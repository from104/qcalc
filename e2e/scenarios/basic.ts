/**
 * basic — 기본 계산기 키패드 (참조 구현).
 *
 * 기대값의 근거: src/core/calculator/CalculatorOperationHandler.ts
 * - 연속 계산: 연산자를 다시 누르면 앞 계산을 먼저 끝낸다(performPreCalculation). '=' 뒤 연산자는 결과에 이어진다.
 * - 퍼센트: × 나 ÷ 가 걸려 있을 때만 동작한다. 200×15% = 200·15/100 = 30, 50÷200% = 50/200·100 = 25.
 * - 메모리: MS 저장, M+/M- 가감, MR 불러오기, MC 비우기. 메모리 연산 직후 3초 동안은 메인 칸에
 *   메모리 값이 대신 보인다(calcStore.showMemoryTemporarily) — 그래서 그 뒤 단언은 시간을 넉넉히 준다.
 */
import { defineGroup, expectMain, expectMemory, shifted, tapKeys } from './kit';

/** 메모리 표시(3초) 가 끝날 때까지 넉넉히 */
const AFTER_MEMORY_DISPLAY = { timeout: 6000 };

export default defineGroup('basic', [
  {
    title: '완전히 새로 설치한 첫 실행에는 "설정이 초기화되었습니다" 토스트가 뜨지 않는다',
    knownBug:
      '빈 저장소에서 App.vue(~118-121)가 비어 있는 sourceUnits: {} 를 "고친 것"으로 세어 첫 실행에 ' +
      '"앱 업데이트로 인해 일부 저장된 설정이 초기화되었습니다" 토스트를 띄운다',
    // 단위·통화·진법 스토어를 시드하지 않는다 (null = 시드 제외)
    seed: { stores: { unit: null, currency: null, radix: null } },
    run: async (app) => {
      // 토스트는 마운트 2.5초 뒤에 뜬다(App.vue setTimeout) — 넉넉히 기다린 뒤 없음을 확인
      await new Promise((resolve) => setTimeout(resolve, 4000));
      const shown = (await app.notices()).filter((text) => text.includes('초기화되었습니다'));
      if (shown.length) throw new Error(`첫 실행에 토스트가 떴다: ${JSON.stringify(shown)}`);
    },
  },
  {
    title: '사칙연산과 소수',
    run: async (app) => {
      await app.step('7 × 6 = 42', async () => {
        await tapKeys(app, '7*6=');
        await expectMain(app, '42');
      });
      await app.step('9 − 12 = −3', async () => {
        await tapKeys(app, 'C9-12=');
        await expectMain(app, '-3');
      });
      await app.step('1 ÷ 4 = 0.25', async () => {
        await tapKeys(app, 'C1/4=');
        await expectMain(app, '0.25');
      });
      await app.step('1.5 + 2.25 = 3.75', async () => {
        await tapKeys(app, 'C1.5+2.25=');
        await expectMain(app, '3.75');
      });
      await app.step('자릿수 묶음: 1234 × 2 = 2,468', async () => {
        await tapKeys(app, 'C1234*2=');
        await expectMain(app, '2,468');
      });
    },
  },
  {
    title: '연속 계산',
    run: async (app) => {
      await app.step('2 + 3 = 뒤 × 4 = → 20', async () => {
        await tapKeys(app, '2+3=');
        await expectMain(app, '5');
        await tapKeys(app, '*4=');
        await expectMain(app, '20');
      });
      await app.step('연산자 연쇄: 2 + 3 + 는 중간 결과 5, 이어서 4 = → 9', async () => {
        await tapKeys(app, 'C2+3+');
        await expectMain(app, '5');
        await tapKeys(app, '4=');
        await expectMain(app, '9');
      });
      await app.step('= 뒤 숫자를 누르면 새 계산', async () => {
        await tapKeys(app, '7');
        await expectMain(app, '7');
        await tapKeys(app, '+1=');
        await expectMain(app, '8');
      });
    },
  },
  {
    title: '퍼센트',
    run: async (app) => {
      await app.step('200 × 15 % → 30', async () => {
        await tapKeys(app, '200*15%');
        await expectMain(app, '30');
      });
      await app.step('50 ÷ 200 % → 25', async () => {
        await tapKeys(app, 'C50/200%');
        await expectMain(app, '25');
      });
      await app.step('퍼센트 결과에 이어서 계산: + 5 = → 30', async () => {
        await tapKeys(app, '+5=');
        await expectMain(app, '30');
      });
    },
  },
  {
    title: '메모리 MS · M+ · M- · MR · MC',
    run: async (app) => {
      await app.step('처음에는 메모리 표시 없음', () => expectMemory(app, false));
      await app.step('5 MS → 메모리 5', async () => {
        await tapKeys(app, '5');
        await shifted(app, 'MS');
        await expectMemory(app, true);
        await expectMain(app, '5');
      });
      // MR 직후 3초는 메인 칸이 메모리 값을 임시로 보여 주므로(MR 이 고장나도 같은 값이 보인다) 화면 값을 MR 의 증거로 쓰지 않는다.
      // 대신 불러온 값으로 계산을 이어 가서, 그 결과가 임시 표시가 끝난 뒤에도 남는지(= MR 이 계산값을 실제로 바꿨는지) 본다.
      await app.step('3 M+ → 메모리 8, MR 후 + 2 = → 10', async () => {
        await tapKeys(app, 'C3');
        await shifted(app, 'M+');
        await tapKeys(app, 'C');
        await shifted(app, 'MR');
        await tapKeys(app, '+2=');
        await expectMain(app, '10', AFTER_MEMORY_DISPLAY);
      });
      await app.step('4 M- → 메모리 4, MR 후 + 1 = → 5', async () => {
        await tapKeys(app, 'C4');
        await shifted(app, 'M-');
        await tapKeys(app, 'C');
        await shifted(app, 'MR');
        await tapKeys(app, '+1=');
        await expectMain(app, '5', AFTER_MEMORY_DISPLAY);
      });
      await app.step('MC → 메모리 표시 사라짐', async () => {
        await shifted(app, 'MC');
        await expectMemory(app, false);
      });
    },
  },
  {
    title: '리셋과 지우기',
    run: async (app) => {
      await app.step('12 + 3 입력 중 C → 0', async () => {
        await tapKeys(app, '12+3');
        await expectMain(app, '3');
        await tapKeys(app, 'C');
        await expectMain(app, '0');
      });
      await app.step('C 는 걸려 있던 연산도 지운다: 4 = → 4', async () => {
        await tapKeys(app, '4=');
        await expectMain(app, '4');
      });
      await app.step('⌫ 는 한 글자씩: 123 ⌫ → 12, ⌫⌫ → 0', async () => {
        await tapKeys(app, 'C123<');
        await expectMain(app, '12');
        await tapKeys(app, '<<');
        await expectMain(app, '0');
      });
    },
  },
]);
