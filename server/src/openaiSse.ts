// Minimal parser for OpenAI-compatible SSE stream.
// We forward tokens as they arrive.

export async function pipeOpenAiLikeStreamToSse(args: {
  upstream: Response;
  onDelta: (delta: string) => void;
  onDone: () => void;
}) {
  const { upstream, onDelta, onDone } = args;

  if (!upstream.body) throw new Error('Upstream response has no body');

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let pendingCarriageReturn = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      let chunk: string = (pendingCarriageReturn ? '\r' : '') + decoder.decode(value, { stream: !done });
      // Preserve a CR at the byte boundary until we know whether LF follows.
      pendingCarriageReturn = !done && chunk.endsWith('\r');
      if (pendingCarriageReturn) chunk = chunk.slice(0, -1);
      buffer += chunk.replace(/\r\n?/g, '\n');

      while (true) {
        const idx = buffer.indexOf('\n\n');
        if (idx === -1) break;

        const frame = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const data = frame.split('\n')
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice('data:'.length).replace(/^ /, ''))
          .join('\n')
          .trim();
        if (data === '[DONE]') {
          void reader.cancel().catch(() => {});
          onDone();
          return;
        }
        if (!data) continue;

        let delta: unknown;
        try {
          const json = JSON.parse(data);
          delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content;
        } catch {
          // Ignore malformed events and keep reading.
          continue;
        }
        if (typeof delta === 'string' && delta) onDelta(delta);
      }

      if (done) break;
    }
    onDone();
  } finally {
    reader.releaseLock();
  }
}
