<script lang="ts" setup>
import { onMounted, reactive, watch } from 'vue';
import { useQuasar } from 'quasar';

import tinykeys, { KeyBindingMap } from 'tinykeys';

import { useI18n } from 'vue-i18n';

import { useCalcStore } from 'src/stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

const { locale } = useI18n({ useScope: 'global' });
const { t } = useI18n();

const localeOptions = reactive([
  { value: 'ko', label: t('ko') },
  { value: 'en', label: t('en') },
]);

watch(locale, () => {
  localeOptions.forEach((option) => {
    option.label = t(option.value);
  });
});

const store = useCalcStore();

const q = useQuasar();

const toggleAlwaysOnTop = (byManual = false) => {
  if (q.platform.is.electron) {
    if (byManual) {
      // 수동으로 토글
      store.toggleAlwaysOnTop();
    }
    window.myAPI.setAlwaysOnTop(store.alwaysOnTop);
  }
};

onMounted(() => {
  const keyBindingMaps: KeyBindingMap = {};

  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [
    [['t'], () => toggleAlwaysOnTop(true)],
    [['k'], store.toggleDarkMode],
    [[','], store.toggleUseGrouping],
    [['['], store.decDecimalPlaces],
    [[']'], store.incDecimalPlaces],
  ];

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  tinykeys(window, keyBindingMaps);

  if (q.platform.is.electron) {
    window.myAPI.setAlwaysOnTop(store.alwaysOnTop);
  }
});
</script>

<template>
  <q-list @focusin="($event.target as HTMLElement).blur()" dense>
    <q-item-label class="q-mt-xl text-h5" header>{{ t('settings') }} (E)</q-item-label>
    <q-item class="q-py-none" v-if="$q.platform.is.electron">
      <q-item-label class="self-center">{{ t('alwaysOnTop') }} (T)</q-item-label>
      <q-space />
      <q-toggle
        v-model="store.alwaysOnTop"
        :color="store.getDarkColor('primary')"
        @click="toggleAlwaysOnTop()"
        keep-color
        dense
      />
    </q-item>

    <q-item class="q-py-none">
      <q-item-label class="self-center">{{ t('darkMode') }} (K)</q-item-label>
      <q-space />
      <q-toggle
        v-model="store.darkMode"
        :color="store.getDarkColor('primary')"
        @click="store.setDarkMode(store.darkMode)"
        keep-color
        dense
      />
    </q-item>

    <q-separator spaced="md" />

    <q-item class="q-py-none">
      <q-item-label class="self-center">{{ t('useGrouping') }} (,)</q-item-label>
      <q-space />
      <q-toggle
        v-model="store.useGrouping"
        :color="store.getDarkColor('primary')"
        keep-color
        dense
      />
    </q-item>

    <q-item class="q-py-none">
      <MyTooltip>
        {{ t('decimalPlacesStat') }}:
        {{
          store.decimalPlaces == -2
            ? t('noLimit')
            : `${store.decimalPlaces} ${t('toNDecimalPlaces')}`
        }}
      </MyTooltip>
      <q-item-label class="q-pt-xs self-start">{{ t('decimalPlaces') }} ([,])</q-item-label>
      <q-space />
      <q-slider
        v-model="store.decimalPlaces"
        :min="-2"
        :step="2"
        :max="6"
        marker-labels
        class="col-5 q-pr-sm"
        :color="store.getDarkColor('primary')"
        @change="store.setDecimalPlaces(store.decimalPlaces)"
        dense
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
    </q-item>

    <q-separator spaced="md" />

    <q-item>
      <q-item-label class="self-center"> {{ t('language') }} </q-item-label>
      <q-space />
      <q-select
        v-model="locale"
        :options="localeOptions"
        :color="store.getDarkColor('primary')"
        dense
        emit-value
        map-options
        options-dense
      />
    </q-item>
  </q-list>
</template>

<i18n lang="yml">
ko:
  settings: '설정'
  alwaysOnTop: '항상 위'
  darkMode: '다크 모드'
  useGrouping: '천단위 표시'
  decimalPlaces: '소수점'
  decimalPlacesStat: '소수점 자리수'
  noLimit: '제한 없음'
  toNDecimalPlaces: '자리'
  language: '언어'
  en: '영어'
  ko: '한국어'
en:
  settings: 'Settings'
  alwaysOnTop: 'Always on top'
  darkMode: 'Dark mode'
  useGrouping: 'Use grouping'
  decimalPlaces: 'Decimal'
  decimalPlacesStat: 'Decimal places (stat)'
  noLimit: 'No limit'
  toNDecimalPlaces: 'decimal places'
  language: 'Language'
  en: 'English'
  ko: 'Korean'
</i18n>
