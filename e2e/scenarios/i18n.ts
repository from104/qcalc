/**
 * i18n — 10개 언어: 번역 누락 탐지 · 언어 전환 · 로케일 숫자 표기.
 *
 * 탐지 규칙 (각 언어 × 각 화면의 UiSnapshot)
 * 1. 조작 요소(버튼·탭·제목·콤보박스·메뉴항목·링크·입력칸)의 접근 가능한 이름이 비어 있으면 안 된다
 *    (스크린리더가 읽을 것이 없다).
 * 2. 보이는 글자·aria-label·title·placeholder 에 번역 키 모양이 새면 안 된다 — vue-i18n 은 키를 못 찾으면 키 문자열을
 *    그대로 돌려준다(예: 'ariaLabel.mainTabs', 'tooltip.search'). 점으로 이은 소문자 식별자와 camelCase 식별자를 잡는다.
 *    정상 글자는 LEGIT 허용 목록(주소·파일명·단위 기호 등)으로 제외한다 — 목록에 무엇이 왜 있는지는 항목마다 적는다.
 * 3. <html lang> 이 고른 언어와 같다(useHtmlLangSync).
 * 기록 화면은 항목이 보이도록 기록을 시드한다.
 *
 * 숫자 표기(src/utils/NumberUtils.ts formatNumberToLocale/parseLocaleNumber, Intl 기반 구분자):
 * de·es·fr·pt·ru 는 소수 구분자가 ',', 나머지(ko en ja zh hi)는 '.'. 붙여넣기는 그룹 구분자를 지우고 소수 구분자를 '.' 로 바꾼다.
 */
import type { CalcApp, ScreenName, TabName, UiSnapshot } from '../drivers/CalcApp';
import { LANGS, type LangCode } from '../fixtures/seed';
import { defineGroup, eventually, expectMain, tapKeys } from './kit';

/** 번역 키처럼 보이는 조각: 점으로 이은 식별자(ariaLabel.mainTabs) 또는 camelCase 식별자(openRecordPage) */
const DOTTED_KEY = /\b[a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+)+\b/g;
const CAMEL_KEY = /\b[a-z]+(?:[A-Z][a-z0-9]+)+\b/g;

/**
 * 키 모양이지만 정상인 글자 — 비워 두는 것이 기본이고, 실행해서 나온 정상 글자만 이유와 함께 더한다.
 * 정규식은 전체 일치(조각 하나 전체)로 비교한다.
 */
const LEGIT: { pattern: RegExp; why: string }[] = [
  { pattern: /^[a-z0-9.-]+\.(?:com|io|org|dev|net|app|kr)$/i, why: '정보 화면의 웹 주소 도메인(github.com 등)' },
  { pattern: /^v\d+(?:\.\d+)+$/, why: '정보 화면의 버전 표기(v0.13.6)' },
  { pattern: /^z\.b$/i, why: '독일어 약어 z.B. ("z.B. (1+3)*5")' },
  { pattern: /^(?:e\.g|i\.e)$/i, why: '영어 약어 e.g. / i.e. (수식 칸 안내문 "e.g. (1+3)*5")' },
];

const isLegit = (piece: string) => LEGIT.some(({ pattern }) => pattern.test(piece));

/** 기록 화면의 글꼴 크기 FAB(q-fab) 버튼 — 스냅숏의 where 에 아이콘 클래스로 잡힌다 */
const FONT_SIZE_FAB = /q-fab__icon/;

interface Finding {
  lang: string;
  screen: string;
  what: string;
}

/** UiSnapshot 에서 문제를 찾는다 */
function inspect(lang: string, screen: string, snapshot: UiSnapshot): Finding[] {
  const found: Finding[] = [];
  for (const control of snapshot.controls) {
    if (control.name.trim() === '') {
      found.push({ lang, screen, what: `빈 이름의 ${control.kind} (${control.where || '표지 없음'})` });
    }
  }
  const pieces = new Set<string>([...snapshot.texts, ...snapshot.controls.map((c) => c.name)]);
  for (const text of pieces) {
    for (const match of [...(text.match(DOTTED_KEY) ?? []), ...(text.match(CAMEL_KEY) ?? [])]) {
      if (isLegit(match)) continue;
      found.push({ lang, screen, what: `번역 키가 새는 듯: '${match}' (글 "${text.slice(0, 60)}")` });
    }
  }
  return found;
}

const MAIN_TABS: TabName[] = ['calc', 'unit', 'currency', 'radix', 'formula'];
const SCREENS: ScreenName[] = ['settings', 'record', 'help', 'about'];

/** 한 언어의 모든 화면을 돌며 문제를 모은다 */
async function auditLanguage(app: CalcApp, lang: LangCode): Promise<Finding[]> {
  const findings: Finding[] = [];
  const htmlLang = await app.documentLang();
  if (htmlLang !== lang)
    findings.push({ lang, screen: '<html>', what: `<html lang> 이 '${htmlLang}' (기대 '${lang}')` });

  for (const tab of MAIN_TABS) {
    await app.tab(tab);
    findings.push(...inspect(lang, `탭 ${tab}`, await app.snapshotUi()));
  }
  for (const screen of SCREENS) {
    await app.openScreen(screen);
    // 화면 내용이 자리 잡을 때까지 조금 기다린 뒤 읽는다(지연 로딩 화면)
    await eventually(
      '화면 글',
      async () => (await app.snapshotUi()).texts.length,
      (n) => n > 3,
    );
    findings.push(...inspect(lang, `화면 ${screen}`, await app.snapshotUi()));
    await app.openScreen('calc');
  }
  return findings;
}

const report = (findings: Finding[]) => findings.map((f) => `  [${f.lang}] ${f.screen}: ${f.what}`).join('\n');

/** 소수 구분자가 ',' 인 언어 (Intl 기준) */
const COMMA_DECIMAL: ReadonlySet<LangCode> = new Set(['de', 'es', 'fr', 'pt', 'ru']);
/** 그룹 구분자를 넣은 1234.5 — 붙여넣기 시험용 (fr·ru 는 NBSP) */
const PASTE_1234_5: Record<LangCode, string> = {
  ko: '1,234.5',
  en: '1,234.5',
  ja: '1,234.5',
  zh: '1,234.5',
  hi: '1,234.5',
  de: '1.234,5',
  es: '1.234,5',
  fr: '1 234,5',
  pt: '1.234,5',
  ru: '1 234,5',
};

export default defineGroup('i18n', [
  {
    title: '설정 화면에서 언어를 바꾼다 (한국어 → English)',
    run: async (app) => {
      await app.openScreen('settings');
      await app.step('언어 선택 상자에서 영어(English) 고르기', async () => {
        await app.choose('setting-language', '영어');
        await eventually('html lang', () => app.documentLang(), 'en');
      });
      await app.step('계산기로 돌아가면 탭 이름이 영어로 바뀌어 있다', async () => {
        await app.openScreen('calc');
        const snapshot = await app.snapshotUi();
        const tabNames = snapshot.controls.filter((c) => c.kind === 'tab').map((c) => c.name);
        if (tabNames.length === 0 || tabNames.some((name) => /[가-힣]/.test(name))) {
          throw new Error(`탭 이름이 아직 한국어이거나 없다: ${JSON.stringify(tabNames)}`);
        }
      });
    },
  },
  {
    title: '기록 화면 글꼴 크기 버튼에 접근 가능한 이름이 있다',
    seed: { history: [{ previousNumber: '1', operator: '+', argumentNumber: '2', resultNumber: '3' }] },
    run: async (app) => {
      await app.openScreen('record');
      await eventually(
        '글꼴 크기 버튼',
        async () => {
          const fab = (await app.snapshotUi()).controls.find((c) => FONT_SIZE_FAB.test(c.where));
          return fab ? fab.name : null;
        },
        (name) => typeof name === 'string' && name.trim() !== '',
      );
    },
  },
  {
    title: '기록 항목 ⋮ 메뉴 버튼에 접근 가능한 이름이 있다',
    needs: ['touch'],
    seed: { history: [{ previousNumber: '1', operator: '+', argumentNumber: '2', resultNumber: '3' }] },
    run: async (app) => {
      await app.openScreen('record');
      await eventually(
        '⋮ 버튼',
        async () => (await app.snapshotUi()).controls.find((c) => c.where.includes('record-menu-btn'))?.name ?? null,
        (name) => typeof name === 'string' && name.trim() !== '',
      );
    },
  },
  ...LANGS.map((lang) => ({
    title: `[${lang}] 모든 탭·화면에 날 번역 키와 빈 이름이 없다`,
    seed: {
      lang,
      history: [
        { previousNumber: '1', operator: '+', argumentNumber: '2', resultNumber: '3' },
        { previousNumber: '9', operator: '×', argumentNumber: '9', resultNumber: '81' },
      ],
    },
    run: async (app: CalcApp) => {
      const findings = await auditLanguage(app, lang);
      if (findings.length > 0) throw new Error(`${findings.length}건\n${report(findings)}`);
    },
  })),
  ...LANGS.map((lang) => ({
    title: `[${lang}] 소수점 표기와 붙여넣기 해석`,
    needs: ['keyboard' as const, 'clipboard' as const],
    seed: { lang },
    run: async (app: CalcApp) => {
      const decimal = COMMA_DECIMAL.has(lang) ? ',' : '.';
      await app.step(`1.5 + 1 = → 소수 구분자 '${decimal}' 로 2${decimal}5`, async () => {
        await tapKeys(app, 'C1.5+1=');
        await expectMain(app, `2${decimal}5`);
      });
      await app.step(`클립보드 '${PASTE_1234_5[lang]}' 를 붙이면 1234.5 로 해석`, async () => {
        await app.setClipboard(PASTE_1234_5[lang]);
        await app.key('Control+v');
        // 그룹 표기는 언어마다 달라(es 는 4자리에 묶음 없음 등) 숫자와 소수 구분자만 비교한다
        await eventually(
          '메인 숫자',
          async () => {
            const [integer = '', fraction = ''] = (await app.main()).split(decimal);
            return `${integer.replace(/\D/g, '')}.${fraction.replace(/\D/g, '')}`;
          },
          '1234.5',
        );
      });
    },
  })),
]);
