import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';

import { mapleChat } from '../mapleHello.js';

test('Maple AI quickstart returns hello world', async (t) => {
  const apiKey = process.env.MAPLE_API_KEY;
  if (!apiKey) {
    t.skip('MAPLE_API_KEY not set');
  }

  const response = await mapleChat({
    apiKey,
    message: 'Reply with exactly: Hello, world!',
  });

  assert.match(response, /hello,\s*world/i);
});
