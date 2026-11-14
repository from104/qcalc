/**
 * convert — 단위 · 진법 · 환율 변환.
 *
 * 기대값의 근거
 * - 단위(src/constants/UnitBaseData.ts): 값은 기준 단위에 곱하는 배율. weight 기준은 g(kg=1000, lb=453.59237),
 *   temp 기준은 °C(°F: x*9/5+32). 변환은 UnitConverter.convert — BigNumber 라 유한 소수는 정확하다.
 * - 보조 칸 붙여넣기(ResultField.vue handlePaste 'sub'): 단위를 뒤바꿔 붙이고 원래 단위로 환산해 메인 숫자로 삼는다.
 * - 진법(RadixConverter): 메인은 원본 진법, 보조는 대상 진법으로 보인다. 키패드 숫자 0~9 는 그대로,
 *   A~F 는 shift 뒤 a5(A) b5(B) c5(C) a4(D) b4(E) c4(F) (CalcButtonSet.ts radix 확장 키).
 *   AND/OR/XOR 는 shift 없이 a2/b2/c2, x<<4 는 shift 뒤 a2.
 * - 자릿수 묶음: 진법 숫자도 설정의 묶음(기본 3자리)을 따른다 — 2진수 11111111 은 '11,111,111' 로 보인다.
 * - 환율(CurrencyConverter): 값 × rates[대상] / rates[원본]. rates 는 e2e/fixtures/network.ts FIXED_RATES(EUR 기준)이므로
 *   1 USD = 1500/1.1 KRW, 1 USD = 160/1.1 JPY. 보조 칸은 BigNumber 64자리까지 그대로 보이므로 근사 비교한다.
 */
import { FIXED_RATES } from '../fixtures/network';
import type { CalcApp, ButtonId } from '../drivers/CalcApp';
import { defineGroup, eventually, expectMain, expectSub, tapKeys } from './kit';

/** 진법 탭의 A~F — shift 뒤에 누르는 키 */
const HEX: Record<string, ButtonId> = { A: 'a5', B: 'b5', C: 'c5', D: 'a4', E: 'b4', F: 'c4' };

async function hexDigit(app: CalcApp, digit: string): Promise<void> {
  await app.press('a6'); // shift
  await app.press(HEX[digit]!);
}

/** 보조 칸의 숫자가 기대값과 상대 오차 1e-9 안인가 — 환율 결과는 소수 64자리까지 나온다 */
const expectSubNear = (app: CalcApp, expected: number) =>
  eventually(
    '보조 결과(근사)',
    async () => Number((await app.sub()).replace(/,/g, '')),
    (actual) => Math.abs(actual - expected) <= Math.abs(expected) * 1e-9,
  );

const unitSeed = (category: string, source: string, target: string) => ({
  stores: {
    unit: { selectedCategory: category, sourceUnits: { [category]: source }, targetUnits: { [category]: target } },
  },
});

export default defineGroup('convert', [
  {
    title: '단위: 범주·단위 고르기 · 변환 · 바꾸기 (무게, 온도)',
    run: async (app) => {
      await app.tab('unit');
      await app.step('무게 kg → g: 2 → 보조 2,000', async () => {
        await app.choose('unit-category', '무게');
        await app.choose('unit-source', 'kg');
        await app.choose('unit-target', 'g');
        await tapKeys(app, 'C2');
        await expectMain(app, '2');
        await expectSub(app, '2,000');
      });
      await app.step('바꾸기: g → kg, 메인 2,000 보조 2', async () => {
        await app.swap('unit');
        await expectMain(app, '2,000');
        await expectSub(app, '2');
      });
      await app.step('lb → kg: 1 lb = 0.45359237 kg', async () => {
        await app.choose('unit-source', 'lb');
        await app.choose('unit-target', 'kg');
        await tapKeys(app, 'C1');
        await expectSub(app, '0.45359237');
      });
      await app.step('온도 °C → °F: 100 → 212, 0 → 32, -40 → -40', async () => {
        await app.choose('unit-category', '온도');
        await app.choose('unit-source', '°C');
        await app.choose('unit-target', '°F');
        await tapKeys(app, 'C100');
        await expectSub(app, '212');
        await tapKeys(app, 'C0');
        await expectSub(app, '32');
        await tapKeys(app, 'C40~');
        await expectMain(app, '-40');
        await expectSub(app, '-40');
      });
    },
  },
  {
    title: '단위: 보조 칸 붙여넣기는 원래 단위로 환산한다 (kg → g)',
    needs: ['keyboard', 'clipboard'],
    seed: unitSeed('weight', 'kg', 'g'),
    run: async (app) => {
      await app.tab('unit');
      await app.step('보조 칸에 5000 (g) → 메인 5 kg', async () => {
        await app.setClipboard('5000');
        await app.key('Shift+Control+v');
        await expectMain(app, '5');
        await expectSub(app, '5,000');
      });
      await app.step('소수 2500.5 g → 2.5005 kg', async () => {
        await app.setClipboard('2500.5');
        await app.key('Shift+Control+v');
        await expectMain(app, '2.5005');
        await expectSub(app, '2,500.5');
      });
    },
  },
  {
    title: '진법: 10진 → 16·2·8진, 16진 입력(A~F), 바꾸기',
    run: async (app) => {
      await app.tab('radix');
      await app.step('10진 255 → 16진 FF', async () => {
        await tapKeys(app, 'C255');
        await expectMain(app, '255');
        await expectSub(app, 'FF');
      });
      await app.step('대상을 2진수로: 11111111(자릿수 묶음 설정에 따라 3자리씩 11,111,111), 8진수로: 377', async () => {
        await app.choose('radix-target', '2진수');
        // 2·8·16진수도 묶음 표기를 쓴다(calcStore.toFormattedNumber — 기본 3자리)
        await expectSub(app, '11,111,111');
        await app.choose('radix-target', '8진수');
        await expectSub(app, '377');
      });
      await app.step('원본 16진수 → 대상 10진수: FF(A~F 키) → 255', async () => {
        await app.choose('radix-source', '16진수');
        await app.choose('radix-target', '10진수');
        await tapKeys(app, 'C');
        await hexDigit(app, 'F');
        await hexDigit(app, 'F');
        await expectMain(app, 'FF');
        await expectSub(app, '255');
      });
      await app.step('바꾸기: 원본 10진수 → 대상 16진수, 메인 255 보조 FF', async () => {
        await app.swap('radix');
        await expectMain(app, '255');
        await expectSub(app, 'FF');
      });
    },
  },
  {
    title: '진법: 비트 연산 AND · OR · XOR · x<<4 (10진 → 16진)',
    run: async (app) => {
      await app.tab('radix');
      const op = async (a: string, key: ButtonId, b: string, main: string, sub: string) => {
        await tapKeys(app, `C${a}`);
        await app.press(key);
        await tapKeys(app, `${b}=`);
        await expectMain(app, main);
        await expectSub(app, sub);
      };
      await app.step('12 AND 10 = 8', () => op('12', 'a2', '10', '8', '8'));
      await app.step('12 OR 10 = 14 (E)', () => op('12', 'b2', '10', '14', 'E'));
      await app.step('12 XOR 10 = 6', () => op('12', 'c2', '10', '6', '6'));
      await app.step('1 x<<4 = 16 (10)', async () => {
        await tapKeys(app, 'C1');
        await app.press('a6');
        await app.press('a2');
        await expectMain(app, '16');
        await expectSub(app, '10');
      });
    },
  },
  {
    title: '진법: 보조 칸 붙여넣기는 대상 진법으로 읽는다',
    needs: ['keyboard', 'clipboard'],
    run: async (app) => {
      await app.tab('radix');
      await app.step('보조 칸에 1F → 메인 31', async () => {
        await app.setClipboard('1F');
        await app.key('Shift+Control+v');
        await expectMain(app, '31');
        await expectSub(app, '1F');
      });
    },
  },
  {
    title: '진법: 메인 칸 붙여넣기는 원본 진법(10진)으로 읽는다',
    needs: ['keyboard', 'clipboard'],
    knownBug:
      '진법 탭 Control+v(메인 붙여넣기)가 보조 붙여넣기와 같은 코드(ResultField.vue handlePaste)를 타서 ' +
      '원본 진법이 아니라 대상 진법(16진)으로 읽는다 — 10진 메인에 255 를 붙이면 597(0x255)이 된다',
    run: async (app) => {
      await app.tab('radix');
      await app.setClipboard('255');
      await app.key('Control+v');
      await expectMain(app, '255');
      await expectSub(app, 'FF');
    },
  },
  {
    title: '환율: 고정 환율로 USD → KRW · JPY, 바꾸기',
    needs: ['netMock'],
    run: async (app) => {
      const perUsd = (code: string) => FIXED_RATES[code]! / FIXED_RATES.USD!;
      await app.tab('currency');
      await app.step('1 USD = 1500/1.1 KRW', async () => {
        await tapKeys(app, 'C1');
        await expectMain(app, '1');
        await expectSubNear(app, perUsd('KRW'));
      });
      await app.step('100 USD → KRW', async () => {
        await tapKeys(app, 'C100');
        await expectSubNear(app, 100 * perUsd('KRW'));
      });
      await app.step('대상 JPY: 100 USD = 100*160/1.1 JPY', async () => {
        await app.choose('currency-target', 'JPY');
        await expectSubNear(app, 100 * perUsd('JPY'));
      });
      await app.step('바꾸기: 메인이 JPY 금액, 보조 100 USD', async () => {
        await app.swap('currency');
        await expectSub(app, '100');
        await eventually(
          '메인(JPY)',
          async () => Number((await app.main()).replace(/,/g, '')),
          (v) => Math.abs(v - 100 * perUsd('JPY')) < 1e-6,
        );
      });
    },
  },
]);
