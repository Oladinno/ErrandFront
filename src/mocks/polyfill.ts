import type { OrderTrackResponse, OrderCreateRequest, OrderCreateResponse, OrderResponse, ErrorResponse, OrderItemInput } from './types';

let originalFetch: any;
const requests: Array<{ url: string; method: string; time: number }> = [];
const ordersDB: Record<string, OrderResponse> = {
  o1: { id: 'o1', status: 'ongoing', items: [
    { id: 'p1', name: 'Jollof Rice', price: 2500, qty: 1, store: 'FoodCourt' },
    { id: 'p2', name: 'Chicken Shawarma', price: 4200, qty: 1, store: 'FoodCourt' },
  ], total: 6700, eta: '12-25 mins', tracking: 'preparing' },
};
const rateBucket: Record<string, number[]> = {};

function pickStatus(seed?: string): OrderTrackResponse['status'] {
  if (seed === 'CREATED' || seed === 'PREPARING' || seed === 'OUT_FOR_DELIVERY' || seed === 'DELIVERED') return seed;
  const arr: OrderTrackResponse['status'][] = ['CREATED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  return arr[Math.floor(Date.now() / 20000) % arr.length];
}

function riderFor(status: OrderTrackResponse['status']) {
  if (status === 'OUT_FOR_DELIVERY') return { name: 'Michael John', phone: '+2348012345678', chatId: 't3' };
  return undefined;
}

function sum(items: OrderItemInput[]) { return items.reduce((s, i) => s + i.price * i.qty, 0); }
function isValidId(id: string) { return /^o\d+$/.test(id); }
function rateLimit(key: string, limit = 8, windowMs = 10000) {
  const now = Date.now();
  const arr = rateBucket[key] ?? [];
  const fresh = arr.filter((t) => now - t < windowMs);
  fresh.push(now);
  rateBucket[key] = fresh;
  return fresh.length <= limit;
}
function isAuthorized(headers: Headers) {
  const auth = headers.get('authorization') ?? headers.get('Authorization');
  if (!auth) return false;
  if (auth.startsWith('Bearer ') && auth.slice(7) === 'forbidden') return 'forbidden';
  return true;
}
function validateCreate(body: any): { ok: true; data: OrderCreateRequest } | { ok: false; errors: string[] } {
  const errs: string[] = [];
  if (!body || typeof body !== 'object') errs.push('body.required');
  if (!Array.isArray(body?.items) || body.items.length === 0) errs.push('items.required');
  if (body?.items) {
    body.items.forEach((it: any, idx: number) => {
      if (!it?.id || !it?.name) errs.push(`items[${idx}].id_name.required`);
      if (typeof it?.price !== 'number' || it.price < 0) errs.push(`items[${idx}].price.invalid`);
      if (typeof it?.qty !== 'number' || it.qty <= 0) errs.push(`items[${idx}].qty.invalid`);
    });
  }
  if (!['Delivery','Pickup'].includes(body?.deliveryMethod)) errs.push('deliveryMethod.invalid');
  if (errs.length) return { ok: false, errors: errs };
  return { ok: true, data: body as OrderCreateRequest };
}

export function startFetchMock() {
  if (originalFetch) return;
  originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url ?? '';
    const method = (init?.method ?? 'GET').toUpperCase();
    requests.push({ url, method, time: Date.now() });
    if (url.startsWith('/api/v1/order/track/')) {
      const u = new URL(url, 'http://localhost');
      const orderId = url.split('/').pop() ?? 'o1';
      const wanted = u.searchParams.get('status') ?? undefined;
      const err = u.searchParams.get('err');
      await new Promise((r) => setTimeout(r, 800));
      if (err === '500') return mk(500, { error: 'server-error' });
      if (err === '400') return mk(400, { error: 'bad-request' });
      const status = pickStatus(wanted);
      const body: OrderTrackResponse = { status, rider: riderFor(status), orderId, eta: '15-25 mins' };
      return mk(200, body);
    }
    if (url === '/api/v1/order' && method === 'POST') {
      const headers = new Headers(init?.headers ?? {});
      const auth = isAuthorized(headers);
      const key = (headers.get('authorization') ?? 'anon').slice(0,32);
      if (!rateLimit(key)) return mk(429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } });
      if (auth === false) return mk(401, { error: { code: 'unauthorized', message: 'Missing or invalid token' } });
      await new Promise((r) => setTimeout(r, 500));
      const parsed = validateCreate(init?.body ? JSON.parse(init.body) : {});
      if (!parsed.ok) return mk(400, { error: { code: 'invalid_input', message: parsed.errors.join(', ') } });
      const body = parsed.data;
      const id = `o${Date.now()}`;
      const total = sum(body.items);
      const order: OrderCreateResponse['order'] = { id, status: 'ongoing', items: body.items, total, eta: body.etaPreference ?? '20 mins', tracking: 'created' };
      ordersDB[id] = order as OrderResponse;
      return mk(201, { order });
    }
    if (url.startsWith('/api/v1/orders/')) {
      const headers = new Headers(init?.headers ?? {});
      const auth = isAuthorized(headers);
      const key = (headers.get('authorization') ?? 'anon').slice(0,32);
      if (!rateLimit(key)) return mk(429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } });
      const u = new URL(url, 'http://localhost');
      const id = u.pathname.split('/').pop() ?? '';
      const db = u.searchParams.get('db');
      if (auth === 'forbidden') return mk(403, { error: { code: 'forbidden', message: 'Not allowed to access this resource' } });
      if (!isValidId(id)) return mk(400, { error: { code: 'invalid_id', message: 'ID format must be o<digits>' } });
      await new Promise((r) => setTimeout(r, 300));
      if (db === 'down') return mk(503, { error: { code: 'db_unavailable', message: 'Database unavailable' } });
      const order = ordersDB[id];
      if (!order) return mk(404, { error: { code: 'not_found', message: 'Order not found' } });
      return mk(200, order);
    }
    return originalFetch(input, init);
  };
  (globalThis as any).__FETCH_MOCK_STOP__ = stopFetchMock;
}

export function stopFetchMock() {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
    originalFetch = undefined;
  }
}

export function getInterceptedRequests() {
  return requests.slice();
}

function mk(status: number, json: any): Response {
  return new Response(JSON.stringify(json), { status, headers: { 'Content-Type': 'application/json' } });
}
