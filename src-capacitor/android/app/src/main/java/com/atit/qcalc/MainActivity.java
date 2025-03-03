package com.atit.qcalc;

import android.annotation.SuppressLint;
import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.Locale;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity 클래스
 * 이 클래스는 Capacitor 기반 안드로이드 앱의 메인 액티비티입니다.
 * BridgeActivity를 상속받아 Capacitor의 기능을 활용합니다.
 */
public class MainActivity extends BridgeActivity {

  @SuppressLint("SetJavaScriptEnabled")
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
    webSettings.setDomStorageEnabled(true);

    // 네이티브 코드와 JavaScript 간의 인터페이스를 추가합니다.
    // 'AndroidInterface'라는 이름으로 JavaScript에서 접근할 수 있습니다.
    webView.addJavascriptInterface(new WebAppInterface(this), "AndroidInterface");

    // 캐시 사용을 비활성화합니다.
    // 이는 항상 최신 콘텐츠를 로드하도록 보장하지만, 네트워크 사용량이 증가할 수 있습니다.
    webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);

    // 화면의 물리적인 폭(dp)을 가져옵니다.
    int textZoom = getZoom();

    // 계산된 텍스트 줌 값을 적용합니다.
    webSettings.setTextZoom(textZoom);

    // JavaScript로 textZoom 값 전달
    webView.setWebViewClient(new WebViewClient() {
      @Override
      public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        String script = String.format(Locale.getDefault(),
            "window.textZoomLevel = %d;", textZoom);
        view.evaluateJavascript(script, null);
      }
    });

    // 초기 화면 배율 설정
    webSettings.setLoadWithOverviewMode(true);
    webSettings.setUseWideViewPort(true);

    // 최소 폰트 크기 설정
    webSettings.setMinimumFontSize(12);

    // 줌 기능 비활성화
    webSettings.setSupportZoom(false);
    webSettings.setBuiltInZoomControls(false);

    // 추가적인 웹뷰 설정을 여기에 구성할 수 있습니다.
    // 예: 뷰포트 설정, 줌 컨트롤, 파일 접근 등
  }

  private int getZoom() {
    // Get the screen width in density-independent pixels (dp).
    float screenWidthDp = getResources().getDisplayMetrics().widthPixels / getResources().getDisplayMetrics().density;

    // Define the base width (in dp) for scaling.
    final float BASE_WIDTH_DP = 350f;

    // Calculate the scaling factor based on the current screen width relative to the base width.
    float scaleFactor = screenWidthDp / BASE_WIDTH_DP;

    // Calculate the text zoom level based on the scaling factor, with a default of 100%.
    // Larger screens than BASE_WIDTH_DP will have proportionally larger text, and smaller screens will have smaller text.
    int textZoom = (int) (100 * scaleFactor);

    // Clamp the text zoom level within a reasonable range (50% to 200%) to prevent text from being too small or too large.
    final int MIN_ZOOM = 50;
    final int MAX_ZOOM = 200;
    textZoom = Math.max(MIN_ZOOM, Math.min(textZoom, MAX_ZOOM));

    return textZoom;
  }
}
