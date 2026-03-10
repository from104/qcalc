<script setup lang="ts">
  /**
   * @file FormulaPage.vue
   * @description 수식 계산기 페이지입니다.
   *              메인 결과 필드(ResultField 공유), 수식 입력 필드, 버튼 패드로 구성됩니다.
   *              수식 입력 필드는 읽기 전용이며 버튼/단축키로만 수식을 입력합니다.
   *              Space 키로 수식 직접 편집 다이얼로그를 엽니다.
   */

  import ResultField from 'components/calc/ResultField.vue';
  import CalcButton from 'components/calc/CalcButton.vue';
  import FormulaField from 'components/calc/FormulaField.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <!-- 메인 결과 필드: calc.currentNumber 공유 -->
      <ResultField field="main" addon="none" />

      <!-- 수식 입력 필드 -->
      <FormulaField />

      <!-- 버튼 패드 -->
      <CalcButton type="formula" />
    </q-card>
  </q-page>
</template>
