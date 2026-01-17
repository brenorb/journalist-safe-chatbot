import { writeFile } from 'node:fs/promises';

import { createPocketTtsCli } from './tts/pocketTtsCli.js';

async function main() {
  const tts = createPocketTtsCli();
  const wav = await tts.synthesizeToFile({
    text: 'Hello world from Pocket TTS.',
    outPath: 'out-hello.wav',
  });

  await writeFile('out-hello.wav', wav);
  // eslint-disable-next-line no-console
  console.log('Wrote out-hello.wav');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
