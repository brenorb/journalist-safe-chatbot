export type Env = {
  PORT: number;
  MAPLE_API_URL: string;
  MAPLE_DEFAULT_API_KEY?: string;
  MAPLE_DEFAULT_MODEL: string;
};

export function getEnv(): Env {
  const portRaw = process.env.PORT ?? '8787';

  const env: Env = {
    PORT: Number(portRaw),
    MAPLE_API_URL: process.env.MAPLE_API_URL ?? 'https://enclave.trymaple.ai',
    MAPLE_DEFAULT_API_KEY: process.env.MAPLE_API_KEY,
    MAPLE_DEFAULT_MODEL: process.env.MAPLE_MODEL ?? 'llama-3.3-70b',
  };

  if (!Number.isFinite(env.PORT) || env.PORT <= 0) {
    throw new Error(`Invalid PORT: ${portRaw}`);
  }

  return env;
}
