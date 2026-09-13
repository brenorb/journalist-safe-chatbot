import OpenAI from 'openai';
import { randomFillSync, webcrypto } from 'node:crypto';

type MapleChatOptions = {
  apiKey: string;
  message: string;
  model?: string;
  apiUrl?: string;
  onToken?: (token: string) => void;
};

const DEFAULT_API_URL = 'https://enclave.trymaple.ai';
const DEFAULT_MODEL = 'llama-3.3-70b';

function ensureMapleBrowserGlobals(apiUrl: string) {
  const globalAny = globalThis as typeof globalThis & {
    window?: typeof globalThis;
    self?: typeof globalThis;
    navigator?: { userAgent: string };
    crypto?: { getRandomValues?: (arr: Uint8Array) => Uint8Array };
    sessionStorage?: {
      getItem: (key: string) => string | null;
      setItem: (key: string, value: string) => void;
      removeItem: (key: string) => void;
      clear: () => void;
    };
    location?: URL;
    __mapleFetchPatched?: boolean;
  };

  if (!globalAny.window) {
    globalAny.window = globalThis;
  }
  if (!globalAny.self) {
    globalAny.self = globalThis;
  }
  if (!globalAny.navigator) {
    globalAny.navigator = { userAgent: 'node' };
  }
  if (!globalAny.crypto) {
    globalAny.crypto = webcrypto ?? {};
  }
  if (!globalAny.crypto.getRandomValues) {
    globalAny.crypto.getRandomValues = (arr) => randomFillSync(arr);
  }
  if (!globalAny.window.crypto) {
    globalAny.window.crypto = globalAny.crypto as typeof globalAny.crypto;
  }
  if (!globalAny.location) {
    globalAny.location = new URL(apiUrl);
  }
  if (!globalAny.sessionStorage) {
    const store = new Map<string, string>();
    globalAny.sessionStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) ?? null : null),
      setItem: (key, value) => {
        store.set(key, String(value));
      },
      removeItem: (key) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    };
  }

  const originalFetch = globalAny.fetch;
  if (originalFetch && !globalAny.__mapleFetchPatched) {
    globalAny.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const resolved = url.startsWith('http')
        ? url
        : new URL(url, apiUrl).toString();
      return originalFetch(resolved, init);
    };
    globalAny.__mapleFetchPatched = true;
  }
}

export async function mapleChat({
  apiKey,
  message,
  model = DEFAULT_MODEL,
  apiUrl = process.env.MAPLE_API_URL ?? DEFAULT_API_URL,
  onToken,
}: MapleChatOptions): Promise<string> {
  if (!apiKey) {
    throw new Error('MAPLE_API_KEY is required.');
  }
  if (!message) {
    throw new Error('message is required.');
  }

  ensureMapleBrowserGlobals(apiUrl);

  const { createCustomFetch } = await import('@opensecret/react');

  const openai = new OpenAI({
    apiKey,
    baseURL: `${apiUrl.replace(/\/$/, '')}/v1/`,
    dangerouslyAllowBrowser: true,
    fetch: createCustomFetch({ apiKey }),
  });

  const stream = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: message }],
    stream: true,
  });

  let output = '';
  for await (const chunk of stream) {
    const delta = chunk?.choices?.[0]?.delta?.content ?? '';
    if (!delta) continue;
    output += delta;
    if (onToken) onToken(delta);
  }

  return output;
}
