<script lang="ts" setup>
  import {onMounted, onBeforeMount, reactive, watch, onBeforeUnmount, ref} from 'vue';

  import {version} from '../../package.json';

  import MyTooltip from 'components/MyTooltip.vue';

  import {useQuasar} from 'quasar';
  const $q = useQuasar();

  import {useStoreCalc} from 'src/stores/store-calc';
  const storeCalc = useStoreCalc();
  const {toggleAlwaysOnTop, notifyMsg, setInitPanel, setDarkMode, setAlwaysOnTop, setHapticsMode, setDecimalPlaces} =
    storeCalc;

  import {useI18n} from 'vue-i18n';
  const {locale} = useI18n({useScope: 'global'});
  const {t} = useI18n();

  const systemLocale = ref(navigator.language.substring(0, 2));

  const localeOptions = reactive([
    {value: 'ko', label: t('message.ko')},
    {value: 'en', label: t('message.en')},
  ]);

  watch([() => storeCalc.useSystemLocale, () => storeCalc.userLocale], () => {
    localeOptions.forEach((option) => {
      option.label = t('message.' + option.value);
    });
    storeCalc.locale = locale.value as string;
  });

  const setLocale = () => {
    if (storeCalc.useSystemLocale) {
      locale.value = systemLocale.value;
    } else {
      locale.value = storeCalc.userLocale;
    }
  };

  const toggleAlwaysOnTopWithNotify = () => {
    if ($q.platform.is.electron) {
      // 수동으로 토글
      toggleAlwaysOnTop();

      if (storeCalc.alwaysOnTop) {
        notifyMsg(t('alwaysOnTopOn'));
      } else {
        notifyMsg(t('alwaysOnTopOff'));
      }
    }
  };

  import {KeyBinding} from 'classes/KeyBinding';
  // prettier-ignore
  const keyBinding = new KeyBinding([
    [['Alt+t'], toggleAlwaysOnTopWithNotify],
    [['Alt+i'], storeCalc.toggleInitPanel],
    [['Alt+d'], storeCalc.toggleDarkMode],
    [['Alt+s'], () => { storeCalc.isSettingDialogOpen = true; }],
    [[';'], storeCalc.toggleButtonAddedLabel],
    [[','], storeCalc.toggleUseGrouping],
    [['['], storeCalc.decDecimalPlaces],
    [[']'], storeCalc.incDecimalPlaces],
  ]);

  // inputFocused 값이 바뀌면 키바인딩을 추가하거나 제거합니다.
  watch(
    () => storeCalc.inputFocused,
    () => {
      // console.log('setting inputFocused', storeCalc.inputFocused);
      if (storeCalc.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    {immediate: true},
  );

  onBeforeMount(() => {
    setLocale();

    if (storeCalc.locale == '') {
      // 처음 실행시
      storeCalc.locale = systemLocale.value;
    }
    if (storeCalc.userLocale == '') {
      // 처음 실행시
      storeCalc.userLocale = systemLocale.value;
    }
  });

  onMounted(() => {
    keyBinding.subscribe();
  });

  // dom 요소가 언마운트되기 전에 키바인딩 제거
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });
</script>

<template>
  <q-dialog
    v-model="storeCalc.isSettingDialogOpen"
    style="z-index: 15"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card id="setting" v-touch-swipe:9e-2:12:50.up="() => (storeCalc.isSettingDialogOpen = false)" class="full-width">
      <q-bar v-blur dark class="full-width noselect text-white bg-primary">
        <q-icon name="settings" size="sm" />
        <div>{{ t('message.settings') }}</div>
        <q-space />
        <q-btn dense flat icon="close" size="md" @click="storeCalc.isSettingDialogOpen = false" />
      </q-bar>
      <q-card-section class="full-width">
        <q-list v-blur dense>
          <q-item v-if="$q.platform.is.electron" class="q-py-none">
            <q-item-label class="self-center">{{ t('alwaysOnTop') }} (T)</q-item-label>
            <q-space />
            <q-toggle v-model="storeCalc.alwaysOnTop" keep-color dense @click="setAlwaysOnTop(storeCalc.alwaysOnTop)" />
          </q-item>

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('initPanel') }} (N)</q-item-label>
            <q-space />
            <q-toggle v-model="storeCalc.initPanel" keep-color dense @click="setInitPanel(storeCalc.initPanel)" />
          </q-item>

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('darkMode') }} (K)</q-item-label>
            <q-space />
            <q-toggle v-model="storeCalc.darkMode" keep-color dense @click="setDarkMode(storeCalc.darkMode)" />
          </q-item>

          <q-item v-if="$q.platform.is.capacitor" class="q-py-none">
            <q-item-label class="self-center">{{ t('hapticsMode') }} (K)</q-item-label>
            <q-space />
            <q-toggle v-model="storeCalc.hapticsMode" keep-color dense @click="setHapticsMode(storeCalc.hapticsMode)" />
          </q-item>

          <q-separator spaced="md" />

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('showButtonAddedLabel') }} (;)</q-item-label>
            <q-space />
            <q-toggle v-model="storeCalc.showButtonAddedLabel" keep-color dense />
          </q-item>

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('useGrouping') }} (,)</q-item-label>
            <q-space />
            <q-toggle v-model="storeCalc.useGrouping" keep-color dense />
          </q-item>

          <q-item class="q-py-none">
            <MyTooltip>
              {{ t('decimalPlacesStat') }}:
              {{ storeCalc.decimalPlaces == -2 ? t('noLimit') : `${storeCalc.decimalPlaces} ${t('toNDecimalPlaces')}` }}
            </MyTooltip>
            <q-item-label class="q-pt-xs self-start">{{ t('decimalPlaces') }} ([,])</q-item-label>
            <q-space />
            <q-slider
              v-model="storeCalc.decimalPlaces"
              :min="-2"
              :step="2"
              :max="6"
              marker-labels
              class="col-5 q-pr-sm"
              dense
              @change="setDecimalPlaces(storeCalc.decimalPlaces)"
            >
              <template #marker-label-group="{markerList}">
                <div
                  class="cursor-pointer"
                  :class="(markerList[0] as any).classes"
                  :style="(markerList[0] as any).style"
                  @click="setDecimalPlaces((markerList[0] as any).value)"
                >
                  x
                </div>
                <div
                  v-for="val in [1, 2, 3, 4]"
                  :key="val"
                  class="cursor-pointer"
                  :class="(markerList[val] as any).classes"
                  :style="(markerList[val] as any).style"
                  @click="setDecimalPlaces((markerList[val] as any).value)"
                >
                  {{ (markerList[val] as any).value }}
                </div>
              </template>
            </q-slider>
          </q-item>

          <template v-if="storeCalc.cTab == 'unit'">
            <q-separator spaced="md" />

            <q-item class="q-py-none">
              <q-item-label class="self-center"> {{ t('showUnit') }} (b) </q-item-label>
              <q-space />
              <q-toggle v-model="storeCalc.showUnit" keep-color dense />
            </q-item>
          </template>
          <template v-else-if="storeCalc.cTab == 'currency'">
            <q-separator spaced="md" />

            <q-item class="q-py-none">
              <q-item-label class="self-center"> {{ t('showSymbol') }} (o) </q-item-label>
              <q-space />
              <q-toggle v-model="storeCalc.showSymbol" keep-color dense />
            </q-item>
          </template>

          <q-separator spaced="md" />

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('useSystemLocale') }}</q-item-label>
            <q-space />
            <q-toggle v-model="storeCalc.useSystemLocale" keep-color dense @click="setLocale()" />
          </q-item>

          <q-item>
            <q-item-label class="self-center">
              {{ t('language') }}
            </q-item-label>
            <q-space />
            <q-select
              v-model="storeCalc.userLocale"
              :disable="storeCalc.useSystemLocale"
              :options="localeOptions"
              dense
              emit-value
              map-options
              options-dense
              @update:model-value="setLocale()"
            />
          </q-item>
        </q-list>
      </q-card-section>
      <q-bar class="full-width noselect text-white bg-primary">
        {{ `${t('message.version')} : ${version}` }}
        <q-space />
      </q-bar>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
  #setting {
    min-width: 250px;
    max-width: 250px;
  }
</style>

<i18n>
ko:
  alwaysOnTop: '항상 위'
  alwaysOnTopOn: '항상 위 켜짐'
  alwaysOnTopOff: '항상 위 꺼짐'
  initPanel: '시작 시 패널 초기화'
  darkMode: '다크 모드'
  hapticsMode: '진동 모드'
  showButtonAddedLabel: '버튼 추가 라벨 표시'
  useGrouping: '천단위 표시'
  decimalPlaces: '소수점'
  decimalPlacesStat: '소수점 자리수'
  noLimit: '제한 없음'
  toNDecimalPlaces: '자리'
  showUnit: '단위 표시'
  showSymbol: '기호 표시'
  useSystemLocale: '시스템 언어 사용'
  language: '언어'
en:
  alwaysOnTop: 'Always on top'
  alwaysOnTopOn: 'Always on top ON'
  alwaysOnTopOff: 'Always on top OFF'
  initPanel: 'Init panel at startup'
  darkMode: 'Dark mode'
  hapticsMode: 'Haptics mode'
  showButtonAddedLabel: 'Show button added label'
  useGrouping: 'Use grouping'
  decimalPlaces: 'Decimal'
  decimalPlacesStat: 'Decimal places (stat)'
  noLimit: 'No limit'
  toNDecimalPlaces: 'decimal places'
  showUnit: 'Show unit'
  showSymbol: 'Show symbol'
  useSystemLocale: 'Use system locale'
  language: 'Language'
</i18n>