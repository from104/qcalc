/**
 * formula — 수식 계산기.
 *
 * 근거
 * - 수식 키패드(src/constants/CalcButtonSet.ts formula): 7~0·연산자 id 는 기본 키패드와 같고 row 0 이 더 있다
 *   (a0 '(' b0 ')' c0 '@' d0 '?'). x² 는 마지막 피연산자를 (s)^2 로, √x 는 sqrt(s) 로 감싼다(wrapLastToken).
 *   shift 확장: sin/cos/tan = a3/b3/c3 (도 단위 — FormulaMath.createFormulaTrigScope), log10 = b4, c0 = '$'.
 * - '=' (formulaStore.evaluate): '@' 는 현재 계산값(calc.currentNumber)으로, '$' 는 메모리 값으로 치환해 mathjs 로 평가하고
 *   결과를 currentNumber 에 넣는다. 평가 전 expressionError() 가 오류를 분류해 토스트로 알린다(utils/FormulaError.ts).
 * - 엔진(mathjs)은 처음 쓸 때 별도 청크(dist/spa/assets/math-*.js)로 불러온다(FormulaMath.ts). 수식 탭 화면이 열릴 때마다
 *   formulaStore.ensureMath() 를 부른다(FormulaPage.vue). 엔진이 없을 때 '=' 는 'formula engine not loaded' 예외를 던지고
 *   앱은 이를 "수식을 평가할 수 없습니다" 토스트로 바꾼다.
 * - 지연 로드가 실패하면 router/index.ts 의 vite:preloadError 리스너가 reloadOnce() 로 페이지를 한 번 새로 연다(10초 안에는 안 함).
 *   첫 화면 뒤 유휴 프리페치(App.vue, 최대 3초)가 엔진을 부르므로 청크를 끊은 앱은 반드시 한 번 스스로 새로고침한다 —
 *   입력 전에 settleSelfReload() 로 기다린다.
 * - 청크는 앱을 띄우기 전부터 끊는다(Scenario.blockFromStart). 뜬 뒤에 끊고 reload() 하면, 그 사이 프리페치가 받아 둔 청크를
 *   WebKit 이 메모리 캐시에서 꺼내 써(가로채기를 안 거친다) 엔진이 그대로 로드된다 — 부하 걸린 전체 실행에서만 나던 흔들림.
 */
import type { ButtonId, CalcApp } from '../drivers/CalcApp';
import { KEY, SHIFT, defineGroup, eventually, expectMain, shifted, tapKeys } from './kit';

const FORMULA_KEY: Record<string, ButtonId> = { ...KEY, '(': 'a0', ')': 'b0', '@': 'c0', '?': 'd0' };

/** 수식 키패드를 글자 하나씩 누른다 — 'C' 는 전체 지우기, '<' 는 ⌫ */
async function tapFormula(app: CalcApp, sequence: string): Promise<void> {
  for (const ch of sequence) {
    const id = FORMULA_KEY[ch];
    if (!id) throw new Error(`tapFormula: '${ch}' 에 해당하는 버튼이 없다`);
    await app.press(id);
  }
}

/** shift 확장 키 — 수식 탭에서 쓰는 것만 (sin cos tan log10) */
const FORMULA_SHIFT = { sin: 'a3', cos: 'b3', tan: 'c3', log10: 'b4', fact: 'c2' } as const satisfies Record<
  string,
  ButtonId
>;
const tapShifted = async (app: CalcApp, fn: keyof typeof FORMULA_SHIFT) => {
  await app.press(KEY['^']);
  await app.press(FORMULA_SHIFT[fn]);
};

/** 알림 중에 조건을 만족하는 글이 뜰 때까지 기다린다 */
const expectNotice = (app: CalcApp, includes: string) =>
  eventually(
    '알림',
    () => app.notices(),
    (notices) => notices.some((text) => text.includes(includes)),
  );

/** 번역 키가 그대로 나온 알림이 없는가 */
const noRawKeys = (notices: string[]) => notices.filter((text) => /\b(error|formula)\.[a-z_]+/i.test(text));

export default defineGroup('formula', [
  {
    title: '수식: 우선순위 · 괄호 · 나눗셈 · 나머지',
    run: async (app) => {
      await app.tab('formula');
      const calc = async (expression: string, result: string) => {
        await tapFormula(app, `C${expression}`);
        await eventually(
          '수식 칸',
          () => app.formulaExpression(),
          (text) => text.replace(/\s/g, '') === expression,
        );
        await tapFormula(app, '=');
        await expectMain(app, result);
      };
      await app.step('1+2*3 = 7 (곱셈 먼저)', () => calc('1+2*3', '7'));
      await app.step('(1+2)*3 = 9 (괄호 먼저)', () => calc('(1+2)*3', '9'));
      await app.step('10/4 = 2.5', () => calc('10/4', '2.5'));
      await app.step('7%3 = 1 (나머지)', () => calc('7%3', '1'));
      await app.step('2*(3+4)-5 = 9 (중첩)', () => calc('2*(3+4)-5', '9'));
      await app.step('수식 칸은 계산 뒤 비워진다', async () => {
        await eventually(
          '수식 칸이 안내 문구로',
          () => app.formulaExpression(),
          (text) => !text.includes('2*(3+4)'),
        );
      });
    },
  },
  {
    title: '수식: 함수 (x² · √x · sin · log10)',
    run: async (app) => {
      await app.tab('formula');
      await app.step('5 x² = 25', async () => {
        await tapFormula(app, 'C5');
        await app.press('a1');
        await eventually('수식 칸', () => app.formulaExpression(), '(5)^2');
        await tapFormula(app, '=');
        await expectMain(app, '25');
      });
      await app.step('16 √x = 4', async () => {
        await tapFormula(app, 'C16');
        await app.press('b1');
        await eventually('수식 칸', () => app.formulaExpression(), 'sqrt(16)');
        await tapFormula(app, '=');
        await expectMain(app, '4');
      });
      await app.step('sin(30°) = 0.5 (도 단위)', async () => {
        await tapFormula(app, 'C30');
        await tapShifted(app, 'sin');
        await eventually('수식 칸', () => app.formulaExpression(), 'sin(30)');
        await tapFormula(app, '=');
        await expectMain(app, '0.5');
      });
      await app.step('log10( 1000 ) = 3', async () => {
        await tapFormula(app, 'C');
        await tapShifted(app, 'log10');
        await tapFormula(app, '1000)');
        await eventually('수식 칸', () => app.formulaExpression(), 'log10(1000)');
        await tapFormula(app, '=');
        await expectMain(app, '3');
      });
    },
  },
  {
    title: '수식: @(현재 계산값) · $(메모리) 치환',
    run: async (app) => {
      await app.step('기본 계산기에서 2+3= → 5, 메모리에 저장', async () => {
        await tapKeys(app, 'C2+3=');
        await expectMain(app, '5');
        await shifted(app, 'MS');
      });
      await app.tab('formula');
      await app.step('@*2 = 10 (@ 는 현재 계산값 5)', async () => {
        // 'C' 는 계산값(5)까지 지우므로 누르지 않는다 — 탭을 막 열었으니 수식 칸은 비어 있다
        await tapFormula(app, '@*2');
        await eventually('수식 칸', () => app.formulaExpression(), '@*2');
        await tapFormula(app, '=');
        await expectMain(app, '10');
      });
      await app.step('$+1 = 6 (메모리 5)', async () => {
        await app.press('d1'); // ⌫ 로 수식만 지운다(@*2 가 이미 계산돼 비어 있다)
        await app.press(KEY['^']);
        await app.press('c0'); // shift 뒤 '$'
        await tapFormula(app, '+1');
        await eventually('수식 칸', () => app.formulaExpression(), '$+1');
        await tapFormula(app, '=');
        await expectMain(app, '6');
      });
      void SHIFT;
    },
  },
  {
    title: '수식: 잘못된 입력은 번역된 오류 안내를 보인다',
    run: async (app) => {
      await app.tab('formula');
      await app.step('여는 괄호만 있는 (1+2 → 괄호 오류, 결과는 그대로', async () => {
        await tapFormula(app, 'C(1+2=');
        await expectNotice(app, '괄호가 맞지 않습니다');
        await expectMain(app, '0');
        if (noRawKeys(await app.notices()).length) throw new Error('번역 키가 그대로 나왔다');
      });
      await app.step('1/0 → 무한대 안내', async () => {
        await tapFormula(app, 'C1/0=');
        await expectNotice(app, '무한대');
        await expectMain(app, '0');
      });
      await app.step('미완성 식 2+ → 구문 오류 안내', async () => {
        await tapFormula(app, 'C2+=');
        await expectNotice(app, '수식 구문이 올바르지 않습니다');
      });
      await app.step('오류 뒤에도 정상 식은 계산된다', async () => {
        await tapFormula(app, 'C6*7=');
        await expectMain(app, '42');
      });
    },
  },
  {
    title: '수식 엔진 청크를 끊으면 실패 안내를 보이고 결과는 그대로다',
    needs: ['netMock', 'reload'],
    blockFromStart: '/assets/math-',
    run: async (app) => {
      await app.step(
        '엔진 청크(assets/math-*.js)를 처음부터 끊은 앱이 스스로 새로고침을 마친 뒤 수식 탭으로',
        async () => {
          await app.settleSelfReload();
          await app.tab('formula');
        },
      );
      await app.step('1+2= → 엔진이 없어 실패 안내, 결과는 그대로, 번역 키 노출 없음', async () => {
        await tapFormula(app, 'C1+2=');
        await expectNotice(app, '수식을 평가할 수 없습니다');
        await expectMain(app, '0');
        if (noRawKeys(await app.notices()).length) throw new Error('번역 키가 그대로 나왔다');
      });
    },
  },
  {
    title: '수식 엔진 로드 실패 토스트에 영어 내부 메시지가 새지 않는다',
    needs: ['netMock', 'reload'],
    blockFromStart: '/assets/math-',
    run: async (app) => {
      await app.settleSelfReload();
      await app.tab('formula');
      await tapFormula(app, 'C1+2=');
      await expectNotice(app, '수식을 평가할 수 없습니다');
      const leaked = (await app.notices()).filter((text) =>
        /formula engine not loaded|[A-Za-z]{4,} [a-z]+ [a-z]+/.test(text),
      );
      if (leaked.length) throw new Error(`내부 영어 메시지가 노출됨: ${JSON.stringify(leaked)}`);
    },
  },
  {
    title: '수식 엔진 청크 로드가 한 번 실패해도 다음 시도에 불러와져 계산된다',
    needs: ['netMock', 'reload'],
    blockFromStart: '/assets/math-',
    run: async (app) => {
      await app.settleSelfReload();
      await app.tab('formula');
      await tapFormula(app, 'C1+2=');
      await expectNotice(app, '수식을 평가할 수 없습니다');
      await app.step(
        '끊기를 풀고 다른 탭에 갔다가 수식 탭에 다시 들어간다(화면이 다시 마운트되며 ensureMath 재호출)',
        async () => {
          await app.blockRequests(null);
          await app.tab('calc');
          await app.tab('formula');
          // 탭 전환 중에는 키패드가 잠깐 둘 보일 수 있다(WebKit) — 하나로 settle 될 때까지 C 를 눌러 본다
          await eventually('키패드 준비', () => app.press('c1').then(() => true), true);
        },
      );
      await app.step('= → 이번엔 불러와져 3', async () => {
        await tapFormula(app, 'C1+2=');
        await expectMain(app, '3');
      });
    },
  },
]);
