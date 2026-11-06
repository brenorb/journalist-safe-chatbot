import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pipeOpenAiLikeStreamToSse } from './openaiSse.js';

function streamFrom(bytes: Uint8Array, chunkSize: number): Response {
  let offset = 0;
  return new Response(new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset === bytes.length) {
        controller.close();
        return;
      }
      controller.enqueue(bytes.slice(offset, offset + chunkSize));
      offset = Math.min(offset + chunkSize, bytes.length);
    },
  }));
}

for (const [name, eol, chunkSize] of [
  ['LF', '\n', 1024],
  ['CRLF split across chunks', '\r\n', 1],
  ['CR', '\r', 1024],
] as const) {
  test(`forwards SSE deltas with ${name}`, async () => {
    const data = JSON.stringify({ choices: [{ delta: { content: 'Olá 🐟' } }] });
    const wire = [`: keepalive`, `data: ${data}`, '', 'data: [DONE]', '', '', `data: ${data}`, '', ''].join(eol);
    const deltas: string[] = [];
    let doneCalls = 0;
    await pipeOpenAiLikeStreamToSse({
      upstream: streamFrom(new TextEncoder().encode(wire), chunkSize),
      onDelta: delta => deltas.push(delta),
      onDone: () => { doneCalls += 1; },
    });
    assert.deepEqual(deltas, ['Olá 🐟']);
    assert.equal(doneCalls, 1);
  });
}

test('joins data lines within a frame and preserves completion at EOF', async () => {
  const wire = 'data: {"choices":\r\ndata: [{"message":{"content":"fixture"}}]}\r\n\r\n';
  const deltas: string[] = [];
  let doneCalls = 0;
  await pipeOpenAiLikeStreamToSse({
    upstream: streamFrom(new TextEncoder().encode(wire), 7),
    onDelta: delta => deltas.push(delta),
    onDone: () => { doneCalls += 1; },
  });
  assert.deepEqual(deltas, ['fixture']);
  assert.equal(doneCalls, 1);
});
