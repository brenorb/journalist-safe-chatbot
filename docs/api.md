# API Contracts (Draft)

Base URL: `/api`

## 1) Text-only (MVP)

### `POST /api/text`
Headers:
- `x-maple-api-key`: required (unless the server has `MAPLE_API_KEY` set)
- `x-maple-model`: optional (defaults to `MAPLE_MODEL` or `llama-3.3-70b`)

Body:
```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "stream": true
}
```

Responses:
- Non-streaming: `200 application/json`
  ```json
  {"text": "..."}
  ```
- Streaming: `200 text/event-stream` (SSE)
  - Lines:
    - `data: {"token":"..."}` (repeated)
    - `data: [DONE]`

## 2) Naive voice (single blob)

### `POST /api/voice/naive`
- `multipart/form-data`
  - `audio` (file)
  - `format` (optional: `wav|m4a|mp3`)

Response: `200 application/json`
```json
{
  "transcript": "...",
  "text": "...",
  "audio": {
    "mime": "audio/wav",
    "base64": "..."
  }
}
```

## 3) Streaming voice (real-time)

### `GET /api/voice/stream` (WebSocket)
Client → Server messages (JSON):
- `{"type":"start","format":"pcm_s16le","sampleRate":16000}`
- `{"type":"audio","chunkBase64":"..."}` (repeat)
- `{"type":"stop"}`

Server → Client messages (JSON):
- `{"type":"transcript_partial","text":"..."}`
- `{"type":"transcript_final","text":"..."}`
- `{"type":"assistant_token","token":"..."}`
- `{"type":"assistant_text_final","text":"..."}`
- `{"type":"tts_audio_chunk","mime":"audio/wav","chunkBase64":"..."}`
- `{"type":"error","message":"..."}`

Notes:
- For hackathon, we can initially implement transcript + token streaming and add TTS chunking later.
