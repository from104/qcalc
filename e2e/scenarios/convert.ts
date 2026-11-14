/**
 * convert — 단위·진법(·환율) 변환. TODO: 아직 구현하지 않았다 (basic.ts / keyboard.ts 를 본보기로).
 *
 * 다룰 것
 * 1. 단위 탭 (app.tab('unit'))
 *    - 기본 시드는 길이 m → cm. 키패드 입력 2 → 메인 '2', 보조 '200'.
 *    - 다른 범주·단위는 seed.stores.unit 으로 고정한다(예: { selectedCategory: 'length',
 *      sourceUnits: { length: 'pm' }, targetUnits: { length: 'nm' } } 에서 1000 → 보조 '1').
 *      단위 선택 UI(드롭다운)를 쓰려면 UnitPanel.vue 에 data-testid 를 더해야 한다.
 *    - 보조 칸 붙여넣기(Shift+Control+v, needs: keyboard·clipboard): 단위를 뒤바꿔 넣고 원래 단위로
 *      환산한다(ResultField.vue handlePaste 'sub'). 기대값은 keyboard.ts 의 단위 탭 시나리오 주석 참고.
 *    - shift 확장 기능: ×2 ×3 ×5 ÷2 … (CalcButtonSet.ts modeSpecificExtendedFunctions.unit).
 * 2. 진법 탭 (app.tab('radix'))
 *    - 기본 10진 → 16진. 255 → 보조 'FF'(접미사 표시 여부는 radixStore.radixType/showRadix — main()/sub()
 *      는 숫자 부분만 돌려준다). 16진 숫자 A~F 는 shift 없이 a4~c5 위치(진법 전용 키패드).
 *    - 보조 칸 붙여넣기: 진법을 뒤바꾼 뒤 10ms 지연으로 넣는다 — 'FF' 를 보조에 붙이면 메인 '255'.
 *    - 비트 연산 AND/OR/XOR/NOT, 워드 크기(radixStore.wordSize 8/16/32/64) 넘침.
 * 3. 환율 탭 (needs: netMock) — e2e/fixtures/network.ts 의 FIXED_RATES 로 기대값 계산.
 *    USD → KRW: 1 USD = 1500/1.1 KRW. 실패 경로는 mockNetwork({ failRates: true }) 로 예비 환율 확인.
 */
import { defineGroup, todo } from './kit';

export default defineGroup('convert', [
  todo('단위 변환 (길이 m→cm, 범주 전환, 보조 칸 붙여넣기)', '단위 탭 변환 검증'),
  todo('진법 변환 (10→16진, A~F 입력, 보조 칸 붙여넣기, 비트 연산)', '진법 탭 변환 검증'),
  todo('환율 변환 (고정 환율, API 실패 시 예비 환율)', '환율 탭 변환 검증', ['netMock']),
]);
