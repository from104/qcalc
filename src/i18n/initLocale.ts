// vue-i18n 라이브러리에서 createI18n 함수를 가져옵니다.
import {createI18n} from 'vue-i18n';

// 다국어 메시지를 포함하는 messages 객체를 가져옵니다.
import messages from 'src/i18n/messages';

// messages 객체의 키 타입을 MessageLanguages로 정의합니다.
export type MessageLanguages = keyof typeof messages;

// vue-i18n 모듈에 대한 타입 선언을 확장합니다.
declare module 'vue-i18n' {
  // 날짜/시간 형식 스키마 정의 (필요한 경우 확장 가능)
  export interface DefineDateTimeFormat {
    [key: string]: unknown; // 추가 가능성을 위한 임시 필드
  }

  // 숫자 형식 스키마 정의 (필요한 경우 확장 가능)
  export interface DefineNumberFormat {
    [key: string]: unknown; // 추가 가능성을 위한 임시 필드
  }
}

// i18n 인스턴스를 생성하고 설정합니다.
export const i18n = createI18n({
  locale: 'ko', // 기본 언어를 한국어로 설정
  fallbackLocale: 'en', // 대체 언어를 영어로 설정
  globalInjection: true, // 전역 주입 활성화
  legacy: false, // 레거시 모드 비활성화
  silentFallbackWarn: true, // 대체 언어 사용 시 경고 메시지 숨김
  messages, // 다국어 메시지 객체 설정
});
