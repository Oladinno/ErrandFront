import type { OrderTrackResponse } from '../../mocks/types';
import type { OrderCreateRequest, OrderCreateResponse, OrderResponse, ErrorResponse, OrderItemInput } from '../../mocks/types';
import type { AvailabilityResponse, PricingResponse, ProfessionalProfile } from '../types';

function pickStatus(seed?: string): OrderTrackResponse['status'] {
  if (seed === 'CREATED' || seed === 'PREPARING' || seed === 'OUT_FOR_DELIVERY' || seed === 'DELIVERED') return seed;
  const arr: OrderTrackResponse['status'][] = ['CREATED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  return arr[Math.floor(Date.now() / 20000) % arr.length];
}

function riderFor(status: OrderTrackResponse['status']) {
  if (status === 'OUT_FOR_DELIVERY') return { name: 'Michael John', phone: '+2348012345678', chatId: 't3' };
  return undefined;
}

export function createOrderHandlers(rest: any) {
  const ordersDB: Record<string, OrderResponse> = {
    o1: { id: 'o1', status: 'ongoing', items: [
      { id: 'p1', name: 'Jollof Rice', price: 2500, qty: 1, store: 'FoodCourt' },
      { id: 'p2', name: 'Chicken Shawarma', price: 4200, qty: 1, store: 'FoodCourt' },
    ], total: 6700, eta: '12-25 mins', tracking: 'preparing' },
    o2: { id: 'o2', status: 'past', items: [
      { id: 'p3', name: 'Chips', price: 1300, qty: 1, store: 'FoodCourt' },
    ], total: 1300, eta: '12 mins', tracking: 'transit' },
  };

  const rateBucket: Record<string, number[]> = {};

  function log(message: string, payload?: any) {
    try { console.log(`[mock-api] ${message}`, payload ?? ''); } catch {}
  }

  function error(ctx: any, code: number, e: ErrorResponse) {
    return [ctx.status(code), ctx.json(e)];
  }

  function sum(items: OrderItemInput[]) { return items.reduce((s, i) => s + i.price * i.qty, 0); }
  function isValidId(id: string) { return /^o\d+$/.test(id); }
  function isAuthorized(req: any) {
    const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
    if (!auth) return false;
    if (auth.startsWith('Bearer ') && auth.slice(7) === 'forbidden') return 'forbidden';
    return true;
  }
  function rateLimit(key: string, limit = 8, windowMs = 10000) {
    const now = Date.now();
    const arr = rateBucket[key] ?? [];
    const fresh = arr.filter((t) => now - t < windowMs);
    fresh.push(now);
    rateBucket[key] = fresh;
    return fresh.length <= limit;
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

  return [
    rest.get('/api/v1/order/track/:orderId', async (req: any, res: any, ctx: any) => {
      const orderId = String(req.params.orderId ?? 'o1');
      const wanted = req.url.searchParams.get('status') ?? undefined;
      const err = req.url.searchParams.get('err');
      if (err === '500') return res(ctx.status(500), ctx.json({ error: 'server-error' }));
      if (err === '400') return res(ctx.status(400), ctx.json({ error: 'bad-request' }));
      await new Promise((r) => setTimeout(r, 800));
      const status = pickStatus(wanted ?? undefined);
      const body: OrderTrackResponse = {
        status,
        rider: riderFor(status),
        orderId,
        eta: '15-25 mins',
      };
      return res(ctx.status(200), ctx.json(body));
    }),

    // GET /availability
    rest.get('/api/v1/availability', async (req: any, res: any, ctx: any) => {
      const providerId = req.url.searchParams.get('providerId');
      const err = req.url.searchParams.get('err');
      const key = (req.headers.get('authorization') ?? 'anon').slice(0,32);
      if (!rateLimit(key)) return res(...error(ctx, 429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } }));
      if (err === '500') return res(...error(ctx, 500, { error: { code: 'server_error', message: 'Unexpected error' } }));
      if (!providerId) return res(...error(ctx, 400, { error: { code: 'invalid_request', message: 'providerId required' } }));
      const statuses: AvailabilityResponse['status'][] = ['available','busy','offline'];
      await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random()*300)));
      const body: AvailabilityResponse = { providerId, status: statuses[Math.floor(Date.now()/15000)%3], updatedAt: new Date().toISOString(), nextWindow: '~ 45 mins' };
      return res(ctx.status(200), ctx.json(body));
    }),

    // GET /pricing
    rest.get('/api/v1/pricing', async (req: any, res: any, ctx: any) => {
      const providerId = req.url.searchParams.get('providerId');
      const err = req.url.searchParams.get('err');
      const key = (req.headers.get('authorization') ?? 'anon').slice(0,32);
      if (!rateLimit(key)) return res(...error(ctx, 429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } }));
      if (err === '500') return res(...error(ctx, 500, { error: { code: 'server_error', message: 'Unexpected error' } }));
      if (!providerId) return res(...error(ctx, 400, { error: { code: 'invalid_request', message: 'providerId required' } }));
      await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random()*300)));
      const body: PricingResponse = {
        providerId,
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
      return res(ctx.status(200), ctx.json(body));
    }),

    // GET /profile
    rest.get('/api/v1/profile', async (req: any, res: any, ctx: any) => {
      const providerId = req.url.searchParams.get('providerId');
      const err = req.url.searchParams.get('err');
      const key = (req.headers.get('authorization') ?? 'anon').slice(0,32);
      if (!rateLimit(key)) return res(...error(ctx, 429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } }));
      if (err === '500') return res(...error(ctx, 500, { error: { code: 'server_error', message: 'Unexpected error' } }));
      if (!providerId) return res(...error(ctx, 400, { error: { code: 'invalid_request', message: 'providerId required' } }));
      await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random()*300)));
      const profiles: Record<string, ProfessionalProfile> = {
        pr1: {
          id: 'pr1',
          name: 'Johnson Smith',
          category: 'Plumber',
          location: 'Sagamu',
          image: 'https://picsum.photos/id/1027/200/200',
          description: 'I provide expert plumbing services with a focus on clean work, punctuality, and transparent pricing. From emergency repairs to planned installations, I deliver dependable solutions that respect your home and schedule. My approach emphasizes clear communication, thorough diagnostics, and durable repairs using quality materials, ensuring long-term reliability and customer satisfaction across diverse residential projects.',
          whatIDoSummary: 'I specialize in leak detection, pipe replacements, fixture installations, bathroom and kitchen plumbing, and drain unblocking. I also handle water heater installation and maintenance, pressure balancing, and rapid emergency response in homes and small commercial spaces. My workflow includes assessment, plan discussion, precise execution, and tidy wrap‑up so you enjoy consistent water flow and peace of mind.',
          pastJobs: [
            { id: 'pj1', title: 'Fix Leaking Kitchen Sink and Replace Tap', clientName: 'Adewale', startDate: '2025-08-10', endDate: '2025-08-10', responsibilities: ['Diagnosed leak source', 'Replaced worn cartridges', 'Installed mixer tap'], technologies: ['PPR fittings','Teflon tape'], outcome: 'Leak resolved; improved pressure; client satisfied', rating: 4.5, ratingCount: 23 },
            { id: 'pj2', title: 'Water heater setup & maintenance', clientName: 'Ngozi', startDate: '2025-07-02', endDate: '2025-07-02', responsibilities: ['Installed electric heater','Tested safety valve','Optimized temperature'], technologies: ['PEX','Dielectric unions'], outcome: 'Stable hot water; reduced power spikes', rating: 4.3, ratingCount: 13 },
            { id: 'pj3', title: 'Install and repair taps, sinks & showers', clientName: 'Musa', startDate: '2025-06-12', endDate: '2025-06-13', responsibilities: ['Mounted sink','Aligned drain','Sealed joints'], technologies: ['PVC','Silicone sealant'], outcome: 'No drips; aligned fixtures; smooth outflow', rating: 4.2, ratingCount: 12 },
          ],
        },
        pr2: {
          id: 'pr2',
          name: 'Mary John',
          category: 'Electrician',
          location: 'Sagamu',
          image: 'https://picsum.photos/id/1005/200/200',
          description: 'I deliver safe, code‑compliant electrical services ranging from troubleshooting to new wiring for renovations. With meticulous attention to load balancing and circuit protection, I ensure efficient, stable power throughout your property. Clear estimates, minimal disruption, and tidy finishes are central to my practice, supporting long‑term reliability and household safety.',
          whatIDoSummary: 'My services include socket and lighting installation, panel upgrades, appliance circuits, fault isolation, surge protection, and smart home setup. I prioritize diagnostics, clean routing, and product recommendations that match usage patterns and budgets. Emergency calls receive swift response with a focus on prevention and safe restoration.',
          pastJobs: [
            { id: 'pj4', title: 'Lighting retrofit and dimmer install', clientName: 'Chinedu', startDate: '2025-05-10', endDate: '2025-05-10', responsibilities: ['Rewired lighting loop','Installed dimmers','Tested load'], technologies: ['LED','MCB'], outcome: 'Even lighting; energy savings; client pleased', rating: 4.6, ratingCount: 19 },
          ],
        },
      };
      const prof = profiles[providerId] ?? profiles['pr1'];
      return res(ctx.status(200), ctx.json(prof));
    }),

    // POST /api/v1/order
    rest.post('/api/v1/order', async (req: any, res: any, ctx: any) => {
      const auth = isAuthorized(req);
      const key = (req.headers.get('authorization') ?? 'anon').slice(0, 32);
      if (!rateLimit(key)) {
        log('rate.limit.hit', { key });
        return res(...error(ctx, 429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } }));
      }
      if (auth === false) return res(...error(ctx, 401, { error: { code: 'unauthorized', message: 'Missing or invalid token' } }));
      await new Promise((r) => setTimeout(r, 500));
      const parsed = validateCreate(await req.json());
      if (!parsed.ok) return res(...error(ctx, 400, { error: { code: 'invalid_input', message: parsed.errors.join(', ') } }));
      const body = parsed.data;
      if (body.clientOrderId && Object.values(ordersDB).some((o) => o.id === body.clientOrderId)) {
        return res(...error(ctx, 409, { error: { code: 'conflict', message: 'Order with clientOrderId already exists' } }));
      }
      try {
        const id = `o${Date.now()}`;
        const total = sum(body.items);
        const order: OrderCreateResponse['order'] = { id, status: 'ongoing', items: body.items, total, eta: body.etaPreference ?? '20 mins', tracking: 'created' };
        ordersDB[id] = order;
        const resp: OrderCreateResponse = { order };
        log('order.create', { id, total });
        return res(ctx.status(201), ctx.json(resp));
      } catch (e: any) {
        log('order.create.error', e?.message ?? e);
        return res(...error(ctx, 500, { error: { code: 'server_error', message: 'Unexpected error' } }));
      }
    }),

    // GET /api/v1/orders/:id
    rest.get('/api/v1/orders/:id', async (req: any, res: any, ctx: any) => {
      const id = String(req.params.id ?? '');
      const db = req.url.searchParams.get('db');
      const auth = isAuthorized(req);
      const key = (req.headers.get('authorization') ?? 'anon').slice(0, 32);
      if (!rateLimit(key)) return res(...error(ctx, 429, { error: { code: 'too_many_requests', message: 'Rate limit exceeded' } }));
      if (auth === 'forbidden') return res(...error(ctx, 403, { error: { code: 'forbidden', message: 'Not allowed to access this resource' } }));
      if (!isValidId(id)) return res(...error(ctx, 400, { error: { code: 'invalid_id', message: 'ID format must be o<digits>' } }));
      await new Promise((r) => setTimeout(r, 300));
      if (db === 'down') return res(...error(ctx, 503, { error: { code: 'db_unavailable', message: 'Database unavailable' } }));
      const order = ordersDB[id];
      if (!order) return res(...error(ctx, 404, { error: { code: 'not_found', message: 'Order not found' } }));
      log('order.get', { id });
      return res(ctx.status(200), ctx.json(order));
    }),
  ];
}
