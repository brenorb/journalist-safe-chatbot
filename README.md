# Journalist Safe Chatbot (Hackathon)

A simple mobile-first mental health chatbot for journalists covering high-risk situations.

## Goals
- Text-first, low-friction mental health support (check-ins, grounding, reflection)
- Optional voice: streaming STT (Parakeet) + TTS (Kyutai Pocket TTS) if latency allows
- Privacy by default (minimal retention, clear controls)
- Safety-aware (crisis escalation, disclaimers, resource links)

## Tech (proposed)
- **Mobile app:** (pick one)
  - React Native (Expo) for speed
  - Flutter for strong UI + perf
- **AI provider:** Maple AI (chat completions)
- **Voice (optional):**
  - STT: Parakeet (streaming)
  - TTS: Kyutai Pocket TTS (fast local / near-real-time)

## Repo layout
- `docs/` — requirements, safety considerations, API contracts
- `apps/mobile/` — mobile client (to be scaffolded)
- `server/` — optional thin backend (proxy, auth, redaction, logging controls)

## Next decisions
1. Do we ship **text-only** for demo, and gate voice behind a toggle?
2. Are we allowed to send any data to third-party APIs? If yes, what must be redacted?
3. Do we want a backend proxy (recommended) to avoid embedding API keys in the app?

See `docs/requirements.md` to refine scope.
