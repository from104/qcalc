// package org.capacitor.quasar.app;

// import com.getcapacitor.BridgeActivity;

// public class MainActivity extends BridgeActivity {}

package org.capacitor.quasar.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Capacitor의 기본 웹뷰 설정 가져오기
        WebView webView = this.getBridge().getWebView();

        // 웹뷰 보안 설정
        webView.getSettings().setJavaScriptEnabled(true);  // JavaScript 활성화
        webView.getSettings().setDomStorageEnabled(true);  // DOM Storage 활성화

        // WebAppInterface를 JavaScript 인터페이스로 웹뷰에 추가
        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidInterface");
        
        // WebView의 다른 보안 및 성능 설정을 구성할 수 있습니다.
        // 예를 들어, 캐시 모드 설정, 뷰포트 설정 등을 추가할 수 있습니다.
        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE); // 캐시 사용 안 함
    }
}
