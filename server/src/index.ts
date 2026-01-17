import 'dotenv/config';

import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { WebSocketServer } from 'ws';

import { getEnv } from './env.js';
import { mapleClient } from './maple.js';
import type { ChatMessage } from './types.js';
import { setSseHeaders, writeSseEvent } from './sse.js';
import { pipeOpenAiLikeStreamToSse } from './openaiSse.js';

const env = getEnv();

const app = Fastify({
  logger: true,
});

app.get('/health', async () => ({ ok: true }));

app.post('/api/text', async (request, reply) => {
  const body = request.body as { messages?: ChatMessage[]; stream?: boolean };
  const messages = body?.messages ?? [];
  const stream = body?.stream ?? true;

  if (!env.MAPLE_API_KEY || !env.MAPLE_MODEL) {
    reply.code(500);
    return { error: 'Server not configured: MAPLE_API_KEY / MAPLE_MODEL' };
  }

  const upstream = await mapleClient.createChatCompletion({
    baseUrl: env.MAPLE_BASE_URL,
    apiKey: env.MAPLE_API_KEY,
    model: env.MAPLE_MODEL,
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

  setSseHeaders(reply);

  let finalText = '';
  await pipeOpenAiLikeStreamToSse({
    upstream,
    onDelta: (delta) => {
      finalText += delta;
      writeSseEvent(reply.raw, 'token', { token: delta });
    },
    onDone: () => {
      writeSseEvent(reply.raw, 'done', { text: finalText });
      reply.raw.end();
    },
  });
});

// Naive voice endpoint: placeholders (STT/TTS integration later)
app.register(multipart);
app.post('/api/voice/naive', async (request, reply) => {
  // For hackathon: keep contract stable; implement later.
  // We return 501 so the client can fall back to text-only.
  reply.code(501);
  return { error: 'Not implemented yet (naive STT/TTS)' };
});

// Streaming voice endpoint: WebSocket (placeholder)
// Path: /api/voice/stream
const server = await app.listen({ port: env.PORT, host: '0.0.0.0' });

const wss = new WebSocketServer({ noServer: true });

// Upgrade handler
(app.server as any).on('upgrade', (req: any, socket: any, head: any) => {
  if (req.url !== '/api/voice/stream') return;
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'error', message: 'Not implemented yet (streaming STT/TTS)' }));
  ws.close();
});

app.log.info(`Server listening on ${server}`);
