import { createParakeetCli } from './stt/parakeetCli.js';

async function main() {
  const stt = createParakeetCli();

  const audioPath = process.argv[2];
  if (!audioPath) {
    throw new Error('Usage: pnpm tsx src/voice/helloParakeet.ts path/to/audio.wav');
  }

  const transcript = await stt.transcribeFile({ audioPath });
  // eslint-disable-next-line no-console
  console.log(transcript);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
