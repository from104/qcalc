package com.atit.qcalc;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.atit.qcalc.DeviceManager;

// 메인 액티비티
public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // 액티비티 생성
    super.onCreate(savedInstanceState);

    // 웹뷰 생성
    WebView webView = getBridge().getWebView();

    // 자바스크립트 인터페이스 추가
    webView.addJavascriptInterface(new AndroidInterface(this), "AndroidInterface");

    // 웹뷰 설정
    WebSettings settings = webView.getSettings();

    // 자바스크립트 활성화
    settings.setJavaScriptEnabled(true);

    // DOM Storage 활성화
    settings.setDomStorageEnabled(true);

    // 캐시 비활성화
    settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

    // 텍스트 크기 설정
    settings.setTextZoom(new DeviceManager(this).getTextZoom()); // 텍스트 크기 설정
  }
}
