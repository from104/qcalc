import {MathB, unitBaseData, UnitBaseData} from './UnitBaseData';

// 단위 변환기 클래스
export class UnitConverter {
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
    originalValue: number | string,
    from: string,
    to: string,
  ): string {
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
    let baseValue = MathB.bignumber(originalValue);
    if (typeof fromUnitValue === 'function') {
      baseValue = fromUnitValue(originalValue, true);
    } else {
      baseValue = baseValue.mul(fromUnitValue);
    }

    // 기준 단위에서 toUnit으로 값 변환
    let convertedValue = baseValue;
    if (typeof toUnitValue === 'function') {
      convertedValue = toUnitValue(convertedValue.toString());
    } else {
      convertedValue = convertedValue.div(toUnitValue);
    }

    return convertedValue.toString();
  }
}

// export {};

// console.log(UnitConverter.convert('길이', 1, 'm', 'km'));
// console.log(UnitConverter.convert('온도', 100, 'F', 'K'));
