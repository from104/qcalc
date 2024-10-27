/**
 * YAML 파일을 위한 모듈 선언
 * 
 * 이 선언은 TypeScript에게 .yml 확장자를 가진 파일을 모듈로 취급하도록 지시합니다.
 * 이를 통해 YAML 파일을 import 문을 사용하여 불러올 수 있게 됩니다.
 */
declare module '*.yml' {
  /**
   * YAML 파일의 내용을 나타내는 문자열
   * 
   * 이 값은 YAML 파일의 전체 내용을 문자열로 포함합니다.
   * import 문을 통해 이 값을 가져와 사용할 수 있습니다.
   */
  const value: string;

  // YAML 파일의 내용을 기본 내보내기로 설정
  export default value;
}
