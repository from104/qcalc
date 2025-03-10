/**
 * @file MainActivity.java
 * @description 이 파일은 Capacitor 기반 안드로이드 애플리케이션의 메인 액티비티를 정의합니다.
 *              이 클래스는 BridgeActivity를 상속받아 Capacitor의 기능을 활용하며,
 *              웹뷰 설정, JavaScript 인터페이스 추가, 캐시 관리 및 텍스트 줌 설정과 같은
 *              다양한 초기화 작업을 수행합니다.
 */

package ocom.atit.qcalc;

import android.annotation.SuppressLint;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.Locale;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import ocom.atit.qcalc.BuildConfig;

/**
 * MainActivity 클래스
 * 이 클래스는 Capacitor 기반 안드로이드 앱의 메인 액티비티입니다.
 * BridgeActivity를 상속받아 Capacitor의 기능을 활용합니다.
 */
public class MainActivity extends BridgeActivity {

  private static final String TAG = "QCalc_MainActivity";

  @SuppressLint("SetJavaScriptEnabled")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Capacitor 초기화를 먼저 수행합니다.
    super.onCreate(savedInstanceState);
    Log.d(TAG, "onCreate: Starting MainActivity initialization");

    // Capacitor의 기본 웹뷰 설정을 가져옵니다.
    WebView webView = this.getBridge().getWebView();
    Log.d(TAG, "onCreate: WebView instance obtained");

    // 빌드 타입에 따라 로드할 URL을 결정합니다
    if (BuildConfig.BUILD_TYPE.equals("debug")) {
      Log.d(TAG, "onCreate: Debug mode detected, using development server");
      // 개발 모드에서는 개발 서버 URL을 사용합니다
      // webView.loadUrl("http://localhost:9100");
    } else {
      Log.d(TAG, "onCreate: Release mode detected, loading local file");
      // 프로덕션 모드에서는 로컬 파일 URL을 사용합니다
      // Capacitor의 기본 메커니즘을 사용하면서도 명시적으로 로컬 파일을 로드합니다
      // this.getBridge().setServerAssetPath("public/index.html");
      // this.getBridge().setServerAssetPath("file:///android_asset/public/index.html");
    }

    // 웹뷰의 설정을 구성합니다.
    WebSettings webSettings = webView.getSettings();
    Log.d(TAG, "onCreate: WebSettings initialized");

    // JavaScript 실행을 활성화합니다.
    webSettings.setJavaScriptEnabled(true);
    Log.d(TAG, "onCreate: JavaScript enabled");

    // DOM Storage API를 활성화합니다.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ECLAIR_MR1) {
      webSettings.setDomStorageEnabled(true);
      Log.d(TAG, "onCreate: DOM Storage enabled");
    }

    // 네이티브 코드와 JavaScript 간의 인터페이스를 추가합니다.
    webView.addJavascriptInterface(new WebAppInterface(this), "AndroidInterface");
    Log.d(TAG, "onCreate: JavaScript interface 'AndroidInterface' added");

    // 캐시 사용을 설정합니다.
    webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
    Log.d(TAG, "onCreate: Cache mode set to LOAD_DEFAULT");

    // 화면의 물리적인 폭(dp)을 가져옵니다.
    int textZoom = getZoom();
    Log.d(TAG, String.format("onCreate: Calculated text zoom value: %d", textZoom));

    // 계산된 텍스트 줌 값을 적용합니다.
    webSettings.setTextZoom(textZoom);
    Log.d(TAG, "onCreate: Text zoom applied");

    // JavaScript로 textZoom 값 전달
    webView.setWebViewClient(new WebViewClient() {
      @Override
      public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        Log.d(TAG, String.format("onPageFinished: Page loaded - URL: %s", url));
        String script = String.format(Locale.getDefault(),
            "window.textZoomLevel = %d;", textZoom);
        view.evaluateJavascript(script, null);
        Log.d(TAG, "onPageFinished: Text zoom level injected to JavaScript");
      }

      @Override
      public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        Log.e(TAG, String.format("onReceivedSslError: SSL Error occurred - %s", error.toString()));
        // 개발 환경에서는 SSL 오류를 무시하고 진행할 수 있습니다.
        if (BuildConfig.BUILD_TYPE.equals("debug")) {
          handler.proceed();
          Log.w(TAG, "onReceivedSslError: Proceeding despite SSL error (Development mode)");
        } else {
          handler.cancel();
          Log.e(TAG, "onReceivedSslError: SSL Error occurred - " + error.toString());
        }
      }
    });

    // 초기 화면 배율 설정
    webSettings.setLoadWithOverviewMode(true);
    webSettings.setUseWideViewPort(true);
    Log.d(TAG, "onCreate: Overview mode and wide viewport enabled");

    // 최소 폰트 크기 설정
    webSettings.setMinimumFontSize(12);
    Log.d(TAG, "onCreate: Minimum font size set to 12");

    // 줌 기능 비활성화
    webSettings.setSupportZoom(false);
    webSettings.setBuiltInZoomControls(false);
    Log.d(TAG, "onCreate: Zoom controls disabled");

    // 로컬 파일 접근 허용
    webSettings.setAllowFileAccess(true);
    webSettings.setAllowFileAccessFromFileURLs(true);
    webSettings.setAllowUniversalAccessFromFileURLs(true);
    Log.d(TAG, "onCreate: File access permissions configured");

    // 혼합 콘텐츠 로딩 허용 (HTTP와 HTTPS 콘텐츠 혼합)
    webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    Log.d(TAG, "onCreate: Mixed content mode set to ALWAYS_ALLOW");

    // 디버그 로그 추가
    Log.d(TAG, "onCreate: Final WebView settings: " + webSettings.toString());
    Log.d(TAG, "onCreate: MainActivity initialization completed");
  }

  private int getZoom() {
    Log.d(TAG, "getZoom: Calculating zoom level");

    // Get the screen width in density-independent pixels (dp).
    float screenWidthDp = getResources().getDisplayMetrics().widthPixels / getResources().getDisplayMetrics().density;
    Log.d(TAG, String.format("getZoom: Screen width in dp: %.2f", screenWidthDp));

    // Define the base width (in dp) for scaling.
    final float BASE_WIDTH_DP = 350f;
    Log.d(TAG, String.format("getZoom: Base width in dp: %.2f", BASE_WIDTH_DP));

    // Calculate the scaling factor based on the current screen width relative to
    // the base width.
    float scaleFactor = screenWidthDp / BASE_WIDTH_DP;
    Log.d(TAG, String.format("getZoom: Calculated scale factor: %.2f", scaleFactor));

    // Calculate the text zoom level based on the scaling factor, with a default of
    // 100%.
    // Larger screens than BASE_WIDTH_DP will have proportionally larger text, and
    // smaller screens will have smaller text.
    int textZoom = (int) (100 * scaleFactor);
    Log.d(TAG, String.format("getZoom: Final text zoom value: %d", textZoom));

    return textZoom;
  }
}
