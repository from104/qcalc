use serde::Serialize;
use tauri::{Manager, PhysicalSize, Size};

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "lowercase")]
enum PackageEnv {
  Snap,
  Flatpak,
  AppImage,
  Native,
}

fn detect_package_env() -> PackageEnv {
  if std::env::var_os("SNAP").is_some() {
    PackageEnv::Snap
  } else if std::env::var_os("FLATPAK_ID").is_some() {
    PackageEnv::Flatpak
  } else if std::env::var_os("APPIMAGE").is_some() {
    PackageEnv::AppImage
  } else {
    PackageEnv::Native
  }
}

fn is_sandboxed(env: PackageEnv) -> bool {
  matches!(env, PackageEnv::Snap | PackageEnv::Flatpak)
}

#[tauri::command]
fn get_package_env() -> PackageEnv {
  detect_package_env()
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
  app.exit(0);
}

/// GNOME/KDE Wayland 세션에서 Tauri의 `setTitle`이 CSD 헤더바를 repaint하지 않고
/// (tauri-apps/tauri#13749), `setAlwaysOnTop`은 Wayland 프로토콜 미지원으로 no-op이다
/// (tauri-apps/tauri#3117 — wontfix, Wayland 프로토콜 확장 대기).
///
/// 두 문제 모두 XWayland으로 전환하면 해결되지만, 그 강제 전환 자체가 실기기에서 재현되는
/// 크래시를 유발한다: GDK가 X11(XWayland)로 붙으면 WebKitGTK/GTK 내부 여러 함수
/// (`gdk_wayland_display_get_wl_display`, `gdk_wayland_window_set_dbus_properties_libgtk_only`
/// 등)가 세션이 실제로는 Wayland 컴포지터임을 감지해 Wayland 전용 API를 호출하다 assertion
/// 실패 후 SIGSEGV로 죽는다 — 발생 여부가 타이밍에 따라 갈리는 레이스로 보이며, 실기기
/// AppImage와 `cargo run` 양쪽에서 재현 확인(2026-07-12, Ubuntu 24.04 GNOME/Wayland).
/// `WEBKIT_DISABLE_DMABUF_RENDERER=1`을 함께 줘도 크래시가 사라지지 않았다.
///
/// 안정성이 우선이므로 기본값은 XWayland 강제를 **하지 않음**(네이티브 Wayland) — setTitle
/// 헤더바 미갱신·항상위 no-op은 남지만 크래시보다 낫다. 두 기능이 꼭 필요하고 크래시
/// 위험을 감수할 사용자는 `QCALC_FORCE_XWAYLAND=1`로 옵트인할 수 있다(단 위 재현 결과상
/// `WEBKIT_DISABLE_DMABUF_RENDERER=1`을 같이 줘도 크래시가 완전히 없어진다는 보장은 없다).
#[cfg(target_os = "linux")]
fn force_xwayland_if_needed() {
  if std::env::var_os("WAYLAND_DISPLAY").is_some()
    && std::env::var_os("QCALC_FORCE_XWAYLAND").is_some()
  {
    std::env::set_var("GDK_BACKEND", "x11");
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
  }
}

#[cfg(not(target_os = "linux"))]
fn force_xwayland_if_needed() {}

// TODO: CSP 설정 — tauri.conf.json의 `app.security.csp`(현재 null)에 실기기 런타임 검증과 함께
// 값을 채워야 한다. currency API·GitHub updater 엔드포인트용 connect-src 허용이 필요.
// (JSON 설정 파일은 주석을 지원하지 않아 이 메모를 여기 남긴다.)
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // 반드시 tauri::Builder::default() 이전에 호출. Builder 초기화가 GTK 세션 백엔드를 확정한다.
  force_xwayland_if_needed();

  let mut builder = tauri::Builder::default()
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![get_package_env, quit_app]);

  if cfg!(debug_assertions) {
    builder = builder.plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    );
  }

  // Snap/Flatpak은 자체 업데이트 메커니즘을 사용하므로 플러그인을 등록하지 않는다
  // (Electron 버전의 electron-updater 조건부 비활성화와 동일한 정책).
  // tauri.conf.json의 plugins.updater(pubkey + endpoints)가 설정되지 않으면
  // 런타임에 check() 호출이 에러로 반환되며, JS shim이 이를 포착해 'error' 이벤트로 보고한다.
  #[cfg(not(any(target_os = "android", target_os = "ios")))]
  if !is_sandboxed(detect_package_env()) {
    builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
  }

  builder
    .setup(|app| {
      if let Some(window) = app.get_webview_window("main") {
        #[cfg(debug_assertions)]
        window.open_devtools();

        if let Ok(Some(monitor)) = window.current_monitor() {
          let size = monitor.size();
          // 네이티브 Wayland에서는 `.setup()` 시점에 컴포지터가 아직 출력(output) 협상을
          // 끝내지 않아 scale_factor()가 0/비정상값을 반환할 수 있다(XWayland는 X11 API가
          // 동기식이라 이 문제가 없었다 — force_xwayland_if_needed()가 항상 켜져 있던
          // 시절엔 드러나지 않던 경로). scale이 0이면 아래 연산이 전부 0으로 붕괴해
          // set_max_size(0, 0)이 호출되고 창이 거의 안 보일 만큼 쪼그라든다(실기기 재현,
          // 2026-07-12). 비정상 범위면 1.0으로 대체한다.
          let raw_scale = monitor.scale_factor();
          let scale = if raw_scale.is_finite() && raw_scale > 0.0 { raw_scale } else { 1.0 };
          log::info!(
            "monitor: size={}x{} raw_scale_factor={raw_scale} used_scale={scale}{}",
            size.width,
            size.height,
            if scale == raw_scale { "" } else { " (FALLBACK — raw value was invalid)" },
          );
          let work_width = (size.width as f64 / scale) as u32;
          let work_height = (size.height as f64 / scale) as u32;
          let is_landscape = work_width > work_height;

          let max_height = if is_landscape {
            (work_height as f64 * 2.0 / 3.0) as u32
          } else {
            work_height / 3
          };
          let max_width = if is_landscape {
            work_width / 2
          } else {
            (work_width as f64 * 2.0 / 3.0) as u32
          };

          // 바닥값(480/756)은 tauri.conf.json의 minWidth/minHeight와 반드시 일치해야 한다
          // — 안 그러면 좁은 화면에서 max_size가 min_size보다 작아지는 모순이 생긴다.
          let _ = window.set_max_size(Some(Size::Physical(PhysicalSize {
            width: (max_width.max(480) as f64 * scale) as u32,
            height: (max_height.max(756) as f64 * scale) as u32,
          })));
        }
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
