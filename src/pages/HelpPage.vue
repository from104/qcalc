<script setup lang="ts">
import { onMounted } from 'vue';
import { useCalcStore } from 'src/stores/calc-store';

const title = 'Help for QCalc';
const author = 'Seo Kihyun';
const content = `
This is a simple calculator made using the source of the calculator
for Android that I made as a graduation assignment in the past.
You can do arithmetic and percentage calculations.
If you press the arithmetic operation button (key) successively,
it repeats the calculation with the last number.
All input can be done with mouse and keyboard.
You can also copy and paste.
You can make the window always on top with the toggle switch on the top right or keyboard.

# Shortcuts

[0-9\.]: numbers and dots
+, -, *, /: addition, subtraction, multiplication, division respectively
Enter, =: output the last calculation result
s, _: change sign
p, %: Calculate percentage (enter in the following order: number, /, number, p (or %))
Backspace: Erase each character
Escape, Delete, c: Reset the calculator
t: Toggle the window always on top

Control-c, Control-Insert: copy result to clipboard
Control-v, Shift-Insert: Paste from clipboard into app`
  .trim()
  .replace(/\n/g, '<br>');

// 계산기 키바인딩 제거
onMounted(() => {
  useCalcStore().$state.keybindingRemoveFromCalc();
});
</script>

<template>
  <q-page>
    <q-card flat class="q-pa-md">
      <q-card-section class="q-pa-sm">
        <div class="" style="font-size: 1.3rem">{{ title }}</div>
        by {{ author }}
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <div v-html="content" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
