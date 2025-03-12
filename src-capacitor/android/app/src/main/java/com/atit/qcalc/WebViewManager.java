package com.atit.qcalc;

import android.annotation.SuppressLint;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.util.Log;

import java.util.Locale;

/**
 * 웹뷰 설정 및 관리를 담당하는 클래스
 */
public class WebViewManager {
  private final WebView webView;
  private final DeviceManager deviceManager;

  public WebViewManager(WebView webView, DeviceManager deviceManager) {
    this.webView = webView;
    this.deviceManager = deviceManager;
    configureWebView();
  }

  /**
   * 웹뷰의 기본 설정을 구성합니다.
   */
  @SuppressLint("SetJavaScriptEnabled")
  private void configureWebView() {
    WebSettings webSettings = webView.getSettings();

    // JavaScript 실행을 활성화합니다.
    webSettings.setJavaScriptEnabled(true);

    // DOM Storage API를 활성화합니다.
    webSettings.setDomStorageEnabled(true);

    // 캐시 사용을 비활성화합니다.
    webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);

    // 텍스트 줌 설정을 적용합니다.
    Log.d("QCalc", "setTextZoom: " + deviceManager.getTextZoom());
    webSettings.setTextZoom(deviceManager.getTextZoom());

    // 웹뷰 클라이언트 설정
    setupWebViewClient();
  }

  /**
   * 웹뷰 클라이언트를 설정합니다.
   */
  private void setupWebViewClient() {
    webView.setWebViewClient(new WebViewClient() {
      @Override
      public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        injectDeviceInfo();
      }

      @SuppressLint("WebViewClientOnReceivedSslError")
      @Override
      public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        // 개발 환경에서는 SSL 오류를 무시하고 진행할 수 있습니다.
        handler.proceed();
      }
    });
  }

  /**
   * 디바이스 정보를 JavaScript로 주입합니다.
   */
  private void injectDeviceInfo() {
    String script = String.format(Locale.getDefault(),
        "window.nativeDeviceInfo = {isTablet: %b, isPhone: %b, isFoldable: %b, textZoomLevel: %d};",
        deviceManager.isTablet(), deviceManager.isPhone(), deviceManager.isFoldable(), deviceManager.getTextZoom());
    webView.evaluateJavascript(script, null);
  }
}