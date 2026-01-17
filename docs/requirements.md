# Requirements (Draft)

## Primary user
Journalists exposed to traumatic content, threats, or intense stress.

## Core flows (text-first)
1. **Quick check-in (30–60s)**
   - Mood + stress slider (or emojis)
   - “What’s happening?” short text
   - Suggest 1–2 actions (grounding, breathing, reframing, debrief)
2. **Guided grounding (2–5 min)**
   - Breathing timer / 5-4-3-2-1 sensory scan
   - Short, calming prompts
3. **Debrief / journaling (5–10 min)**
   - Structured prompts: what happened, what you felt, what you need
   - Optional export to notes / encrypted file
4. **Safety plan / crisis**
   - If user mentions self-harm or imminent danger: show crisis resources + encourage reaching out
   - Region-aware hotline list (for demo: US + “global directory” link)

## Non-goals (for hackathon)
- Not a medical diagnosis tool
- Not long-term therapy replacement
- No complex social features

## Privacy / data
- Default: **no long-term storage** unless user opts in
- If stored: encrypt on device; allow delete/export
- Redact obvious PII before sending to Maple AI (names, phones, emails) if feasible

## Latency targets
- Text response: < 2s perceived (stream tokens if possible)
- Voice mode: push-to-talk; partial transcripts in < 500ms ideally; TTS starts within ~500–800ms after first tokens

## MVP definition (demo-ready)
- Chat + 3 prebuilt flows (check-in, grounding, debrief)
- Safety disclaimers + crisis screen
- Basic settings: data retention, voice toggle
