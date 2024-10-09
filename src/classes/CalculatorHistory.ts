import {Calculator, ResultSnapshot} from './Calculator';

// 히스토리 객체
export interface History {
  id?: number;
  resultSnapshot: ResultSnapshot;
  memo?: string;
}

export class CalculatorHistory {
  private histories: History[] = [];
  // 히스토리 최대 크기
  private readonly HISTORY_MAX_SIZE = 100;

  constructor(calculator: Calculator) {
    calculator.on('addHistory', this.addHistory.bind(this));
    calculator.on('unshiftHistory', this.unshiftHistory.bind(this));
  }

  // 히스토리 추가
  private addHistory(history: History): string {
    // console.log(history);
    if (this.histories.length == 0) {
      history.id = 1;
    } else {
      history.id = Math.max(...(this.histories.map((h) => h.id) as number[])) + 1;
    }
    // 배열 앞에 히스토리 추가
    this.histories.unshift(history);

    // 히스토리 크기가 최대 크기를 넘어서면 제일 뒤의 것을 제거
    if (this.histories.length > this.HISTORY_MAX_SIZE) this.histories.pop();

    // 최종적으로 계산 결과를 반환
    return history.resultSnapshot.resultNumber;
  }

  private unshiftHistory() {
    this.histories.unshift();
  }

  // 히스토리 크기 얻기
  public getHistorySize(): number {
    return this.histories.length;
  }

  // 히스토리 전체 얻기
  public getHistories(): History[] {
    return this.histories;
  }

  // 히스토리의 id로 인덱스 찾기
  public getHistoryIndexByID(id: number): number {
    const index = this.histories.findIndex((h) => h.id === id);
    if (index !== -1) {
      return index;
    } else {
      throw new Error('History not found');
    }
  }

  // 히스토리에서 배열 인덱스로 찾기
  public getHistoryByIndex(index: number): History {
    if (index >= 0 && index < this.histories.length) {
      return this.histories[index];
    } else {
      throw new Error('History not found');
    }
  }

  // 히스토리에서 id로 찾기
  public getHistoryByID(id: number): History {
    return this.getHistoryByIndex(this.getHistoryIndexByID(id));
  }

  // id를 사용하여 히스토리 배열에서 해당 항목을 찾아서 삭제
  public deleteHistory(id: number): void {
    this.histories.splice(this.getHistoryIndexByID(id), 1);
  }

  // 히스토리 초기화
  public clearHistory(): void {
    this.histories = [];
  }

  // 히스토리에 메모 셋팅
  public setMemo(id: number, memo: string): void {
    const index = this.getHistoryIndexByID(id);
    this.histories[index].memo = memo;
  }

  // 히스토리에서 메모 얻기
  public getMemo(id: number): string | null {
    const index = this.getHistoryIndexByID(id);
    return this.histories[index].memo || null;
  }

  // 히스토리에서 메모 삭제
  public deleteMemo(id: number): void {
    const index = this.getHistoryIndexByID(id);
    delete this.histories[index].memo;
  }
}
