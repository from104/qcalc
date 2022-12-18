interface Unit {
  [key: string]: number | ((value: number, toRev?: boolean) => number);
}

type UnitBaseData = Record<string, Unit>;

// 단위 변환 범주 목록별 단위 목록
const unitBaseData: UnitBaseData = {
  length: {
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
  area: {
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
  volume: {
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
  weight: {
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
  temperature: {
    C: 1,
    K: (t: number, r = false) => (r ? t - 273.15 : t + 273.15),
    F: (t: number, r = false) => (r ? ((t - 32) * (5 / 9)) : t * (9 / 5) + 32),
    R: (t: number, r = false) => (r ? ((t - 491.67) * (5 / 9)) : t * (9 / 5) + 491.67),
  },
  speed: {
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
  pressure: {
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
export default class UnitConverter {
  // 단위 변환 범주 목록
  static get categories() {
    return Object.keys(unitBaseData);
  }

  // 단위 변환 범주 목록별 단위 목록
  static get units() {
    return unitBaseData;
  }

  // 단위 변환 범주 목록별 단위 목록에서
  // 단위를 찾아서 반환 typescript

  static getUnit(category: string, unit: string) {
    return unitBaseData[category][unit];
  }

  // 단위 변환 범주 목록별 단위 목록에서
  // 단위 변환을 수행
  static convert<T extends keyof UnitBaseData>(
    category: T,
    value: number,
    from: string,
    to: string
  ): number {
    const base = UnitConverter.getUnit(category, from);
    const target = UnitConverter.getUnit(category, to);

    if (typeof base === 'function') {
      value = base(value, true);
    }
    if (typeof target === 'function') {
      return target(value);
    }
    return (value * (typeof base === 'function' ? 1 : base)) / target;
  }
}

console.log(UnitConverter.categories);
console.log(UnitConverter.units);
console.log(UnitConverter.getUnit('speed', 'm/s'));
console.log(UnitConverter.getUnit('speed', 'km/h'));
console.log(UnitConverter.convert('speed', 100, 'km/h', 'm/s'));
console.log(UnitConverter.convert('temperature', 100, 'F', 'K'));
