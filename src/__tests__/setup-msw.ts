let close: (() => void) | undefined;

beforeAll(() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setupServer } = require('msw/node');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { rest } = require('msw');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createOrderHandlers } = require('../mocks/handlers/orderHandlers');
    const server = setupServer(...createOrderHandlers(rest));
    server.listen({ onUnhandledRequest: 'warn' });
    close = () => server.close();
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startFetchMock } = require('../mocks/polyfill');
    startFetchMock();
    close = () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { stopFetchMock } = require('../mocks/polyfill');
      stopFetchMock();
    };
  }
});

afterEach(() => {
  // noop for now; handlers stateless
});

afterAll(() => {
  if (close) close();
});
