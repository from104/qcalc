/**
 * 조건을 검사하여 에러를 발생시키는 유틸리티 함수
 * @param condition - 에러 발생 조건 (true일 경우 에러 발생)
 * @param message - 에러 메시지
 * @throws {Error} condition이 true일 경우 주어진 메시지와 함께 에러 발생
 */
export function checkError(condition: boolean, message: string): void {
  if (condition) {
    throw new Error(message);
  }
}
