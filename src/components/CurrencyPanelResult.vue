<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
  Ref,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { KeyBinding } from 'classes/KeyBinding';
import { useCalcStore } from 'stores/calc-store';
import MyTooltip from 'components/MyTooltip.vue';

const { t } = useI18n();

const store = useCalcStore();

const { calc } = store;

const { currencyConverter } = store;

// 선택할 통화 초기화
const initRecentCurrency = () => {
  const defaultCurrency = ['USD', 'KRW'];


  // 저장된 원본 통화가 잘못됐으면 초기화
  if (!currencyConverter.getCurrencyLists().includes(store.recentCurrencyFrom)) {
    store.recentCurrencyFrom = defaultCurrency[0];
    if (store.recentCurrencyFrom === store.recentCurrencyTo) {
      store.recentCurrencyFrom = defaultCurrency[1];
    }
  }

  // 저장된 대상 통화가 잘못됐으면 초기화
  if (!currencyConverter.getCurrencyLists().includes(store.recentCurrencyTo)) {
    store.recentCurrencyTo = defaultCurrency[1];
    if (store.recentCurrencyTo === store.recentCurrencyFrom) {
      store.recentCurrencyTo = defaultCurrency[0];
    }
  }
}

const getCurrencyResult = () => {
  // 저장된 범주와 단위가 잘못됐으면 초기화
  initRecentCurrency();

  const symbol = store.showSymbol ? currencyConverter.getSymbol(store.recentCurrencyTo) : '';
  // 변환 결과를 반환
  return [
    symbol,
    store.toLocale(
      currencyConverter
        .convert(Number(calc.getCurrentNumber()), store.recentCurrencyFrom, store.recentCurrencyTo)
        .toString()
    )
  ].join(' ');
};

const currencyResult = ref(getCurrencyResult());

watch(
  [
    calc,
    () => store.useGrouping,
    () => store.decimalPlaces,
    () => store.recentCurrencyFrom,
    () => store.recentCurrencyTo,
    () => store.showSymbol
  ],
  () => {
    currencyResult.value = getCurrencyResult();
  }
);

// 단위 이름과 값을 바꾸기 위한 함수
const swapCurrencyValue = () => {
  // 변환 결과를 원본 값으로 바꾸기
  calc.setCurrentNumber(currencyResult.value);

  // 화폐도 바꾸기
  const temp = store.recentCurrencyFrom;
  store.recentCurrencyFrom = store.recentCurrencyTo;
  store.recentCurrencyTo = temp;
}

// 단위 초기화
initRecentCurrency();

// 통화 이름을 언어에 맞게 초기화
interface CurrencyDescription {
  [key: string]: string;
}

const descOfCurrency = reactive<CurrencyDescription>(
  currencyConverter
    .getCurrencyLists()
    .reduce((acc: CurrencyDescription, currency) => {
      acc[currency] = t(`currencyDesc.${currency}`);
      return acc;
    }, {}),
);

// 통화 이름을 언어에 맞게 바꾸기 위한 감시
watch([() => store.useSystemLocale, () => store.userLocale], () => {
  // 통화 이름을 언어에 맞게 초기화
  currencyConverter.getCurrencyLists().forEach((currency) => {
    descOfCurrency[currency] = t(`currencyDesc.${currency}`);
  });
});

// 변환 결과 툴팁 표시 상태 변수
const needCurrencyResultTooltip = ref(false);

// 변환 결과가 길 경우 툴팁 표시 상태 셋팅
const setNeedCurrencyResultTooltip = () => {
  // 원래 결과 칸 길이
  const ow = document.getElementById('currencyResult')?.offsetWidth ?? 0;
  // 결과 문자열의 크기
  // (원래 칸에 결과 길이가 넘치면 스크롤 해야하는데 ...로 대체 시킨 경우 스크롤해야할 폭 값만 커진다.)
  const sw = document.getElementById('currencyResult')?.scrollWidth ?? 0;
  // 원래의 칸 크기보다 결과 문자열 길이가 길면 툴팁을 표시
  needCurrencyResultTooltip.value = ow < sw;

  return true;
}
// 키바인딩 생성
const keyBinding = new KeyBinding([
  [['v'], () => store.clickButtonById('btn-swap-currency')],
  [['b'], () => store.showSymbolToggle()],
]);

// inputFocused 값이 바뀌면 키바인딩을 추가하거나 제거합니다.
watch(
  () => store.inputFocused,
  () => {
    if (store.inputFocused) {
      keyBinding.unsubscribe();
    } else {
      keyBinding.subscribe();
    }
  },
  // { immediate: true }
);
let updateRatesTimer: number | undefined;

onMounted(() => {
  initRecentCurrency();

  keyBinding.subscribe();

  // 변환 결과 툴팁 표시 상태 셋팅
  setNeedCurrencyResultTooltip();

  // 환율 정보 업데이트
  (async () => {
    await currencyConverter.updateRates();
  })();

  // 환율 정보 업데이트 주기마다 환율 정보 업데이트
  updateRatesTimer = window.setInterval(async () => {
    await currencyConverter.updateRates();
  }, 1000 * 60 * 60 * 1);
});

// dom 요소가 언마운트되기 전에 키바인딩 제거
onBeforeUnmount(() => {
  keyBinding.unsubscribe();
  store.setInputBlurred();
  clearInterval(updateRatesTimer);
});

type CurrencyOptions = {
  value: string;
  label: string;
  desc: string;
  disable?: boolean;
};

type ReactiveCurrencyOptions = {
  values: CurrencyOptions[];
};

const fromCurrencyOptions = reactive({ values: [] } as ReactiveCurrencyOptions);
const toCurrencyOptions = reactive({ values: [] } as ReactiveCurrencyOptions);

watch(
  [() => store.recentCurrencyFrom, () => store.recentCurrencyTo],
  () => {
    const currencyList = currencyConverter.getCurrencyLists();

    fromCurrencyOptions.values = currencyList.map((currency) => ({
      value: currency,
      label: currency,
      desc: descOfCurrency[currency],
      disable: store.recentCurrencyTo === currency,
    }));

    toCurrencyOptions.values = currencyList.map((currency) => ({
      value: currency,
      label: currency,
      desc: descOfCurrency[currency],
      disable: store.recentCurrencyFrom === currency,
    }));

    // 변환기에 기준 통화 설정
    currencyConverter.setBase(store.recentCurrencyFrom);
  },
  { immediate: true },
);

// 통화 선택 필터 함수 생성
// 검색어를 사용하여 통화 목록을 필터링하는 함수를 생성합니다.
// options 매개변수는 Ref<CurrencyOptions[]> 타입으로 선언되어 있으며, reactiveOptions 매개변수는 ReactiveCurrencyOptions 타입으로 선언되어 있습니다.
  const createFilterFn = (
  options: Ref<CurrencyOptions[]>,
  reactiveOptions: ReactiveCurrencyOptions,
) => {
  // 검색어(val), 업데이트 함수(update), 중단 함수(abort)를 매개변수로 받는 함수를 반환합니다.
  return (val: string, update: (fn: () => void) => void, abort: () => void) => {
    // 검색어의 길이가 1보다 작으면 검색을 중단하고, 검색어의 길이가 1 이상이면 검색을 시작합니다.
    if (val.length < 1) {
      // 검색어가 없으면 options 배열에 모든 값을 저장합니다.
      update(() => {
        options.value = reactiveOptions.values;
      });
      abort();
      return;
    }

    // 검색어를 소문자로 변환하여 needle 변수에 저장합니다.
    const needle = val.toLowerCase();

    // options 배열에서 검색어가 포함된 항목만 필터링하여 options 배열에 저장합니다.
    update(() => {
      options.value = reactiveOptions.values
        .filter((v) => {
          const labelMatch = v.label.toLowerCase().indexOf(needle) > -1;
          const descMatch = v.desc.toLowerCase().indexOf(needle) > -1;
          return labelMatch || descMatch;
        });
    });
  };
};

// fromCurrencyOptions.values 배열을 사용하여 fromFilteredCurrencyOptions 배열을 생성합니다.
const fromFilteredCurrencyOptions = ref<CurrencyOptions[]>(fromCurrencyOptions.values);
// createFilterFn 함수를 사용하여 filterFnFrom 함수를 생성합니다.
const filterFnFrom = createFilterFn(fromFilteredCurrencyOptions, fromCurrencyOptions);

// toCurrencyOptions.values 배열을 사용하여 toFilteredCurrencyOptions 배열을 생성합니다.
const toFilteredCurrencyOptions = ref<CurrencyOptions[]>(toCurrencyOptions.values);
// createFilterFn 함수를 사용하여 filterFnTo 함수를 생성합니다.
const filterFnTo = createFilterFn(toFilteredCurrencyOptions, toCurrencyOptions);
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 통화 -->
    <q-select
      v-model="store.recentCurrencyFrom"
      :options="fromFilteredCurrencyOptions"
      :label="descOfCurrency[store.recentCurrencyFrom]"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      @filter="filterFnFrom"
      @keyup.enter="store.blurElement"
      @update:model-value="store.blurElement"
      @focus="store.setInputFocused"
      @blur="store.setInputBlurred"
      class="col-4 q-pl-sm shadow-4"
      :class="store.darkMode ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ descOfCurrency[scope.opt.label] }}</q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        <div class="text-left" style="white-space: pre-wrap;">
          {{ `${descOfCurrency[store.recentCurrencyFrom]}\n${store.recentCurrencyFrom}` }}
        </div>
      </MyTooltip>
    </q-select>

    <!-- 원본, 대상 통화 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-currency"
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-2 q-mx-none q-px-sm"
      :color="store.getDarkColor('primary')"
      @click="swapCurrencyValue"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 통화 -->
    <q-select
      v-model="store.recentCurrencyTo"
      :options="toFilteredCurrencyOptions"
      :label="descOfCurrency[store.recentCurrencyTo]"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      @filter="filterFnTo"
      @keyup.enter="store.blurElement"
      @update:model-value="store.blurElement"
      @focus="store.setInputFocused"
      @blur="store.setInputBlurred"
      class="col-4 q-pl-sm shadow-4"
      :class="store.darkMode ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ descOfCurrency[scope.opt.label] }}</q-item-label>
            <q-item-label>
              {{ `${scope.opt.label}, ${currencyConverter.getRate(scope.opt.label)}` }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        <div class="text-left" style="white-space: pre-wrap;">
          {{ `${descOfCurrency[store.recentCurrencyTo]}\n${store.recentCurrencyTo}, ${currencyConverter.getRate(store.recentCurrencyTo)}` }}
        </div>
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon
      name="keyboard_double_arrow_down"
      size="xs"
      class="col-1 q-px-none"
    />
  </q-card-section>

  <q-card-section class="col-12 q-px-sm q-pt-none q-pb-none">
    <!-- 대상 값 -->
    <q-field
      :model-value="currencyResult"
      class="shadow-4 justify-end self-center"
      filled
      dense
      readonly
      :bg-color="
        needCurrencyResultTooltip
          ? store.darkMode
            ? 'blue-grey-9'
            : 'amber-2'
          : undefined
      "
    >
      <template v-slot:control>
        <div
          id="currencyResult"
          v-mutation="setNeedCurrencyResultTooltip"
          v-mutation.characterData
          class="self-center full-width no-outline ellipsis text-h4 text-right"
        >
          {{ currencyResult }}
          <MyTooltip v-if="needCurrencyResultTooltip">{{
            currencyResult
          }}</MyTooltip>
        </div>
      </template>
    </q-field>
  </q-card-section>
</template>

<i18n lang="yaml5">
ko:
  currencyDesc:
    EUR: '유로'
    USD: '미국 달러'
    KRW: '대한민국 원'
    GBP: '영국 파운드'
    JPY: '일본 엔화'
    CNY: '중국 위안'
    AED: '아랍 에미리트 디르함'
    AFN: '아프가니스탄 아프가니'
    ALL: '알바니아 레크'
    AMD: '아르메니아 드람'
    ANG: '네덜란드령 안틸레스 길더'
    AOA: '앙골라 콴자'
    ARS: '아르헨티나 페소'
    AUD: '호주 달러'
    AWG: '아루바 플로린'
    AZN: '아제르바이잔 마나트'
    BAM: '보스니아 헤르체고비나 태환 마르크'
    BBD: '바베이도스 달러'
    BDT: '방글라데시 타카'
    BGN: '불가리아 레프'
    BHD: '바레인 디나르'
    BIF: '부룬디 프랑'
    BMD: '버뮤다 달러'
    BND: '브루나이 달러'
    BOB: '볼리비아노'
    BRL: '브라질 레알'
    BSD: '바하마 달러'
    BTC: '비트코인'
    BTN: '부탄 눌트럼'
    BWP: '보츠와나 풀라'
    BYN: '새 벨라루스 루블'
    BYR: '벨라루스 루블'
    BZD: '벨리즈 달러'
    CAD: '캐나다 달러'
    CDF: '콩고 프랑'
    CHF: '스위스 프랑'
    CLF: '칠레 특별 체계 (UF)'
    CLP: '칠레 페소'
    COP: '콜롬비아 페소'
    CRC: '코스타리카 콜론'
    CUC: '쿠바 태환 페소'
    CUP: '쿠바 페소'
    CVE: '카보베르데 에스쿠도'
    CZK: '체코 공화국 코루나'
    DJF: '지부티 프랑'
    DKK: '덴마크 크로네'
    DOP: '도미니카 페소'
    DZD: '알제리 디나르'
    EGP: '이집트 파운드'
    ERN: '에리트리아 나크파'
    ETB: '에티오피아 비르'
    FJD: '피지 달러'
    FKP: '포클랜드 제도 파운드'
    GEL: '조지아 라리'
    GGP: '건지 파운드'
    GHS: '가나 시디'
    GIP: '지브롤터 파운드'
    GMD: '감비아 달라시'
    GNF: '기니 프랑'
    GTQ: '과테말라 케트살'
    GYD: '가이아나 달러'
    HKD: '홍콩 달러'
    HNL: '온두라스 렘피라'
    HRK: '크로아티아 쿠나'
    HTG: '아이티 구르드'
    HUF: '헝가리 포린트'
    IDR: '인도네시아 루피아'
    ILS: '이스라엘 신 셰켈'
    IMP: '맨섬 파운드'
    INR: '인도 루피'
    IQD: '이라크 디나르'
    IRR: '이란 리얄'
    ISK: '아이슬란드 크로나'
    JEP: '저지 파운드'
    JMD: '자메이카 달러'
    JOD: '요르단 디나르'
    KES: '케냐 실링'
    KGS: '키르기스스탄 솜'
    KHR: '캄보디아 리엘'
    KMF: '코모로 프랑'
    KPW: '북한 원'
    KWD: '쿠웨이트 디나르'
    KYD: '케이맨 제도 달러'
    KZT: '카자흐스탄 텐게'
    LAK: '라오스 킵'
    LBP: '레바논 파운드'
    LKR: '스리랑카 루피'
    LRD: '라이베리아 달러'
    LSL: '레소토 로티'
    LTL: '리투아니아 리타스'
    LVL: '라트비아 라트'
    LYD: '리비아 디나르'
    MAD: '모로코 디르함'
    MDL: '몰도바 레우'
    MGA: '마다가스카르 아리아리'
    MKD: '마케도니아 디나르'
    MMK: '미얀마 차트'
    MNT: '몽골 투그릭'
    MOP: '마카오 파타카'
    MRO: '모리타니안 우기야'
    MUR: '모리셔스 루피'
    MVR: '몰디브 루피아'
    MWK: '말라위 콰차'
    MXN: '멕시코 페소'
    MYR: '말레이시아 링깃'
    MZN: '모잠비크 메티칼'
    NAD: '나미비아 달러'
    NGN: '니제리아 나이라'
    NIO: '니카라과 코르도바'
    NOK: '노르웨이 크로네'
    NPR: '네팔 루피'
    NZD: '뉴질랜드 달러'
    OMR: '오만 리알'
    PAB: '파나마 발보아'
    PEN: '페루 누에보 솔'
    PGK: '파푸아뉴기니 키나'
    PHP: '필리핀 페소'
    PKR: '파키스탄 루피'
    PLN: '폴란드 즐로티'
    PYG: '파라과이 과라니'
    QAR: '카타르 리얄'
    RON: '루마니아 레우'
    RSD: '세르비아 디나르'
    RUB: '러시아 루블'
    RWF: '르완다 프랑'
    SAR: '사우디 리얄'
    SBD: '솔로몬 제도 달러'
    SCR: '세이셸 루피'
    SDG: '수단 파운드'
    SEK: '스웨덴 크로나'
    SGD: '싱가포르 달러'
    SHP: '세인트헬레나 파운드'
    SLE: '시에라리온 레온'
    SLL: '시에라리온 레온'
    SOS: '소말리아 실링'
    SRD: '수리남 달러'
    STD: '상투메 프린시페 도브라'
    SVC: '엘살바도르 콜론'
    SYP: '시리아 파운드'
    SZL: '스와질란드 릴랑게니'
    THB: '태국 바트'
    TJS: '타지키스탄 소모니'
    TMT: '투르크메니스탄 마나트'
    TND: '튀니지 디나르'
    TOP: '통가 파앙가'
    TRY: '터키 리라'
    TTD: '트리니다드 토바고 달러'
    TWD: '신 타이완 달러'
    TZS: '탄자니아 실링'
    UAH: '우크라이나 그리브나'
    UGX: '우간다 실링'
    UYU: '우루과이 페소'
    UZS: '우즈베키스탄 소미'
    VEF: '베네수엘라 볼리바르 푸에르테'
    VES: '소버린 볼리바르'
    VND: '베트남 동'
    VUV: '바누아투 바투'
    WST: '사모아 탈라'
    XAF: 'CFA 프랑 BEAC'
    XAG: '은 (트로이온스)'
    XAU: '금 (트로이온스)'
    XCD: '동카리브 달러'
    XDR: '특별인출권 (IMF)'
    XOF: 'CFA 프랑 BCEAO'
    XPF: 'CFP 프랑'
    YER: '예멘 리알'
    ZAR: '남아프리카 랜드'
    ZMK: '잠비아 콰차 (2013년 이전)'
    ZMW: '잠비아 콰차'
    ZWL: '짐바브웨 달러'
  tooltipSwap: '원본과 대상을 바꿉니다.'
en:
  currency: 'Currency'
  currencyDesc:
    EUR: 'Euro'
    USD: 'Currencyed States Dollar'
    KRW: 'South Korean Won'
    GBP: 'British Pound Sterling'
    JPY: 'Japanese Yen'
    CNY: 'Chinese Yuan'
    AED: 'Currencyed Arab Emirates Dirham'
    AFN: 'Afghan Afghani'
    ALL: 'Albanian Lek'
    AMD: 'Armenian Dram'
    ANG: 'Netherlands Antillean Guilder'
    AOA: 'Angolan Kwanza'
    ARS: 'Argentine Peso'
    AUD: 'Australian Dollar'
    AWG: 'Aruban Florin'
    AZN: 'Azerbaijani Manat'
    BAM: 'Bosnia-Herzegovina Convertible Mark'
    BBD: 'Barbadian Dollar'
    BDT: 'Bangladeshi Taka'
    BGN: 'Bulgarian Lev'
    BHD: 'Bahraini Dinar'
    BIF: 'Burundian Franc'
    BMD: 'Bermudan Dollar'
    BND: 'Brunei Dollar'
    BOB: 'Bolivian Boliviano'
    BRL: 'Brazilian Real'
    BSD: 'Bahamian Dollar'
    BTC: 'Bitcoin'
    BTN: 'Bhutanese Ngultrum'
    BWP: 'Botswanan Pula'
    BYN: 'New Belarusian Ruble'
    BYR: 'Belarusian Ruble'
    BZD: 'Belize Dollar'
    CAD: 'Canadian Dollar'
    CDF: 'Congolese Franc'
    CHF: 'Swiss Franc'
    CLF: 'Chilean Currency of Account (UF)'
    CLP: 'Chilean Peso'
    COP: 'Colombian Peso'
    CRC: 'Costa Rican Colón'
    CUC: 'Cuban Convertible Peso'
    CUP: 'Cuban Peso'
    CVE: 'Cape Verdean Escudo'
    CZK: 'Czech Republic Koruna'
    DJF: 'Djiboutian Franc'
    DKK: 'Danish Krone'
    DOP: 'Dominican Peso'
    DZD: 'Algerian Dinar'
    EGP: 'Egyptian Pound'
    ERN: 'Eritrean Nakfa'
    ETB: 'Ethiopian Birr'
    FJD: 'Fijian Dollar'
    FKP: 'Falkland Islands Pound'
    GEL: 'Georgian Lari'
    GGP: 'Guernsey Pound'
    GHS: 'Ghanaian Cedi'
    GIP: 'Gibraltar Pound'
    GMD: 'Gambian Dalasi'
    GNF: 'Guinean Franc'
    GTQ: 'Guatemalan Quetzal'
    GYD: 'Guyanaese Dollar'
    HKD: 'Hong Kong Dollar'
    HNL: 'Honduran Lempira'
    HRK: 'Croatian Kuna'
    HTG: 'Haitian Gourde'
    HUF: 'Hungarian Forint'
    IDR: 'Indonesian Rupiah'
    ILS: 'Israeli New Sheqel'
    IMP: 'Manx Pound'
    INR: 'Indian Rupee'
    IQD: 'Iraqi Dinar'
    IRR: 'Iranian Rial'
    ISK: 'Icelandic Króna'
    JEP: 'Jersey Pound'
    JMD: 'Jamaican Dollar'
    JOD: 'Jordanian Dinar'
    KES: 'Kenyan Shilling'
    KGS: 'Kyrgystani Som'
    KHR: 'Cambodian Riel'
    KMF: 'Comorian Franc'
    KPW: 'North Korean Won'
    KWD: 'Kuwaiti Dinar'
    KYD: 'Cayman Islands Dollar'
    KZT: 'Kazakhstani Tenge'
    LAK: 'Laotian Kip'
    LBP: 'Lebanese Pound'
    LKR: 'Sri Lankan Rupee'
    LRD: 'Liberian Dollar'
    LSL: 'Lesotho Loti'
    LTL: 'Lithuanian Litas'
    LVL: 'Latvian Lats'
    LYD: 'Libyan Dinar'
    MAD: 'Moroccan Dirham'
    MDL: 'Moldovan Leu'
    MGA: 'Malagasy Ariary'
    MKD: 'Macedonian Denar'
    MMK: 'Myanma Kyat'
    MNT: 'Mongolian Tugrik'
    MOP: 'Macanese Pataca'
    MRO: 'Mauritanian Ouguiya'
    MUR: 'Mauritian Rupee'
    MVR: 'Maldivian Rufiyaa'
    MWK: 'Malawian Kwacha'
    MXN: 'Mexican Peso'
    MYR: 'Malaysian Ringgit'
    MZN: 'Mozambican Metical'
    NAD: 'Namibian Dollar'
    NGN: 'Nigerian Naira'
    NIO: 'Nicaraguan Córdoba'
    NOK: 'Norwegian Krone'
    NPR: 'Nepalese Rupee'
    NZD: 'New Zealand Dollar'
    OMR: 'Omani Rial'
    PAB: 'Panamanian Balboa'
    PEN: 'Peruvian Nuevo Sol'
    PGK: 'Papua New Guinean Kina'
    PHP: 'Philippine Peso'
    PKR: 'Pakistani Rupee'
    PLN: 'Polish Zloty'
    PYG: 'Paraguayan Guarani'
    QAR: 'Qatari Rial'
    RON: 'Romanian Leu'
    RSD: 'Serbian Dinar'
    RUB: 'Russian Ruble'
    RWF: 'Rwandan Franc'
    SAR: 'Saudi Riyal'
    SBD: 'Solomon Islands Dollar'
    SCR: 'Seychellois Rupee'
    SDG: 'Sudanese Pound'
    SEK: 'Swedish Krona'
    SGD: 'Singapore Dollar'
    SHP: 'Saint Helena Pound'
    SLE: 'Sierra Leonean Leone'
    SLL: 'Sierra Leonean Leone'
    SOS: 'Somali Shilling'
    SRD: 'Surinamese Dollar'
    STD: 'São Tomé and Príncipe Dobra'
    SVC: 'Salvadoran Colón'
    SYP: 'Syrian Pound'
    SZL: 'Swazi Lilangeni'
    THB: 'Thai Baht'
    TJS: 'Tajikistani Somoni'
    TMT: 'Turkmenistani Manat'
    TND: 'Tunisian Dinar'
    TOP: 'Tongan Paʻanga'
    TRY: 'Turkish Lira'
    TTD: 'Trinidad and Tobago Dollar'
    TWD: 'New Taiwan Dollar'
    TZS: 'Tanzanian Shilling'
    UAH: 'Ukrainian Hryvnia'
    UGX: 'Ugandan Shilling'
    UYU: 'Uruguayan Peso'
    UZS: 'Uzbekistan Som'
    VEF: 'Venezuelan Bolívar Fuerte'
    VES: 'Sovereign Bolivar'
    VND: 'Vietnamese Dong'
    VUV: 'Vanuatu Vatu'
    WST: 'Samoan Tala'
    XAF: 'CFA Franc BEAC'
    XAG: 'Silver (troy ounce)'
    XAU: 'Gold (troy ounce)'
    XCD: 'East Caribbean Dollar'
    XDR: 'Special Drawing Rights'
    XOF: 'CFA Franc BCEAO'
    XPF: 'CFP Franc'
    YER: 'Yemeni Rial'
    ZAR: 'South African Rand'
    ZMK: 'Zambian Kwacha (pre-2013)'
    ZMW: 'Zambian Kwacha'
    ZWL: 'Zimbabwean Dollar'
  tooltipSwap: 'Swap source and destination.'
</i18n>
