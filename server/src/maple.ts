import type { ChatMessage } from './types.js';

function joinUrl(base: string, path: string) {
  const trimmed = base.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${trimmed}${p}`;
}

export async function mapleProxyChatCompletion(args: {
  proxyUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  stream: boolean;
}): Promise<Response> {
  // Maple Proxy is OpenAI-compatible.
  const url = joinUrl(args.proxyUrl, '/v1/chat/completions');

  return fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${args.apiKey}`,
      accept: args.stream ? 'text/event-stream' : 'application/json',
      'accept-encoding': 'identity',
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      stream: args.stream,
    }),
  });
}
