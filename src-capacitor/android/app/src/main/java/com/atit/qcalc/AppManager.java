package com.atit.qcalc;

import android.content.pm.ActivityInfo;
import android.util.Log;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

/**
 * 앱의 전반적인 초기화와 매니저들의 조정을 담당하는 클래스
 */
public class AppManager {
  private final BridgeActivity activity;
  private DeviceManager deviceManager;
  private OrientationManager orientationManager;
  private WebAppBridge webAppBridge;

  public AppManager(BridgeActivity activity) {
    this.activity = activity;
  }

  /**
   * 앱의 초기화를 수행합니다.
   */
  public void initialize() {
    initializeManagers();
    setupWebView();
    configureInitialSettings();
  }

  /**
   * 매니저 클래스들을 초기화합니다.
   */
  private void initializeManagers() {
    deviceManager = new DeviceManager(activity);
    orientationManager = new OrientationManager(activity);
    ClipboardManager clipboardManager = new ClipboardManager(activity);

    WebView webView = activity.getBridge().getWebView();
    WebViewManager webViewManager = new WebViewManager(webView, deviceManager);

    webAppBridge = new WebAppBridge(deviceManager, orientationManager, clipboardManager);
  }

  /**
   * 웹뷰를 설정합니다.
   */
  private void setupWebView() {
    WebView webView = activity.getBridge().getWebView();
    webView.addJavascriptInterface(webAppBridge, "AndroidInterface");
  }

  /**
   * 초기 설정을 구성합니다.
   */
  private void configureInitialSettings() {
    // 디바이스가 폰인 경우 화면 방향을 세로로 고정
    if (deviceManager.isPhone()) {
      Log.d("AppManager", "Locking screen orientation to portrait for phone devices");
      orientationManager.lockToPortrait();
    }
  }
}