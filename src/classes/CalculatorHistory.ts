import { CalculationResult } from './CalculatorTypes';

/**
 * 계산기 히스토리 항목을 위한 인터페이스
 * 각 히스토리 항목은 계산 결과와 관련 메타데이터를 포함합니다.
 */
export interface History {
  /**
   * 히스토리 항목의 고유 식별자
   * 선택적 필드이며, 새로운 히스토리 생성 시 자동으로 할당됩니다.
   */
  id?: number;

  /**
   * 계산 결과의 스냅샷
   * 계산식, 결과값 등 계산과 관련된 모든 정보를 포함합니다.
   */
  calculationResult: CalculationResult;

  /**
   * 히스토리 항목에 대한 사용자 메모
   * 선택적 필드이며, 사용자가 특정 계산에 대한 참고사항을 기록할 수 있습니다.
   */
  memo?: string;
}

/**
 * 계산기의 히스토리를 관리하는 클래스입니다.
 *
 * 이 클래스는 다음과 같은 주요 기능을 제공합니다:
 * - 계산 결과의 히스토리 저장 및 관리
 * - 히스토리 항목의 추가/삭제
 * - 히스토리 크기 제한 관리
 *
 * 주요 특징:
 * - 최대 100개의 히스토리 항목을 저장할 수 있습니다.
 * - 새로운 항목은 배열의 앞쪽에 추가됩니다(LIFO 구조).
 * - 각 히스토리 항목은 고유한 ID를 가집니다.
 * - 메모리 관리를 위해 히스토리 크기를 자동으로 제한합니다.
 *
 * @example
 * const history = new CalculatorHistory();
 * history.addHistory(resultSnapshot);
 * const size = history.getHistorySize();
 * const allHistories = history.getHistories();
 */

export class CalculatorHistory {
  /**
   * 계산기의 모든 히스토리 항목들을 저장하는 배열
   * 가장 최근 항목이 배열의 앞쪽에 위치합니다.
   */
  private histories: History[] = [];

  /**
   * 히스토리의 최대 저장 개수
   * 메모리 관리를 위해 100개로 제한합니다.
   */
  private readonly HISTORY_MAX_SIZE = 100;

  /**
   * 새로운 계산 결과를 히스토리에 추가합니다.
   * 히스토리 객체를 생성하고 배열의 맨 앞에 추가한 후,
   * 필요한 경우 최대 크기를 초과하지 않도록 조정합니다.
   *
   * @param history - 저장할 계산 결과의 스냅샷 데이터
   * @throws {Error} 히스토리 객체 생성 또는 추가 과정에서 오류가 발생한 경우
   */
  public addHistory(history: CalculationResult): void {
    try {
      // 새로운 히스토리 항목의 고유 ID 생성
      const historyId = this.generateNewId();

      // 새로운 히스토리 객체 생성
      // - id: 고유한 식별자
      // - resultSnapshot: 계산 결과 데이터
      // - memo: 사용자 메모 (초기값: 빈 문자열)
      const newHistory: History = {
        id: historyId,
        calculationResult: history,
        memo: '',
      };

      // 새로운 히스토리를 배열의 맨 앞에 추가 (LIFO 구조)
      this.histories.unshift(newHistory);

      // 히스토리 크기가 최대 제한(HISTORY_MAX_SIZE)을 초과하는 경우
      // 오래된 항목을 제거하여 크기 조정
      this.trimHistoryIfNeeded();
    } catch (error) {
      throw new Error('Failed to add history item');
    }
  }

  /**
   * 가장 오래된(첫 번째) 히스토리 항목을 제거합니다.
   * LIFO(Last In First Out) 구조에서 가장 마지막에 추가된 항목을 제거합니다.
   *
   * @throws {Error} 히스토리 항목 제거 중 오류가 발생한 경우
   */
  public shiftHistory(): void {
    try {
      this.histories.shift();
    } catch (error) {
      throw new Error('Failed to remove history item');
    }
  }

  /**
   * 현재 저장된 히스토리 항목의 총 개수를 반환합니다.
   *
   * @returns {number} 히스토리 배열의 현재 길이
   */
  public getHistorySize(): number {
    return this.histories.length;
  }

  /**
   * 저장된 모든 히스토리 항목을 배열 형태로 반환합니다.
   * 배열은 최신 항목부터 오래된 항목 순으로 정렬되어 있습니다.
   *
   * @returns {History[]} 전체 히스토리 항목 배열
   */
  public getHistories(): History[] {
    return this.histories;
  }

  /**
   * 주어진 ID에 해당하는 히스토리 항목의 배열 인덱스를 찾아 반환합니다.
   *
   * @param {number} id - 찾고자 하는 히스토리 항목의 고유 ID
   * @returns {number} 히스토리 배열에서의 인덱스 위치
   * @throws {Error} 주어진 ID에 해당하는 히스토리를 찾을 수 없는 경우
   */
  public getHistoryIndexByID(id: number): number {
    const index = this.histories.findIndex((history) => history.id === id);
    if (index === -1) throw new Error('History item not found');
    return index;
  }

  /**
   * 주어진 인덱스에 해당하는 히스토리 항목을 반환합니다.
   *
   * @param {number} index - 찾고자 하는 히스토리 항목의 인덱스
   * @returns {History} 해당 인덱스의 히스토리 항목
   * @throws {Error} 유효하지 않은 인덱스가 전달된 경우
   */
  public getHistoryByIndex(index: number): History {
    if (index < 0 || index >= this.histories.length) {
      throw new Error('Invalid history index');
    }
    return this.histories[index];
  }

  /**
   * 주어진 ID에 해당하는 히스토리 항목을 반환합니다.
   *
   * @param {number} id - 찾고자 하는 히스토리 항목의 고유 ID
   * @returns {History} 해당 ID의 히스토리 항목
   * @throws {Error} 해당 ID의 히스토리를 찾을 수 없는 경우
   */
  public getHistoryByID(id: number): History {
    return this.getHistoryByIndex(this.getHistoryIndexByID(id));
  }

  /**
   * 주어진 ID에 해당하는 히스토리 항목을 삭제합니다.
   *
   * @param {number} id - 삭제하고자 하는 히스토리 항목의 고유 ID
   * @throws {Error} 해당 ID의 히스토리를 찾을 수 없는 경우
   */
  public deleteHistory(id: number): void {
    const index = this.getHistoryIndexByID(id);
    this.histories.splice(index, 1);
  }

  /**
   * 저장된 모든 히스토리 항목을 삭제합니다.
   * 히스토리 배열을 빈 배열로 초기화합니다.
   */
  public clearHistory(): void {
    this.histories = [];
  }

  /**
   * 히스토리 항목에 메모를 추가하거나 수정합니다.
   *
   * @param {number} id - 메모를 추가할 히스토리 항목의 고유 ID
   * @param {string} memo - 추가할 메모 내용
   * @throws {Error} 해당 ID의 히스토리를 찾을 수 없는 경우 'History item not found' 에러 발생
   */
  public setMemo(id: number, memo: string): void {
    const index = this.getHistoryIndexByID(id);
    this.histories[index].memo = memo;
  }

  /**
   * 히스토리 항목의 메모를 조회합니다.
   *
   * @param {number} id - 메모를 조회할 히스토리 항목의 고유 ID
   * @returns {string | null} 메모가 있는 경우 메모 내용, 없는 경우 null 반환
   * @throws {Error} 해당 ID의 히스토리를 찾을 수 없는 경우 'History item not found' 에러 발생
   */
  public getMemo(id: number): string | null {
    const index = this.getHistoryIndexByID(id);
    return this.histories[index].memo || null;
  }

  /**
   * 히스토리 항목의 메모를 삭제합니다.
   *
   * @param {number} id - 메모를 삭제할 히스토리 항목의 고유 ID
   * @throws {Error} 해당 ID의 히스토리를 찾을 수 없는 경우 'History item not found' 에러 발생
   */
  public deleteMemo(id: number): void {
    const index = this.getHistoryIndexByID(id);
    delete this.histories[index].memo;
  }

  /**
   * 새로운 히스토리 항목을 위한 고유 ID를 생성합니다.
   *
   * @returns {number} 새로 생성된 고유 ID
   * @private
   */
  private generateNewId(): number {
    if (this.histories.length === 0) {
      return 1;
    }

    const maxId = Math.max(...(this.histories.map((history) => history.id) as number[]));
    return maxId + 1;
  }

  /**
   * 히스토리 크기가 최대 제한을 초과하는 경우 가장 오래된 항목을 제거합니다.
   * HISTORY_MAX_SIZE를 초과하는 경우 마지막 항목이 삭제됩니다.
   *
   * @private
   */
  private trimHistoryIfNeeded(): void {
    if (this.histories.length > this.HISTORY_MAX_SIZE) {
      this.histories.pop();
    }
  }
}
