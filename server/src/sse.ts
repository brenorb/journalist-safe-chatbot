export function writeSseEvent(res: any, event: string, data: unknown) {
  // Fastify raw reply (Node http.ServerResponse)
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function setSseHeaders(reply: any) {
  reply.raw.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  });
}
