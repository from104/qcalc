/**
 * Android 시스템과 상호 작용하기 위한 인터페이스를 나타냅니다.
 */
declare class AndroidInterface {
  /**
   * 클립보드에서 내용을 가져옵니다.
   * 
   * src-capacitor/android/app/src/main/java/org/capacitor/quasar/app/WebAppInterface.java 참조
   * 
   * @returns 클립보드에서 가져온 내용을 문자열로 반환합니다.
   */
  static getFromClipboard(): string;
}
