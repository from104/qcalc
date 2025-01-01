import { tinykeys, KeyBindingMap } from 'tinykeys';

// 키 바인딩과 해당 콜백 함수를 정의하는 타입
export type KeyBindings = [string[], () => void][]; // [키바인딩 배열, 콜백 함수][]

/**
 * KeyBinding 클래스
 * 키 바인딩을 관리하고 구독/해제하는 기능을 제공합니다.
 */
export class KeyBinding {
  private isSubscribed = false; // 현재 구독 상태
  private keyBindingsList: KeyBindings = []; // 키 바인딩 목록
  private unsubscribeCallback: () => void = () => {}; // 구독 해제 메서드

  /**
   * KeyBinding 클래스의 생성자
   * @param keybindings 초기 키 바인딩 목록
   * @param subscribe 생성 시 즉시 구독 여부
   */
  constructor(keybindings: KeyBindings, subscribe = false) {
    this.addKeyBindings(keybindings);
    if (subscribe) {
      this.subscribe();
    }
  }

  /**
   * 키 바인딩을 추가하는 메서드
   * @param keybindings 추가할 키 바인딩 목록
   */
  addKeyBindings(keybindings: KeyBindings) {
    if (this.isSubscribed) {
      this.unsubscribe(); // 이미 구독 중이면 해제
    }
    this.keyBindingsList = keybindings;
  }

  /**
   * 키 바인딩을 구독하는 메서드
   */
  subscribe() {
    if (this.isSubscribed) return; // 이미 구독 중이면 중단

    const keyBindingMaps: KeyBindingMap = {};

    // 키 바인딩 맵 생성
    this.keyBindingsList.forEach((keybinding) => {
      const [keys, handler] = keybinding;
      keys.forEach((key) => {
        keyBindingMaps[key] = handler;
      });
    });

    // tinykeys를 사용하여 키 바인딩 설정 및 구독 해제 메서드 저장
    this.unsubscribeCallback = tinykeys(window, keyBindingMaps);

    this.isSubscribed = true;
  }

  /**
   * 키 바인딩 구독을 해제하는 메서드
   */
  unsubscribe() {
    if (this.isSubscribed) {
      this.unsubscribeCallback(); // 구독 해제
      this.unsubscribeCallback = () => {}; // 메서드 초기화

      this.isSubscribed = false;
    }
  }

  /**
   * 구독 상태를 토글하는 메서드
   */
  toggle() {
    if (this.isSubscribed) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }

  /**
   * 모든 키 바인딩을 제거하고 구독을 해제하는 메서드
   */
  clear() {
    this.unsubscribe();
    this.keyBindingsList = [];
  }

  /**
   * 현재 구독 상태를 반환하는 메서드
   * @returns {boolean} 구독 상태
   */
  getSubscribe() {
    return this.isSubscribed;
  }
}
