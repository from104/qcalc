import console from 'console';

enum Operator {
  None,
  Plus,
  Minus,
  Mul,
  Div,
  Rec,
  Sqrt,
  Pow2,
  Percent,
}

// 연산자와 문자열을 매핑하는 객체
const operatorMap: { [key: string]: Operator } = {
  '': Operator.None,
  '+': Operator.Plus,
  '-': Operator.Minus,
  '×': Operator.Mul,
  '÷': Operator.Div,
  pow2: Operator.Pow2,
  sqrt: Operator.Sqrt,
  '%': Operator.Percent,
  rec: Operator.Rec,
};

interface History {
  id?: number;
  preNumber: number;
  operator: string;
  argNumber: number | null;
  resultNumber: number;
}

export class Calculator {
  // 연산자가 눌렸을 때 임시로 숫자를 저장
  private backupNumber!: number;

  // 연산자를 반복적으로 눌렀을 때 연산되는 숫자
  private repeatNumber!: number;

  // 계산기에서 실제로 보여지는 숫자
  private shownNumber!: string;

  // 연산자 코드 저장
  private mOperator!: Operator;

  // 표시 숫자가 앞으로 리셋 될지 여부
  private willReset!: boolean;

  // 계산 히스토리 저장 배열
  private history: History[] = [];

  // 히스토리 최대 크기
  private static readonly HISTORY_MAX_SIZE = 20;

  // 생성자
  constructor() {
    this.clear();
  }

  // 초기화
  public clear() {
    this.backupNumber = 0;
    this.repeatNumber = 0;
    this.shownNumber = '0';
    this.mOperator = Operator.None;
    this.willReset = false;
  }

  // 문자열에서 숫자 문자열만 추출
  private getNumberString(originalString: string): string {
    // 숫자, 부호, 소수점만 남김
    let onlyNumber = originalString.replace(/[^0-9.\ -]/gm, '');

    // 부호 체크
    const isMinus = onlyNumber.match(/^-/);

    // 부호 제거
    onlyNumber = onlyNumber.replace(/-/g, '');

    // 소수점으로 나누기
    const splitedNumberByDot = onlyNumber.split('.');
    let result = splitedNumberByDot.shift();

    // 소수점이 있으면 추가
    if (splitedNumberByDot.length > 0) {
      result += '.' + splitedNumberByDot.join('');
    }

    // 부호와 숫자만 리턴
    return Number(
      (isMinus ? '-' : '') + (result == '' ? '0' : result)
    ).toString();
  }

  // shownNumber를 문자열로 셋팅
  public setShownNumber(s: string): void {
    this.shownNumber = this.getNumberString(
      s.substring(0, s.length < 53 ? s.length : 53) // 최대 표시 숫자 갯수는 53
    );
    this.willReset = false; // 초기화 예정 끄기
  }

  // 표시 숫자 얻기
  public getShownNumber(): string {
    return this.shownNumber;
  }

  // 백업 숫자 얻기
  public getBackupNumber(): number {
    return this.backupNumber;
  }

  // 콘솔로 결과 출력
  public resultToConsole() {
    console.log(this.shownNumber);
  }

  // 초기화 예정 여부 얻기
  public getWillReset(): boolean {
    return this.willReset;
  }

  // 숫자 1개씩 추가
  public addDigit(digit: number | string): void {
    if (typeof digit === 'string') {
      try {
        digit = Number.parseInt(digit.charAt(0)); // 첫번째 숫자만 정수로 변환후 추가
      } catch (e: unknown) {
        digit = 0; //변환 실패 시 0으로 추가
      }
    }

    digit |= 0; // 정수 부분만 추출
    if (digit >= 0 && digit <= 9) {
      // 0~9 숫자만
      const d = digit.toString();
      if (this.shownNumber === '0' || this.willReset) {
        // 초기 숫자이거나 표시 숫자 초기화 예정이면
        this.shownNumber = d;
        this.willReset = false; // 숫자 하나로 셋팅하고 초기화 예정 끄기
      } else {
        // 아니면
        this.shownNumber += d; // 기존 표시숫자에 추가
      }
    }
  }

  // 소수점 추가
  public addDot() {
    if (this.willReset) {
      // 초기화 예정이면 (숫자에 앞서 .만 입력할 시)
      this.shownNumber = '0.';
      this.willReset = false;
    } else if (this.shownNumber.indexOf('.') == -1)
      // 표시 숫자에 .이 없으면 . 추가
      this.shownNumber += '.';
  }

  // 숫자 또는 소수점 지우기
  public deleteDigitOrDot() {
    const l = this.shownNumber.length;
    const fc = this.shownNumber.substring(0, 1);

    if (l == 1 || (l == 2 && fc == '-'))
      // 표시 숫자가 1개면 "0"으로
      this.shownNumber = '0';
    // 아니면 P의 숫자 지우기
    else this.shownNumber = this.shownNumber.substring(0, l - 1);

    // this.shownToNumber(); // 표시 숫자를 백업
  }

  // 부동소수점 숫자를 문자열로
  private numberToString(n: number): string {
    if (n == Number.parseInt(n.toString())) {
      // 소수점 아래가 없으면 정수로 변환 (그냥하면 .가 붙음
      return Number.parseInt(n.toString()).toString();
    } else {
      // 아니면 소수점 포함 변환
      return n.toString();
    }
  }

  // 부호 변환
  public changeSign() {
    this.shownNumber = this.numberToString(-Number(this.shownNumber));
  }

  // 임시 숫자를 표시 숫자로
  private numberToShown() {
    this.shownNumber = this.numberToString(this.backupNumber);
  }

  // 표시 숫자를 임시 숫자로
  private shownToNumber() {
    try {
      this.backupNumber = Number(this.shownNumber);
    } catch (e: unknown) {
      this.backupNumber = 0;
    }
  }

  // 사전 계산 함수
  private preCalc() {
    let n; // 계산에 쓰일 숫자

    if (this.willReset) {
      // 반복 계산 숫자가 0이면 아무것도 안함
      if (this.repeatNumber == 0) return;
      // 초기화 예정이면 반복 계산될 숫자를
      n = this.repeatNumber;
    } else {
      // 아니면 표시 숫자를 계산에 사용
      n = Number(this.shownNumber);
      this.repeatNumber = n;
    }

    // 사전에 정해진 연산자에 따라 실제 계산
    switch (this.mOperator) {
      case Operator.Plus:
        this.backupNumber = this.addHistory({
          preNumber: this.backupNumber,
          operator: this.getOperatorString() as string,
          argNumber: n,
          resultNumber: this.backupNumber + n,
        });
        break;
      case Operator.Minus:
        this.backupNumber = this.addHistory({
          preNumber: this.backupNumber,
          operator: this.getOperatorString() as string,
          argNumber: n,
          resultNumber: this.backupNumber - n,
        });
        break;
      case Operator.Mul:
        this.backupNumber = this.addHistory({
          preNumber: this.backupNumber,
          operator: this.getOperatorString() as string,
          argNumber: n,
          resultNumber: this.backupNumber * n,
        });
        break;
      case Operator.Div:
        this.backupNumber = this.addHistory({
          preNumber: this.backupNumber,
          operator: this.getOperatorString() as string,
          argNumber: n,
          resultNumber: this.backupNumber / n,
        });
        break;
      default:
        break;
    }
  }

  // 연산자 공동 함수
  private operationCommon(operator: Operator) {
    if (this.mOperator == Operator.None) {
      // 전 연산자가 없을 경우 표시 숫자를 백업
      this.shownToNumber();
    } else {
      this.preCalc(); // 계산

      this.numberToShown(); // 저장 숫자를 표시 숫자로
    }

    this.mOperator = operator; // 다음 연산자 셋팅
    this.willReset = true; // 다음 숫자 입력 시 1번째 자리부터
  }

  // 더하기
  public plus() {
    this.operationCommon(Operator.Plus);
  }

  // 빼기
  public minus() {
    this.operationCommon(Operator.Minus);
  }

  // 곱하기
  public mul() {
    this.operationCommon(Operator.Mul);
  }

  // 나누기
  public div() {
    this.operationCommon(Operator.Div);
  }

  // = 버튼 처리
  public equal() {
    if (this.mOperator == Operator.None) {
      // 전 연산자가 없었다면
      this.shownToNumber(); // 표시 숫자를 백업
    } else {
      // 전 연산자가 있었다면
      this.preCalc(); // 계산

      this.numberToShown(); // 저장 숫자를 표시 숫자로

      this.mOperator = Operator.None; // 연산자 리셋

      this.willReset = true; // 숫자 입력 초기화 예정

      this.repeatNumber = 0; // 반복 숫자 초기화
    }
  }

  // 연산자 문자열로 얻기
  public getOperatorString(
    operator: Operator = this.mOperator
  ): string | undefined {
    return Object.keys(operatorMap).find(
      (key) => operatorMap[key] === operator
    );
  }

  // % 버튼 처리
  public percent(): void {
    if (this.mOperator == Operator.Div) {
      // 전 연산자가 나누기였다면
      this.preCalc(); // 계산한 결과에
      const { preNumber, argNumber } = this.history.shift() as History;
      this.backupNumber = this.addHistory({
        preNumber: preNumber,
        operator: this.getOperatorString(Operator.Percent) as string,
        argNumber: argNumber,
        resultNumber: this.backupNumber * 100, // 100을 곱하여 퍼센트를 계산
      });
      this.numberToShown();
    }
    this.repeatNumber = 0;
    this.willReset = true;
  }

  // 역수 계산
  public rec() {
    if (Number(this.shownNumber) != 0) {
      this.shownNumber = this.numberToString(
        this.addHistory({
          preNumber: Number(this.shownNumber),
          operator: this.getOperatorString(Operator.Rec) as string,
          argNumber: null,
          resultNumber: 1 / Number(this.shownNumber),
        })
      );
      this.repeatNumber = 0;
      this.willReset = true;
    }
  }

  // 제곱 계산
  public pow2() {
    this.shownNumber = this.numberToString(
      this.addHistory({
        preNumber: Number(this.shownNumber),
        operator: this.getOperatorString(Operator.Pow2) as string,
        argNumber: null,
        resultNumber: Number(this.shownNumber) ** 2,
      })
    );
    this.repeatNumber = 0;
    this.willReset = true;
  }

  // 제곱근 계산
  public sqrt() {
    this.shownNumber = this.numberToString(
      this.addHistory({
        preNumber: Number(this.shownNumber),
        operator: this.getOperatorString(Operator.Sqrt) as string,
        argNumber: null,
        resultNumber: Math.sqrt(Number(this.shownNumber)),
      })
    );
    this.repeatNumber = 0;
    this.willReset = true;
  }

  // 히스토리 추가
  private addHistory(history: History): number {
    // console.log(history);
    if (this.history.length == 0) {
      history.id = 1;
    } else {
      history.id = Math.max(...(this.history.map((h) => h.id) as number[])) + 1;
    }
    // 배열 앞에 히스토리 추가
    this.history.unshift(history);

    // 히스토리 크기가 최대 크기를 넘어서면 제일 뒤의 것을 제거
    if (this.history.length > Calculator.HISTORY_MAX_SIZE) this.history.pop();

    // 최종적으로 계산 결과를 반환
    return history.resultNumber;
  }

  // 히스토리 얻기
  public getHistory(idx = -1): History[] | History | undefined {
    return idx == -1 ? this.history : this.history[idx];
  }

  // 히스토리 초기화
  public clearHistory(): void {
    this.history = [];
  }
}

export default Calculator;
export { Operator };
export type { History };
