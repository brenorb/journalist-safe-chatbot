# Architecture (Draft)

## Recommendation for hackathon
Text-first mobile app + thin backend proxy.

### Why a proxy?
- Avoid shipping Maple AI API keys in the mobile app
- Centralize redaction, rate limits, and safety checks
- Optional: store *nothing*; just forward requests

## Components
- **Mobile**
  - UI (designer-owned)
  - Chat state + streaming display
  - Optional voice (push-to-talk)
- **Server (optional but recommended)**
  - `/chat` endpoint → forwards to Maple AI
  - Redaction of obvious PII
  - Safety classifier / rules for crisis screen triggers

## Voice options
### Option A: Fastest to ship
- Device captures audio
- Send to server for Parakeet streaming STT
- Send transcript to Maple AI
- Stream tokens back
- TTS generated either:
  - on device (Pocket TTS) from streamed text chunks, or
  - server-side (if Pocket TTS runs there)

### Option B: On-device voice
- On-device STT + TTS to keep audio local
- Harder: model size, battery, iOS restrictions

## Real-time strategy
- Prefer **streaming** everywhere:
  - STT partials
  - Maple AI token streaming
  - incremental TTS (chunked)
- If streaming APIs aren’t available: fake it with rapid polling + chunked playback.
