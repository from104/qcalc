package com.atit.qcalc;

import android.app.Activity;
import android.content.res.Configuration;
import android.os.Build;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.util.Log;

/**
 * 디바이스 타입 감지 및 관련 기능을 관리하는 클래스
 */
public class DeviceManager {
  private final Activity activity;
  private boolean isTablet = false;
  private boolean isFoldable = false;
  private boolean isPhone = false;
  private int textZoom = 100;
  private int apiLevel = 0;
  private int navigationBarHeight = 0;
  private boolean isGestureNavigation = false;

  public DeviceManager(Activity activity) {
    this.activity = activity;
    detectDeviceType();
    calculateTextZoom();
    detectApiLevel();
    detectNavigationBarState();
  }

  /**
   * 디바이스 유형을 감지하는 메서드
   */
  private void detectDeviceType() {
    boolean isTabletByConfig = (activity.getResources().getConfiguration().screenLayout
        & Configuration.SCREENLAYOUT_SIZE_MASK) >= Configuration.SCREENLAYOUT_SIZE_LARGE;

    DisplayMetrics metrics = new DisplayMetrics();
    activity.getWindowManager().getDefaultDisplay().getMetrics(metrics);

    float widthDp = metrics.widthPixels / metrics.density;
    float heightDp = metrics.heightPixels / metrics.density;

    boolean isTabletBySize = Math.min(widthDp, heightDp) >= 660;

    setTablet(isTabletByConfig || isTabletBySize);

    String model = Build.MODEL.toLowerCase();
    setFoldable(model.contains("fold") || model.contains("flip"));

    setPhone(!isTablet);

    Log.d("QCalc", "디바이스 타입 감지: isTablet=" + this.isTablet + ", isPhone=" + this.isPhone + ", isFoldable="
        + this.isFoldable + ", model=" + Build.MODEL + ", width=" + widthDp + "dp, height=" + heightDp + "dp");
  }

  /**
   * API 레벨을 감지하는 메서드
   */
  private void detectApiLevel() {
    this.apiLevel = Build.VERSION.SDK_INT;
    Log.d("QCalc", "API 레벨 감지: apiLevel=" + this.apiLevel);
  }

  /**
   * 네비게이션바의 상태를 감지하는 메서드
   */
  private void detectNavigationBarState() {
    // 네비게이션바 높이 감지
    int resourceId = activity.getResources().getIdentifier("navigation_bar_height", "dimen", "android");
    if (resourceId > 0) {
      this.navigationBarHeight = activity.getResources().getDimensionPixelSize(resourceId);
    }

    // 제스처 네비게이션 확인 (API 29 이상)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      try {
        int navigationMode = Settings.Secure.getInt(activity.getContentResolver(), "navigation_mode");
        // 0: 3-button, 1: 2-button (Pixel-exclusive), 2: Gesture
        this.isGestureNavigation = (navigationMode == 2);
      } catch (Settings.SettingNotFoundException e) {
        this.isGestureNavigation = false;
        Log.e("QCalc", "네비게이션 모드 설정을 찾을 수 없습니다.", e);
      }
    } else {
      this.isGestureNavigation = false;
    }

    Log.d("QCalc", "네비게이션바 상태 감지: height=" + this.navigationBarHeight + "px, gesture=" + this.isGestureNavigation);
  }

  /**
   * 텍스트 줌 레벨을 계산하는 메서드
   */
  private void calculateTextZoom() {
    float screenWidthDp = activity.getResources().getDisplayMetrics().widthPixels
        / activity.getResources().getDisplayMetrics().density;
    float screenHeightDp = activity.getResources().getDisplayMetrics().heightPixels
        / activity.getResources().getDisplayMetrics().density;
    final float BASE_WIDTH_DP = 352f;
    final float BASE_HEIGHT_DP = 604f;
    float scaleFactor = Math.max(screenWidthDp / BASE_WIDTH_DP, screenHeightDp / BASE_HEIGHT_DP);

    this.textZoom = (int) Math.min(Math.max(100 * scaleFactor, 75), 125);
  }

  // --- Getter/Setter 메서드 (기존과 동일) ---

  public boolean isTablet() {
    return isTablet;
  }

  public void setTablet(boolean tablet) {
    isTablet = tablet;
  }

  public boolean isPhone() {
    return isPhone;
  }

  public void setPhone(boolean phone) {
    isPhone = phone;
  }

  public boolean isFoldable() {
    return isFoldable;
  }

  public void setFoldable(boolean foldable) {
    isFoldable = foldable;
  }

  public int getTextZoom() {
    Log.d("QCalc", "textZoom: " + textZoom);
    return textZoom;
  }

  public int getApiLevel() {
    return apiLevel;
  }

  public int getNavigationBarHeight() {
    return navigationBarHeight;
  }

  public boolean isGestureNavigation() {
    return isGestureNavigation;
  }
}