interface Unit {
  [unit: string]: number | ((value: number, toRev?: boolean) => number);
}

type UnitBaseData = Record<string, Unit>;

// 단위 범주 목록별 단위 목록
const unitBaseData: UnitBaseData = {
  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  },
  area: {
    'm²': 1,
    'km²': 1000000,
    'cm²': 0.0001,
    'mm²': 0.000001,
    'in²': 0.00064516,
    'ft²': 0.09290304,
    'yd²': 0.83612736,
    'mi²': 2589988.110336,
    ha: 10000,
    a: 100,
    ac: 4046.8564224,
    py: 3.3025,
  },
  volume: {
    'm³': 1,
    'km³': 1000000000,
    'cm³': 0.000001,
    'mm³': 0.000000001,
    'in³': 0.000016387064,
    'ft³': 0.028316846592,
    'yd³': 0.764554857984,
    'mi³': 4168181825.44058,
    l: 0.001,
    ml: 0.000001,
    kl: 1000,
    gal: 0.003785411784,
  },
  weight: {
    g: 1,
    kg: 1000,
    mg: 0.001,
    oz: 28.349523125,
    lb: 453.59237,
    ton: 1000000,
  },
  temp: {
    C: 1,
    F: (t: number, r = false) => (r ? (t - 32) * (5 / 9) : t * (9 / 5) + 32),
    K: (t: number, r = false) => (r ? t - 273.15 : t + 273.15),
    R: (t: number, r = false) =>
      r ? (t - 491.67) * (5 / 9) : t * (9 / 5) + 491.67,
  },
  time: {
    sec: 1,
    min: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2628000,
    year: 31536000,
  },
  speed: {
    'km/h': 1,
    'm/s': 3.6,
    'ft/s': 1.09728,
    'mi/h': 1.609344,
    knot: 1.852,
  },
  pressure: {
    Pa: 1,
    kPa: 1000,
    MPa: 1000000,
    hPa: 100,
    bar: 100000,
    psi: 6894.75729316836,
    ksi: 6894757.29316836,
  },
  bytes: {
    B: 1,
    KB: 1024,
    MB: 1048576,
    GB: 1073741824,
    TB: 1099511627776,
    PB: 1125899906842624,
  },
};

// 단위 변환기 클래스
class UnitConverter {
  // 단위 변환 범주 목록
  static get categories() {
    return Object.keys(unitBaseData);
  }

  // 단위 변환 범주 목록별 단위 목록
  static get units() {
    return unitBaseData;
  }

  // 범주 별 단위 목록
  static getUnitLists(category: string) {
    // 예외 처리
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    return Object.keys(this.units[category]);
  }

  // 단위를 찾아서 반환
  static getUnit(category: string, unit: string) {
    // 예외 처리
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    if (!this.getUnitLists(category).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}`);
    }
    return this.units[category][unit];
  }

  // 단위 변환
  static convert<T extends keyof UnitBaseData>(
    category: T,
    value: number,
    from: string,
    to: string
  ): number {
    // fromUnit과 toUnit이 유효한 단위인지 확인
    const fromUnitInfo = this.getUnit(category, from);
    if (!fromUnitInfo) {
      throw new Error(`Invalid fromUnit: ${from}`);
    }
    const toUnitInfo = this.getUnit(category, to);
    if (!toUnitInfo) {
      throw new Error(`Invalid toUnit: ${to}`);
    }

    // fromUnit의 기준 단위로 값 변환
    let baseValue = value;
    if (typeof fromUnitInfo === 'function') {
      baseValue = fromUnitInfo(value, true);
    } else {
      baseValue *= fromUnitInfo;
    }

    // 기준 단위에서 toUnit으로 값 변환
    let convertedValue = baseValue;
    if (typeof toUnitInfo === 'function') {
      convertedValue = toUnitInfo(convertedValue);
    } else {
      convertedValue /= toUnitInfo;
    }

    return convertedValue;
  }
}
export default UnitConverter;
export {};

// console.log(UnitConverter.convert('길이', 1, 'm', 'km'));
// console.log(UnitConverter.convert('온도', 100, 'F', 'K'));
