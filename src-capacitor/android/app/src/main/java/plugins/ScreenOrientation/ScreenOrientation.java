package plugins.ScreenOrientation;

import android.view.Surface;

import androidx.appcompat.app.AppCompatActivity;

import android.content.pm.ActivityInfo;

public class ScreenOrientation {
  private final AppCompatActivity activity;

  public ScreenOrientation(AppCompatActivity activity) {
    this.activity = activity;
  }

  public void lock(String orientationType) {
    int orientationEnum = fromOrientationTypeToEnum(orientationType);
    activity.setRequestedOrientation(orientationEnum);
  }

  public void unlock() {
    activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
  }

  public String getCurrentOrientationType() {
    int rotation = activity.getWindowManager().getDefaultDisplay().getRotation();
    return fromRotationToOrientationType(rotation);
  }

  private String fromRotationToOrientationType(int rotation) {
    return switch (rotation) {
      case Surface.ROTATION_90 -> "landscape-primary";
      case Surface.ROTATION_180 -> "portrait-secondary";
      case Surface.ROTATION_270 -> "landscape-secondary";
      default -> "portrait-primary";
    };
  }

  private int configOrientation;

  public boolean hasOrientationChanged(int orientation) {
    if (orientation == configOrientation) {
      return false;
    } else {
      this.configOrientation = orientation;
      return true;
    }
  }

  private int fromOrientationTypeToEnum(String orientationType) {
    return switch (orientationType) {
      case "landscape-primary" -> ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE;
      case "landscape-secondary" -> ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE;
      case "portrait-secondary" -> ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT;
      default ->
        // Case: portrait-primary
        ActivityInfo.SCREEN_ORIENTATION_PORTRAIT;
    };
  }
}