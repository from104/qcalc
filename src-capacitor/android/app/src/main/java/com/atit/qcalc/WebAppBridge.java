package com.atit.qcalc;

import android.webkit.JavascriptInterface;

/**
 * 웹 애플리케이션과 네이티브 코드 간의 인터페이스를 제공하는 클래스
 */
public class WebAppBridge {
  private final DeviceManager deviceManager;
  private final OrientationManager orientationManager;
  private final ClipboardManager clipboardManager;

  public WebAppBridge(DeviceManager deviceManager,
      OrientationManager orientationManager,
      ClipboardManager clipboardManager) {
    this.deviceManager = deviceManager;
    this.orientationManager = orientationManager;
    this.clipboardManager = clipboardManager;
  }

  /**
   * 태블릿 여부를 반환합니다.
   */
  @JavascriptInterface
  public boolean isTablet() {
    return deviceManager.isTablet();
  }

  /**
   * 폰 여부를 반환합니다.
   */
  @JavascriptInterface
  public boolean isPhone() {
    return deviceManager.isPhone();
  }

  /**
   * 폴더블 기기 여부를 반환합니다.
   */
  @JavascriptInterface
  public boolean isFoldable() {
    return deviceManager.isFoldable();
  }

  /**
   * 화면 방향을 세로 모드로 고정합니다.
   */
  @JavascriptInterface
  public void lockToPortrait() {
    orientationManager.lockToPortrait();
  }

  /**
   * 화면 방향을 가로 모드로 고정합니다.
   */
  @JavascriptInterface
  public void lockToLandscape() {
    orientationManager.lockToLandscape();
  }

  /**
   * 화면 방향 고정을 해제합니다.
   */
  @JavascriptInterface
  public void unlockOrientation() {
    orientationManager.unlockOrientation();
  }

  /**
   * 클립보드의 내용을 가져옵니다.
   */
  @JavascriptInterface
  public String getFromClipboard() {
    return clipboardManager.getFromClipboard();
  }
}