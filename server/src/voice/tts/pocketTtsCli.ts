import { readFile } from 'node:fs/promises';

import type { RunCommand } from '../runCommand.js';
import { runCommand } from '../runCommand.js';

export type PocketTtsCliOptions = {
  bin?: string; // default: pocket-tts
  runner?: RunCommand;
};

export type PocketTtsSynthesizeArgs = {
  text: string;
  outPath: string;
  voice?: string;
};

export function createPocketTtsCli(opts: PocketTtsCliOptions = {}) {
  const bin = opts.bin ?? 'pocket-tts';
  const runner = opts.runner ?? runCommand;

  return {
    async synthesizeToFile({ text, outPath, voice }: PocketTtsSynthesizeArgs) {
      if (!text.trim()) throw new Error('PocketTTS: text is empty');

      const argv: string[] = [];
      if (voice) argv.push('--voice', voice);

      // Assumption: Pocket TTS CLI supports: pocket-tts --text "..." --out out.wav
      // If your local CLI differs, adapt here.
      argv.push('--text', text, '--out', outPath);

      try {
        const res = await runner({ cmd: bin, argv });
        if (res.exitCode !== 0) {
          throw new Error(`PocketTTS failed (exit ${res.exitCode}): ${res.stderr || res.stdout}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(
          `PocketTTS not runnable. Ensure Kyutai Pocket TTS CLI is installed and '${bin}' is on PATH.\n${msg}`
        );
      }

      try {
        return await readFile(outPath);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`PocketTTS ran but output file was not found: ${outPath}\n${msg}`);
      }
    },
  };
}
