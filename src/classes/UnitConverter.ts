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
    μm: 1e6,
    nm: 1e9,
    pm: 1e12,
    in: 39.37007874015748,
    ft: 3.280839895013123,
    yd: 1.0936132983377078,
    mi: 0.000621371192237334,
    ly: 1.0570008340246155e-16,
    pc: 3.240779289469756e-17,
    au: 6.684587122268445e-12,
    nmi: 0.0005399568034557235,
  },
  넓이: {
    m2: 1,
    km2: 1e-6,
    cm2: 10000,
    mm2: 1e6,
    μm2: 1e12,
    nm2: 1e18,
    pm2: 1e24,
    in2: 1550.0031000062,
    ft2: 10.763910416709722,
    yd2: 1.19599004630108,
    mi2: 3.86102158542446e-7,
    ha: 1e-4,
    a: 1e-2,
    ac: 2.471053814671653e-4,
  },
  부피: {
    m3: 1,
    km3: 1e-9,
    cm3: 1e6,
    mm3: 1e9,
    μm3: 1e18,
    nm3: 1e27,
    pm3: 1e36,
    in3: 61023.74409473228,
    ft3: 35.31466672148859,
    yd3: 1.307950619314392,
    mi3: 2.399127586206896e-10,
    l: 1000,
    ml: 1e6,
    kl: 1,
    hl: 100,
    gal: 264.1720523581484,
    qt: 1056.688209534594,
    pt: 2113.376419069188,
    tbsp: 67628.04540368685,
    tsp: 202884.1362110605,
  },
  무게: {
    kg: 1,
    g: 1000,
    mg: 1e6,
    μg: 1e9,
    ng: 1e12,
    pg: 1e15,
    oz: 35.27396194958041,
    lb: 2.2046226218487757,
    st: 0.1574730444177697,
    t: 0.001102311310924388,
    u: 6.022136652620899e26,
    ton: 0.001,
    cwt: 0.019684130552220097,
  },
  온도: {
    C: 1,
    K: (t: number, r = false) => (r ? t - 273.15 : t + 273.15),
    F: (t: number, r = false) => (r ? ((t - 32) * (5 / 9)) : t * (9 / 5) + 32),
    R: (t: number, r = false) => (r ? ((t - 491.67) * (5 / 9)) : t * (9 / 5) + 491.67),
  },
  속도: {
    'm/s': 1,
    'km/h': 0.2777777777777778,
    'km/s': 1e-3,
    'm/h': 0.0002777777777777778,
    'cm/s': 100,
    'mm/s': 1000,
    'in/s': 39.37007874015748,
    'ft/s': 3.280839895013123,
    'ft/h': 0.011363636363636364,
    'mi/s': 0.000621371192237334,
    'mi/h': 0.00044704,
    knot: 0.0005399568034557235,
    mach: 340.003,
  },
  압력: {
    Pa: 1,
    kPa: 0.001,
    MPa: 1e-6,
    hPa: 0.01,
    bar: 0.00001,
    atm: 0.00000986923266716012,
    torr: 0.00750063755419211,
    psi: 0.0001450377377302092,
    ksi: 1.450377377302092e-7,
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

// console.log(UnitConverter.categories);
// UnitConverter.categories.forEach(category => {
//   console.log(category);
//   console.log(UnitConverter.getUnitLists(category));
// });
// //console.log(UnitConverter.units);
// console.log(UnitConverter.getUnit('속도', 'm/s'));
// console.log(UnitConverter.getUnit('속도', 'km/h'));
// console.log(UnitConverter.convert('속도', 100, 'km/h', 'm/s'));
// console.log(UnitConverter.convert('온도', 100, 'F', 'K'));
