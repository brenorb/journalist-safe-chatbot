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

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE frames separated by \n\n
    while (true) {
      const idx = buffer.indexOf('\n\n');
      if (idx === -1) break;

      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      for (const line of frame.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const data = trimmed.slice('data:'.length).trim();
        if (data === '[DONE]') {
          onDone();
          return;
        }

        try {
          const json = JSON.parse(data);
          const delta: string | undefined =
            json?.choices?.[0]?.delta?.content ??
            json?.choices?.[0]?.message?.content;
          if (delta) onDelta(delta);
        } catch {
          // ignore partial/invalid lines
        }
      }
    }
  }

  onDone();
}
