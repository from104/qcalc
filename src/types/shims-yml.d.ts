// 목적: yaml 파일을 위한 모듈 선언.
declare module '*.yml' {
  const value: string;
  export default value;
}
