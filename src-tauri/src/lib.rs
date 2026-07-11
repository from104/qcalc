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
/// 두 문제 모두 XWayland으로 전환하면 즉시 해결된다. 따라서 Linux에서 Wayland 세션일 때만
/// `GDK_BACKEND=x11`을 강제해 XWayland 경로로 GTK를 초기화시킨다. X11 네이티브 세션은 영향 없음.
///
/// HiDPI/fractional scaling은 GTK가 `GDK_SCALE` / `GDK_DPI_SCALE` 환경변수를 존중하므로
/// 사용자가 이미 설정한 값이 그대로 적용된다. 125~150% 사용자가 블러를 피하고 싶으면
/// `QCALC_FORCE_WAYLAND=1`을 설정해 이 분기를 우회할 수 있다 (대신 setTitle·항상위는 작동 안 함).
#[cfg(target_os = "linux")]
fn force_xwayland_if_needed() {
  if std::env::var_os("WAYLAND_DISPLAY").is_some()
    && std::env::var_os("QCALC_FORCE_WAYLAND").is_none()
  {
    std::env::set_var("GDK_BACKEND", "x11");
  }
}

#[cfg(not(target_os = "linux"))]
fn force_xwayland_if_needed() {}

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
          let scale = monitor.scale_factor();
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

          let _ = window.set_max_size(Some(Size::Physical(PhysicalSize {
            width: (max_width.max(352) as f64 * scale) as u32,
            height: (max_height.max(604) as f64 * scale) as u32,
          })));
        }
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
