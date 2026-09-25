#!/usr/bin/env node
/**
 * @file measure-startup.mjs
 * @description 헤드리스 Chrome(CDP)으로 SPA 빌드의 시작 시간을 잰다.
 *              캐시 끔 + CPU 스로틀(기본 4배)로 저사양·콜드 스타트를 흉내 내고,
 *              "계산기 버튼이 모두 그려진 시점"(interactive)의 중앙값을 보고한다.
 *              사용법: node scripts/measure-startup.mjs <url> [--runs=10] [--cpu=4]
 *              (dist/spa 를 정적 서버로 띄운 URL 을 넘긴다. Node 22+ 내장 WebSocket 사용)
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const opt = (k, d) => Number(args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d);
const runs = opt('runs', 10);
const cpu = opt('cpu', 4);
if (!url) {
  console.error('사용법: node scripts/measure-startup.mjs <url> [--runs=10] [--cpu=4]');
  process.exit(2);
}

const chromeBin = process.env.CHROME_BIN ?? 'google-chrome';
const profile = mkdtempSync(join(tmpdir(), 'qcalc-perf-'));
const chrome = spawn(chromeBin, [
  '--headless=new',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--window-size=480,756',
  'about:blank',
]);

const wsUrl = await new Promise((resolve, reject) => {
  const onData = (d) => {
    const m = String(d).match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  };
  chrome.stderr.on('data', onData);
  setTimeout(() => reject(new Error('Chrome 시작 실패')), 15000);
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else listeners.forEach((fn) => fn(msg));
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });

// 페이지 시작 시점부터 계산기 버튼 출현을 감시하는 주입 스크립트
const PROBE = `
  window.__perf = {};
  new MutationObserver((_, obs) => {
    if (document.querySelectorAll('.q-btn').length >= 20 && !window.__perf.interactive) {
      requestAnimationFrame(() => { window.__perf.interactive = performance.now(); });
      obs.disconnect();
    }
  }).observe(document, { childList: true, subtree: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; })
    .observe({ type: 'largest-contentful-paint', buffered: true });
`;

const results = [];
for (let i = 0; i < runs; i++) {
  const { result: t } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: a } = await send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  const s = a.sessionId;
  await send('Page.enable', {}, s);
  await send('Network.enable', {}, s);
  await send('Network.setCacheDisabled', { cacheDisabled: true }, s);
  await send('Emulation.setCPUThrottlingRate', { rate: cpu }, s);
  await send('Page.addScriptToEvaluateOnNewDocument', { source: PROBE }, s);
  await send('Page.navigate', { url }, s);
  // interactive 가 잡힐 때까지 최대 15초 대기
  let perf = {};
  for (let w = 0; w < 150 && !perf.interactive; w++) {
    await new Promise((r) => setTimeout(r, 100));
    const { result } = await send(
      'Runtime.evaluate',
      {
        expression: `JSON.stringify({ ...window.__perf, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime })`,
        returnByValue: true,
      },
      s,
    );
    perf = JSON.parse(result?.result?.value ?? '{}');
  }
  results.push(perf);
  await send('Target.closeTarget', { targetId: t.targetId });
}

const median = (k) => {
  const v = results
    .map((r) => r[k])
    .filter((x) => typeof x === 'number')
    .sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)].toFixed(0) : '-';
};
console.log(`${url}  runs=${runs} cpu=${cpu}x  (median ms)`);
// 헤드리스에서는 FCP/LCP 가 잡히지 않는 경우가 많아 interactive 를 주 지표로 쓴다
console.log(`  interactive ${median('interactive')}  (FCP ${median('fcp')}, LCP ${median('lcp')})`);

ws.close();
await new Promise((r) => {
  chrome.once('exit', r);
  chrome.kill();
});
// Chrome 하위 프로세스가 늦게 쓰는 파일 때문에 정리가 실패할 수 있다 — 측정 결과와 무관하므로 무시
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch {
  /* 임시 프로필 정리 실패 무시 */
}
