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
import { mapleProxyChatCompletion } from './maple.js';
import { pipeOpenAiLikeStreamToSse } from './openaiSse.js';

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

  if (!env.MAPLE_PROXY_URL) {
    reply.code(500);
    return {
      error:
        'Server is not configured for Maple. Set MAPLE_PROXY_URL to a running Maple Proxy (OpenAI-compatible). ' +
        'Direct enclave E2E calls require a browser client (OpenSecret SDK) and cannot run in this Node server.',
    };
  }

  const upstream = await mapleProxyChatCompletion({
    proxyUrl: env.MAPLE_PROXY_URL,
    apiKey,
    model,
    messages,
    stream,
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    reply.code(upstream.status);
    return { error: 'Upstream error', status: upstream.status, body: text };
  }

  if (!stream) {
    const json = await upstream.json();
    const text: string =
      json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? '';
    return { text };
  }

  reply.raw.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  });

  let finalText = '';
  await pipeOpenAiLikeStreamToSse({
    upstream,
    onDelta: (delta) => {
      finalText += delta;
      reply.raw.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
    },
    onDone: () => {
      reply.raw.write('data: [DONE]\n\n');
      reply.raw.end();
    },
  });
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
