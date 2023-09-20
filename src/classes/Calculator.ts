import { create, all } from 'mathjs';

const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
}) as math.MathJsStatic;

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
  previousNumber: string;
  operator: string;
  argumentNumber?: string;
  resultNumber: string;
}

export class Calculator {
  // 연산자가 눌렸을 때 임시로 숫자를 저장
  private previousNumber!: string;

  // 연산자를 반복적으로 눌렀을 때 연산되는 숫자
  private repeatedNumber!: string;

  // 계산기에서 실제로 보여지는 숫자
  private currentNumber!: string;

  // 연산자 코드 저장
  private currentOperator!: Operator;

  // 표시 숫자가 앞으로 리셋 될지 여부
  private shouldReset!: boolean;

  // 계산 히스토리 저장 배열
  private history: History[] = [];

  // 히스토리 최대 크기
  private readonly HISTORY_MAX_SIZE = 20;

  // 생성자
  constructor() {
    this.clear();
  }

  // 초기화
  public clear() {
    this.previousNumber = '0';
    this.repeatedNumber = '0';
    this.currentNumber = '0';
    this.currentOperator = Operator.None;
    this.shouldReset = false;
  }

  // 문자열에서 숫자 문자열만 추출
  private extractNumberString(originalString: string): string {
    // 숫자, 부호, 소수점만 남김
    let onlyNumber = originalString.replace(/[^0-9.\-]/gm, '');

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
    return MathB.bignumber(
      (isMinus ? '-' : '') + (result == '' ? '0' : result)
    ).toString();
  }

  // shownNumber를 문자열로 셋팅
  public setCurrentNumber(s: string): void {
    this.currentNumber = this.extractNumberString(
      s.substring(0, s.length < 64 ? s.length : 64) // 최대 표시 숫자 갯수는 64
    );
    this.shouldReset = false; // 초기화 예정 끄기
  }

  // 표시 숫자 얻기
  public getCurrentNumber(): string {
    return this.currentNumber;
  }

  // 백업 숫자 얻기
  public getPreviousNumber(): string {
    return this.previousNumber;
  }

  // 콘솔로 결과 출력
  // public resultToConsole() {
  //   console.log(this.currentNumber);
  // }

  // 초기화 예정 여부 얻기
  public getShouldReset(): boolean {
    return this.shouldReset;
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
      if (this.currentNumber === '0' || this.shouldReset) {
        // 초기 숫자이거나 표시 숫자 초기화 예정이면
        this.currentNumber = d;
        this.shouldReset = false; // 숫자 하나로 셋팅하고 초기화 예정 끄기
      } else {
        // 아니면
        this.currentNumber += d; // 기존 표시숫자에 추가
      }
    }
  }

  // 소수점 추가
  public addDot() {
    if (this.shouldReset) {
      // 초기화 예정이면 (숫자에 앞서 .만 입력할 시)
      this.currentNumber = '0.';
      this.shouldReset = false;
    } else if (!this.currentNumber.match(/\./))
      // 표시 숫자에 .이 없으면 . 추가
      this.currentNumber += '.';
  }

  // 숫자 또는 소수점 지우기
  public deleteDigitOrDot() {
    // 표시 숫자가 1개이거나, 표시 숫자가 '-'로 시작하고 길이가 2인 경우
    if (this.currentNumber.match(/^-?\d$/)) {
      // 표시 숫자를 '0'으로 설정
      this.currentNumber = '0';
    } else {
      // 그 외의 경우 표시 숫자의 마지막 글자 제거
      this.currentNumber = this.currentNumber.slice(0, -1);
    }
  }

  // // 표시 숫자를 bignumber로 얻기
  // public getShownBigNumber(): string {
  //   return MathB.bignumber(this.currentNumber);
  // }

  // 부동소수점 숫자를 문자열로
  private numberToString(numberForCalc: string): string {
    const [integer, decimal] = numberForCalc.toString().split('.') // 정수와 소수점으로 나눔
    if (decimal) {
      // 소수점이 있으면
      return integer + '.' + decimal;
    } else {
      // 없으면
      return integer;
    }
  }

  // 부호 변환
  public changeSign() {
    this.currentNumber = MathB.bignumber(this.getCurrentNumber()).mul(-1).toString();
  }

  // 임시 숫자를 표시 숫자로
  private setCurrentNumberFromPrevious() {
    this.currentNumber = this.previousNumber;
  }

  // 표시 숫자를 임시 숫자로
  private setPreviousNumberFromCurrent() {
    this.previousNumber = this.currentNumber;
  }

  // 사전 계산 함수
  private performPreCalculation() {
    let numberForCalc: string; // 계산에 쓰일 숫자

    if (this.shouldReset) {
      // 반복 계산 숫자가 0이면 아무것도 안함
      if (this.repeatedNumber == '0') return;
      // 초기화 예정이면 반복 계산될 숫자를
      numberForCalc = this.repeatedNumber;
    } else {
      // 아니면 표시 숫자를 계산에 사용
      numberForCalc = this.currentNumber
      this.repeatedNumber = numberForCalc;
    }

    // 사전에 정해진 연산자에 따라 실제 계산
    switch (this.currentOperator) {
      case Operator.Plus:
        this.previousNumber = this.addHistory({
          previousNumber: this.previousNumber,
          operator: this.getOperatorString() as string,
          argumentNumber: numberForCalc,
          resultNumber: MathB.bignumber(this.previousNumber).add(numberForCalc).toString(),
        });
        break;
      case Operator.Minus:
        this.previousNumber = this.addHistory({
          previousNumber: this.previousNumber,
          operator: this.getOperatorString() as string,
          argumentNumber: numberForCalc,
          resultNumber: MathB.bignumber(this.previousNumber).sub(numberForCalc).toString(),
        });
        break;
      case Operator.Mul:
        this.previousNumber = this.addHistory({
          previousNumber: this.previousNumber,
          operator: this.getOperatorString() as string,
          argumentNumber: numberForCalc,
          resultNumber: MathB.bignumber(this.previousNumber).mul(numberForCalc).toString(),
        });
        break;
      case Operator.Div:
        this.previousNumber = this.addHistory({
          previousNumber: this.previousNumber,
          operator: this.getOperatorString() as string,
          argumentNumber: numberForCalc,
          resultNumber: MathB.bignumber(this.previousNumber).div(numberForCalc).toString(),
        });
        break;
      default:
        break;
    }
  }

  // 연산자 공동 함수
  private performOperation(operator: Operator) {
    if (this.currentOperator == Operator.None) {
      // 전 연산자가 없을 경우 표시 숫자를 백업
      this.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation(); // 계산

      this.setCurrentNumberFromPrevious(); // 저장 숫자를 표시 숫자로
    }

    this.currentOperator = operator; // 다음 연산자 셋팅
    this.shouldReset = true; // 다음 숫자 입력 시 1번째 자리부터
  }

  // 더하기
  public plus() {
    this.performOperation(Operator.Plus);
  }

  // 빼기
  public minus() {
    this.performOperation(Operator.Minus);
  }

  // 곱하기
  public mul() {
    this.performOperation(Operator.Mul);
  }

  // 나누기
  public div() {
    this.performOperation(Operator.Div);
  }

  // = 버튼 처리
  public equal() {
    if (this.currentOperator == Operator.None) {
      // 전 연산자가 없었다면
      this.setPreviousNumberFromCurrent(); // 표시 숫자를 백업
    } else {
      // 전 연산자가 있었다면
      this.performPreCalculation(); // 계산

      this.setCurrentNumberFromPrevious(); // 저장 숫자를 표시 숫자로

      this.currentOperator = Operator.None; // 연산자 리셋

      this.shouldReset = true; // 숫자 입력 초기화 예정

      this.repeatedNumber = '0'; // 반복 숫자 초기화
    }
  }

  // 연산자 문자열로 얻기
  public getOperatorString(operator: Operator = this.currentOperator): string {
    return (
      Object.keys(operatorMap).find((key) => operatorMap[key] === operator) || ''
    );
  }

  // % 처리
  // 나누기와 곱하기만 처리
  // 나누기면 퍼센트를 구하기
  // 곱하기면 퍼센트로 곱하기
  public percent(): void {
    if (this.currentOperator == Operator.Div || this.currentOperator == Operator.Mul) {
      this.performPreCalculation(); // 사전 계산

      const { previousNumber, argumentNumber } = this.history.shift() as History; // 계산 결과를 빼냄
      const operator =
        this.getOperatorString() + this.getOperatorString(Operator.Percent); // 연산자를 %로
      const resultNumber =
        this.currentOperator == Operator.Div
          ? MathB.bignumber(this.previousNumber).mul(100).toString()
          : MathB.bignumber(this.previousNumber).div(100).toString(); // 나누기면 곱하기 100, 곱하기면 나누기 100

      this.previousNumber = this.addHistory({
        previousNumber: previousNumber,
        operator: operator,
        argumentNumber: argumentNumber,
        resultNumber: resultNumber,
      });

      this.setCurrentNumberFromPrevious();
    }

    this.currentOperator = Operator.None // 연산자 리셋
    this.repeatedNumber = '0'; // 반복 숫자 초기화
    this.shouldReset = true; // 숫자 입력 초기화 예정
  }

  // 역수 계산
  public rec() {
    if (Number(this.currentNumber) != 0) {
      this.currentNumber = this.numberToString(
        this.addHistory({
          previousNumber: this.currentNumber,
          operator: this.getOperatorString(Operator.Rec) as string,
          resultNumber: MathB.bignumber(1).div(this.currentNumber).toString(),
        })
      );
      this.repeatedNumber = '0';
      this.shouldReset = true;
    }
  }

  // 제곱 계산
  public pow2() {
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Pow2) as string,
        resultNumber: MathB.bignumber(this.currentNumber).pow(2).toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // 제곱근 계산
  public sqrt() {
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Sqrt) as string,
        resultNumber: MathB.bignumber(this.currentNumber).sqrt().toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // 히스토리 추가
  private addHistory(history: History): string {
    // console.log(history);
    if (this.history.length == 0) {
      history.id = 1;
    } else {
      history.id = Math.max(...(this.history.map((h) => h.id) as number[])) + 1;
    }
    // 배열 앞에 히스토리 추가
    this.history.unshift(history);

    // 히스토리 크기가 최대 크기를 넘어서면 제일 뒤의 것을 제거
    if (this.history.length > this.HISTORY_MAX_SIZE) this.history.pop();

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

// const bigmath = create(all, {
//   number: 'BigNumber',
//   precision: 64,
// }) as math.MathJsStatic;

// const a = bigmath.bignumber(0.1);
// // const b = bigmath.bignumber(0.2);
// console.log(a.div(3).mul(3).toDecimalPlaces(20).toString());
// console.log(bigmath.format(a.div(3).mul(3), {  precision: 20 }));

// const numberGrouping = (number: number | string | BigNumber, grouping: number = 3, separator: string = ',') => {
//   const
//   [integer, decimal] = number.toString().split('.'),
//   regex = new RegExp(`\\B(?=(\\d{${grouping}})+(?!\\d))`, 'g');
//   return integer.replace(regex, separator) + (decimal ? `.${decimal}` : '');
// }

// console.log(numberGrouping(bigmath.bignumber('123456789.123456789'), 4, '_'));
