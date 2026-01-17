# STT/TTS (Hello World)

These are **separate** minimal adapters so we can plug in the best option during the hackathon.

## Pocket TTS (Kyutai) — TTS
Files:
- `server/src/voice/tts/pocketTtsCli.ts`
- Demo: `server/src/voice/helloPocketTts.ts`

Run (from `server/`):
- `pnpm i`
- `pnpm tsx src/voice/helloPocketTts.ts`

Expected: creates `out-hello.wav`.

Notes:
- This assumes a CLI named `pocket-tts` exists on your PATH and supports:
  - `pocket-tts --text "..." --out out.wav`
- If your Pocket TTS invocation differs, adapt the args in `createPocketTtsCli()`.

## Parakeet — STT
Files:
- `server/src/voice/stt/parakeetCli.ts`
- Demo: `server/src/voice/helloParakeet.ts`

Run (from `server/`):
- `pnpm i`
- `pnpm tsx src/voice/helloParakeet.ts path/to/audio.wav`

Expected: prints the transcript to stdout.

Notes:
- This assumes a Python module/CLI that can run as:
  - `python3 -m parakeet transcribe --audio path/to/audio.wav`
- If your Parakeet install uses a different command, adapt `createParakeetCli()`.

## Tests (TDD-ish)
We keep command construction tested even before wiring real binaries:
- `cd server && pnpm test`

Tests:
- `server/src/voice/pocketTtsCli.test.ts`
- `server/src/voice/parakeetCli.test.ts`
