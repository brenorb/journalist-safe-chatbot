import { spawn } from 'node:child_process';

export type RunCommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export type RunCommand = (args: {
  cmd: string;
  argv: string[];
  stdin?: Buffer;
  cwd?: string;
}) => Promise<RunCommandResult>;

export const runCommand: RunCommand = async ({ cmd, argv, stdin, cwd }) => {
  return await new Promise((resolve, reject) => {
    const child = spawn(cmd, argv, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on('data', (d) => stdout.push(Buffer.from(d)));
    child.stderr.on('data', (d) => stderr.push(Buffer.from(d)));

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      resolve({
        exitCode: code ?? 0,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
      });
    });

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();
  });
};
