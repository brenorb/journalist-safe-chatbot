import 'dotenv/config';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { WebSocketServer } from 'ws';

import { getEnv } from './env.js';
import type { ChatMessage } from './types.js';
import { getHeaderString, setNoCacheHeaders } from './http.js';
import { createChatCompletion, streamChatCompletion } from './maple.js';

const env = getEnv();

const app = Fastify({ logger: true });

app.get('/health', async () => ({ ok: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await app.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

app.post('/api/text', async (request, reply) => {
  setNoCacheHeaders(reply);

  const body = request.body as { messages?: ChatMessage[]; stream?: boolean };
  const messages = body?.messages ?? [];
  const stream = body?.stream ?? true;

  const apiKey =
    getHeaderString(request, 'x-maple-api-key') ?? env.MAPLE_DEFAULT_API_KEY;
  const model =
    getHeaderString(request, 'x-maple-model') ?? env.MAPLE_DEFAULT_MODEL;

  if (!apiKey) {
    reply.code(400);
    return { error: 'Missing Maple API key. Pass x-maple-api-key header.' };
  }

  if (!stream) {
    const text = await createChatCompletion({
      apiUrl: env.MAPLE_API_URL,
      apiKey,
      model,
      messages,
    });

    return { text };
  }

  reply.raw.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  });

  let closed = false;
  request.raw.on('close', () => {
    closed = true;
  });

  await streamChatCompletion({
    apiUrl: env.MAPLE_API_URL,
    apiKey,
    model,
    messages,
    onDelta: (delta) => {
      if (closed) return;
      reply.raw.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
    },
  });

  if (!closed) {
    reply.raw.write('data: [DONE]\n\n');
    reply.raw.end();
  }
});

// Naive voice endpoint: placeholder (STT/TTS integration later)
app.register(multipart);
app.post('/api/voice/naive', async (_request, reply) => {
  reply.code(501);
  return { error: 'Not implemented yet (naive STT/TTS)' };
});

// Streaming voice endpoint: WebSocket placeholder
const serverAddress = await app.listen({ port: env.PORT, host: '0.0.0.0' });

const wss = new WebSocketServer({ noServer: true });

(app.server as any).on('upgrade', (req: any, socket: any, head: any) => {
  if (req.url !== '/api/voice/stream') return;
  wss.handleUpgrade(req, socket, head, (ws: any) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws: any) => {
  ws.send(
    JSON.stringify({
      type: 'error',
      message: 'Not implemented yet (streaming STT/TTS)',
    })
  );
  ws.close();
});

app.log.info(`Server listening on ${serverAddress}`);
