import { create, all } from 'mathjs';

const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
}) as math.MathJsStatic;

/**
 * 다양한 연산자를 나타내는 열거형입니다.
 */
enum Operator {
  None, // 연산자 없음
  Plus, // 덧셈
  Minus, // 뺄셈
  Mul, // 곱셈
  Div, // 나눗셈
  Pct, // 백분율
  Pow, // N제곱
  Root, // N제곱근
  Mod, // 나머지
  Rec, // 역수
  Sqrt, // 제곱근
  Pow2, // 거듭제곱
  Sin, // 사인
  Cos, // 코사인
  Tan, // 탄젠트
  Fct, // 팩토리얼
  Exp10, // 10의 N제곱
  Int, // 정수부
  Frac, // 소수부
}

// 연산자와 문자열을 매핑하는 객체
const operatorMap: { [key: string]: Operator } = {
  '': Operator.None,
  '+': Operator.Plus,
  '-': Operator.Minus,
  '×': Operator.Mul,
  '÷': Operator.Div,
  '%': Operator.Pct,
  pow: Operator.Pow,
  root: Operator.Root,
  mod: Operator.Mod,
  rec: Operator.Rec,
  sqrt: Operator.Sqrt,
  pow2: Operator.Pow2,
  sin: Operator.Sin,
  cos: Operator.Cos,
  tan: Operator.Tan,
  fct: Operator.Fct,
  exp10: Operator.Exp10,
  int: Operator.Int,
  frac: Operator.Frac,
};

// 상수
const constants: { [key: string]: string } = {
  pi: MathB.pi.toString(),
  pi2: MathB.bignumber(MathB.pi).div(2).toString(),
  e: MathB.e.toString(),
  ln2: MathB.log(2).toString(),
  ln10: MathB.log(10).toString(),
  phi: MathB.phi.toString(),
};

// 히스토리 객체
interface History {
  id?: number;
  previousNumber: string;
  operator: string;
  argumentNumber?: string;
  resultNumber: string;
  memo?: string;
}

export class Calculator {
  // 연산자가 눌렸을 때 임시로 숫자를 저장
  private previousNumber!: string;

  // 연산자를 반복적으로 눌렀을 때 연산되는 숫자
  private repeatedNumber!: string;

  // 계산기에서 실제로 보여지는 숫자
  private currentNumber!: string;

  // 메모리 숫자
  private memoryNumber!: string;

  // 메로리가 리렛되었는지 여부
  private isMemoryReset!: boolean;

  // 연산자 코드 저장
  private currentOperator!: Operator;

  // 표시 숫자가 앞으로 리셋 될지 여부
  private shouldReset!: boolean;

  // 계산 히스토리 저장 배열
  private histories: History[] = [];

  // 히스토리 최대 크기
  private readonly HISTORY_MAX_SIZE = 100;

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
        if (numberForCalc === '0') {
          throw new Error('Cannot divide by zero');
        }
        this.previousNumber = this.addHistory({
          previousNumber: this.previousNumber,
          operator: this.getOperatorString() as string,
          argumentNumber: numberForCalc,
          resultNumber: MathB.bignumber(this.previousNumber).div(numberForCalc).toString(),
        });
        break;
      case Operator.Pow:
        this.previousNumber = this.addHistory({
          previousNumber: this.previousNumber,
          operator: this.getOperatorString() as string,
          argumentNumber: numberForCalc,
          resultNumber: MathB.bignumber(this.previousNumber).pow(numberForCalc).toString(),
        });
        break;
      case Operator.Root:
        this.previousNumber = this.addHistory({
          previousNumber: this.previousNumber,
          operator: this.getOperatorString() as string,
          argumentNumber: numberForCalc,
          // Math.pow(x, 1 / n); // x의 n제곱근
          resultNumber: MathB.bignumber(this.previousNumber).pow(MathB.bignumber(1).div(numberForCalc)).toString(),
        });
        break;
      case Operator.Mod:
        this.previousNumber = this.addHistory({
          previousNumber: this.previousNumber,
          operator: this.getOperatorString() as string,
          argumentNumber: numberForCalc,
          resultNumber: MathB.bignumber(this.previousNumber).mod(numberForCalc).toString(),
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

  // N제곱
  public pow() {
    this.performOperation(Operator.Pow);
  }

  // N제곱근
  public root() {
    this.performOperation(Operator.Root);
  }

  // 나머지
  public mod() {
    this.performOperation(Operator.Mod);
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

      const { previousNumber, argumentNumber } = this.histories.shift() as History; // 계산 결과를 빼냄
      const operator =
        this.getOperatorString() + this.getOperatorString(Operator.Pct); // 연산자를 %로
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
    if (this.currentNumber.charAt(0) === '-') {
      throw new Error('The square root of a negative number is not allowed.');
    }
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

  // sin 계산
  public sin() {
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Sin) as string,
        resultNumber: MathB.sin(MathB.bignumber(this.currentNumber)).toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // cos 계산
  public cos() {
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Cos) as string,
        resultNumber: MathB.cos(MathB.bignumber(this.currentNumber)).toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // tan 계산
  public tan() {
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Tan) as string,
        resultNumber: MathB.tan(MathB.bignumber(this.currentNumber)).toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // 팩토리얼 계산
  public fct() {
    if (Number(this.currentNumber) < 0) {
      throw new Error('The factorial of a negative number is not allowed.');
    }
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Fct) as string,
        resultNumber: MathB.factorial(MathB.bignumber(this.currentNumber)).toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // 지수 계산
  public exp10() {
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Exp10) as string,
        resultNumber: MathB.pow(10, MathB.bignumber(this.currentNumber)).toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }
  
  // 정수부 계산
  public int() {
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Int) as string,
        resultNumber: MathB.bignumber(this.currentNumber).floor().toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // 소수부 계산
  public frac() {
    this.currentNumber = this.numberToString(
      this.addHistory({
        previousNumber: this.currentNumber,
        operator: this.getOperatorString(Operator.Frac) as string,
        resultNumber: MathB.bignumber(this.currentNumber).mod(1).toString(),
      })
    );
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // 상수 얻기 (pi, e, phi)
  public getConstant(constant: string): string {
    if (constants[constant]) {
      return constants[constant];
    } else {
      throw new Error('Constant not found');
    }
  }

  // 상수로 설정
  public setConstant(constant: string) {
    this.currentNumber = this.getConstant(constant);
  }

  // 메모리 저장
  public memorySave() {
    this.memoryNumber = this.currentNumber;
    this.isMemoryReset = false;
  }

  // 메모리 불러오기
  public memoryRecall() {
    if (this.isMemoryReset) {
      throw new Error('No memory to recall.'); 
    } else {
      this.currentNumber = this.memoryNumber;
    }
  }

  // 메모리 클리어
  public memoryClear() {
    this.memoryNumber = '0';
    this.isMemoryReset = true;
  }

  // 메모리 더하기
  public memoryPlus() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).add(this.currentNumber).toString();
    }
  }

  // 메모리 마이너스
  public memoryMinus() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).sub(this.currentNumber).toString();
    }
  }

  // 메모리 곱하기
  public memoryMul() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).mul(this.currentNumber).toString();
    }
  }

  // 메모리 나누기
  public memoryDiv() {
    if (!this.isMemoryReset) {
      if (this.currentNumber === '0') {
        throw new Error('Cannot divide by zero');
      }
      this.memoryNumber = MathB.bignumber(this.memoryNumber).div(this.currentNumber).toString();
    }
  }

  // 메모리 숫자 얻기
  public getMemoryNumber(): string {
    return this.memoryNumber;
  }
  
  // 메모리가 리셋되었는지 여부
  public getIsMemoryReset(): boolean {
    return this.isMemoryReset;
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
    return history.resultNumber;
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
