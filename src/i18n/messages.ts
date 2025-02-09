// 한국어와 영어 메시지 파일을 가져옵니다.
import koMessages from './messages/koMessages.yml';
import enMessages from './messages/enMessages.yml';

// 에러 메시지 파일을 가져옵니다.
import koErrors from './errors/koErrors.yml';
import enErrors from './errors/enErrors.yml';

// 다국어 메시지 객체를 내보냅니다.
export default {
  // 한국어 메시지
  ko: {
    message: koMessages,
    error: koErrors,
  },
  // 영어 메시지
  en: {
    message: enMessages,
    error: enErrors,
  },
};
