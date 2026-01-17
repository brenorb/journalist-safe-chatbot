export type Env = {
  PORT: number;

  // Maple Proxy (server-side) — OpenAI-compatible
  // See https://blog.trymaple.ai/maple-proxy-documentation/
  MAPLE_PROXY_URL?: string; // e.g. http://127.0.0.1:11434

  // Optional defaults (can also be passed per-request headers)
  MAPLE_DEFAULT_API_KEY?: string;
  MAPLE_DEFAULT_MODEL: string;
};

export function getEnv(): Env {
  const portRaw = process.env.PORT ?? '8787';

  const env: Env = {
    PORT: Number(portRaw),
    MAPLE_PROXY_URL: process.env.MAPLE_PROXY_URL,
    MAPLE_DEFAULT_API_KEY: process.env.MAPLE_API_KEY,
    MAPLE_DEFAULT_MODEL: process.env.MAPLE_MODEL ?? 'llama-3.3-70b',
  };

  if (!Number.isFinite(env.PORT) || env.PORT <= 0) {
    throw new Error(`Invalid PORT: ${portRaw}`);
  }

  return env;
}
