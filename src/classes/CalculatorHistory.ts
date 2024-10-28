import { ResultSnapshot } from './Calculator';

// 계산기 히스토리를 위한 인터페이스
export interface History {
  id?: number;           // 히스토리 항목의 고유 식별자
  resultSnapshot: ResultSnapshot;  // 계산 결과의 스냅샷
  memo?: string;         // 선택적인 메모 필드
}

export class CalculatorHistory {
  private histories: History[] = [];  // 히스토리 항목들을 저장하는 배열
  private readonly HISTORY_MAX_SIZE = 100; // 히스토리의 최대 크기

  // 새로운 히스토리 항목 추가
  public addHistory(history: ResultSnapshot): void {
    // 새로운 히스토리 ID 생성
    const historyId = this.generateNewId();
    
    // 새로운 히스토리 객체 생성
    const newHistory: History = {
      id: historyId,
      resultSnapshot: history,
      memo: '',
    };

    // 새 히스토리를 배열의 앞쪽에 추가
    this.histories.unshift(newHistory);
    
    // 히스토리 크기가 최대치를 넘지 않도록 조정
    this.trimHistoryIfNeeded();
  }

  // 가장 오래된 히스토리 항목 제거
  public shiftHistory(): void {
    this.histories.shift();
  }

  // 현재 히스토리 크기 반환
  public getHistorySize(): number {
    return this.histories.length;
  }

  // 전체 히스토리 배열 반환
  public getHistories(): History[] {
    return this.histories;
  }

  // ID로 히스토리 인덱스 찾기
  public getHistoryIndexByID(id: number): number {
    const index = this.histories.findIndex((h) => h.id === id);
    if (index === -1) throw new Error('히스토리를 찾을 수 없습니다.');
    return index;
  }

  // 인덱스로 히스토리 항목 찾기
  public getHistoryByIndex(index: number): History {
    if (index < 0 || index >= this.histories.length) {
      throw new Error('유효하지 않은 인덱스입니다.');
    }
    return this.histories[index];
  }

  // ID로 히스토리 항목 찾기
  public getHistoryByID(id: number): History {
    return this.getHistoryByIndex(this.getHistoryIndexByID(id));
  }

  // ID로 히스토리 항목 삭제
  public deleteHistory(id: number): void {
    const index = this.getHistoryIndexByID(id);
    this.histories.splice(index, 1);
  }

  // 모든 히스토리 삭제
  public clearHistory(): void {
    this.histories = [];
  }

  // 히스토리 항목에 메모 추가
  public setMemo(id: number, memo: string): void {
    const index = this.getHistoryIndexByID(id);
    this.histories[index].memo = memo;
  }

  // 히스토리 항목의 메모 가져오기
  public getMemo(id: number): string | null {
    const index = this.getHistoryIndexByID(id);
    return this.histories[index].memo || null;
  }

  // 히스토리 항목의 메모 삭제
  public deleteMemo(id: number): void {
    const index = this.getHistoryIndexByID(id);
    delete this.histories[index].memo;
  }

  // 새로운 히스토리 ID 생성
  private generateNewId(): number {
    // 히스토리가 비어있으면 1을 반환
    if (this.histories.length === 0) return 1;
    
    // 현재 존재하는 ID 중 가장 큰 값을 찾아 1을 더함
    const maxId = Math.max(...(this.histories.map((h) => h.id) as number[]));
    return maxId + 1;
  }

  // 히스토리 크기 제한
  private trimHistoryIfNeeded(): void {
    // 히스토리 크기가 최대치를 초과하면 가장 오래된 항목 제거
    if (this.histories.length > this.HISTORY_MAX_SIZE) {
      this.histories.pop();
    }
  }
}