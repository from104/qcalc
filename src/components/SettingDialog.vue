<script lang="ts" setup>
  // Vue 3의 Composition API에서 필요한 함수들을 가져옵니다.
  import { onMounted, onBeforeMount, reactive, watch, onBeforeUnmount, ref } from 'vue';

  // 패키지 버전 정보를 가져옵니다.
  import { version } from '../../package.json';

  // 사용자 정의 툴팁 컴포넌트를 가져옵니다.
  import MyTooltip from 'components/MyTooltip.vue';

  // Quasar 프레임워크의 useQuasar 훅을 가져옵니다.
  import { useQuasar } from 'quasar';
  const $q = useQuasar();

  // 애플리케이션의 여러 스토어들을 가져옵니다.
  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreNotifications } from 'src/stores/store-notifications';
  import { useStoreUtils } from 'src/stores/store-utils';

  // 스토어 인스턴스들을 생성합니다.
  const storeBase = useStoreBase();
  const storeSettings = useStoreSettings();
  const storeNotifications = useStoreNotifications();
  const storeUtils = useStoreUtils();

  // 스토어에서 필요한 함수들을 구조 분해 할당으로 가져옵니다.
  const { notifyMsg } = storeNotifications;
  const { toggleAlwaysOnTop, setInitPanel, setDarkMode, setAlwaysOnTop, setHapticsMode, setDecimalPlaces } =
    storeSettings;

  // i18n 설정을 위한 훅을 가져옵니다.
  import { useI18n } from 'vue-i18n';
  const { locale } = useI18n({ useScope: 'global' });
  const { t } = useI18n();

  // 시스템 로케일을 참조로 저장합니다.
  const systemLocale = ref(navigator.language.substring(0, 2));

  // 언어 옵션을 반응형 배열로 정의합니다.
  const localeOptions = reactive([
    { value: 'ko', label: t('message.ko') },
    { value: 'en', label: t('message.en') },
  ]);

  // 시스템 로케일 사용 여부와 사용자 로케일이 변경될 때마다 언어 옵션 라벨을 업데이트합니다.
  watch([() => storeSettings.useSystemLocale, () => storeSettings.userLocale], () => {
    localeOptions.forEach((option) => {
      option.label = t('message.' + option.value);
    });
    storeSettings.locale = locale.value as string;
  });

  // 로케일을 설정하는 함수입니다.
  const setLocale = () => {
    if (storeSettings.useSystemLocale) {
      locale.value = systemLocale.value;
    } else {
      locale.value = storeSettings.userLocale;
    }
  };

  // '항상 위에' 설정을 토글하고 알림을 표시하는 함수입니다.
  const toggleAlwaysOnTopWithNotify = () => {
    if ($q.platform.is.electron) {
      toggleAlwaysOnTop();

      if (storeSettings.alwaysOnTop) {
        notifyMsg(t('alwaysOnTopOn'));
      } else {
        notifyMsg(t('alwaysOnTopOff'));
      }
    }
  };

  // 키 바인딩 클래스를 가져옵니다.
  import { KeyBinding } from 'classes/KeyBinding';

  // 키 바인딩을 설정합니다.
  const keyBinding = new KeyBinding([
    [['Alt+t'], toggleAlwaysOnTopWithNotify],
    [['Alt+i'], storeSettings.toggleInitPanel],
    [['Alt+d'], storeSettings.toggleDarkMode],
    [['Alt+s'], () => { storeBase.isSettingDialogOpen = true; }],
    [[';'], storeSettings.toggleButtonAddedLabel],
    [[','], storeSettings.toggleUseGrouping],
    [['Ctrl+,'], () => storeSettings.setGroupingUnit(storeSettings.groupingUnit == 3 ? 4 : 3)],
    [['['], storeSettings.decDecimalPlaces],
    [[']'], storeSettings.incDecimalPlaces],
  ]);

  // 입력 포커스 상태에 따라 키 바인딩을 활성화/비활성화합니다.
  watch(
    () => storeUtils.inputFocused,
    () => {
      if (storeUtils.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  // 컴포넌트가 마운트되기 전에 실행되는 훅입니다.
  onBeforeMount(() => {
    setLocale();

    // 초기 실행 시 로케일 설정
    if (storeSettings.locale === '') {
      storeSettings.locale = systemLocale.value;
    }
    if (storeSettings.userLocale === '') {
      storeSettings.userLocale = systemLocale.value;
    }
  });

  // 컴포넌트가 마운트된 후 실행되는 훅입니다.
  onMounted(() => {
    keyBinding.subscribe();
  });

  // 컴포넌트가 언마운트되기 전에 실행되는 훅입니다.
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });
</script>

<template>
  <q-dialog
    v-model="storeBase.isSettingDialogOpen"
    style="z-index: 15"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card id="setting" v-touch-swipe:9e-2:12:50.up="() => (storeBase.isSettingDialogOpen = false)" class="full-width">
      <q-bar v-blur dark class="full-width noselect text-white bg-primary">
        <q-icon name="settings" size="sm" />
        <div>{{ t('message.settings') }}</div>
        <q-space />
        <q-btn dense flat icon="close" size="md" @click="storeBase.isSettingDialogOpen = false" />
      </q-bar>
      <q-card-section class="full-width">
        <q-list v-blur dense>
          <q-item v-if="$q.platform.is.electron" class="q-py-none">
            <q-item-label class="self-center">{{ t('alwaysOnTop') }} (T)</q-item-label>
            <q-space />
            <q-toggle
              v-model="storeSettings.alwaysOnTop"
              keep-color
              dense
              @click="setAlwaysOnTop(storeSettings.alwaysOnTop)"
            />
          </q-item>

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('initPanel') }} (N)</q-item-label>
            <q-space />
            <q-toggle
              v-model="storeSettings.initPanel"
              keep-color
              dense
              @click="setInitPanel(storeSettings.initPanel)"
            />
          </q-item>

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('darkMode') }} (K)</q-item-label>
            <q-space />
            <q-toggle v-model="storeSettings.darkMode" keep-color dense @click="setDarkMode(storeSettings.darkMode)" />
          </q-item>

          <q-item v-if="$q.platform.is.capacitor" class="q-py-none">
            <q-item-label class="self-center">{{ t('hapticsMode') }} (K)</q-item-label>
            <q-space />
            <q-toggle
              v-model="storeSettings.hapticsMode"
              keep-color
              dense
              @click="setHapticsMode(storeSettings.hapticsMode)"
            />
          </q-item>

          <q-separator spaced="sm" />

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('showButtonAddedLabel') }} (;)</q-item-label>
            <q-space />
            <q-toggle v-model="storeSettings.showButtonAddedLabel" keep-color dense />
          </q-item>

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('useGrouping') }} (,)</q-item-label>
            <q-space />
            <q-toggle v-model="storeSettings.useGrouping" keep-color dense />
          </q-item>

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('groupingUnit') }} (??)</q-item-label>
            <q-space />
            <q-slider
              v-model="storeSettings.groupingUnit"
              :min="3"
              :max="4"
              :step="1"
              :disable="!storeSettings.useGrouping"
              dense
              class="col-2 q-pr-sm q-pt-xs"
              marker-labels
            />
          </q-item>

          <q-item class="q-py-none">
            <MyTooltip>
              {{ t('decimalPlacesStat') }}:
              {{
                storeSettings.decimalPlaces == -2
                  ? t('noLimit')
                  : `${storeSettings.decimalPlaces} ${t('toNDecimalPlaces')}`
              }}
            </MyTooltip>
            <q-item-label class="q-pt-xs self-start">{{ t('decimalPlaces') }} ([,])</q-item-label>
            <q-space />
            <q-slider
              v-model="storeSettings.decimalPlaces"
              :min="-2"
              :step="2"
              :max="6"
              marker-labels
              class="col-5 q-pr-sm"
              dense
              @change="setDecimalPlaces(storeSettings.decimalPlaces)"
            >
              <template #marker-label-group="{ markerList }">
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

          <template v-if="storeBase.cTab == 'unit'">
            <q-separator spaced="sm" />

            <q-item class="q-py-none">
              <q-item-label class="self-center"> {{ t('showUnit') }} (b) </q-item-label>
              <q-space />
              <q-toggle v-model="storeSettings.showUnit" keep-color dense />
            </q-item>
          </template>

          <template v-else-if="storeBase.cTab == 'currency'">
            <q-separator spaced="sm" />

            <q-item class="q-py-none">
              <q-item-label class="self-center"> {{ t('showSymbol') }} (o) </q-item-label>
              <q-space />
              <q-toggle v-model="storeSettings.showSymbol" keep-color dense />
            </q-item>
          </template>

          <template v-else-if="storeBase.cTab == 'radix'">
            <q-separator spaced="sm" />

            <q-item class="q-py-none">
              <q-item-label class="self-center"> {{ t('showRadix') }} (??) </q-item-label>
              <q-space />
              <q-toggle v-model="storeSettings.showRadix" keep-color dense />
            </q-item>

            <q-item class="q-py-none">
              <q-item-label class="self-center"> {{ t('radixType') }} (??) </q-item-label>
              <q-space />
              <q-select
                v-model="storeSettings.radixType"
                :options="[
                  { label: t('prefix'), value: 'prefix' },
                  { label: t('suffix'), value: 'suffix' },
                ]"
                dense
                emit-value
                map-options
                options-dense
                :disable="!storeSettings.showRadix"
                :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
                :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
                :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
                :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
              />
            </q-item>
          </template>

          <q-separator spaced="sm" />

          <q-item class="q-py-none">
            <q-item-label class="self-center">{{ t('useSystemLocale') }}</q-item-label>
            <q-space />
            <q-toggle v-model="storeSettings.useSystemLocale" keep-color dense @click="setLocale()" />
          </q-item>

          <q-item>
            <q-item-label class="self-center">
              {{ t('language') }}
            </q-item-label>
            <q-space />
            <q-select
              v-model="storeSettings.userLocale"
              :disable="storeSettings.useSystemLocale"
              :options="localeOptions"
              dense
              emit-value
              map-options
              options-dense
              :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
              :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
              :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
              :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
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
  $height: 26px;
  $left: 4px;
  :deep(.q-field__control) {
    min-height: $height !important;
    height: auto !important;
    padding-left: $left !important;
    .q-field__native {
      min-height: $height !important;
      height: auto !important;
      padding-left: $left !important;
    }
    .q-field__append {
      min-height: $height !important;
      height: auto !important;
      padding-left: $left !important;
    }
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
  useGrouping: '숫자 묶음 표시'
  groupingUnit: '숫자 묶음 단위'
  decimalPlaces: '소수점'
  decimalPlacesStat: '소수점 자리수'
  noLimit: '제한 없음'
  toNDecimalPlaces: '자리'
  showUnit: '단위 표시'
  showSymbol: '기호 표시'
  showRadix: '진법 표시'
  radixType: '진법 표시 형식'
  prefix: '앞에'
  suffix: '뒤에'
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
  groupingUnit: 'Grouping unit'
  decimalPlaces: 'Decimal'
  decimalPlacesStat: 'Decimal places (stat)'
  noLimit: 'No limit'
  toNDecimalPlaces: 'decimal places'
  showUnit: 'Show unit'
  showSymbol: 'Show symbol'
  showRadix: 'Show radix'
  radixType: 'Radix type'
  prefix: 'Prefix'
  suffix: 'Suffix'
  useSystemLocale: 'Use system locale'
  language: 'Language'
</i18n>
