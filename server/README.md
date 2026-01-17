# Server

Thin proxy server for Maple AI + voice endpoints.

## Setup
- Copy `.env.example` → `.env` and fill `MAPLE_PROXY_URL`, `MAPLE_API_KEY`, and `MAPLE_MODEL`.

## Run
```bash
cd server
pnpm i
pnpm dev
```

## Endpoints
- `GET /health`
- `POST /api/text` (JSON, supports SSE streaming)
  - Headers: `x-maple-api-key` (required unless `MAPLE_API_KEY` set), `x-maple-model` (optional)
- `POST /api/voice/naive` (placeholder)
- `WS /api/voice/stream` (placeholder)

## Test UI
Open `http://localhost:8787/` after starting the server.
