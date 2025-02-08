import { unitBaseData } from '../constants/UnitBaseData';
import { BigNumber } from './CalculatorMath';
import { BaseConverter } from './BaseConverter';

import type { UnitBaseData } from '../constants/UnitBaseData';

/**
 * UnitConverter 클래스
 * 다양한 단위 간의 변환을 수행하는 메서드를 제공합니다.
 */
export class UnitConverter extends BaseConverter {
  protected readonly converterName = 'UnitConverter';

  /**
   * 사용 가능한 단위 변환 범주 목록을 반환합니다.
   * @returns {string[]} 단위 변환 범주 목록
   */
  static getCategories(): string[] {
    return Object.keys(unitBaseData);
  }

  /**
   * 특정 범주의 단위 목록을 반환합니다.
   * @param {string} category - 단위 범주
   * @returns {string[]} 해당 범주의 단위 목록
   * @throws {Error} 유효하지 않은 범주일 경우 에러를 발생시킵니다.
   */
  static getUnitLists(category: string): string[] {
    if (!UnitConverter.getCategories().includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    const categoryUnits = unitBaseData[category];
    if (!categoryUnits) {
      throw new Error(`No units found for category: ${category}`);
    }
    return Object.keys(categoryUnits);
  }

  getAvailableItems(): string[] {
    return UnitConverter.getCategories();
  }

  /**
   * 모든 단위 변환 범주와 해당 단위 목록을 반환합니다.
   * @returns {UnitBaseData} 단위 변환 범주별 단위 목록
   */
  get units(): UnitBaseData {
    return unitBaseData;
  }

  /**
   * 특정 단위의 설명을 반환합니다.
   * @param {string} item - 설명을 조회할 단위
   * @returns {string} 단위의 설명
   */
  getItemDescription(item: string): string {
    const [category, unit] = item.split('.');
    if (!category || !unit) {
      throw new Error(this.formatError('Invalid item format. Use "category.unit"'));
    }
    return UnitConverter.getUnitDesc(category, unit);
  }

  /**
   * 입력값이 유효한 단위인지 검사합니다.
   * @param {string} value - 검사할 값
   * @param {string} format - 검사할 단위 (형식: "category.unit")
   * @returns {boolean} 유효성 여부
   */
  isValid(value: string, format: string): boolean {
    const [category, unit] = format.split('.');
    if (!category || !unit) return false;

    try {
      const unitValue = UnitConverter.getUnitValue(category, unit);
      return unitValue !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * 특정 범주와 단위의 값을 반환합니다.
   * @param {string} category - 단위 범주
   * @param {string} unit - 단위
   * @returns {BigNumber | ((value: BigNumberType, toBase?: boolean) => BigNumber)} 단위 값 또는 변환 함수
   * @throws {Error} 유효하지 않은 범주나 단위일 경우 에러를 발생시킵니다.
   */
  static getUnitValue(
    category: string,
    unit: string,
  ): BigNumberType | ((value: BigNumberType, toBase?: boolean) => BigNumberType) {
    if (!UnitConverter.getCategories().includes(category) || !unitBaseData[category]?.[unit]) {
      throw new Error(`Invalid category or unit: ${category}, ${unit}`);
    }
    const unitValue = unitBaseData[category][unit].value;
    return typeof unitValue === 'function' ? unitValue : BigNumber(unitValue);
  }

  /**
   * 특정 범주와 단위의 설명을 반환합니다.
   * @param {string} category - 단위 범주
   * @param {string} unit - 단위
   * @returns {string} 단위 설명
   * @throws {Error} 유효하지 않은 범주나 단위일 경우 에러를 발생시킵니다.
   */
  static getUnitDesc(category: string, unit: string): string {
    if (!UnitConverter.getCategories().includes(category) || !unitBaseData[category]?.[unit]) {
      throw new Error(`Invalid category or unit: ${category}, ${unit}`);
    }
    return unitBaseData[category][unit].desc;
  }

  /**
   * 한 단위에서 다른 단위로 값을 변환합니다.
   * @param {T} category - 단위 범주
   * @param {BigNumberType} originalValue - 변환할 원래 값
   * @param {string} from - 원래 단위
   * @param {string} to - 변환할 단위
   * @returns {string} 변환된 값 (문자열 형태)
   * @throws {Error} 유효하지 않은 단위일 경우 에러를 발생시킵니다.
   */
  static convert<T extends keyof UnitBaseData>(
    category: T,
    originalValue: BigNumberType,
    from: string,
    to: string,
  ): string {
    // Check validity of fromUnit and toUnit at once
    const [fromUnitValue, toUnitValue] = [from, to].map((unit) => {
      const value = UnitConverter.getUnitValue(category, unit);
      if (!value) {
        throw new Error(`Invalid unit: ${unit}`);
      }
      return value;
    });

    // fromUnit에서 기준 단위로, 그리고 기준 단위에서 toUnit으로 값 변환
    const baseValue =
      typeof fromUnitValue === 'function'
        ? fromUnitValue(originalValue, true)
        : BigNumber(originalValue).mul(BigNumber(fromUnitValue));

    if (!baseValue) {
      throw new Error('Failed to calculate base value');
    }

    const convertedValue =
      typeof toUnitValue === 'function' ? toUnitValue(baseValue) : baseValue.div(BigNumber(toUnitValue));

    if (!convertedValue) {
      throw new Error('Failed to convert value');
    }

    return convertedValue.toString();
  }
}
