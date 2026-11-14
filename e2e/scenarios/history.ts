/**
 * history — 계산 기록. TODO: 아직 구현하지 않았다 (basic.ts / keyboard.ts 를 본보기로).
 *
 * 다룰 것
 * 1. 저장: 2 + 3 = 뒤 기록 화면(F4 또는 상단 기록 버튼)에 '2 + 3 = 5' 한 줄이 생긴다.
 *    기록 카드(src/components/record/RecordCard.vue)와 기록 화면 버튼에 data-testid 를 더해야 한다
 *    (예: record-item, record-open, record-delete-all). aria-label 은 번역되므로 선택자로 쓰지 않는다.
 * 2. 복원: 기록 항목을 눌러 그 결과를 메인 칸으로 불러온다 → app.main() 이 '5'.
 * 3. 삭제: 한 항목 삭제, 전체 삭제(확인 다이얼로그) 뒤 빈 상태.
 * 4. 영속성 (needs: reload): 계산 → app.reload() → 기록이 남아 있다.
 * 5. 시드: SeedState.history 로 기록을 미리 채울 수 있다(e2e/fixtures/seed.ts buildSeed — calc 스토어의
 *    calc.record.records 로 들어간다). 이 형식이 실제 복원과 맞는지 이 시나리오에서 먼저 확인할 것.
 *    최대 100건(MAX_RECORDS) 넘침도 시드로 빠르게 만들 수 있다.
 */
import { defineGroup, todo } from './kit';

export default defineGroup('history', [
  todo('계산하면 기록에 저장된다', '기록 저장'),
  todo('기록 항목을 눌러 결과를 복원한다', '기록 복원'),
  todo('기록 한 건 삭제 · 전체 삭제', '기록 삭제'),
  todo('다시 띄워도 기록이 남는다', '기록 영속성', ['reload']),
]);
