/**
 * 네이티브 기능을 JavaScript에서 호출할 수 있게 해주는 인터페이스
 * 제공 기능:
 * - 디바이스 타입 확인 (태블릿/폰/폴더블)
 * - 클립보드 내용 접근
 * - API 레벨 확인
 * - 네비게이션바 상태 확인
 */
package com.atit.qcalc;

import android.webkit.JavascriptInterface;
import android.app.Activity;

public class AndroidInterface {
  private final DeviceManager deviceManager;
  private final ClipboardManager clipboardManager;
  private final Activity context;

  public AndroidInterface(Activity context) {
    this.context = context;
    this.deviceManager = new DeviceManager(context);
    this.clipboardManager = new ClipboardManager(this);
  }

  @JavascriptInterface
  public boolean isTablet() {
    return deviceManager.isTablet();
  }

  @JavascriptInterface
  public boolean isPhone() {
    return deviceManager.isPhone();
  }

  @JavascriptInterface
  public boolean isFoldable() {
    return deviceManager.isFoldable();
  }

  @JavascriptInterface
  public int getTextZoom() {
    return deviceManager.getTextZoom();
  }

  @JavascriptInterface
  public int getApiLevel() {
    return deviceManager.getApiLevel();
  }

  @JavascriptInterface
  public int getNavigationBarHeight() {
    return deviceManager.getNavigationBarHeight();
  }

  @JavascriptInterface
  public boolean isGestureNavigation() {
    return deviceManager.isGestureNavigation();
  }

  @JavascriptInterface
  public String getFromClipboard() {
    return clipboardManager.getFromClipboard();
  }

  public Object getSystemService(String name) {
    return context.getSystemService(name);
  }
}