use serde::Serialize;
use tauri::{LogicalSize, Manager, Size};

/// tauri.conf.json의 minWidth/minHeight와 같은 값. 확대 비율 1.0 기준이며 아래 창 크기
/// 계산의 바닥이 된다. 한쪽만 고치면 좁은 화면에서 max_size가 min_size보다 작아진다.
const BASE_MIN_WIDTH: f64 = 480.0;
const BASE_MIN_HEIGHT: f64 = 756.0;

/// 데스크톱의 텍스트 확대 비율 (Linux 전용, 그 외 플랫폼은 항상 1.0).
///
/// WebKitGTK는 GTK의 텍스트 배율만큼 페이지 전체를 확대하므로, 창의 논리 크기가 같아도
/// 웹 콘텐츠가 받는 CSS 뷰포트는 그만큼 좁아진다. 실측(배율 1.25):
///
/// | 창 크기   | CSS 뷰포트 |
/// |-----------|------------|
/// | 480x756   | 384x604    |
/// | 600x945   | 480x756    |
///
/// 즉 배율을 반영하지 않으면 최소 창이 의도한 480x756이 아니라 384x604짜리 캔버스만
/// 준다. 창의 최소/최대 크기를 이 비율만큼 키워야 어느 배율에서든 같은 CSS 공간이 나온다.
///
/// gtk-xft-dpi는 dpi를 1024배한 정수이고 기본값 96dpi가 배율 1.0이다(-1은 미설정).
/// monitor.scale_factor()와는 다른 값이다 — 그쪽은 HiDPI 배율이고 Tauri의 논리 좌표계가
/// 이미 반영하고 있다. 비정상 값이 창을 붕괴시키지 않도록 범위를 제한한다.
fn ui_scale() -> f64 {
  #[cfg(target_os = "linux")]
  {
    use gtk::prelude::*;
    if let Some(settings) = gtk::Settings::default() {
      let xft_dpi = settings.property::<i32>("gtk-xft-dpi");
      if xft_dpi > 0 {
        let scale = (xft_dpi as f64 / 1024.0) / 96.0;
        if scale.is_finite() && (0.5..=4.0).contains(&scale) {
          return scale;
        }
        log::warn!("gtk-xft-dpi={xft_dpi} yields an out-of-range UI scale ({scale}); using 1.0");
      }
    }
  }
  1.0
}

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

/// 스크린리더에게 텍스트를 직접 낭독시킨다 (Linux 전용, 그 외 플랫폼은 no-op).
///
/// Orca(46 기준)는 앱 toolkit이 'gtk'인 앱에 웹 스크립트를 배정하지 않으므로 WebKitGTK
/// 문서 안의 aria-live 리전을 낭독할 코드 경로가 없다(gtk 스크립트의 onChildrenAdded는
/// 캐시 정리만 하는 no-op이고 LiveRegionManager도 없다). 반면 어떤 스크립트든
/// `object:announcement` 이벤트는 무조건 낭독하므로, GTK 창의 접근성 객체에서 ATK
/// `announcement` 신호(ATK 2.46+)를 쏘는 것이 신뢰할 수 있는 유일한 경로다.
/// DOM의 aria-live 리전은 다른 플랫폼(Windows/WebView2 등)을 위해 그대로 유지한다.
#[tauri::command]
fn announce_a11y(window: tauri::WebviewWindow, text: String) {
  #[cfg(target_os = "linux")]
  {
    let win = window.clone();
    // GTK 객체 접근은 메인 스레드에서만 허용된다.
    let _ = window.run_on_main_thread(move || {
      use gtk::prelude::*;
      if let Ok(gtk_window) = win.gtk_window() {
        if let Some(accessible) = gtk_window.accessible() {
          accessible.emit_by_name::<()>("announcement", &[&text]);
        }
      }
    });
  }
  #[cfg(not(target_os = "linux"))]
  {
    let _ = (window, text);
  }
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
    .invoke_handler(tauri::generate_handler![get_package_env, quit_app, announce_a11y]);

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
          let ui = ui_scale();
          log::info!(
            "monitor: size={}x{} raw_scale_factor={raw_scale} used_scale={scale} ui_scale={ui}{}",
            size.width,
            size.height,
            if scale == raw_scale { "" } else { " (FALLBACK — raw value was invalid)" },
          );
          let work_width = size.width as f64 / scale;
          let work_height = size.height as f64 / scale;
          let is_landscape = work_width > work_height;

          let max_height = if is_landscape {
            work_height * 2.0 / 3.0
          } else {
            work_height / 3.0
          };
          let max_width = if is_landscape {
            work_width / 2.0
          } else {
            work_width * 2.0 / 3.0
          };

          // 최소·최대 모두 화면 확대 비율만큼 키운다. 그래야 배율이 얼마든 웹 콘텐츠가
          // 받는 CSS 공간이 같아진다. 다만 화면보다 큰 창을 요구하면 창을 못 쓰게 되므로
          // 작업 영역으로 자른다.
          let min_width = (BASE_MIN_WIDTH * ui).min(work_width);
          let min_height = (BASE_MIN_HEIGHT * ui).min(work_height);
          let _ = window.set_min_size(Some(Size::Logical(LogicalSize {
            width: min_width,
            height: min_height,
          })));

          // 최대는 최소보다 작을 수 없다 — 좁은 화면에서 둘이 뒤집히면 창 크기가 붕괴한다.
          let capped_max_width = (max_width * ui).min(work_width).max(min_width);
          let capped_max_height = (max_height * ui).min(work_height).max(min_height);
          let _ = window.set_max_size(Some(Size::Logical(LogicalSize {
            width: capped_max_width,
            height: capped_max_height,
          })));

          log::info!(
            "window bounds (logical): min={min_width}x{min_height} max={capped_max_width}x{capped_max_height} work={work_width}x{work_height}"
          );

          // tauri-plugin-window-state가 복원한 크기는 config의 minWidth/minHeight를
          // 무시하므로, 새 최소값보다 작게 복원됐으면 끌어올린다.
          if let (Ok(inner), Ok(win_scale)) = (window.inner_size(), window.scale_factor()) {
            let logical = inner.to_logical::<f64>(win_scale);
            if logical.width + 0.5 < min_width || logical.height + 0.5 < min_height {
              let _ = window.set_size(Size::Logical(LogicalSize {
                width: logical.width.max(min_width),
                height: logical.height.max(min_height),
              }));
            }
          }
        }
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
