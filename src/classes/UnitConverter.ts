interface Unit {
  [unit: string]: {
    value: number | ((originalValue: number, isReverse?: boolean) => number);
    desc: string;
  };
}

type UnitBaseData = Record<string, Unit>;

// 단위 범주 목록별 단위 목록
const unitBaseData: UnitBaseData = {
  length: {
    m: { value: 1, desc: 'Meter' },
    km: { value: 1000, desc: 'Kilometer' },
    cm: { value: 0.01, desc: 'Centimeter' },
    mm: { value: 0.001, desc: 'Millimeter' },
    in: { value: 0.0254, desc: 'Inch' },
    ft: { value: 0.3048, desc: 'Foot' },
    yd: { value: 0.9144, desc: 'Yard' },
    mi: { value: 1609.344, desc: 'Mile' },
  },
  area: {
    py: { value: 3.3025, desc: 'Pyeong' },
    'm²': { value: 1, desc: 'Square Meter' },
    'km²': { value: 1000000, desc: 'Square Kilometer' },
    'cm²': { value: 0.0001, desc: 'Square Centimeter' },
    'mm²': { value: 0.000001, desc: 'Square Millimeter' },
    'in²': { value: 0.00064516, desc: 'Square Inch' },
    'ft²': { value: 0.09290304, desc: 'Square Foot' },
    'yd²': { value: 0.83612736, desc: 'Square Yard' },
    'mi²': { value: 2589988.110336, desc: 'Square Mile' },
    ha: { value: 10000, desc: 'Hectare' },
    a: { value: 100, desc: 'Are' },
    ac: { value: 4046.8564224, desc: 'Acre' },
  },
  volume: {
    'm³': { value: 1, desc: 'Cubic Meter' },
    'km³': { value: 1000000000, desc: 'Cubic Kilometer' },
    'cm³': { value: 0.000001, desc: 'Cubic Centimeter' },
    'mm³': { value: 0.000000001, desc: 'Cubic Millimeter' },
    'in³': { value: 0.000016387064, desc: 'Cubic Inch' },
    'ft³': { value: 0.028316846592, desc: 'Cubic Foot' },
    'yd³': { value: 0.764554857984, desc: 'Cubic Yard' },
    'mi³': { value: 4168181825.44058, desc: 'Cubic Mile' },
    l: { value: 0.001, desc: 'Liter' },
    ml: { value: 0.000001, desc: 'Milliliter' },
    kl: { value: 1000, desc: 'Kiloliter' },
    gal: { value: 0.003785411784, desc: 'Gallon' },
  },
  weight: {
    g: { value: 1, desc: 'Gram' },
    kg: { value: 1000, desc: 'Kilogram' },
    mg: { value: 0.001, desc: 'Milligram' },
    oz: { value: 28.349523125, desc: 'Ounce' },
    lb: { value: 453.59237, desc: 'Pound' },
    ton: { value: 1000000, desc: 'Ton' },
  },
  temp: {
    '°C': { value: 1, desc: 'Celsius' },
    '°F': {
      value: (originalValue: number, isReverse = false) =>
        isReverse
          ? (originalValue - 32) * (5 / 9)
          : originalValue * (9 / 5) + 32,
      desc: 'Fahrenheit',
    },
    K: {
      value: (originalValue: number, isReverse = false) =>
        isReverse ? originalValue - 273.15 : originalValue + 273.15,
      desc: 'Kelvin',
    },
    '°R': {
      value: (originalValue: number, isReverse = false) =>
        isReverse
          ? (originalValue - 491.67) * (5 / 9)
          : originalValue * (9 / 5) + 491.67,
      desc: 'Rankine',
    },
  },
  time: {
    sec: { value: 1, desc: 'Second' },
    min: { value: 60, desc: 'Minute' },
    hour: { value: 3600, desc: 'Hour' },
    day: { value: 86400, desc: 'Day' },
    week: { value: 604800, desc: 'Week' },
    month: { value: 2628000, desc: 'Month' },
    year: { value: 31536000, desc: 'Year' },
  },
  speed: {
    'km/h': { value: 1, desc: 'Kilometer per Hour' },
    'm/s': { value: 3.6, desc: 'Meter per Second' },
    'ft/s': { value: 1.09728, desc: 'Foot per Second' },
    'mi/h': { value: 1.609344, desc: 'Mile per Hour' },
    knot: { value: 1.852, desc: 'Knot' },
  },
  pressure: {
    Pa: { value: 1, desc: 'Pascal' },
    kPa: { value: 1000, desc: 'Kilopascal' },
    MPa: { value: 1000000, desc: 'Megapascal' },
    hPa: { value: 100, desc: 'Hectopascal' },
    bar: { value: 100000, desc: 'Bar' },
    psi: { value: 6894.75729316836, desc: 'Pound per Square Inch' },
    ksi: { value: 6894757.29316836, desc: 'Kilopound per Square Inch' },
  },
  data: {
    B: { value: 1, desc: 'Byte' },
    KB: { value: 1024, desc: 'Kilobyte' },
    MB: { value: 1048576, desc: 'Megabyte' },
    GB: { value: 1073741824, desc: 'Gigabyte' },
    TB: { value: 1099511627776, desc: 'Terabyte' },
    PB: { value: 1125899906842624, desc: 'Petabyte' },
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

  // 단위 값 반환
  static getUnitValue(category: string, unit: string) {
    // 예외 처리
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    if (!this.getUnitLists(category).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}`);
    }
    return this.units[category][unit].value;
  }

  // 단위 설명 반환
  static getUnitDesc(category: string, unit: string) {
    // 예외 처리
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    if (!this.getUnitLists(category).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}`);
    }
    return this.units[category][unit].desc;
  }

  // 단위 변환
  static convert<T extends keyof UnitBaseData>(
    category: T,
    originalValue: number,
    from: string,
    to: string
  ): number {
    // fromUnit과 toUnit이 유효한 단위인지 확인
    const fromUnitValue = this.getUnitValue(category, from);
    if (!fromUnitValue) {
      throw new Error(`Invalid fromUnit: ${from}`);
    }
    const toUnitValue = this.getUnitValue(category, to);
    if (!toUnitValue) {
      throw new Error(`Invalid toUnit: ${to}`);
    }

    // fromUnit의 기준 단위로 값 변환
    let baseValue = originalValue;
    if (typeof fromUnitValue === 'function') {
      baseValue = fromUnitValue(originalValue, true);
    } else {
      baseValue *= fromUnitValue;
    }

    // 기준 단위에서 toUnit으로 값 변환
    let convertedValue = baseValue;
    if (typeof toUnitValue === 'function') {
      convertedValue = toUnitValue(convertedValue);
    } else {
      convertedValue /= toUnitValue;
    }

    return convertedValue;
  }
}
export default UnitConverter;
export {};

// console.log(UnitConverter.convert('길이', 1, 'm', 'km'));
// console.log(UnitConverter.convert('온도', 100, 'F', 'K'));
