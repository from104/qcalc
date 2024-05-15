package org.capacitor.quasar.app;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.content.ClipboardManager;
import android.content.ClipData;

public class WebAppInterface {
    private Context mContext;

    // 생성자
    public WebAppInterface(Context c) {
        mContext = c;
    }

    // 클립보드에서 텍스트를 가져오는 메서드
    @JavascriptInterface
    public String getFromClipboard() {
        ClipboardManager clipboard = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
        if (clipboard.hasPrimaryClip() && clipboard.getPrimaryClipDescription().hasMimeType(ClipData.MIMETYPE_TEXT_PLAIN)) {
            ClipData.Item item = clipboard.getPrimaryClip().getItemAt(0);
            return item.getText().toString();
        }
        return "클립보드에 텍스트가 없습니다.";
    }
}
