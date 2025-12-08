import 'whatwg-fetch';

describe('Mock API endpoints', () => {
  test('POST /api/v1/order success', async () => {
    const resp = await fetch('/api/v1/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer demo' },
      body: JSON.stringify({ items: [{ id: 'p9', name: 'Test', price: 1000, qty: 2 }], deliveryMethod: 'Delivery', etaPreference: '25 mins' })
    });
    expect(resp.status).toBe(201);
    const json = await resp.json();
    expect(json.order).toBeTruthy();
    expect(json.order.total).toBe(2000);
    expect(String(json.order.id)).toMatch(/^o\d+/);
  });

  test('POST /api/v1/order invalid input -> 400', async () => {
    const resp = await fetch('/api/v1/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer demo' },
      body: JSON.stringify({ items: [], deliveryMethod: 'Delivery' })
    });
    expect(resp.status).toBe(400);
    const json = await resp.json();
    expect(json.error.code).toBe('invalid_input');
  });

  test('POST /api/v1/order unauthorized -> 401', async () => {
    const resp = await fetch('/api/v1/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: 'p1', name: 'A', price: 1, qty: 1 }], deliveryMethod: 'Pickup' }) });
    expect(resp.status).toBe(401);
  });

  test('GET /api/v1/orders/:id success', async () => {
    const resp = await fetch('/api/v1/orders/o1', { headers: { Authorization: 'Bearer demo' } });
    expect(resp.status).toBe(200);
    const json = await resp.json();
    expect(json.id).toBe('o1');
    expect(json.items?.length).toBeGreaterThan(0);
  });

  test('GET /api/v1/orders/:id invalid id -> 400', async () => {
    const resp = await fetch('/api/v1/orders/invalid', { headers: { Authorization: 'Bearer demo' } });
    expect(resp.status).toBe(400);
  });

  test('GET /api/v1/orders/:id not found -> 404', async () => {
    const resp = await fetch('/api/v1/orders/o999999', { headers: { Authorization: 'Bearer demo' } });
    expect(resp.status).toBe(404);
  });

  test('GET /api/v1/orders/:id forbidden -> 403', async () => {
    const resp = await fetch('/api/v1/orders/o1', { headers: { Authorization: 'Bearer forbidden' } });
    expect(resp.status).toBe(403);
  });

  test('GET /api/v1/orders/:id db unavailable -> 503', async () => {
    const resp = await fetch('/api/v1/orders/o1?db=down', { headers: { Authorization: 'Bearer demo' } });
    expect(resp.status).toBe(503);
  });

  test('Rate limit 429', async () => {
    const headers = { Authorization: 'Bearer demo' } as any;
    // make 10 quick requests
    const resps = await Promise.all(Array.from({ length: 10 }).map(() => fetch('/api/v1/orders/o1', { headers })));
    const codes = resps.map((r) => r.status);
    expect(codes.includes(429)).toBeTruthy();
  });
});

