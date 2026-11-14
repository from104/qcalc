#!/usr/bin/env node
/**
 * e2e 용 정적 서버 — Playwright `webServer` 가 띄운다.
 *
 * 1. dist/spa 가 없거나 소스보다 오래됐으면(또는 E2E_REBUILD=1) `quasar build -m spa` 로 다시 만든다.
 * 2. dist/spa 를 127.0.0.1:E2E_PORT(기본 4178)에서 그대로 내준다 — 운영 빌드를 시험한다.
 *    `--build-only` 면 1 만 하고 끝낸다(app 층이 Tauri 바이너리에 넣을 dist/spa 를 준비할 때).
 *
 * 의존성 없이 node 내장 모듈만 쓴다. 빌드 로그는 test-results/e2e-build.log 로 남긴다.
 */
import { spawnSync } from 'node:child_process';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist/spa');
const indexHtml = path.join(dist, 'index.html');
const port = Number(process.env.E2E_PORT || 4178);

// 빌드 결과에 영향을 주는 입력들 — 이 중 하나라도 index.html 보다 새로우면 다시 빌드한다
const BUILD_INPUTS = ['src', 'public', 'index.html', 'quasar.config.ts', 'package.json'];

/** dir 아래에 builtAt 보다 새로 고친 파일이 하나라도 있으면 그 경로를 돌려준다 */
function newerThan(target, builtAt) {
  if (!existsSync(target)) return null;
  const st = statSync(target);
  if (!st.isDirectory()) return st.mtimeMs > builtAt ? target : null;
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name.startsWith('.')) continue;
    const hit = newerThan(path.join(target, entry.name), builtAt);
    if (hit) return hit;
  }
  return null;
}

function staleReason() {
  if (process.env.E2E_REBUILD === '1') return 'E2E_REBUILD=1';
  if (!existsSync(indexHtml)) return 'dist/spa 없음';
  const builtAt = statSync(indexHtml).mtimeMs;
  for (const input of BUILD_INPUTS) {
    const hit = newerThan(path.join(root, input), builtAt);
    if (hit) return `${path.relative(root, hit)} 이(가) 빌드보다 새로움`;
  }
  return null;
}

const reason = staleReason();
if (reason) {
  mkdirSync(path.join(root, 'test-results'), { recursive: true });
  const logPath = path.join(root, 'test-results/e2e-build.log');
  const log = openSync(logPath, 'w');
  console.error(`[e2e] SPA 빌드 시작 (${reason}) — 로그: ${path.relative(root, logPath)}`);
  const started = Date.now();
  const r = spawnSync('yarn', ['quasar', 'build', '-m', 'spa'], { cwd: root, stdio: ['ignore', log, log] });
  if (r.status !== 0) {
    console.error(`[e2e] SPA 빌드 실패 (exit ${r.status}) — ${logPath}`);
    process.exit(1);
  }
  console.error(`[e2e] SPA 빌드 완료 ${((Date.now() - started) / 1000).toFixed(1)}s`);
} else {
  console.error('[e2e] 기존 dist/spa 재사용 (강제 재빌드: E2E_REBUILD=1)');
}
// app 층(e2e/app/build.mjs)은 빌드만 맡기고 서버는 띄우지 않는다
if (process.argv.includes('--build-only')) process.exit(0);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

// 같은 출처의 빈 문서 — 드라이버가 앱을 띄우기 전에 localStorage 를 심을 때 쓴다(seed)
const BLANK = '<!doctype html><meta charset="utf-8"><title>e2e blank</title>';

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0] || '/');
    const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    const file = path.join(dist, rel);
    if (!file.startsWith(dist + path.sep) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(BLANK);
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    createReadStream(file).pipe(res);
  })
  .listen(port, '127.0.0.1', () => {
    // Playwright 가 SIGKILL 로 죽으면 이 서버는 고아로 남는다 — test-suite.sh 가 다음 실행 전에 이 pid 파일로 정리한다
    mkdirSync(path.join(root, 'test-results'), { recursive: true });
    writeFileSync(path.join(root, 'test-results', '.e2e-server.pid'), String(process.pid));
    console.error(`[e2e] serving dist/spa at http://127.0.0.1:${port}`);
  });
const cleanPid = () => rmSync(path.join(root, 'test-results', '.e2e-server.pid'), { force: true });
process.on('exit', cleanPid);
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => process.exit(0));
