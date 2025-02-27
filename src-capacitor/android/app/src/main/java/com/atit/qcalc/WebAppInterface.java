package org.capacitor.quasar.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.webkit.JavascriptInterface;

/**
 * 웹 애플리케이션과 안드로이드 네이티브 기능 간의 인터페이스를 제공하는 클래스입니다.
 * 이 클래스는 JavaScript에서 안드로이드의 네이티브 기능을 호출할 수 있게 해줍니다.
 */
public class WebAppInterface {
    private Context mContext;

    /**
     * WebAppInterface의 생성자입니다.
     * @param context 애플리케이션 또는 액티비티의 컨텍스트
     */
    public WebAppInterface(MainActivity context) {
        this.mContext = context;
    }

    /**
     * 안드로이드 시스템 클립보드에서 텍스트를 가져오는 메서드입니다.
     *
     * 주의: 이 메서드는 웹뷰의 기본 보안 정책으로 인해 JavaScript에서 직접 클립보드에 접근할 수 없기 때문에
     * 별도로 구현되었습니다.
     *
     * @return 클립보드에 있는 텍스트. 클립보드가 비어있거나 텍스트가 아닌 경우 빈 문자열 반환
     */
    @JavascriptInterface
    public String getFromClipboard() {
        try {
            ClipboardManager clipboardManager = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);

            // 클립보드에 내용이 있는지 확인
            if (clipboardManager != null && clipboardManager.hasPrimaryClip()) {
                ClipData clipData = clipboardManager.getPrimaryClip();

                // 클립데이터의 첫 번째 아이템 가져오기
                if (clipData != null && clipData.getItemCount() > 0) {
                    ClipData.Item item = clipData.getItemAt(0);
                    CharSequence text = item.getText();

                    // 텍스트가 있으면 문자열로 변환하여 반환, 없으면 빈 문자열 반환
                    return (text != null) ? text.toString() : "";
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            // 예외 발생 시 로그 출력 (실제 프로덕션 환경에서는 적절한 에러 처리 필요)
            System.err.println("Error occurred while retrieving text from clipboard: " + e.getMessage());
        }

        // 클립보드가 비어있거나 예외 발생 시 빈 문자열 반환
        return "";
    }
}
