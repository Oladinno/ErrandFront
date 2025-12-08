// Use dynamic require to avoid bundling issues when msw is not present in RN builds
// This module is meant for Jest/node environment only
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setupServer } = require('msw/node');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { rest } = require('msw');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createOrderHandlers } = require('./handlers/orderHandlers');

export const mswServer = setupServer(...createOrderHandlers(rest));
