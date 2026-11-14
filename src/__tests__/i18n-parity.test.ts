/**
 * @file i18n-parity.test.ts
 * @description 전역 메시지(src/i18n/**)와 SFC `<i18n>` 블록 전부에서 10개 언어가 기준 언어(ko)의 키를 빠짐없이
 *              갖고 있는지 검사합니다. fallbackLocale 이 'en' 이라 한 언어에서 번역이 빠져도 화면에는 영어가 나와서
 *              E2E 로는 드러나지 않기 때문입니다.
 *
 *              이미 있는 빈틈은 i18n-parity-baseline.json 에 기록해 두고, **새로 생긴 빈틈만** 실패시킵니다.
 *              기준선에 있던 빈틈이 채워지면 기준선을 줄이라고 알립니다(실패). 기준선 갱신:
 *                UPDATE_I18N_BASELINE=1 yarn test src/__tests__/i18n-parity.test.ts
 *
 *              빈틈 = 기준 언어에 있는 키가 해당 언어에 없거나, 문자열이 아니거나, 빈 문자열인 경우.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'src');
const BASELINE_FILE = join(__dirname, 'i18n-parity-baseline.json');
const REFERENCE = 'ko';
const LANGS = SUPPORTED_LANGUAGES.map((l) => l.code);

type Tree = Record<string, unknown>;
/** 한 출처(파일 또는 SFC)의 { 언어 → 평탄화된 키 → 값 } */
type Source = Record<string, Map<string, unknown>>;

/** 중첩 객체를 'a.b.c' 키로 펼친다. 배열은 'a[0]' 로 펼쳐 항목 수 차이도 잡는다 */
function flatten(value: unknown, prefix = '', out = new Map<string, unknown>()): Map<string, unknown> {
  if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Tree)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (prefix) {
    out.set(prefix, value);
  }
  return out;
}

const walk = (dir: string, ext: string, acc: string[] = []): string[] => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '__tests__') walk(full, ext, acc);
    } else if (entry.name.endsWith(ext)) acc.push(full);
  }
  return acc;
};

const rel = (file: string) => relative(ROOT, file).split('\\').join('/');

/** 출처 수집 */
function collectSources(): Record<string, Source> {
  const sources: Record<string, Source> = {};

  // 1) 언어별 파일: messages/<lang>Messages.yml, errors/<lang>Errors.yml — 파일 하나가 언어 하나
  for (const [dir, suffix] of [
    ['messages', 'Messages'],
    ['errors', 'Errors'],
  ] as const) {
    const source: Source = {};
    for (const lang of LANGS) {
      const text = readFileSync(join(SRC, 'i18n', dir, `${lang}${suffix}.yml`), 'utf8');
      source[lang] = flatten(parse(text));
    }
    sources[`src/i18n/${dir}/*${suffix}.yml`] = source;
  }

  // 2) components/*.yml 과 3) SFC 인라인 <i18n> — 최상위 키가 언어
  const fromLangTree = (tree: Tree | null): Source =>
    Object.fromEntries(LANGS.map((lang) => [lang, flatten((tree ?? {})[lang])]));
  for (const file of walk(join(SRC, 'i18n', 'components'), '.yml')) {
    sources[rel(file)] = fromLangTree(parse(readFileSync(file, 'utf8')) as Tree);
  }
  for (const file of walk(SRC, '.vue')) {
    const text = readFileSync(file, 'utf8');
    // src="..." 로 외부 파일을 쓰는 블록은 위 components/*.yml 에서 이미 검사한다
    for (const match of text.matchAll(/<i18n\b([^>]*)>([\s\S]*?)<\/i18n>/g)) {
      if (/\bsrc\s*=/.test(match[1]!)) continue;
      const name = rel(file);
      sources[name] = fromLangTree(parse(match[2]!) as Tree);
    }
  }
  return sources;
}

const isMissing = (value: unknown) => typeof value !== 'string' || value.trim() === '';

/** 출처별 { 언어 → 정렬된 누락 키 } (누락이 있는 것만) */
function findGaps(sources: Record<string, Source>): Record<string, Record<string, string[]>> {
  const gaps: Record<string, Record<string, string[]>> = {};
  for (const [name, source] of Object.entries(sources)) {
    const reference = source[REFERENCE]!;
    for (const lang of LANGS) {
      if (lang === REFERENCE) continue;
      const missing = [...reference.keys()].filter((key) => isMissing(source[lang]!.get(key))).sort();
      if (missing.length) (gaps[name] ??= {})[lang] = missing;
    }
  }
  return gaps;
}

const sources = collectSources();
const gaps = findGaps(sources);
const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8')) as Record<string, Record<string, string[]>>;

const countByLang = (g: Record<string, Record<string, string[]>>) =>
  Object.fromEntries(LANGS.map((lang) => [lang, Object.values(g).reduce((n, s) => n + (s[lang]?.length ?? 0), 0)]));

describe('i18n 키 패리티 (전역 메시지 + SFC <i18n>)', () => {
  it('기준 언어(ko)의 키가 각 출처에 있고 최소 한 출처는 읽혔다', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);
    for (const source of Object.values(sources)) expect(source[REFERENCE]!.size).toBeGreaterThan(0);
  });

  it('현재 빈틈 현황 (기준선과 비교)', () => {
    const now = countByLang(gaps);
    const base = countByLang(baseline);
    console.info(
      `[i18n parity] 언어별 번역 누락 (기준 ${REFERENCE}) — 현재 ${JSON.stringify(now)} / 기준선 ${JSON.stringify(base)}`,
    );
    expect(Object.keys(now)).toEqual(LANGS);
  });

  it('새로 생긴 빈틈이 없고, 기준선에 있던 빈틈은 그대로이거나 줄었다', () => {
    if (process.env.UPDATE_I18N_BASELINE) {
      writeFileSync(BASELINE_FILE, JSON.stringify(gaps, null, 2) + '\n');
      return;
    }
    const added: string[] = [];
    const fixed: string[] = [];
    for (const name of new Set([...Object.keys(gaps), ...Object.keys(baseline)])) {
      for (const lang of LANGS) {
        const nowKeys = new Set(gaps[name]?.[lang] ?? []);
        const baseKeys = new Set(baseline[name]?.[lang] ?? []);
        for (const key of nowKeys) if (!baseKeys.has(key)) added.push(`${name} [${lang}] ${key}`);
        for (const key of baseKeys) if (!nowKeys.has(key)) fixed.push(`${name} [${lang}] ${key}`);
      }
    }
    expect(
      added,
      `새 번역 누락 ${added.length}건 — 번역을 추가하세요 (의도적이면 UPDATE_I18N_BASELINE=1 로 기준선 갱신):\n${added.join('\n')}`,
    ).toEqual([]);
    expect(
      fixed,
      `기준선의 빈틈 ${fixed.length}건이 채워졌습니다 — 기준선을 줄이세요 (UPDATE_I18N_BASELINE=1 yarn test src/__tests__/i18n-parity.test.ts):\n${fixed.join('\n')}`,
    ).toEqual([]);
  });
});
