package com.atit.qcalc;

import com.getcapacitor.BridgeActivity;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.app.ActivityManager;
import android.content.pm.ActivityInfo;

import plugins.ScreenOrientation.ScreenOrientationPlugin;
import com.atit.qcalc.DeviceManager;

// 메인 액티비티
public class MainActivity extends BridgeActivity {
  @SuppressLint("SetJavaScriptEnabled")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // 화면 방향 잠금
    registerPlugin(ScreenOrientationPlugin.class);

    // 키보드가 레이아웃을 밀지 않도록 설정
    getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);

    // DeviceManager 초기화
    DeviceManager deviceManager = new DeviceManager(this);

    // 폰일 경우 화면 분할 모드 비활성화
    if (deviceManager.isPhone()) {
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_NOSENSOR);
        // Android N 이상에서는 manifest에서 android:resizeableActivity="false"로 설정하는 것이 권장됨
        // 런타임 제한은 완벽하지 않음
      }
    }

    // 액티비티 생성
    super.onCreate(savedInstanceState);

    // 웹뷰 생성
    WebView webView = getBridge().getWebView();

    // 자바스크립트 인터페이스 추가
    webView.addJavascriptInterface(new AndroidInterface(this), "AndroidInterface");

    // 오버스크롤 방지
    webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);

    // 웹뷰 설정
    WebSettings settings = webView.getSettings();

    // 자바스크립트 활성화
    settings.setJavaScriptEnabled(true);

    // DOM Storage 활성화
    settings.setDomStorageEnabled(true);

    // 캐시 비활성화
    settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

    // 텍스트 크기 설정
    settings.setTextZoom(deviceManager.getTextZoom());
  }
}
