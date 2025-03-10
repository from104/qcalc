/**
 * @file MainActivity.java
 * @description 이 파일은 Capacitor 기반 안드로이드 애플리케이션의 메인 액티비티를 정의합니다.
 *              이 클래스는 BridgeActivity를 상속받아 Capacitor의 기능을 활용하며,
 *              웹뷰 설정, JavaScript 인터페이스 추가, 캐시 관리 및 텍스트 줌 설정과 같은
 *              다양한 초기화 작업을 수행합니다.
 */

package com.atit.qcalc;

import android.annotation.SuppressLint;
import android.net.http.SslError;
import android.os.Bundle;
import android.webkit.SslErrorHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.BridgeActivity;

import java.util.Locale;

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

    // 추가적인 웹뷰 설정을 여기에 구성할 수 있습니다.
    // 예: 뷰포트 설정, 줌 컨트롤, 파일 접근 등

    // 화면의 물리적인 폭(dp)을 가져옵니다.
    int textZoom = getZoom();

    // 계산된 텍스트 줌 값을 적용합니다.
    webSettings.setTextZoom(textZoom);

    // JavaScript로 textZoom 값 전달
    // webView.setWebViewClient(new WebViewClient() {
    //   @Override
    //   public void onPageFinished(WebView view, String url) {
    //     super.onPageFinished(view, url);
    //     String script = String.format(Locale.getDefault(),
    //         "window.textZoomLevel = %d;", textZoom);
    //     view.evaluateJavascript(script, null);
    //   }

    //   @SuppressLint("WebViewClientOnReceivedSslError")
    //   @Override
    //   public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
    //     // 개발 환경에서는 SSL 오류를 무시하고 진행할 수 있습니다.
    //     handler.proceed();
    //   }
    // });
  }

  /**
   * 텍스트 줌 레벨을 계산하는 메서드
   *
   * @description 화면 너비를 밀도 독립 픽셀(dp)로 가져오고,
   *              기준 너비(dp)와 비교하여 스케일링 팩터를 계산합니다.
   *              스케일링 팩터를 기반으로 텍스트 줌 레벨을 계산하고,
   *              최종 텍스트 줌 값을 반환합니다.
   * @return 텍스트 줌 레벨(int)
   */
  private int getZoom() {
    // 화면 너비를 밀도 독립 픽셀(dp)로 가져옵니다.
    float screenWidthDp = getResources().getDisplayMetrics().widthPixels / getResources().getDisplayMetrics().density;

    // 스케일링을 위한 기준 너비(dp)를 정의합니다.
    final float BASE_WIDTH_DP = 350f;

    // 현재 화면 너비를 기준 너비에 대해 상대적으로 스케일링 팩터를 계산합니다.
    float scaleFactor = screenWidthDp / BASE_WIDTH_DP;

    // 스케일링 팩터를 기반으로 텍스트 줌 레벨을 계산합니다. 기본값은 100%입니다.
    // BASE_WIDTH_DP보다 큰 화면은 비례적으로 더 큰 텍스트를 가지며,
    // 작은 화면은 더 작은 텍스트를 가집니다.

    return (int) (100 * scaleFactor);
  }
}
