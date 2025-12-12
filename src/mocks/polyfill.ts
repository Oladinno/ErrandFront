import type { OrderTrackResponse, OrderCreateRequest, OrderCreateResponse, OrderResponse, ErrorResponse, OrderItemInput, AvailabilityResponse, PricingResponse, ProfessionalProfile } from './types';

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
    if (url.startsWith('/api/v1/availability')) {
      const u = new URL(url, 'http://localhost');
      const providerId = u.searchParams.get('providerId');
      const err = u.searchParams.get('err');
      const headers = new Headers(init?.headers ?? {});
      const key = (headers.get('authorization') ?? 'anon').slice(0,32);
      if (!rateLimit(key)) return mk(429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } });
      if (err === '500') return mk(500, { error: { code: 'server_error', message: 'Unexpected error' } });
      if (!providerId) return mk(400, { error: { code: 'invalid_request', message: 'providerId required' } });
      await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random()*300)));
      const statuses: AvailabilityResponse['status'][] = ['available','busy','offline'];
      const body: AvailabilityResponse = { providerId, status: statuses[Math.floor(Date.now()/15000)%3], updatedAt: new Date().toISOString(), nextWindow: '~ 45 mins' };
      return mk(200, body);
    }
    if (url.startsWith('/api/v1/pricing')) {
      const u = new URL(url, 'http://localhost');
      const providerId = u.searchParams.get('providerId');
      const err = u.searchParams.get('err');
      const headers = new Headers(init?.headers ?? {});
      const key = (headers.get('authorization') ?? 'anon').slice(0,32);
      if (!rateLimit(key)) return mk(429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } });
      if (err === '500') return mk(500, { error: { code: 'server_error', message: 'Unexpected error' } });
      if (!providerId) return mk(400, { error: { code: 'invalid_request', message: 'providerId required' } });
      await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random()*300)));
      const body: PricingResponse = {
        providerId: providerId!,
        basePrice: 1200,
        currency: 'NGN',
        surgeMultiplier: Math.random() < 0.2 ? 1.2 : undefined,
        discountPercent: Math.random() < 0.3 ? 10 : undefined,
        updatedAt: new Date().toISOString(),
        variations: [
          { name: 'Basic call-out', price: 1200, currency: 'NGN' },
          { name: 'Pipe leak fix', price: 3500, currency: 'NGN' },
          { name: 'Tap installation', price: 4500, currency: 'NGN' },
        ],
      };
      return mk(200, body);
    }
    if (url.startsWith('/api/v1/profile')) {
      const u = new URL(url, 'http://localhost');
      const providerId = u.searchParams.get('providerId');
      const err = u.searchParams.get('err');
      const headers = new Headers(init?.headers ?? {});
      const key = (headers.get('authorization') ?? 'anon').slice(0,32);
      if (!rateLimit(key)) return mk(429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } });
      if (err === '500') return mk(500, { error: { code: 'server_error', message: 'Unexpected error' } });
      if (!providerId) return mk(400, { error: { code: 'invalid_request', message: 'providerId required' } });
      await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random()*300)));
      const profiles: Record<string, ProfessionalProfile> = {
        pr1: {
          id: 'pr1', name: 'Johnson Smith', category: 'Plumber', location: 'Sagamu', image: 'https://picsum.photos/id/1027/200/200',
          description: 'I provide expert plumbing services with a focus on clean work, punctuality, and transparent pricing. From emergency repairs to planned installations, I deliver dependable solutions that respect your home and schedule. My approach emphasizes clear communication, thorough diagnostics, and durable repairs using quality materials, ensuring long-term reliability and customer satisfaction across diverse residential projects.',
          whatIDoSummary: 'I specialize in leak detection, pipe replacements, fixture installations, bathroom and kitchen plumbing, and drain unblocking. I also handle water heater installation and maintenance, pressure balancing, and rapid emergency response in homes and small commercial spaces. My workflow includes assessment, plan discussion, precise execution, and tidy wrap‑up so you enjoy consistent water flow and peace of mind.',
          pastJobs: [
            { id: 'pj1', title: 'Fix Leaking Kitchen Sink and Replace Tap', clientName: 'Adewale', startDate: '2025-08-10', endDate: '2025-08-10', responsibilities: ['Diagnosed leak source','Replaced worn cartridges','Installed mixer tap'], technologies: ['PPR fittings','Teflon tape'], outcome: 'Leak resolved; improved pressure; client satisfied', rating: 4.5, ratingCount: 23 },
          ],
        },
        pr2: {
          id: 'pr2', name: 'Mary John', category: 'Electrician', location: 'Sagamu', image: 'https://picsum.photos/id/1005/200/200',
          description: 'I deliver safe, code‑compliant electrical services ranging from troubleshooting to new wiring for renovations. With meticulous attention to load balancing and circuit protection, I ensure efficient, stable power throughout your property. Clear estimates, minimal disruption, and tidy finishes are central to my practice, supporting long‑term reliability and household safety.',
          whatIDoSummary: 'My services include socket and lighting installation, panel upgrades, appliance circuits, fault isolation, surge protection, and smart home setup. I prioritize diagnostics, clean routing, and product recommendations that match usage patterns and budgets. Emergency calls receive swift response with a focus on prevention and safe restoration.',
          pastJobs: [
            { id: 'pj4', title: 'Lighting retrofit and dimmer install', clientName: 'Chinedu', startDate: '2025-05-10', endDate: '2025-05-10', responsibilities: ['Rewired lighting loop','Installed dimmers','Tested load'], technologies: ['LED','MCB'], outcome: 'Even lighting; energy savings; client pleased', rating: 4.6, ratingCount: 19 },
          ],
        },
      };
      const prof = profiles[providerId!] ?? profiles['pr1'];
      return mk(200, prof);
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
