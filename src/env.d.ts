/* eslint-disable */

/**
 * Node.js 환경 변수에 대한 타입 선언
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * 현재 실행 환경을 나타내는 문자열
     * (예: 'development', 'production', 'test')
     */
    NODE_ENV: string;

    /**
     * Vue Router의 작동 모드
     * - 'hash': URL 해시를 사용하여 라우팅 (예: /#/about)
     * - 'history': HTML5 History API를 사용 (예: /about)
     * - 'abstract': 서버 환경이나 브라우저가 지원하지 않을 때 사용
     * - undefined: 기본값 사용
     */
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;

    /**
     * Vue Router의 기본 URL
     * 애플리케이션이 서브 디렉토리에서 호스팅될 때 사용
     * (예: '/my-app/')
     */
    VUE_ROUTER_BASE: string | undefined;
  }
}

/**
 * freecurrencyapi-js 모듈 선언
 * 이 모듈은 통화 환율 정보를 제공하는 API를 사용하기 위한 것입니다.
 */
declare module '@everapi/freecurrencyapi-js';
