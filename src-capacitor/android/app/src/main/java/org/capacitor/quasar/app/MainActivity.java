// package org.capacitor.quasar.app;

// import com.getcapacitor.BridgeActivity;

// public class MainActivity extends BridgeActivity {}

package org.capacitor.quasar.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // 웹뷰 설정 코드 추가
        WebView webView = this.getBridge().getWebView();
        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidInterface");
    }
}
