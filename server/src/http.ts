export function getHeaderString(req: any, name: string): string | undefined {
  const value = req.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  return undefined;
}

export function setNoCacheHeaders(reply: any) {
  reply.header('cache-control', 'no-store');
}
