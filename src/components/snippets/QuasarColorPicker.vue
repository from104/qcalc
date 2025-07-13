<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue';
  import type { QCardSection } from 'quasar';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  defineProps<{
    label?: string;
    dense?: boolean;
  }>();

  const model = defineModel<string>({
    required: true,
  });

  const dialogVisible = ref(false);
  const dialogContentRef = ref<QCardSection | null>(null);
  const focusedColor = ref({ groupIndex: 0, colorIndex: 0 });

  const mainColors = [
    'red',
    'pink',
    'purple',
    'deep-purple',
    'indigo',
    'blue',
    'light-blue',
    'cyan',
    'teal',
    'green',
    'light-green',
    'lime',
    'yellow',
    'amber',
    'orange',
    'deep-orange',
    'brown',
    'grey',
    'blue-grey',
  ];

  const colorGroups = computed(() => [
    ...mainColors.map((color) => ({
      name: color
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      colors: [color, ...Array.from({ length: 14 }, (_, i) => `${color}-${i + 1}`)],
    })),
  ]);

  function selectColor(color: string) {
    model.value = color;
    dialogVisible.value = false;
  }

  async function onDialogShow() {
    let initialGroupIndex = 0;
    let initialColorIndex = 0;

    const currentColor = model.value;
    if (currentColor) {
      for (let i = 0; i < colorGroups.value.length; i++) {
        const colorIndex = colorGroups.value[i]!.colors.indexOf(currentColor);
        if (colorIndex !== -1) {
          initialGroupIndex = i;
          initialColorIndex = colorIndex;
          break;
        }
      }
    }
    focusedColor.value = { groupIndex: initialGroupIndex, colorIndex: initialColorIndex };

    await nextTick();
    (dialogContentRef.value?.$el as HTMLElement)?.focus();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
      return;
    }
    e.preventDefault();

    const { groupIndex, colorIndex } = focusedColor.value;
    const currentGroup = colorGroups.value[groupIndex];

    if (e.key === 'Enter') {
      const selectedColor = currentGroup?.colors[colorIndex];
      if (selectedColor) {
        selectColor(selectedColor);
      }
      return;
    }

    if (!currentGroup) return;

    const numGroups = colorGroups.value.length;
    const numColorsInGroup = currentGroup.colors.length;

    let newGroupIndex = groupIndex;
    let newColorIndex = colorIndex;

    switch (e.key) {
      case 'ArrowUp':
        newGroupIndex = Math.max(0, groupIndex - 1);
        break;
      case 'ArrowDown':
        newGroupIndex = Math.min(numGroups - 1, groupIndex + 1);
        break;
      case 'ArrowLeft':
        newColorIndex = Math.max(0, colorIndex - 1);
        break;
      case 'ArrowRight':
        newColorIndex = Math.min(numColorsInGroup - 1, colorIndex + 1);
        break;
    }

    const newGroup = colorGroups.value[newGroupIndex];
    if (!newGroup) return;

    const newNumColorsInGroup = newGroup.colors.length;
    if (newColorIndex >= newNumColorsInGroup) {
      newColorIndex = newNumColorsInGroup - 1;
    }

    focusedColor.value = { groupIndex: newGroupIndex, colorIndex: newColorIndex };
  }
</script>

<template>
  <q-input v-model="model" :label="label" filled :dense="dense" readonly>
    <template #append>
      <div
        v-if="model"
        class="color-sample cursor-pointer"
        :class="`bg-${model}`"
        :aria-label="t('openColorPicker')"
        role="button"
        @click="dialogVisible = true"
      />
    </template>
  </q-input>

  <q-dialog v-model="dialogVisible" aria-labelledby="colorPickerTitle" @show="onDialogShow">
    <q-card style="max-width: 350px">
      <q-card-section class="row items-center q-pb-none">
        <div id="colorPickerTitle" class="text-h6">{{ label }}</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense :aria-label="t('close')" />
      </q-card-section>

      <q-card-section
        ref="dialogContentRef"
        class="q-pt-sm"
        tabindex="0"
        style="outline: none"
        @keydown="handleKeyDown"
      >
        <div v-for="(group, groupIndex) in colorGroups" :key="group.name" class="q-mb-xs">
          <div class="row q-gutter-xs">
            <div
              v-for="(color, colorIndex) in group.colors"
              :key="color"
              class="color-swatch cursor-pointer"
              :class="[
                { focused: focusedColor.groupIndex === groupIndex && focusedColor.colorIndex === colorIndex },
                `bg-${color}`,
              ]"
              role="button"
              :aria-label="colorIndex === 0 ? group.name : color"
              @click="selectColor(color)"
            >
              <q-tooltip :delay="500">
                {{ colorIndex === 0 ? group.name : color }}
              </q-tooltip>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
  .color-sample {
    width: 20px;
    height: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .color-swatch {
    width: 12px;
    height: 12px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .color-swatch.focused {
    outline: 2px solid var(--q-primary);
    outline-offset: 1px;
    transform: scale(1.2);
  }
</style>

<i18n>
ko:
  openColorPicker: '색상 선택기 열기'
  close: '닫기'
en:
  openColorPicker: 'Open color picker'
  close: 'Close'
</i18n>
