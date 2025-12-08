export function startNativeMocks() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setupServer } = require('msw/native');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { rest } = require('msw');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createOrderHandlers } = require('./handlers/orderHandlers');
    const server = setupServer(...createOrderHandlers(rest));
    if (!(server as any).__started) {
      (server as any).__started = true;
      server.listen();
    }
    (globalThis as any).__MSW_NATIVE_SERVER__ = server;
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { startFetchMock } = require('./polyfill');
      startFetchMock();
    } catch {}
  }
}

export function stopNativeMocks() {
  const server = (globalThis as any).__MSW_NATIVE_SERVER__;
  if (server && (server as any).__started) {
    (server as any).__started = false;
    server.close();
  }
  if ((globalThis as any).__FETCH_MOCK_STOP__) {
    (globalThis as any).__FETCH_MOCK_STOP__();
    (globalThis as any).__FETCH_MOCK_STOP__ = undefined;
  }
}
