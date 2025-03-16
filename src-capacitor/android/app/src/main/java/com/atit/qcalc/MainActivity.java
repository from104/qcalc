package com.atit.qcalc;

import com.getcapacitor.BridgeActivity;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.app.ActivityManager;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;

import plugins.ScreenOrientation.ScreenOrientationPlugin;
import com.atit.qcalc.DeviceManager;

/**
 * QCalc 앱의 메인 액티비티
 * 
 * Capacitor 브릿지를 통해 웹앱과 네이티브 기능을 연결하고, 앱의 기본 설정 및 웹뷰 최적화를 담당합니다.
 */
public class MainActivity extends BridgeActivity {

  @SuppressLint("SetJavaScriptEnabled")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // ===== 기본 설정 및 초기화 =====

    // 화면 방향 제어를 위한 플러그인 등록
    // 특정 화면에서 방향 고정이 필요한 경우 사용
    registerPlugin(ScreenOrientationPlugin.class);

    // 키보드가 UI를 가리지 않도록 레이아웃 조정 설정
    // 사용자 입력 시 더 나은 UX를 제공
    getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);

    // ===== 디바이스 특정 설정 =====

    // 디바이스 관리자 초기화 - 디바이스 특성에 따른 최적화를 위해 사용
    DeviceManager deviceManager = new DeviceManager(this);

    // 폰 디바이스의 경우 회전 비활성화
    // 작은 화면에서의 사용자 경험 최적화
    if (deviceManager.isPhone()) {
      // 세로 모드로 고정
      setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }

    // 부모 클래스의 onCreate 호출
    super.onCreate(savedInstanceState);

    // ===== 웹뷰 기본 설정 =====

    // Capacitor 브릿지의 웹뷰 인스턴스 가져오기
    WebView webView = getBridge().getWebView();

    // 네이티브 인터페이스 설정 - 웹앱과 네이티브 코드 간 통신 브릿지
    webView.addJavascriptInterface(new AndroidInterface(this), "AndroidInterface");

    // 스크롤 바운스 효과 비활성화 - 네이티브 앱과 같은 사용자 경험 제공
    webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);

    // ===== 웹뷰 보안 및 성능 설정 =====

    WebSettings settings = webView.getSettings();

    // 자바스크립트 활성화 - 웹앱 기능 지원을 위해 필수
    // @SuppressLint("SetJavaScriptEnabled")로 보안 경고 처리됨
    settings.setJavaScriptEnabled(true);

    // DOM Storage 활성화 - 웹앱의 로컬 데이터 저장 지원
    settings.setDomStorageEnabled(true);

    // 캐시 비활성화 - 항상 최신 콘텐츠 로드 보장
    settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

    // 디바이스에 최적화된 텍스트 크기 설정
    settings.setTextZoom(deviceManager.getTextZoom());
  }
}
