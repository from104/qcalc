/**
 * 모든 변환기의 기본이 되는 추상 클래스
 * @description
 * 단위, 통화, 진법 등의 변환기들이 공통적으로 사용하는 기능을 정의합니다.
 */
export abstract class BaseConverter {
  /**
   * 변환기의 이름
   * @protected
   */
  protected abstract readonly converterName: string;

  /**
   * 변환 가능한 항목들의 목록을 반환
   * @returns {string[]} 변환 가능한 항목들의 목록
   */
  abstract getAvailableItems(): string[];

  /**
   * 특정 항목의 설명을 반환
   * @param {string} item - 설명을 조회할 항목
   * @returns {string} 항목의 설명
   */
  abstract getItemDescription(item: string): string;

  /**
   * 입력값이 유효한지 검사
   * @param {string} value - 검사할 값
   * @param {string} format - 검사할 형식
   * @returns {boolean} 유효성 여부
   */
  abstract isValid(value: string, format: string): boolean;

  /**
   * 에러 메시지 생성
   * @param {string} message - 에러 메시지
   * @returns {string} 포맷팅된 에러 메시지
   * @protected
   */
  protected formatError(message: string): string {
    return `[${this.converterName}] ${message}`;
  }

  /**
   * 변환기 초기화 시 필요한 작업 수행
   * @protected
   */
  protected initialize(): void {
    console.log(`${this.converterName} initialized`);
  }

  /**
   * 생성자
   */
  constructor() {
    this.initialize();
  }
}
