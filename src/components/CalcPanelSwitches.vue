<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';

import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

// 스토어 가져오기
const store = useCalcStore();

// 계산기 키바인딩 제거하기위한 변수 선언
let keybindingRemoveAtUmount = tinykeys(window, {} as KeyBindingMap);

// dom 요소가 마운트 되었을 때
// 1. 계산기 키바인딩 설정하기
// 2. 스토어에서 값을 가져와서 계산기에 설정하기
onMounted( () =>
{
  type Shortcut = [ string[], () => void ][];

  const shortcuts: Shortcut = [
    [ [ ',' ], store.toggleUseGrouping ],
    [ [ '[' ], store.decDecimalPlaces ],
    [ [ ']' ], store.incDecimalPlaces ],
  ];
// Support keyboard entry
  const keyBindingMaps: KeyBindingMap = {};

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  // 키바인딩하고 제거할 수 있는 메서드 백업;
  keybindingRemoveAtUmount = tinykeys(window, keyBindingMaps);
});

// dom 요소가 언마운트되기 전에 키바인딩 제거
onBeforeUnmount(() => {
  keybindingRemoveAtUmount();
});
</script>

<template>
  <q-card-section
    class="noselect col-9 row no-wrap items-center justify-start q-py-none q-px-xs"
    @focusin="($event.target as HTMLElement).blur()"
  >
    <q-checkbox
      v-model="store.useGrouping"
      label="쉼표: "
      left-label
      class="q-ml-sm"
    />
    <div class="col-7 row no-wrap items-center">
      <my-tooltip>
        소수점 고정 상태:
        {{
          store.decimalPlaces == -2
            ? '제한 없음'
            : `${store.decimalPlaces} 자리`
        }}
      </my-tooltip>
      <div>소수점:</div>
      <q-slider
        v-model="store.decimalPlaces"
        :min="-2"
        :step="2"
        :max="6"
        marker-labels
        class="col-6 q-ml-md"
        @change="store.setDecimalPlaces(store.decimalPlaces)"
      >
        <template v-slot:marker-label-group="{ markerList }">
          <div
            class="cursor-pointer"
            :class=" ( markerList[ 0 ] as any ).classes "
            :style=" ( markerList[ 0 ] as any ).style "
            @click="store.setDecimalPlaces((markerList[0] as any).value)"
          >
            x
          </div>
          <div
            v-for="val in [1, 2, 3, 4]"
            :key="val"
            class="cursor-pointer"
            :class=" ( markerList[ val ] as any ).classes "
            :style=" ( markerList[ val ] as any ).style "
            @click="store.setDecimalPlaces((markerList[val] as any).value)"
          >
            {{ (markerList[val] as any).value }}
          </div>
        </template>
      </q-slider>
    </div>
  </q-card-section>
</template>
