#!/usr/bin/env node
/**
 * @file gen-icon-map.mjs
 * @description 앱 소스에서 쓰는 아이콘 이름(Material Icons 스네이크 표기, mdi-* 표기)을 모아
 *              src/constants/IconMap.generated.ts 에 SVG 경로 맵을 생성한다.
 *              아이콘 웹폰트(수천 개 클래스 CSS + woff2)를 빼고 쓰는 아이콘만 번들하기 위함.
 *              사용법: node scripts/gen-icon-map.mjs [--check]
 *                --check: 생성 결과가 커밋된 파일과 다르면 실패 (CI·테스트용)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const OUT = join(root, 'src/constants/IconMap.generated.ts');

/** @quasar/extras 아이콘 모듈에서 export 이름 → 값 맵을 읽는다 */
function loadSet(file) {
  const src = readFileSync(join(root, 'node_modules/@quasar/extras', file), 'utf8');
  const map = new Map();
  for (const m of src.matchAll(/^export const (\w+) = '([^']*)'/gm)) map.set(m[1], m[2]);
  return map;
}
const mat = loadSet('material-icons/index.mjs');
const mdi = loadSet('mdi-v5/index.mjs');
const outlined = loadSet('material-icons-outlined/index.mjs');

// 웹폰트에만 있던 레거시 별칭 → SVG 세트의 대응 아이콘
const ALIASES = { info_outline: outlined.get('outlinedInfo') };

const toCamel = (s) => s.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
const matKey = (name) => 'mat' + toCamel('_' + name).replace(/^_/, '');
const mdiKey = (name) => toCamel(name); // 'mdi-equal' → 'mdiEqual'

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (e === '__tests__' || e.endsWith('.generated.ts')) continue;
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(vue|ts)$/.test(e)) acc.push(p);
  }
  return acc;
}

const used = new Map(); // name → svg
const unknownMdi = new Set();
for (const file of walk(join(root, 'src'))) {
  const src = readFileSync(file, 'utf8');
  // mdi-* 는 어디서든 확실한 아이콘 표기
  for (const m of src.matchAll(/['"`@]?(mdi-[a-z0-9-]+)/g)) {
    const svg = mdi.get(mdiKey(m[1]));
    if (svg) used.set(m[1], svg);
    else unknownMdi.add(`${m[1]} (${relative(root, file)})`);
  }
  // CalcButtonSet 의 '@이름' 은 아이콘 버튼 표기 — 줄 조건 없이 수집
  for (const m of src.matchAll(/['"`]@([a-z][a-z0-9_]*)['"`]/g)) {
    const svg = ALIASES[m[1]] ?? mat.get(matKey(m[1]));
    if (svg) used.set(m[1], svg);
  }
  // Material 이름: 'icon'·'name=' 이 들어간 줄의 따옴표 토큰 중 실존 아이콘만
  for (const line of src.split('\n')) {
    if (!/icon|name=/i.test(line)) continue;
    for (const m of line.matchAll(/['"`]([a-z][a-z0-9_]*)['"`]/g)) {
      const svg = ALIASES[m[1]] ?? mat.get(matKey(m[1]));
      if (svg) used.set(m[1], svg);
    }
  }
}

const names = [...used.keys()].sort();
const body = names.map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(used.get(n))},`).join('\n');
const out = `/* eslint-disable */
// 자동 생성 파일 — 직접 수정 금지. \`node scripts/gen-icon-map.mjs\` 로 재생성한다.
// 앱에서 쓰는 아이콘 이름 → Quasar SVG 경로 (@quasar/extras material-icons · mdi-v5)
export const ICON_MAP: Record<string, string> = {
${body}
};
`;

if (process.argv.includes('--check')) {
  const cur = readFileSync(OUT, 'utf8');
  if (cur !== out) {
    console.error('IconMap.generated.ts 가 소스와 다르다 — node scripts/gen-icon-map.mjs 실행 필요');
    process.exit(1);
  }
  console.log(`icon map OK (${names.length})`);
} else {
  writeFileSync(OUT, out);
  console.log(`icons: ${names.length}`);
}
if (unknownMdi.size) console.warn('mdi-v5에 없는 이름:', [...unknownMdi].join(', '));
