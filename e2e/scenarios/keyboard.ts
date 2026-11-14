/**
 * keyboard — 키보드 입력과 클립보드 단축키 (참조 구현).
 *
 * 키 바인딩의 근거
 * - 키패드: src/constants/CalcButtonSet.ts (숫자·연산자 글자 그대로, Enter/= 계산, Backspace 한 글자, Delete 리셋)
 * - 클립보드: src/components/calc/ResultField.vue
 *     Control+v → 메인 칸에 붙여넣기, Shift+Control+v → 보조 칸에 붙여넣기
 *     Control+c → 메인 칸 표시값 복사, Shift+Control+c → 보조 칸 표시값 복사
 *   tinykeys 는 수식키를 정확히 비교하므로 Shift+Control+c 가 Control+c 를 부르지 않는다.
 *
 * 단위 탭의 보조 칸 붙여넣기(ResultField handlePaste 'sub'): 단위를 뒤바꾼 상태에서 값을 넣고
 * 원래 단위로 환산해 메인 숫자로 삼은 뒤 단위를 되돌린다. 시드가 m → cm 이므로
 * 보조 칸에 300(cm) 을 붙이면 메인은 3(m), 보조는 300(cm) 이 된다.
 * 복사되는 표시값(displayedResult)은 단위까지 붙은 '3 m' 같은 문자열이다.
 *
 * 한 번에 문자열을 입력하면 앱이 무시한다 — 반드시 키 하나씩(typeKeys) 보낸다.
 */
import { defineGroup, expectClipboard, expectMain, expectSub, tapKeys, typeKeys } from './kit';

/** Tauri Linux 의 Control+c 버그 — 공유 시나리오와 app 층 native 시나리오가 같은 설명을 쓴다 */
export const TAURI_LINUX_COPY_BUG =
  'Tauri Linux 에서 Control+c 가 "복사되었습니다" 알림만 띄우고 클립보드를 비운다 — ResultField 의 단축키가 ' +
  'keydown 기본 동작을 막지 않아, 앱의 navigator.clipboard.writeText 뒤에 WebKitGTK 기본 "복사"(선택 없음)가 ' +
  '클립보드를 텍스트 없는 내용으로 덮는다 (preventDefault 하면 정상 — 2026-11-15 Xvfb 실측). Shift+Control+c 는 정상';

export default defineGroup('keyboard', [
  {
    title: '키 입력 · Enter · Backspace · Delete',
    needs: ['keyboard'],
    run: async (app) => {
      await app.step('1 2 + 3 Enter → 15', async () => {
        await typeKeys(app, '12+3');
        await app.key('Enter');
        await expectMain(app, '15');
      });
      await app.step('Delete → 0', async () => {
        await app.key('Delete');
        await expectMain(app, '0');
      });
      await app.step('1 2 3 Backspace → 12', async () => {
        await typeKeys(app, '123');
        await app.key('Backspace');
        await expectMain(app, '12');
      });
      await app.step('Delete 뒤 7 * 6 = → 42 (= 키)', async () => {
        await app.key('Delete');
        await typeKeys(app, '7*6=');
        await expectMain(app, '42');
      });
      await app.step('9 / 4 Enter → 2.25', async () => {
        await app.key('Delete');
        await typeKeys(app, '9/4');
        await app.key('Enter');
        await expectMain(app, '2.25');
      });
    },
  },
  {
    title: '기본 탭: Control+v 붙여넣기 · Control+c 복사',
    needs: ['keyboard', 'clipboard'],
    knownBugOn: { 'tauri-linux': { bug: TAURI_LINUX_COPY_BUG, symptom: /클립보드: .*"1,235\.5".*마지막 값 ""/ } },
    run: async (app) => {
      await app.step('클립보드 1234.5 → Control+v → 메인 1,234.5', async () => {
        await app.setClipboard('1234.5');
        await app.key('Control+v');
        await expectMain(app, '1,234.5');
      });
      await app.step('붙여넣은 값으로 계산: + 1 Enter → 1,235.5', async () => {
        await typeKeys(app, '+1');
        await app.key('Enter');
        await expectMain(app, '1,235.5');
      });
      await app.step('Control+c → 클립보드에 표시값 1,235.5', async () => {
        await app.setClipboard('');
        await app.key('Control+c');
        await expectClipboard(app, '1,235.5');
      });
    },
  },
  {
    title: '단위 탭: 메인/보조 칸 붙여넣기 · 복사',
    needs: ['keyboard', 'clipboard'],
    knownBugOn: { 'tauri-linux': { bug: TAURI_LINUX_COPY_BUG, symptom: /클립보드: .*"3 m".*마지막 값 ""/ } },
    run: async (app) => {
      await app.tab('unit');
      await app.step('Control+v 2 → 메인 2 m, 보조 200 cm', async () => {
        await app.setClipboard('2');
        await app.key('Control+v');
        await expectMain(app, '2');
        await expectSub(app, '200');
      });
      await app.step('Shift+Control+v 300 → 보조 300 cm, 메인은 되돌려 환산한 3 m', async () => {
        await app.setClipboard('300');
        await app.key('Shift+Control+v');
        await expectSub(app, '300');
        await expectMain(app, '3');
      });
      await app.step('Control+c → 메인 표시값 "3 m"', async () => {
        await app.setClipboard('');
        await app.key('Control+c');
        await expectClipboard(app, '3 m');
      });
      await app.step('Shift+Control+c → 보조 표시값 "300 cm"', async () => {
        await app.setClipboard('');
        await app.key('Shift+Control+c');
        await expectClipboard(app, '300 cm');
      });
      await app.step('키패드로 이어서: × 2 = → 메인 6, 보조 600', async () => {
        await tapKeys(app, '*2=');
        await expectMain(app, '6');
        await expectSub(app, '600');
      });
    },
  },
]);
