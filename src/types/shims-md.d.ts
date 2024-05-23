// 목적: 마크다운 파일을 위한 모듈 선언.
declare module '*.md' {
  const value: string;
  export default value;
}
