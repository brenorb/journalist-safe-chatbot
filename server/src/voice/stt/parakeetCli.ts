import type { RunCommand } from '../runCommand.js';
import { runCommand } from '../runCommand.js';

export type ParakeetCliOptions = {
  cmd?: string; // default: python3
  runner?: RunCommand;
};

export type ParakeetTranscribeArgs = {
  audioPath: string;
  model?: string;
};

export function createParakeetCli(opts: ParakeetCliOptions = {}) {
  const cmd = opts.cmd ?? 'python3';
  const runner = opts.runner ?? runCommand;

  return {
    async transcribeFile({ audioPath, model }: ParakeetTranscribeArgs) {
      const argv: string[] = ['-m', 'parakeet', 'transcribe', '--audio', audioPath];
      if (model) argv.push('--model', model);

      try {
        const res = await runner({ cmd, argv });
        if (res.exitCode !== 0) {
          throw new Error(`Parakeet STT failed (exit ${res.exitCode}): ${res.stderr || res.stdout}`);
        }

        // Expect the CLI to print just the transcript.
        return res.stdout.trim();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(
          `Parakeet STT not runnable. Ensure Parakeet is installed (python module) and '${cmd}' is on PATH.\n${msg}`
        );
      }
    },
  };
}
