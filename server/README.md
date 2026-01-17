# Server

Thin proxy server for Maple AI + voice endpoints.

## Setup
- Copy `.env.example` → `.env` and fill `MAPLE_API_KEY` and `MAPLE_MODEL`.

## Run
```bash
cd server
pnpm i
pnpm dev
```

## Endpoints
- `GET /health`
- `POST /api/text` (JSON, supports SSE streaming)
- `POST /api/voice/naive` (placeholder)
- `WS /api/voice/stream` (placeholder)
