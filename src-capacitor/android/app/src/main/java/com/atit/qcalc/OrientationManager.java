package com.atit.qcalc;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.util.Log;

/**
 * 화면 방향 관련 기능을 관리하는 클래스
 */
public class OrientationManager {
  private final Activity activity;

  public OrientationManager(Activity activity) {
    this.activity = activity;
  }

  /**
   * 화면 방향을 세로 모드로 고정합니다.
   */
  public void lockToPortrait() {
    activity.runOnUiThread(() -> {
      activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
      Log.d("QCalc", "화면 방향이 세로 모드로 고정되었습니다.");
    });
  }

  /**
   * 화면 방향을 가로 모드로 고정합니다.
   */
  public void lockToLandscape() {
    activity.runOnUiThread(() -> {
      activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
      Log.d("QCalc", "화면 방향이 가로 모드로 고정되었습니다.");
    });
  }

  /**
   * 화면 방향 고정을 해제합니다.
   */
  public void unlockOrientation() {
    activity.runOnUiThread(() -> {
      activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
      Log.d("QCalc", "화면 방향 고정이 해제되었습니다.");
    });
  }
}