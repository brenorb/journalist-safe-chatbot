import test from 'node:test';
import assert from 'node:assert/strict';

import { createParakeetCli } from './stt/parakeetCli.js';

test('Parakeet STT builds expected python module args', async () => {
  let seen: any = null;

  const stt = createParakeetCli({
    cmd: 'python3',
    runner: async ({ cmd, argv }) => {
      seen = { cmd, argv };
      return { exitCode: 0, stdout: 'hello world\n', stderr: '' };
    },
  });

  const transcript = await stt.transcribeFile({ audioPath: 'in.wav' });
  assert.equal(transcript, 'hello world');

  assert.equal(seen.cmd, 'python3');
  assert.deepEqual(seen.argv, ['-m', 'parakeet', 'transcribe', '--audio', 'in.wav']);
});
