import { i18n } from 'src/i18n/initLocale';

/**
 * i18n을 사용하여 에러 메시지를 가져옵니다.
 * @param key - 에러 메시지의 i18n 키
 * @param params - 메시지에 삽입될 파라미터 객체
 * @returns 현재 로케일에 맞는 번역된 에러 메시지
 */
export function getErrorMessage(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params ?? {});
}

/**
 * 조건을 검사하여 i18n 처리된 에러를 발생시키는 유틸리티 함수
 * @param condition - 에러 발생 조건 (true일 경우 에러 발생)
 * @param messageKey - 에러 메시지의 i18n 키
 * @param params - 메시지에 삽입될 파라미터 객체
 * @throws {Error} condition이 true일 경우 i18n 처리된 메시지와 함께 에러 발생
 */
export function checkError(condition: boolean, messageKey: string, params?: Record<string, unknown>): void {
  if (condition) {
    const errorMessage = getErrorMessage(messageKey, params);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * i18n 처리된 에러를 발생시키는 유틸리티 함수
 * @param messageKey - 에러 메시지의 i18n 키
 * @param params - 메시지에 삽입될 파라미터 객체
 * @throws {Error} i18n 처리된 메시지와 함께 에러 발생
 */
export function throwError(messageKey: string, params?: Record<string, unknown>): never {
  const errorMessage = getErrorMessage(messageKey, params);
  console.error(errorMessage);
  throw new Error(errorMessage);
}
