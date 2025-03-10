/**
 * @file MainActivity.java
 * @description 이 파일은 Capacitor 기반 안드로이드 애플리케이션의 메인 액티비티를 정의합니다.
 *              이 클래스는 BridgeActivity를 상속받아 Capacitor의 기능을 활용하며,
 *              웹뷰 설정, JavaScript 인터페이스 추가, 캐시 관리 및 텍스트 줌 설정과 같은
 *              다양한 초기화 작업을 수행합니다.
 */

package ocom.atit.qcalc;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

/**
 * MainActivity 클래스
 *
 * 이 클래스는 Capacitor 기반 안드로이드 앱의 메인 액티비티입니다.
 * BridgeActivity를 상속받아 Capacitor의 기능을 활용합니다.
 */
public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Capacitor의 기본 웹뷰 설정을 가져옵니다.
    WebView webView = this.getBridge().getWebView();

    // 웹뷰의 설정을 구성합니다.
    WebSettings webSettings = webView.getSettings();

    // JavaScript 실행을 활성화합니다.
    // 주의: 보안상의 이유로 신뢰할 수 있는 콘텐츠에만 사용해야 합니다.
    webSettings.setJavaScriptEnabled(true);

    // DOM Storage API를 활성화합니다.
    // 이는 웹 애플리케이션의 로컬 데이터 저장을 가능하게 합니다.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ECLAIR_MR1) {
      webSettings.setDomStorageEnabled(true);
    }

    // 네이티브 코드와 JavaScript 간의 인터페이스를 추가합니다.
    // 'AndroidInterface'라는 이름으로 JavaScript에서 접근할 수 있습니다.
    webView.addJavascriptInterface(new WebAppInterface(this), "AndroidInterface");

    // 캐시 사용을 비활성화합니다.
    // 이는 항상 최신 콘텐츠를 로드하도록 보장하지만, 네트워크 사용량이 증가할 수 있습니다.
    webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);

    // 추가적인 웹뷰 설정을 여기에 구성할 수 있습니다.
    // 예: 뷰포트 설정, 줌 컨트롤, 파일 접근 등
  }
}
