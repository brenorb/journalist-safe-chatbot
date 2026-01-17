import test from 'node:test';
import assert from 'node:assert/strict';

import { createPocketTtsCli } from './tts/pocketTtsCli.js';

test('PocketTTS builds expected CLI args', async () => {
  let seen: any = null;

  const tts = createPocketTtsCli({
    bin: 'pocket-tts',
    runner: async ({ cmd, argv }) => {
      seen = { cmd, argv };
      return { exitCode: 0, stdout: '', stderr: '' };
    },
  });

  // We do not actually need to create the output file in this unit test;
  // the adapter reads it after running, so we expect it to fail there.
  await assert.rejects(
    () => tts.synthesizeToFile({ text: 'hello', outPath: 'out.wav' }),
    /output file was not found/i,
  );

  assert.equal(seen.cmd, 'pocket-tts');
  assert.deepEqual(seen.argv, ['--text', 'hello', '--out', 'out.wav']);
});
