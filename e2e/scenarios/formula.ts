/**
 * formula — 수식 계산기. TODO: 아직 구현하지 않았다 (basic.ts / keyboard.ts 를 본보기로).
 *
 * 다룰 것
 * 1. 키패드로 수식 만들기 (app.tab('formula')) — 수식 키패드는 row 0 이 더 있다(a0 '(' b0 ')' c0 '@' d0 '?').
 *    kit.ts 의 KEY 표는 기본 계산기용이므로 수식용 표(FORMULA_KEY)를 따로 만든다(CalcButtonSet.ts formula).
 *    예: ( 1 + 2 ) × 3 = → 9. 수식 칸(FormulaField.vue)에 data-testid 를 더해 식 문자열도 확인한다.
 * 2. '@' 는 현재 계산값으로 치환, '$' 는 메모리(비어 있으면 안내 토스트).
 * 3. 수식 엔진 지연 로딩과 재시도 (needs: netMock)
 *    - mathjs 묶음은 dist/spa/assets/math-<hash>.js 로 따로 나뉘어 처음 쓸 때 불러온다
 *      (src/core/calculator/FormulaMath.ts). 앱 시작 직후 유휴 시간에도 미리 받는다(App.vue prefetch).
 *    - 첫 요청 한 번만 끊고(Playwright: page.route(/\/assets\/math-[^/]+\.js$/, route => 한 번 abort, 이후 continue))
 *      '=' → 오류 안내가 뜬 뒤, 다시 '=' 를 누르면 계산되어야 한다(실패 시 loading = null 로 되돌려 재시도).
 *    - 이 가로채기는 Playwright 전용이므로 CalcApp 에 `failNextRequest(pattern)` 같은 능력 메서드를
 *      더하고 PlaywrightApp 에 구현하는 쪽을 권한다(다른 드라이버는 netMock 능력 없음으로 건너뜀).
 * 4. 문법 오류(괄호 불일치·연산자 연속)에서 오류 메시지가 번역 키 그대로 나오지 않는지.
 */
import { defineGroup, todo } from './kit';

export default defineGroup('formula', [
  todo('수식 입력과 계산 (괄호·우선순위·@ 치환)', '수식 계산기 기본 동작'),
  todo('수식 엔진 청크를 한 번 끊은 뒤 재시도하면 계산된다', 'mathjs 지연 로딩 재시도', ['netMock']),
  todo('수식 문법 오류 안내', '오류 메시지 번역 확인'),
]);
