#!/usr/bin/env node
/**
 * @file measure-bundle.mjs
 * @description SPA 빌드 결과에서 "시작 시 실제로 받는" JS/CSS 크기(gzip)를 잰다.
 *              index.html 의 진입 스크립트와 첫 라우트 레이아웃(MainLayout)에서 출발해
 *              정적 import 그래프만 따라간다 (동적 import 로 지연되는 chunk 는 제외).
 *              사용법: node scripts/measure-bundle.mjs [dist/spa] [--budget-js=KB] [--budget-css=KB]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--')) ?? 'dist/spa';
const budget = (k) => Number(args.find((a) => a.startsWith(`--budget-${k}=`))?.split('=')[1] ?? Infinity);
const assets = join(dir, 'assets');
if (!existsSync(assets)) {
  console.error(`빌드 결과 없음: ${assets}`);
  process.exit(2);
}

const files = readdirSync(assets);
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const entries = [...html.matchAll(/(?:src|href)="\/?assets\/([^"]+\.js)"/g)].map((m) => m[1]);
const layout = files.find((f) => /^MainLayout-.*\.js$/.test(f));
if (layout) entries.push(layout);

const seen = new Set();
const queue = [...entries];
while (queue.length) {
  const f = queue.pop();
  if (seen.has(f) || !files.includes(f)) continue;
  seen.add(f);
  const src = readFileSync(join(assets, f), 'utf8');
  for (const m of src.matchAll(/(?:from|import)\s*["']\.\/([^"']+\.js)["']/g)) queue.push(m[1]);
}

const gz = (f) => gzipSync(readFileSync(join(assets, f))).length;
const js = [...seen].reduce((t, f) => t + gz(f), 0);
// 시작 CSS: index.html 이 링크한 CSS + 시작 JS chunk 와 같은 이름의 CSS
const cssLinked = [...html.matchAll(/href="\/?assets\/([^"]+\.css)"/g)].map((m) => m[1]);
const cssByChunk = files.filter((f) => f.endsWith('.css') && seen.has(f.replace(/\.css$/, '.js')));
const cssFiles = [...new Set([...cssLinked, ...cssByChunk])];
const css = cssFiles.reduce((t, f) => t + gz(f), 0);

const kb = (n) => (n / 1024).toFixed(1);
console.log(`startup JS  ${kb(js)} KB gz (${seen.size} files)`);
console.log(`startup CSS ${kb(css)} KB gz (${cssFiles.length} files)`);

let fail = false;
if (js / 1024 > budget('js')) {
  console.error(`JS 예산 초과: ${kb(js)} > ${budget('js')} KB`);
  fail = true;
}
if (css / 1024 > budget('css')) {
  console.error(`CSS 예산 초과: ${kb(css)} > ${budget('css')} KB`);
  fail = true;
}
process.exit(fail ? 1 : 0);
