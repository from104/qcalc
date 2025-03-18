/**
 * 전역 객체에 불변 속성을 정의하는 유틸리티 함수
 * @param obj - 속성을 정의할 객체
 * @param key - 속성 키
 * @param value - 속성 값
 */
export function defineImmutableProperty<T extends object, K extends PropertyKey>(obj: T, key: K, value: unknown): void {
  Object.defineProperty(obj, key, { value, writable: false, configurable: false, enumerable: true });
}
