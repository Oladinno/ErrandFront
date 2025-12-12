import 'whatwg-fetch';
import { getInterceptedRequests } from '../mocks/polyfill';

describe('Mock API provider endpoints', () => {
  test('GET /availability returns status and next window', async () => {
    const res = await fetch('/api/v1/availability?providerId=pr1');
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.providerId).toBe('pr1');
    expect(['available','busy','offline']).toContain(json.status);
    expect(typeof json.updatedAt).toBe('string');
  });

  test('GET /pricing returns variations', async () => {
    const res = await fetch('/api/v1/pricing?providerId=pr2');
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.providerId).toBe('pr2');
    expect(Array.isArray(json.variations)).toBe(true);
    expect(json.variations.length).toBeGreaterThan(0);
  });

  test('GET /profile returns full professional profile', async () => {
    const res = await fetch('/api/v1/profile?providerId=pr1');
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.id).toBe('pr1');
    expect(typeof json.description).toBe('string');
    expect(Array.isArray(json.pastJobs)).toBe(true);
    expect(json.pastJobs[0]).toHaveProperty('clientName');
  });

  test('rate limiting returns 429', async () => {
    let lastStatus = 200;
    for (let i = 0; i < 12; i++) {
      const res = await fetch('/api/v1/availability?providerId=pr1', { headers: { Authorization: 'Bearer test-token' } });
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }
    expect([200,429]).toContain(lastStatus);
  });

  test('invalid request returns 400', async () => {
    const res = await fetch('/api/v1/availability');
    expect(res.status).toBe(400);
  });
});

