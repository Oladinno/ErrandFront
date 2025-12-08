# Mock Backend for ErrandFront

## Overview

- Purpose: Provide a reliable, type-safe mock backend for the ErrandFront app that enables local development, integration testing, and UI prototyping without a live server. It simulates realistic network behavior, validation, authentication, and error cases.
- Target Users: Frontend engineers building features against API contracts; QA engineers writing integration tests; CI pipelines running non-flaky test suites; designers validating interaction flows; demo environments.
- Problem Solving: Solves lack of stable backend during early development; ensures consistent contracts; enables deterministic error scenarios; supports rate limiting simulation; provides tracking updates that reflect delivery lifecycle.

## System Architecture

```mermaid
flowchart LR
  RN[React Native / Expo App]
  RN -- fetch --> INT[Request Interceptor]
  subgraph Mock Layer
    INT -- dev env --> MSW[MSW (Service Worker / Node)]
    INT -- native/web fallback --> PF[Fetch Polyfill]
  end
  MSW -- handlers --> HND[Order Handlers]
  PF -- logic --> HND
  HND -- in-memory --> DB[(ordersDB)]
  HND -- logs --> LOG[Console]
  HND -- responses --> RN
```

- Technology Stack: TypeScript, MSW (`msw/node` in Jest), optional Service Worker for web, fetch polyfill fallback for native, Jest for tests, Zustand for UI state.
- Data Flow: The app calls `fetch`. In tests, MSW Node intercepts calls and routes them to endpoint handlers. In native/web fallback, a fetch polyfill intercepts and returns responses. Both paths share business rules and in-memory `ordersDB` behavior.

## Entity Definitions

Source: `src/mocks/types.ts`

| Entity | Purpose |
|--------|---------|
| `OrderItemInput` | Line item data used to create orders |
| `OrderCreateRequest` | Client payload to create an order |
| `OrderCreateResponse` | Server response when an order is created |
| `OrderResponse` | Standard order resource representation |
| `OrderTrackResponse` | Tracking payload for order status polling |
| `ErrorResponse` | Normalized error shape for all endpoints |

### OrderItemInput

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `string` | required |
| `name` | `string` | required |
| `price` | `number` | `>= 0` |
| `qty` | `number` | `> 0` |
| `store` | `string?` | optional |

Example:

```json
{
  "id": "p1",
  "name": "Jollof Rice",
  "price": 2500,
  "qty": 1,
  "store": "FoodCourt"
}
```

### OrderCreateRequest

| Field | Type | Constraints |
|-------|------|-------------|
| `clientOrderId` | `string?` | optional, used for idempotency/conflict check |
| `items` | `OrderItemInput[]` | required, non-empty |
| `deliveryMethod` | `'Delivery' | 'Pickup'` | required |
| `etaPreference` | `string?` | optional |

### OrderCreateResponse

| Field | Type |
|-------|------|
| `order.id` | `string` |
| `order.status` | `'ongoing' | 'past'` |
| `order.items` | `OrderItemInput[]` |
| `order.total` | `number` |
| `order.eta` | `string?` |
| `order.tracking` | `'created' | 'preparing' | 'transit'` |

### OrderResponse

| Field | Type |
|-------|------|
| `id` | `string` |
| `status` | `'ongoing' | 'past'` |
| `items` | `OrderItemInput[]` |
| `total` | `number` |
| `eta` | `string?` |
| `tracking` | `'created' | 'preparing' | 'transit' | 'delivered'` |

### OrderTrackResponse

| Field | Type |
|-------|------|
| `status` | `'CREATED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED'` |
| `rider` | `{ name?: string; phone?: string; chatId?: string }?` |
| `orderId` | `string` |
| `eta` | `string?` |

### ErrorResponse

| Field | Type |
|-------|------|
| `error.code` | `string` |
| `error.message` | `string` |

## Endpoint Documentation

Handlers: `src/mocks/handlers/orderHandlers.ts:86-131`

### Order Creation

- Method/Path: `POST /api/v1/order`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body: `OrderCreateRequest`
- Success: `201` with `OrderCreateResponse`
- Errors:
  - `401` unauthorized (missing/invalid token)
  - `400` invalid input (field-level validation)
  - `409` resource conflict (`clientOrderId` already exists)
  - `500` server error
  - `429` rate limit exceeded
- Auth: Required
- Example Request:

```bash
curl -X POST /api/v1/order \
  -H "Authorization: Bearer demo" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"p9","name":"Test","price":1000,"qty":2}],"deliveryMethod":"Delivery","etaPreference":"25 mins"}'
```

- Example Success:

```json
{
  "order": {
    "id": "o1733600000000",
    "status": "ongoing",
    "items": [{ "id": "p9", "name": "Test", "price": 1000, "qty": 2 }],
    "total": 2000,
    "eta": "25 mins",
    "tracking": "created"
  }
}
```

### Get Order by ID

- Method/Path: `GET /api/v1/orders/:id`
- Headers: `Authorization: Bearer <token>`
- Params: `id` path param, `db` optional query (`down` simulates DB outage)
- Success: `200` with `OrderResponse`
- Errors:
  - `403` forbidden (Bearer `forbidden`)
  - `400` invalid id format (`o<digits>`)
  - `503` database unavailable
  - `404` not found
  - `429` rate limit exceeded
- Auth: Required
- Example Request:

```bash
curl /api/v1/orders/o1 -H "Authorization: Bearer demo"
```

- Example Success:

```json
{
  "id": "o1",
  "status": "ongoing",
  "items": [
    { "id": "p1", "name": "Jollof Rice", "price": 2500, "qty": 1, "store": "FoodCourt" },
    { "id": "p2", "name": "Chicken Shawarma", "price": 4200, "qty": 1, "store": "FoodCourt" }
  ],
  "total": 6700,
  "eta": "12-25 mins",
  "tracking": "preparing"
}
```

### Track Order Status

- Method/Path: `GET /api/v1/order/track/:orderId`
- Query: `status` optional (`CREATED|PREPARING|OUT_FOR_DELIVERY|DELIVERED`), `err` optional (`400|500`)
- Success: `200` with `OrderTrackResponse`
- Errors: `400`, `500` based on `err`
- Auth: Not required in mock
- Example:

```bash
curl /api/v1/order/track/o1?status=OUT_FOR_DELIVERY
```

## Business Logic

- Validation: Field-level checks on create (`items` non-empty; each `price >= 0`, `qty > 0`; `deliveryMethod` is in allowed set). See `src/mocks/handlers/orderHandlers.ts:52-66`.
- Algorithms: `sum(items)` computes totals (`src/mocks/handlers/orderHandlers.ts:36`). Tracking selection rotates or forces status based on `status` query (`src/mocks/handlers/orderHandlers.ts:4-8, 69-84`).
- Error Handling: Normalized `ErrorResponse` with code/message returned by helper (`src/mocks/handlers/orderHandlers.ts:32-34`).
- Rate Limiting: Fixed window, key from `Authorization` prefix; limit default `8` events per `10s` (`src/mocks/handlers/orderHandlers.ts:44-51`).
- Caching Policies: None; all responses are generated per request.

## Mock-Specific Features

- Dynamic Rider Info: Rider details only provided when `status=OUT_FOR_DELIVERY` to enable call/chat UI (`src/mocks/handlers/orderHandlers.ts:10-13`).
- Network Delay Simulation: `setTimeout` delays on each handler (`track ~800ms`, `create ~500ms`, `get ~300ms`).
- Environment Configuration: `EXPO_PUBLIC_USE_MOCKS=true` toggles mock usage for app builds; MSW is used in tests (`src/__tests__/setup-msw.ts:3-13`), polyfill fallback used when MSW is unavailable (`src/__tests__/setup-msw.ts:14-22`).
- Reset/Initialization: In tests, MSW server is started automatically. In app runtime, `startFetchMock()` can be invoked to enable native fallback (`src/mocks/polyfill.ts:56-110`).

## Usage Examples

### Create Order (fetch)

```ts
await fetch('/api/v1/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer demo' },
  body: JSON.stringify({ items: [{ id: 'p9', name: 'Test', price: 1000, qty: 2 }], deliveryMethod: 'Delivery' })
});
```

### Get Order

```ts
await fetch('/api/v1/orders/o1', { headers: { Authorization: 'Bearer demo' } });
```

### Track Order

```ts
await fetch('/api/v1/order/track/o1');
```

### Jest Integration

- Setup: `package.json:35-39` configures Jest with `jest-expo` and a setup file.
- MSW Setup: `src/__tests__/setup-msw.ts:3-13` starts MSW; falls back to fetch mock if needed (`src/__tests__/setup-msw.ts:16-22`).
- Example tests: `src/__tests__/api.mocks.test.tsx` exercises create/get/limits; `src/__tests__/OrderTrackingScreen.test.tsx` exercises state transitions and actions.

## Future Considerations

- Planned Enhancements: Additional resources (users, stores, messages); pagination; search filters; authenticated tracking endpoint.
- Known Limitations: In-memory DB resets per process; rate limit keyed only to Authorization header; no real persistence; MSW Service Worker not used in native runtime.
- Scaling Considerations: Replace in-memory store with seeded fixtures; consider determinism controls for rotating statuses; introduce mock datasets for higher cardinality; optional caching layer to mimic server behavior.

## Cross-References

- Types: `src/mocks/types.ts:1-46`
- Handlers: `src/mocks/handlers/orderHandlers.ts:15-133`
- Polyfill: `src/mocks/polyfill.ts:1-125`
- Test setup: `src/__tests__/setup-msw.ts:1-32`
- UI consumer (tracking): `src/screens/OrderTrackingScreen.tsx:65-97, 213-221`

