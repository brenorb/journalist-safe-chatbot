# Voice Mode (Bonus) — Design Notes

This project is **text-first**. Voice is a **bonus mode**.

## Why voice is tricky
To feel “real-time”, voice needs streaming at every stage:
- **STT** should produce partial transcripts while the user speaks.
- **LLM** should stream tokens.
- **TTS** should start speaking before the whole answer is ready.

If any step is not streaming, latency jumps and the experience feels slow.

## Strategy
We implement **three independent API paths** so one mode never breaks another:

1. **Text-only (MVP, must work 100%)**
   - Input: chat messages
   - Output: assistant text (optionally streamed)

2. **Naive voice (simple, higher latency)**
   - Input: single audio blob
   - Flow: STT (full) → LLM (full/stream) → TTS (full)
   - Output: transcript + assistant text + one audio file

3. **Streaming voice (real-time, harder)**
   - Input: audio chunks (push-to-talk)
   - Flow: STT partials → LLM token stream → incremental TTS
   - Output: partial transcript events + AI tokens + audio chunks

## UX recommendations
- Use **push-to-talk** (not always-on) for privacy + lower complexity.
- Display partial transcript while recording.
- Start TTS after the first sentence/phrase is stable.
- Provide a clear **Stop** button (stop exercise + stop audio playback).

## Event types (streaming)
For the streaming mode, the server should emit events like:
- `transcript_partial` — partial STT updates
- `transcript_final` — final STT segment
- `assistant_token` — streamed LLM token
- `assistant_text_final` — final text
- `tts_audio_chunk` — base64 audio chunk (or binary over WS)
- `error` — recoverable errors

## Implementation notes
- Prefer **WebSocket** for streaming voice (bi-directional: audio up, events down).
- Prefer **SSE** for text streaming (simple, works well on mobile).
- Keep the text-only path clean and stable.

See `docs/api.md` for endpoint contracts.
