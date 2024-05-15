package org.capacitor.quasar.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ClipDescription;
import android.content.Context;
import android.webkit.JavascriptInterface;

/**
 * 웹 앱 인터페이스를 나타내는 클래스입니다.
 */
public class WebAppInterface {
    private Context mContext;

    /**
     * WebAppInterface의 생성자입니다.
     * @param c 컨텍스트 객체
     */
    public WebAppInterface(Context c) {
        mContext = c;
    }

    /**
     * 클립보드에서 텍스트를 가져오는 메서드입니다.
     * @return 클립보드에서 가져온 텍스트
     */
    @JavascriptInterface
    public String getFromClipboard() {
        try {
            ClipboardManager clipboard = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
            if (clipboard.hasPrimaryClip()) {
                ClipData.Item item = clipboard.getPrimaryClip().getItemAt(0);
                CharSequence cs = item.getText();
                return cs != null ? cs.toString() : "";
            } else {
                return "";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}
