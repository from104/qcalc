/**
 * Outside-the-app helpers for the Linux app layer, both running inside the isolated session (Xvfb + private bus):
 *  - ClipboardHelper: owns/reads the X CLIPBOARD like any other desktop program (support/clipboard.py)
 *  - AnnouncementListener: hears AT-SPI `object:announcement` events like a screen reader (support/atspi-listen.py)
 * Both are child processes with known PIDs; stop() ends them.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

import type { AppClipboard } from './platform';
import { terminate } from './procs';

const SUPPORT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'support');

class LineProcess {
  readonly child: ChildProcess;
  private readonly buffered: string[] = [];
  private readonly waiting: ((line: string) => void)[] = [];
  private exited = false;

  constructor(script: string, env: NodeJS.ProcessEnv) {
    this.child = spawn('python3', ['-I', path.join(SUPPORT, script)], { env, stdio: ['pipe', 'pipe', 'inherit'] });
    createInterface({ input: this.child.stdout! }).on('line', (line) => {
      const waiter = this.waiting.shift();
      if (waiter) waiter(line);
      else this.buffered.push(line);
    });
    this.child.on('exit', () => {
      this.exited = true;
    });
  }

  next(timeoutMs = 5000): Promise<string> {
    const line = this.buffered.shift();
    if (line !== undefined) return Promise.resolve(line);
    if (this.exited) return Promise.reject(new Error('helper process exited'));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiting.splice(this.waiting.indexOf(done), 1);
        reject(new Error(`helper: no answer within ${timeoutMs}ms`));
      }, timeoutMs);
      const done = (l: string) => {
        clearTimeout(timer);
        resolve(l);
      };
      this.waiting.push(done);
    });
  }

  drain(): string[] {
    return this.buffered.splice(0);
  }

  send(payload: unknown): void {
    this.child.stdin!.write(JSON.stringify(payload) + '\n');
  }

  async stop(): Promise<void> {
    this.child.stdin?.end();
    if (this.child.pid) await terminate([this.child.pid], 1000);
  }
}

export class ClipboardHelper implements AppClipboard {
  private queue: Promise<unknown> = Promise.resolve();

  private constructor(private readonly proc: LineProcess) {}

  static async start(env: NodeJS.ProcessEnv): Promise<ClipboardHelper> {
    const proc = new LineProcess('clipboard.py', env);
    const hello = JSON.parse(await proc.next(10_000)) as { ready?: boolean };
    if (!hello.ready) throw new Error(`clipboard helper did not start: ${JSON.stringify(hello)}`);
    return new ClipboardHelper(proc);
  }

  /** one request at a time — the helper answers in order */
  private request<T>(payload: unknown): Promise<T> {
    const run = async () => {
      this.proc.send(payload);
      const answer = JSON.parse(await this.proc.next()) as { ok: boolean; error?: string } & T;
      if (!answer.ok) throw new Error(`clipboard helper: ${answer.error}`);
      return answer;
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  async set(text: string): Promise<void> {
    await this.request({ op: 'set', text });
  }

  /** text on the system clipboard; '' when the owner offers no text */
  async get(): Promise<string> {
    return (await this.request<{ text: string | null }>({ op: 'get' })).text ?? '';
  }

  stop(): Promise<void> {
    return this.proc.stop();
  }
}

export interface Announcement {
  type: string;
  text: string;
  app: string | null;
}

export class AnnouncementListener {
  private readonly heard: Announcement[] = [];

  private constructor(private readonly proc: LineProcess) {}

  static async start(env: NodeJS.ProcessEnv): Promise<AnnouncementListener> {
    const proc = new LineProcess('atspi-listen.py', env);
    const hello = JSON.parse(await proc.next(15_000)) as { ready?: boolean };
    if (!hello.ready) throw new Error(`AT-SPI listener did not start: ${JSON.stringify(hello)}`);
    return new AnnouncementListener(proc);
  }

  /** everything announced so far */
  all(): Announcement[] {
    this.heard.push(...this.proc.drain().map((line) => JSON.parse(line) as Announcement));
    return [...this.heard];
  }

  stop(): Promise<void> {
    return this.proc.stop();
  }
}
