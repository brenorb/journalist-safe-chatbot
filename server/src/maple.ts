import OpenAI from 'openai';
import { createCustomFetch } from '@opensecret/react';

import type { ChatMessage } from './types.js';

type MapleClientOptions = {
  apiUrl: string;
  apiKey: string;
};

export function createMapleClient({ apiUrl, apiKey }: MapleClientOptions) {
  const baseURL = apiUrl.endsWith('/') ? `${apiUrl}v1/` : `${apiUrl}/v1/`;

  // Maple/OpenSecret requires a custom fetch that performs attestation + E2E encryption.
  const customFetch = createCustomFetch({ apiKey });

  return new OpenAI({
    baseURL,
    apiKey,
    dangerouslyAllowBrowser: false,
    defaultHeaders: {
      'Accept-Encoding': 'identity',
      'Content-Type': 'application/json',
    },
    fetch: customFetch as any,
  });
}

export async function streamChatCompletion(args: {
  apiUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  onDelta: (delta: string) => void;
}): Promise<string> {
  const openai = createMapleClient({ apiUrl: args.apiUrl, apiKey: args.apiKey });

  const stream = await openai.chat.completions.create({
    model: args.model,
    messages: args.messages,
    stream: true,
  });

  let full = '';
  for await (const chunk of stream as any) {
    const delta: string = chunk?.choices?.[0]?.delta?.content ?? '';
    if (!delta) continue;
    full += delta;
    args.onDelta(delta);
  }

  return full;
}

export async function createChatCompletion(args: {
  apiUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
}): Promise<string> {
  const openai = createMapleClient({ apiUrl: args.apiUrl, apiKey: args.apiKey });

  const result = await openai.chat.completions.create({
    model: args.model,
    messages: args.messages,
    stream: false,
  });

  return (result as any)?.choices?.[0]?.message?.content ?? '';
}
