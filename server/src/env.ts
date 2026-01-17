export type Env = {
  PORT: number;
  MAPLE_BASE_URL: string;
  MAPLE_API_KEY: string;
  MAPLE_MODEL: string;
};

export function getEnv(): Env {
  const portRaw = process.env.PORT ?? '8787';

  const env: Env = {
    PORT: Number(portRaw),
    MAPLE_BASE_URL: process.env.MAPLE_BASE_URL ?? 'https://api.maple.ai/v1',
    MAPLE_API_KEY: process.env.MAPLE_API_KEY ?? '',
    MAPLE_MODEL: process.env.MAPLE_MODEL ?? '',
  };

  if (!Number.isFinite(env.PORT) || env.PORT <= 0) {
    throw new Error(`Invalid PORT: ${portRaw}`);
  }

  return env;
}
