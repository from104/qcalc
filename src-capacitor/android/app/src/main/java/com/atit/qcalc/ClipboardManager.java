package com.atit.qcalc;

import android.content.ClipData;
import android.content.Context;

/**
 * 클립보드 관련 기능을 관리하는 클래스
 */
public class ClipboardManager {
  private final AndroidInterface context;

  public ClipboardManager(AndroidInterface context) {
    this.context = context;
  }

  /**
   * 안드로이드 시스템 클립보드에서 텍스트를 가져오는 메서드입니다.
   *
   * @return 클립보드에 있는 텍스트. 클립보드가 비어있거나 텍스트가 아닌 경우 빈 문자열 반환
   */
  public String getFromClipboard() {
    try {
      android.content.ClipboardManager clipboardManager;
      clipboardManager = (android.content.ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);

      if (clipboardManager != null && clipboardManager.hasPrimaryClip()) {
        ClipData clipData = clipboardManager.getPrimaryClip();

        if (clipData != null && clipData.getItemCount() > 0) {
          ClipData.Item item = clipData.getItemAt(0);
          CharSequence text = item.getText();
          return (text != null) ? text.toString() : "";
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
      System.err.println("Error occurred while retrieving text from clipboard: " + e.getMessage());
    }

    return "";
  }
}