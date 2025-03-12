/**
 * @file MainActivity.java
 * @description 이 파일은 Capacitor 기반 안드로이드 애플리케이션의 메인 액티비티를 정의합니다.
 *              이 클래스는 BridgeActivity를 상속받아 Capacitor의 기능을 활용하며,
 *              웹뷰 설정, JavaScript 인터페이스 추가, 캐시 관리 및 텍스트 줌 설정과 같은
 *              다양한 초기화 작업을 수행합니다.
 */

package com.atit.qcalc;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * MainActivity 클래스
 * 이 클래스는 Capacitor 기반 안드로이드 앱의 메인 액티비티입니다.
 * 앱의 초기화와 매니저 클래스들의 생성만을 담당합니다.
 */
public class MainActivity extends BridgeActivity {

  private AppManager appManager;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // 앱 매니저를 통한 초기화
    appManager = new AppManager(this);
    appManager.initialize();
  }
}
