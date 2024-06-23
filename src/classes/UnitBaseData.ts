import {create, all, BigNumber} from 'mathjs';

export const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
});

export type BigNumberType = number | BigNumber | string;

interface Unit {
  [unit: string]: {
    value: number | ((originalValue: BigNumberType, isReverse?: boolean) => BigNumber);
    desc: string;
  };
}

export type UnitBaseData = Record<string, Unit>;

// 단위 범주 목록별 단위 목록
export const unitBaseData: UnitBaseData = {
  length: {
    // 길이
    pm: {value: 0.000000000001, desc: 'Picometer'}, // 피코미터
    nm: {value: 0.000000001, desc: 'Nanometer'}, // 나노미터
    μm: {value: 0.000001, desc: 'Micrometer'}, // 마이크로미터
    mm: {value: 0.001, desc: 'Millimeter'}, // 밀리미터
    cm: {value: 0.01, desc: 'Centimeter'}, // 센티미터
    m: {value: 1, desc: 'Meter'}, // 미터
    km: {value: 1000, desc: 'Kilometer'}, // 킬로미터
    in: {value: 0.0254, desc: 'Inch'}, // 인치
    ft: {value: 0.3048, desc: 'Foot'}, // 피트
    yd: {value: 0.9144, desc: 'Yard'}, // 야드
    mi: {value: 1609.344, desc: 'Mile'}, // 마일
    chi: {value: 0.0303, desc: "Ch'i (Inch)"}, // 치
    chok: {value: 0.303, desc: "Ch'ŏk (Foot)"}, // 척
    chg: {value: 3.03, desc: 'Chang (Fathom)'}, // 장
    ri: {value: 393, desc: 'Ri (Village Distance)'}, // 리
    au: {value: 149597870700, desc: 'Astronomical Unit'}, // 천문학적 단위
    ly: {value: 9460730472580800, desc: 'Light Year'}, // 광년
    pc: {value: 30856775814913672, desc: 'Parsec'}, // 파섹
  },
  area: {
    // 넓이
    'mm²': {value: 0.000001, desc: 'Square Millimeter'}, // 제곱밀리미터
    'cm²': {value: 0.0001, desc: 'Square Centimeter'}, // 제곱센티미터
    'm²': {value: 1, desc: 'Square Meter'}, // 제곱미터
    'km²': {value: 1000000, desc: 'Square Kilometer'}, // 제곱킬로미터
    'in²': {value: 0.00064516, desc: 'Square Inch'}, // 제곱인치
    'ft²': {value: 0.09290304, desc: 'Square Foot'}, // 제곱피트
    'yd²': {value: 0.83612736, desc: 'Square Yard'}, // 제곱야드
    'mi²': {value: 2589988.110336, desc: 'Square Mile'}, // 제곱마일
    ha: {value: 10000, desc: 'Hectare'}, // 헥타르
    a: {value: 100, desc: 'Are'}, // 아르
    ac: {value: 4046.8564224, desc: 'Acre'}, // 에이커
    py: {value: 3.3025, desc: 'Pyeong'}, // 평
    tb: {value: 330.58, desc: 'Tanbo (Are)'}, // 단보
    k: {value: 3305.8, desc: 'Kyŏl (Hectare)'}, // 결
  },
  volume: {
    // 부피
    'mm³': {value: 0.000000001, desc: 'Cubic Millimeter'}, // 입방밀리미터
    'cm³': {value: 0.000001, desc: 'Cubic Centimeter'}, // 입방센티미터
    'm³': {value: 1, desc: 'Cubic Meter'}, // 입방미터
    'km³': {value: 1000000000, desc: 'Cubic Kilometer'}, // 입방킬로미터
    'in³': {value: 0.000016387064, desc: 'Cubic Inch'}, // 입방인치
    'ft³': {value: 0.028316846592, desc: 'Cubic Foot'}, // 입방피트
    'yd³': {value: 0.764554857984, desc: 'Cubic Yard'}, // 입방야드
    'mi³': {value: 4168181825.44058, desc: 'Cubic Mile'}, // 입방마일
    ml: {value: 0.000001, desc: 'Milliliter'}, // 밀리리터
    l: {value: 0.001, desc: 'Liter'}, // 리터
    kl: {value: 1000, desc: 'Kiloliter'}, // 킬로리터
    gal: {value: 0.003785411784, desc: 'Gallon'}, // 갤런
    to: {value: 0.0018, desc: 'Toe (Liter)'}, // 되
    mal: {value: 0.018, desc: 'Mal (Decaliter)'}, // 말
    seom: {value: 0.18, desc: 'Sŏm (Hectoliter)'}, // 섬
  },
  weight: {
    // 무게
    g: {value: 1, desc: 'Gram'}, // 그램
    kg: {value: 1000, desc: 'Kilogram'}, // 킬로그램
    mg: {value: 0.001, desc: 'Milligram'}, // 밀리그램
    oz: {value: 28.349523125, desc: 'Ounce'}, // 온스
    lb: {value: 453.59237, desc: 'Pound'}, // 파운드
    ton: {value: 1000000, desc: 'Ton'}, // 톤
    geun: {value: 600, desc: 'Geun (Catty)'}, // 근
    nyang: {value: 37.5, desc: 'Nyang (Tael)'}, // 냥
    don: {value: 3.75, desc: 'Don (Mace)'}, // 돈
    jeon: {value: 0.375, desc: 'Jeon (Candareen)'}, // 전
    gwan: {value: 3750, desc: 'Gwan (Kwan)'}, // 관
  },
  angle: {
    // 각도
    deg: {value: 0.017453292519943295, desc: 'Degree'}, // 도
    urad: {value: 0.000001, desc: 'Microradian'}, // 마이크로라디안
    grad: {value: 0.015707963267948967, desc: 'Gradian'}, // 그라디안
    rad: {value: 1, desc: 'Radian'}, // 라디안
    arcm: {value: 0.0002908882086657216, desc: 'Minute of arc'}, // 분(각도)
    arcs: {value: 0.00000484813681109536, desc: 'Second of arc'}, // 초(각도)
  },
  temp: {
    // 온도
    '°C': {value: 1, desc: 'Celsius'}, // 섭씨
    '°F': {
      // 화씨
      value: (originalValue: BigNumberType, isReverse = false): BigNumber => {
        const value = MathB.bignumber(originalValue);
        return isReverse
          ? value.minus(32).times(5).dividedBy(9) // (originalValue - 32) * (5 / 9)
          : value.times(9).dividedBy(5).plus(32); // originalValue * (9 / 5) + 32
      },
      desc: 'Fahrenheit',
    },
    K: {
      // 켈빈
      value: (originalValue: BigNumberType, isReverse = false): BigNumber => {
        const value = MathB.bignumber(originalValue);
        return isReverse
          ? value.minus(273.15) // originalValue - 273.15 (From Kelvin to Celsius)
          : value.plus(273.15); // originalValue + 273.15 (From Celsius to Kelvin)
      },
      desc: 'Kelvin',
    },
    '°R': {
      // 랭킨
      value: (originalValue: BigNumberType, isReverse = false): BigNumber => {
        const value = MathB.bignumber(originalValue);
        return isReverse
          ? value.minus(491.67).times(5).dividedBy(9) // (originalValue - 491.67) * (5 / 9)
          : value.times(9).dividedBy(5).plus(491.67); // originalValue * (9 / 5) + 491.67
      },
      desc: 'Rankine',
    },
  },
  energy: {
    // 에너지
    J: {value: 1, desc: 'Joule'}, // 줄
    kJ: {value: 1000, desc: 'Kilojoule'}, // 킬로줄
    MJ: {value: 1000000, desc: 'Megajoule'}, // 메가줄
    GJ: {value: 1000000000, desc: 'Gigajoule'}, // 기가줄
    cal: {value: 4.184, desc: 'Calorie'}, // 칼로리
    kcal: {value: 4184, desc: 'Kilocalorie'}, // 킬로칼로리
    Wh: {value: 3600, desc: 'Watt-hour'}, // 와트시
    kWh: {value: 3600000, desc: 'Kilowatt-hour'}, // 킬로와트시
    MWh: {value: 3600000000, desc: 'Megawatt-hour'}, // 메가와트시
    GWh: {value: 3600000000000, desc: 'Gigawatt-hour'}, // 기가와트시
    eV: {value: 1.602176634e-19, desc: 'Electronvolt'}, // 전자볼트
    keV: {value: 1.602176634e-16, desc: 'Kiloelectronvolt'}, // 킬로전자볼트
    MeV: {value: 1.602176634e-13, desc: 'Megaelectronvolt'}, // 메가전자볼트
    GeV: {value: 1.602176634e-10, desc: 'Gigaelectronvolt'}, // 기가전자볼트
    BTU: {value: 1055.06, desc: 'British Thermal Unit'}, // 영국 열 단위
    erg: {value: 0.0000001, desc: 'Erg'}, // 에르그
  },
  force: {
    // 힘
    N: {value: 1, desc: 'Newton'}, // 뉴턴
    kN: {value: 1000, desc: 'Kilonewton'}, // 킬로뉴턴
    dyn: {value: 0.00001, desc: 'Dyne'}, // 다인
    lbf: {value: 4.44822, desc: 'Pound-force'}, // 파운드힘
    kgf: {value: 9.80665, desc: 'Kilogram-force'}, // 킬로그램힘
  },
  time: {
    // 시간
    ps: {value: 0.000000000001, desc: 'Picosecond'}, // 피코초
    ns: {value: 0.000000001, desc: 'Nanosecond'}, // 나노초
    μs: {value: 0.000001, desc: 'Microsecond'}, // 마이크로초
    ms: {value: 0.001, desc: 'Millisecond'}, // 밀리초
    s: {value: 1, desc: 'Second'}, // 초
    m: {value: 60, desc: 'Minute'}, // 분
    h: {value: 3600, desc: 'Hour'}, // 시간
    d: {value: 86400, desc: 'Day'}, // 일
    w: {value: 604800, desc: 'Week'}, // 주
    mon: {value: 2628000, desc: 'Month'}, // 월
    year: {value: 31536000, desc: 'Year'}, // 년
    decade: {value: 315360000, desc: 'Decade'}, // 십년
    century: {value: 3153600000, desc: 'Century'}, // 세기
  },
  speed: {
    // 속도
    'km/h': {value: 1, desc: 'Kilometer per Hour'}, // 킬로미터/시간
    'm/s': {value: 3.6, desc: 'Meter per Second'}, // 미터/초
    'ft/s': {value: 1.09728, desc: 'Foot per Second'}, // 피트/초
    'mi/h': {value: 1.609344, desc: 'Mile per Hour'}, // 마일/시간
    knot: {value: 1.852, desc: 'Knot'}, // 노트
  },
  pressure: {
    // 압력
    Pa: {value: 1, desc: 'Pascal'}, // 파스칼
    hPa: {value: 100, desc: 'Hectopascal'}, // 헥토파스칼
    kPa: {value: 1000, desc: 'Kilopascal'}, // 킬로파스칼
    MPa: {value: 1000000, desc: 'Megapascal'}, // 메가파스칼
    bar: {value: 100000, desc: 'Bar'}, // 바
    psi: {value: 6894.75729316836, desc: 'Pound per Square Inch'}, // 파운드/제곱인치
    ksi: {value: 6894757.29316836, desc: 'Kilopound per Square Inch'}, // 킬로파운드/제곱인치
  },
  data: {
    // 데이터
    B: {value: 1, desc: 'Byte'}, // 바이트
    kiB: {value: 1024, desc: 'Kibibyte (1024 Bytes)'}, // 키비바이트 (1024 바이트)
    kB: {value: 1000, desc: 'Kilobyte (1000 Bytes)'}, // 킬로바이트 (1000 바이트)
    MiB: {value: 1048576, desc: 'Mebibyte (1024 Kibibytes)'}, // 메비바이트 (1024 키비바이트)
    MB: {value: 1000000, desc: 'Megabyte (1000 Kilobytes)'}, // 메가바이트 (1000 킬로바이트)
    GiB: {value: 1073741824, desc: 'Gibibyte (1024 Mebibytes)'}, // 기비바이트 (1024 메비바이트)
    GB: {value: 1000000000, desc: 'Gigabyte (1000 Megabytes)'}, // 기가바이트 (1000 메가바이트)
    TiB: {value: 1099511627776, desc: 'Tebibyte (1024 Gibibytes)'}, // 테비바이트 (1024 기비바이트)
    TB: {value: 1000000000000, desc: 'Terabyte (1000 Gigabytes)'}, // 테라바이트 (1000 기가바이트)
    PiB: {value: 1125899906842624, desc: 'Pebibyte (1024 Tebibytes)'}, // 페비바이트 (1024 테비바이트)
    PB: {value: 1000000000000000, desc: 'Petabyte (1000 Terabytes)'}, // 페타바이트 (1000 테라바이트)
    EiB: {value: 1152921504606846976, desc: 'Exbibyte (1024 Pebibytes)'}, // 엑스비바이트 (1024 페비바이트)
    EB: {value: 1000000000000000000, desc: 'Exabyte (1000 Petabytes)'}, // 엑사바이트 (1000 페타바이트)
    ZiB: {value: 1180591620717411303424, desc: 'Zebibyte (1024 Exbibytes)'}, // 제비바이트 (1024 엑스비바이트)
    ZB: {value: 1000000000000000000000, desc: 'Zettabyte (1000 Exabytes)'}, // 제타바이트 (1000 엑사바이트)
    YiB: {value: 1208925819614629174706176, desc: 'Yobibyte (1024 Zebibytes)'}, // 요비바이트 (1024 제비바이트)
    YB: {value: 1000000000000000000000000, desc: 'Yottabyte (1000 Zettabytes)'}, // 요타바이트 (1000 제타바이트)
    n: {value: 0.5, desc: 'Nibble'}, // 니블
    b: {value: 0.125, desc: 'Bit'}, // 비트
    kib: {value: 128, desc: 'Kibibit (1024 Bits)'}, // 키비비트 (1024 비트)
    kb: {value: 125, desc: 'Kilobit (1000 Bits)'}, // 킬로비트 (1000 비트)
    Mib: {value: 131072, desc: 'Mebibit (1024 Kibibits)'}, // 메비비트 (1024 키비비트)
    Mb: {value: 125000, desc: 'Megabit (1000 Kilobits)'}, // 메가비트 (1000 킬로비트)
    Gib: {value: 134217728, desc: 'Gibibit (1024 Mebibits)'}, // 기비비트 (1024 메비비트)
    Gb: {value: 125000000, desc: 'Gigabit (1000 Megabits)'}, // 기가비트 (1000 메가비트)
    Tib: {value: 137438953472, desc: 'Tebibit (1024 Gibibits)'}, // 테비비트 (1024 기비비트)
    Tb: {value: 125000000000, desc: 'Terabit (1000 Gigabits)'}, // 테라비트 (1000 기가비트)
    Pib: {value: 140737488355328, desc: 'Pebibit (1024 Tebibits)'}, // 페비비트 (1024 테비비트)
    Pb: {value: 125000000000000, desc: 'Petabit (1000 Terabits)'}, // 페타비트 (1000 테라비트)
    Eib: {value: 144115188075855872, desc: 'Exbibit (1024 Pebibits)'}, // 엑스비비트 (1024 페비비트)
    Eb: {value: 125000000000000000, desc: 'Exabit (1000 Petabits)'}, // 엑사비트 (1000 페타비트)
    Zib: {value: 147573952589676412928, desc: 'Zebibit (1024 Exbibits)'}, // 제비비트 (1024 엑스비비트)
    Zb: {value: 125000000000000000000, desc: 'Zettabit (1000 Exabits)'}, // 제타비트 (1000 엑사비트)
    Yib: {value: 151115727451828646838272, desc: 'Yobibit (1024 Zebibits)'}, // 요비비트 (1024 제비비트)
    Yb: {value: 125000000000000000000000, desc: 'Yottabit (1000 Zettabits)'}, // 요타비트 (1000 제타비트)
  },
  frequency: {
    // 주파수
    Hz: {value: 1, desc: 'Hertz'}, // 헤르츠
    kHz: {value: 1000, desc: 'Kilohertz'}, // 킬로헤르츠
    MHz: {value: 1000000, desc: 'Megahertz'}, // 메가헤르츠
    GHz: {value: 1000000000, desc: 'Gigahertz'}, // 기가헤르츠
    THz: {value: 1000000000000, desc: 'Terahertz'}, // 테라헤르츠
    rpm: {value: 1 / 60, desc: 'Revolutions per minute'}, // 분당 회전수
  },
  luminance: {
    // 휘도
    'cd/m²': {value: 1, desc: 'Candela per square meter'}, // 칸델라 매 제곱미터
    nit: {value: 1, desc: 'Nit'}, // 니트
    stb: {value: 10000, desc: 'Stilb'}, // 스틸브
    asb: {value: 0.31831, desc: 'Apostilb'}, // 아포스틸브
    lmb: {value: 3183.1, desc: 'Lambert'}, // 램버트
    ftl: {value: 3.4262591, desc: 'Foot-lambert'}, // 피트램버트
  },
  illuminance: {
    // 조도
    lx: {value: 1, desc: 'Lux'}, // 럭스
    ph: {value: 10000, desc: 'Phot'}, // 포트
    fc: {value: 10.76391, desc: 'Foot-candle'}, // 푸트캔들
  },
  electricCharge: {
    // 전하량
    pC: {value: 0.000000000001, desc: 'Picocoulomb'}, // 피코쿨롬
    nC: {value: 0.000000001, desc: 'Nanocoulomb'}, // 나노쿨롬
    μC: {value: 0.000001, desc: 'Microcoulomb'}, // 마이크로쿨롬
    mC: {value: 0.001, desc: 'Millicoulomb'}, // 밀리쿨롬
    C: {value: 1, desc: 'Coulomb'}, // 쿨롬
    mAh: {value: 3.6, desc: 'Milliampere-hour'}, // 밀리암페어시
    Ah: {value: 3600, desc: 'Ampere-hour'}, // 암페어시
    e: {value: 1.602176634e-19, desc: 'Elementary Charge'}, // 원자 전하
  },
};
