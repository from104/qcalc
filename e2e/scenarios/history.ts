/**
 * history — 계산 기록.
 *
 * 근거
 * - 저장: '=' 마다 CalculatorRecord.addRecord 가 맨 앞에 기록을 넣는다(최신이 앞, 최대 100). 기록 칸 글은
 *   RecordCard.vue recordStrings = `<좌변>\n= <우변>` 이고 정규화하면 '2 + 3= 5' 꼴이다(연산자는 Operator 의 '×' '÷').
 * - 복원: 기록 ⋮ 메뉴 '메인 패널로 불러오기'(loadToMainPanel) 가 currentNumber 를 그 결과로 바꾸고, 좁은 화면은 계산기 화면으로 돌아간다.
 * - 삭제: 데스크톱은 ⋮ 메뉴 '삭제', 터치 기기는 항목을 밀어 지운다(q-slide-item @left). 전체 삭제는 하위 화면 헤더의 휴지통 →
 *   확인 다이얼로그 '예'.
 * - 영속성: calcStore 는 pinia-plugin-persistedstate 로 localStorage 'calc' 에 저장한다.
 * - 시드: SeedState.history 는 위 저장 모양과 같다(fixtures/seed.ts) — 시드한 기록이 화면에 같은 순서·글로 나오는지로 확인한다.
 */
import type { CalcApp } from '../drivers/CalcApp';
import type { SeedState } from '../fixtures/seed';
import { defineGroup, eventually, expectMain, tapKeys } from './kit';

/** 최신이 앞 */
const HISTORY: NonNullable<SeedState['history']> = [
  { previousNumber: '10', operator: '÷', argumentNumber: '4', resultNumber: '2.5' },
  { previousNumber: '1', operator: '+', argumentNumber: '1', resultNumber: '2' },
  { previousNumber: '9', operator: '×', argumentNumber: '9', resultNumber: '81' },
];
const HISTORY_TEXTS = ['10 ÷ 4= 2.5', '1 + 1= 2', '9 × 9= 81'];

const expectRecords = (app: CalcApp, expected: string[]) =>
  eventually(
    '기록 목록',
    () => app.recordTexts(),
    (texts) => JSON.stringify(texts) === JSON.stringify(expected),
  );

export default defineGroup('history', [
  {
    title: '계산하면 기록에 저장된다 (최신이 맨 위)',
    run: async (app) => {
      await app.step('2+3= 와 7*6= 를 계산한다', async () => {
        await tapKeys(app, '2+3=');
        await expectMain(app, '5');
        await tapKeys(app, '7*6=');
        await expectMain(app, '42');
      });
      await app.step('기록 화면: 7 × 6= 42 가 위, 2 + 3= 5 가 아래', async () => {
        await app.openScreen('record');
        await expectRecords(app, ['7 × 6= 42', '2 + 3= 5']);
      });
    },
  },
  {
    title: '시드한 기록이 저장된 기록과 같은 모양으로 복원된다',
    seed: { history: HISTORY },
    run: async (app) => {
      await app.openScreen('record');
      await expectRecords(app, HISTORY_TEXTS);
      await app.step('시드 위에 새 계산을 하면 맨 앞에 붙는다', async () => {
        await app.openScreen('calc');
        await tapKeys(app, '3*3=');
        await expectMain(app, '9');
        await app.openScreen('record');
        await expectRecords(app, ['3 × 3= 9', ...HISTORY_TEXTS]);
      });
    },
  },
  {
    title: '기록을 불러오면 그 결과가 메인 칸에 들어간다',
    seed: { history: HISTORY },
    run: async (app) => {
      await app.openScreen('record');
      await expectRecords(app, HISTORY_TEXTS);
      await app.step('두 번째(1 + 1= 2) 를 불러온다 → 계산기 화면, 메인 2', async () => {
        await app.restoreRecord(1);
        await expectMain(app, '2');
      });
      await app.step('다른 기록(9 × 9= 81)도 불러온다 → 메인 81', async () => {
        await app.openScreen('record');
        await expectRecords(app, HISTORY_TEXTS);
        await app.restoreRecord(2);
        await expectMain(app, '81');
      });
    },
  },
  {
    title: '기록 한 건 삭제 · 전체 삭제',
    seed: { history: HISTORY },
    run: async (app) => {
      await app.openScreen('record');
      await expectRecords(app, HISTORY_TEXTS);
      await app.step('맨 위(10 ÷ 4) 한 건을 지운다', async () => {
        await app.deleteRecord(0);
        await expectRecords(app, ['1 + 1= 2', '9 × 9= 81']);
      });
      await app.step('전체 삭제 → 빈 목록', async () => {
        await app.deleteAllRecords();
        await expectRecords(app, []);
      });
    },
  },
  {
    title: '다시 띄워도 기록이 남는다',
    needs: ['reload'],
    run: async (app) => {
      await tapKeys(app, '2+3=');
      await expectMain(app, '5');
      await app.step('다시 띄운다 → 기록 화면에 2 + 3= 5', async () => {
        await app.reload();
        await app.openScreen('record');
        await expectRecords(app, ['2 + 3= 5']);
      });
      await app.step('다시 띄운 뒤의 계산도 이어서 쌓인다', async () => {
        await app.openScreen('calc');
        await tapKeys(app, 'C8-3=');
        await expectMain(app, '5');
        await app.openScreen('record');
        await expectRecords(app, ['8 - 3= 5', '2 + 3= 5']);
      });
    },
  },
]);
