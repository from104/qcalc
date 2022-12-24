interface Unit {
  [unit: string]: number | ((value: number, toRev?: boolean) => number);
}

//
type UnitBaseData = Record<string, Unit>;

// 단위 변환 범주 목록별 단위 목록
const unitBaseData: UnitBaseData = {
  길이: {
    m: 1,
    km: 1e-3,
    cm: 100,
    mm: 1000,
    in: 39.37007874015748,
    ft: 3.280839895013123,
    yd: 1.0936132983377078,
    mi: 0.000621371192237334,
  },
  넓이: {
    'm²': 1,
    'km²': 1e-6,
    'cm²': 10000,
    'mm²': 1e6,
    'in²': 1550.0031000062,
    'ft²': 10.763910416709722,
    'yd²': 1.19599004630108,
    'mi²': 3.86102158542446e-7,
    py: 0.3025,
    ha: 1e-4,
    a: 1e-2,
    ac: 2.471053814671653e-4,
  },
  부피: {
    'm³': 1,
    'km³': 1e-9,
    'cm³': 1e6,
    'mm³': 1e9,
    'in³': 61023.74409473228,
    'ft³': 35.31466672148859,
    'yd³': 1.307950619314392,
    'mi³': 2.399127586206896e-10,
    l: 1000,
    ml: 1e6,
    kl: 1,
    gal: 264.1720523581484,
  },
  무게: {
    kg: 1,
    g: 1000,
    mg: 1e6,
    oz: 35.27396194958041,
    lb: 2.2046226218487757,
    ton: 0.001,
  },
  온도: {
    C: 1,
    K: (t: number, r = false) => (r ? t - 273.15 : t + 273.15),
    F: (t: number, r = false) => (r ? ((t - 32) * (5 / 9)) : t * (9 / 5) + 32),
    R: (t: number, r = false) => (r ? ((t - 491.67) * (5 / 9)) : t * (9 / 5) + 491.67),
  },
  속도: {
    'km/h': 1,
    'm/s': 0.277778,
    'ft/s': 0.91134514435653324327,
    'mi/h': 0.6213716893348046,
    knot: 0.53995723588740196508
  },
  압력: {
    Pa: 1,
    kPa: 0.001,
    MPa: 1e-6,
    hPa: 0.01,
    bar: 0.00001,
    psi: 0.0001450377377302092,
    ksi: 1.450377377302092e-7,
  },
  자료: {
    B: 1125899906842624,
    KB: 1099511627776,
    MB: 1073741824,
    GB: 1048576,
    TB: 1024,
    PB: 1,
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

  // 단위 변환 범주 목록별 단위 목록에서
  // 단위를 찾아서 반환 typescript

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

  // 단위 변환 범주 목록별 단위 목록에서
  // 단위 변환을 수행
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

    // fromUnit에서 fromUnit의 기준 단위로 값 변환
    let baseValue = value;
    if (typeof fromUnitInfo === 'function') {
      baseValue = fromUnitInfo(value, true);
    } else {
      baseValue /= fromUnitInfo;
    }

    // 기준 단위에서 toUnit으로 값 변환
    let convertedValue = baseValue;
    if (typeof toUnitInfo === 'function') {
      convertedValue = toUnitInfo(convertedValue);
    } else {
      convertedValue *= toUnitInfo;
    }

    return convertedValue;
  }
}
export default UnitConverter;
export {};

// console.log(UnitConverter.categories);
// UnitConverter.categories.forEach(category => {
//   console.log(category);
//   console.log(UnitConverter.getUnitLists(category));
// });
// //console.log(UnitConverter.units);
// console.log(UnitConverter.getUnit('속도', 'm/s'));
// console.log(UnitConverter.getUnit('속도', 'km/h'));
// console.log(UnitConverter.convert('길이', 1, 'm', 'km'));
// console.log(UnitConverter.convert('온도', 100, 'F', 'K'));
