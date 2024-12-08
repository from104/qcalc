/**
 * Android 시스템과 상호 작용하기 위한 인터페이스를 정의합니다.
 * 이 인터페이스는 웹 애플리케이션과 Android 네이티브 기능 간의 브리지 역할을 합니다.
 */
declare class AndroidInterface {
  /**
   * Android 기기의 클립보드에서 내용을 가져옵니다.
   * 
   * 이 메서드는 Android의 네이티브 클립보드 기능에 접근하여 현재 저장된 텍스트를 검색합니다.
   * 주의: 이 메서드는 Android 환경에서만 작동하며, 다른 플랫폼에서는 예외가 발생할 수 있습니다.
   * 
   * 구현 세부 사항은 다음 파일을 참조하세요:
   * src-capacitor/android/app/src/main/java/org/capacitor/quasar/app/WebAppInterface.java
   * 
   * @returns {string} 클립보드에서 가져온 텍스트 내용을 문자열로 반환합니다.
   *                   클립보드가 비어있거나 텍스트가 아닌 경우 빈 문자열을 반환할 수 있습니다.
   * 
   * @throws {Error} 클립보드 접근 권한이 없거나 기타 시스템 오류 발생 시 예외를 던질 수 있습니다.
   */
  static getFromClipboard(): string;
}
