enum Operator { None, Plus, Minus, Mul, Div }

export class Calculator {
  // 연산자가 눌렸을 때 임시로 숫자를 저장
  private number!: number;
  // 연산자를 반복적으로 눌렀을 때 연산되는 숫자
  private repeatNumber!: number;

  // 계산기에서 실제로 보여지는 숫자
  private shownNumber!: string;

  // 연산자 코드 저장
  private mOperator!: Operator;

  // 표시 숫자가 앞으로 리셋 될지 여부
  private willReset = false;

  // 생성자
  constructor() {
    this.clear();
  }

  // 초기화
  public clear() {
    this.number = 0;
    this.repeatNumber = 0;
    this.shownNumber = '0';
    this.mOperator = Operator.None;
  }

  // 표시 숫자 얻기
  public getShownNumber(): string {
    return this.shownNumber;
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

    this.shownToNumber(); // 표시 숫자를 백업
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
    this.shownNumber = this.numberToString(this.number);
  }

  // 표시 숫자를 임시 숫자로
  private shownToNumber() {
    try {
      this.number = Number(this.shownNumber);
    } catch (e: unknown) {
      this.number = 0;
    }
  }

  // 사전 계산 함수
  private preCalc() {
    let n; // 계산에 쓰일 숫자

    if (this.willReset)
      // 초기화 예정이면 반복 계산될 숫자를
      n = this.repeatNumber;
    // 아니면 표시 숫자를 계산에 사용
    else n = Number(this.shownNumber);

    // 사전에 정해진 연산자에 따라 실제 계산
    switch (this.mOperator) {
      case Operator.Plus:
        this.number += n;
        break;
      case Operator.Minus:
        this.number -= n;
        break;
      case Operator.Mul:
        this.number *= n;
        break;
      case Operator.Div:
        try {
          // 0으로 나누는 등 에러 처리
          this.number /= n;
          // eslint-disable-next-line no-empty
        } catch (e: unknown) {}
        break;
      default:
        break;
    }
  }

  // 연산자 공동 함수
  private operationCommon(o: Operator) {
    if (this.mOperator == Operator.None) {
      // 전 연산자가 없을 경우 표시 숫자를 백업
      this.shownToNumber();
    } else {
      // 전 연산자가 있을 경우
      if (this.willReset && this.mOperator != o) {
        // 초기화 예정이고 연산자가 반복이 아니면
        this.repeatNumber = 0; // 반복 숫자 0
      } // 아니면 표시 숫자를 반복 숫자로
      else this.repeatNumber = Number(this.shownNumber);

      this.preCalc(); // 계산

      this.numberToShown(); // 저장 숫자를 표시 숫자로
    }

    this.mOperator = o; // 다음 연산자 셋팅
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
    this.repeatNumber = 0; // 반복 숫자 초기화
    if (this.mOperator == Operator.None) {
      // 전 연산자가 없었다면
      this.shownToNumber(); // 표시 숫자를 백업
    } else {
      // 전 연산자가 있었다면
      this.preCalc(); // 계산

      this.numberToShown(); // 저장 숫자를 표시 숫자로

      this.mOperator = Operator.None; // 연산자 리셋
    }
    this.willReset = true; // 숫자 입력 초기화 예정
  }

  // % 버튼 처리
  public percent(): void {
    if (this.mOperator == Operator.Div) {
      // 전 연산자가 나누기였다면
      this.preCalc(); // 계산한 결과에
      this.number *= 100; // 100을 곱하여 퍼센트를 계산
      this.numberToShown();
    }
    this.repeatNumber = 0;
    this.willReset = true;
  }
}

export default Calculator;
