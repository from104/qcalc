package com.atit.qcalc;

import android.app.Activity;
import android.content.res.Configuration;
import android.os.Build;
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

  public DeviceManager(Activity activity) {
    this.activity = activity;
    detectDeviceType();
    calculateTextZoom();
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

    // 높이나 너비 중 작은 쪽이 660dp 이상이면 태블릿으로 판단
    boolean isTabletBySize = Math.min(widthDp, heightDp) >= 660;

    setTablet(isTabletByConfig || isTabletBySize);

    String model = Build.MODEL.toLowerCase();
    setFoldable(model.contains("fold") || model.contains("flip"));

    setPhone(!isTablet);

    Log.d("QCalc", "디바이스 타입 감지: isTablet=" + this.isTablet +
        ", isPhone=" + this.isPhone + ", isFoldable=" + this.isFoldable +
        ", model=" + Build.MODEL + ", width=" + widthDp + "dp, height=" + heightDp + "dp");
  }

  /**
   * 텍스트 줌 레벨을 계산하는 메서드
   */
  private void calculateTextZoom() {
    float screenWidthDp = activity.getResources().getDisplayMetrics().widthPixels /
        activity.getResources().getDisplayMetrics().density;
    float screenHeightDp = activity.getResources().getDisplayMetrics().heightPixels /
        activity.getResources().getDisplayMetrics().density;
    final float BASE_WIDTH_DP = 352f;
    final float BASE_HEIGHT_DP = 604f;
    float scaleFactor = Math.max(screenWidthDp / BASE_WIDTH_DP, screenHeightDp / BASE_HEIGHT_DP);
    
    this.textZoom = (int) Math.min(Math.max(100 * scaleFactor, 75), 125);
  }

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
}