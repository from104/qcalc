use serde::Serialize;
use tauri::{LogicalSize, Manager, Size};

/// 앱이 쓸 만해지는 최소 크기 — **확대 비율 1.0 기준**이다. 실제 최소 창 크기는 여기에
/// 데스크톱 확대 비율을 곱해 정한다. `.setup()`에서 페이지 줌을 상쇄하므로 CSS 픽셀과
/// 창의 논리 픽셀이 같고, 따라서 이 값은 두 단위 어느 쪽으로 읽어도 된다.
/// Electron 빌드의 같은 성격의 값은 352x604다(`src-electron/electron-main.ts`).
///
/// `tauri.conf.json`의 minWidth/minHeight와 **같은 값으로 유지할 것.** 저쪽은 아래
/// set_min_size가 도는 정상 경로에서는 덮어써지지만, `current_monitor()`가 실패하면
/// 그대로 남아 유일한 바닥값이 된다. 둘이 어긋나 있으면 그 경로에서만 다른 창이 뜬다.
///
/// 이 수치는 실기기에서 나왔다: 사용자가 직접 늘려 쓸 만하다고 판단한 창이 978x1536 물리
/// 픽셀이었고(모니터 배율 2 → 489x768 논리), 텍스트 배율 1.25가 걸려 CSS로는 384x604였다.
/// 즉 예전 상수 480x756은 이미 1.25가 반영된 논리 크기였고, 그걸 CSS 값으로 착각해 배율을
/// 다시 곱하는 바람에 창이 1.5배 넘게 커진 적이 있다(2026-08-16). 단위를 헷갈리지 말 것.
const BASE_MIN_WIDTH: f64 = 384.0;
const BASE_MIN_HEIGHT: f64 = 604.0;

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
/// 그래서 `.setup()`에서 역수 줌(`set_zoom(1/배율)`)을 걸어 이 확대를 상쇄한다. 그러면
/// CSS 픽셀 = 창 논리 픽셀이 되어, 창 크기 계산에서 배율을 신경 쓸 필요가 없어지고
/// 화면에 그려지는 크기도 Chromium을 쓰는 Electron 빌드와 같아진다.
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
///
/// 반대로 **환경이 밖에서 x11을 강제하고 있으면 되돌린다.** AppImage 번들은
/// linuxdeploy-plugin-gtk이 자동 생성하는 AppRun 훅에서 `export GDK_BACKEND=x11`을
/// 무조건 내보내므로(tauri-apps/tauri#8541 회피용), 이 바이너리가 실행되기도 전에 위 크래시
/// 조건이 성립한다 — 실제로 0.13.0 릴리스 AppImage가 GNOME/Wayland에서 창이 뜨자마자
/// SIGSEGV로 죽는 것을 재현했다(2026-08-16). 훅은 빌드 산출물이라 우리가 지울 수 없으니
/// GTK가 초기화되기 전인 여기서 네이티브 Wayland로 되돌린다.
#[cfg(target_os = "linux")]
fn configure_gdk_backend() {
  // Wayland 세션이 아니면(순수 X11 등) 백엔드 선택을 건드릴 이유가 없다.
  if std::env::var_os("WAYLAND_DISPLAY").is_none() {
    return;
  }

  if std::env::var_os("QCALC_FORCE_XWAYLAND").is_some() {
    std::env::set_var("GDK_BACKEND", "x11");
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    return;
  }

  // 옵트인이 없으면 네이티브 Wayland가 기본이다. 값을 지우지 않고 명시적으로 박는 이유는,
  // 지우면 GDK가 후보를 순회하다 결국 x11로 떨어져 같은 크래시로 돌아갈 수 있기 때문이다.
  std::env::set_var("GDK_BACKEND", "wayland");
}

#[cfg(not(target_os = "linux"))]
fn configure_gdk_backend() {}

/// Linux(GTK) 창 크기 보정. GNOME Wayland는 서버 장식(SSD)이 없어 GTK가 CSD로 그림자와
/// 타이틀바를 그리는데, 그 상태에서 tao의 크기 API가 서로 다른 기준을 쓴다(2026-09-09 실측,
/// 배율 2·텍스트 1.25 환경에서 프레임−내용 = 90×138 논리px, X11/SSD에서는 0×0):
/// - `set_size`는 **내용** 크기를 정한다.
/// - `inner_size`·`Resized` 이벤트·`set_min_size`/`set_max_size` 힌트는 **프레임**(내용+그림자+
///   타이틀바) 기준이다. GTK `geometry_widget`을 지정해도 힌트는 프레임에 걸린다(실험 확인).
///
/// 그대로 두면 두 가지가 어긋난다. (1) 최소 480×755로 잡아도 내용은 390×617이 된다.
/// (2) tauri-plugin-window-state가 종료 때 프레임 크기를 저장하고 다음 실행에 내용 크기로
/// 복원하므로 **실행할 때마다 창이 델타만큼 자라다 최대에서 멈춘다**.
///
/// 그래서 Linux에서는 내용 크기를 `gtk_window.size()`로 직접 읽고, 힌트는 실측한 델타를 더해
/// 프레임 기준으로 다시 걸며, 크기 저장·복원은 플러그인 대신 여기서 한다(플러그인은 SIZE
/// 플래그를 뺀 나머지만 담당).
#[cfg(target_os = "linux")]
mod linux_geometry {
  use std::sync::Mutex;
  use tauri::{LogicalSize, Manager, PhysicalSize, Size};

  /// 내용 기준 논리 픽셀 경계.
  #[derive(Clone, Copy, Debug)]
  pub struct Bounds {
    pub min: (f64, f64),
    pub max: (f64, f64),
  }

  #[derive(Default)]
  pub struct State {
    pub bounds: Mutex<Option<Bounds>>,
    /// 프레임 − 내용(논리 px). 첫 Resized 이벤트에서 알 수 있고, 최대화 등으로 바뀔 수 있다.
    pub delta: Mutex<Option<(f64, f64)>>,
    /// 마지막으로 본 내용 크기(논리 px). 종료 때 저장한다.
    pub content: Mutex<Option<(f64, f64)>>,
  }

  const FILE_NAME: &str = "window-size.json";

  #[derive(serde::Serialize, serde::Deserialize)]
  struct Saved {
    width: f64,
    height: f64,
  }

  pub fn load(app: &tauri::AppHandle) -> Option<(f64, f64)> {
    let path = app.path().app_config_dir().ok()?.join(FILE_NAME);
    let saved: Saved = serde_json::from_str(&std::fs::read_to_string(path).ok()?).ok()?;
    (saved.width.is_finite() && saved.width > 0.0 && saved.height.is_finite() && saved.height > 0.0)
      .then_some((saved.width, saved.height))
  }

  pub fn save(app: &tauri::AppHandle, (width, height): (f64, f64)) {
    let Ok(dir) = app.path().app_config_dir() else { return };
    if let Err(err) = std::fs::create_dir_all(&dir) {
      log::warn!("failed to create the config dir for the window size: {err}");
      return;
    }
    match serde_json::to_string(&Saved { width, height }) {
      Ok(text) => {
        if let Err(err) = std::fs::write(dir.join(FILE_NAME), text) {
          log::warn!("failed to save the window size: {err}");
        }
      }
      Err(err) => log::warn!("failed to serialise the window size: {err}"),
    }
  }

  /// GTK가 아는 내용 크기(논리 px). CSD 그림자·타이틀바를 뺀 값이다.
  pub fn content_size(window: &tauri::WebviewWindow) -> Option<(f64, f64)> {
    use gtk::prelude::*;
    let (width, height) = window.gtk_window().ok()?.size();
    (width > 0 && height > 0).then_some((width as f64, height as f64))
  }

  /// 내용 기준 경계에 델타를 더해 프레임 기준 힌트로 건다.
  pub fn apply_hints(window: &tauri::WebviewWindow, bounds: Bounds, delta: (f64, f64)) {
    let _ = window.set_min_size(Some(Size::Logical(LogicalSize {
      width: bounds.min.0 + delta.0,
      height: bounds.min.1 + delta.1,
    })));
    let _ = window.set_max_size(Some(Size::Logical(LogicalSize {
      width: bounds.max.0 + delta.0,
      height: bounds.max.1 + delta.1,
    })));
  }

  /// Resized 이벤트마다 내용 크기를 기억하고, 프레임−내용 델타가 바뀌면 힌트를 다시 건다.
  pub fn on_resized(window: &tauri::WebviewWindow, frame: PhysicalSize<u32>) {
    let Some(content) = content_size(window) else { return };
    let state = window.state::<State>();
    *state.content.lock().unwrap() = Some(content);

    let Ok(scale) = window.scale_factor() else { return };
    let frame = frame.to_logical::<f64>(scale);
    let delta = (
      (frame.width - content.0).max(0.0),
      (frame.height - content.1).max(0.0),
    );
    let changed = {
      let mut current = state.delta.lock().unwrap();
      if *current == Some(delta) {
        false
      } else {
        *current = Some(delta);
        true
      }
    };
    if changed {
      if let Some(bounds) = *state.bounds.lock().unwrap() {
        apply_hints(window, bounds, delta);
        log::info!(
          "window frame-content delta (logical): {}x{} — size hints re-applied",
          delta.0,
          delta.1
        );
      }
    }
  }
}

// TODO: CSP 설정 — tauri.conf.json의 `app.security.csp`(현재 null)에 실기기 런타임 검증과 함께
// 값을 채워야 한다. currency API·GitHub updater 엔드포인트용 connect-src 허용이 필요.
// (JSON 설정 파일은 주석을 지원하지 않아 이 메모를 여기 남긴다.)
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // 반드시 tauri::Builder::default() 이전에 호출. Builder 초기화가 GTK 세션 백엔드를 확정한다.
  configure_gdk_backend();

  // Windows에서만 창을 숨긴 채 만든다(tauri.windows.conf.json의 visible:false — JSON merge patch는
  // 배열을 통째로 바꾸므로 main 창 항목 전체가 거기 반복돼 있다). window-state 플러그인이
  // on_window_ready에서 저장된 위치·크기를 복원한 뒤 직접 show() 하므로, 처음부터 보이면
  // Windows는 OS 기본 좌표에 떴다가 WebView2 초기화 후(2~3초) 저장 위치로 점프하는 게 보인다.
  // Linux는 보이는 채로 만든다: tao 0.35의 Wayland CSD는 숨겨 만든 창을 나중에 show하면
  // 타이틀바 입력 영역이 갱신되지 않아 최소화·닫기 버튼이 안 눌린다(tauri#13440, 0.13.2 실기기
  // 재현). 근본 수정은 tao 0.36(tauri-apps/tao#1218, Tauri 2.12 예정). Wayland는 어차피
  // 앱이 창 위치를 못 정하니 점프 문제도 없다. 플러그인을 빼거나 denylist에 넣으면 Windows
  // 창이 영영 안 보이니 주의.
  // Linux에서는 크기 저장·복원을 linux_geometry가 맡는다(플러그인은 프레임 크기를 저장해
  // 내용 크기로 복원하므로 실행마다 창이 자란다 — 모듈 주석 참고).
  let state_flags = {
    use tauri_plugin_window_state::StateFlags;
    #[cfg(target_os = "linux")]
    {
      StateFlags::all() & !StateFlags::SIZE
    }
    #[cfg(not(target_os = "linux"))]
    {
      StateFlags::all()
    }
  };

  let mut builder = tauri::Builder::default()
    .plugin(
      tauri_plugin_window_state::Builder::default()
        .with_state_flags(state_flags)
        .build(),
    )
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

        // WebKitGTK는 데스크톱 텍스트 배율만큼 페이지 전체를 확대한다. 그대로 두면 두 가지가
        // 어긋난다: (1) 화면에 그려지는 글자와 버튼이 같은 데스크톱의 다른 앱보다 그 비율만큼
        // 커지고(Chromium 기반인 Electron 빌드는 이 배율을 적용하지 않는다), (2) CSS 픽셀과
        // 창의 논리 픽셀이 달라져 아래 창 크기 계산이 전부 배율에 얽힌다.
        //
        // 역수 줌을 걸어 상쇄하면 CSS 픽셀 = 창 논리 픽셀이 되어 두 문제가 함께 사라진다.
        // Linux 외 플랫폼에서는 ui_scale()이 1.0이라 무동작이다.
        let ui = ui_scale();
        if (ui - 1.0).abs() > f64::EPSILON {
          if let Err(err) = window.set_zoom(1.0 / ui) {
            log::warn!("failed to neutralise the {ui}x desktop text scaling: {err}");
          }
        }

        // visible:false로 만든 창은 setup 시점에 아직 realize되지 않아(GdkWindow 없음)
        // current_monitor()가 None을 돌려준다. 그러면 아래 최소·최대 크기 계산이 통째로
        // 건너뛰어져 config의 minWidth/minHeight만 남는다 — 0.13.2 snap/dev에서 실측.
        // 창이 속한 모니터를 모르면 첫 모니터로 대신한다.
        let monitor = window.current_monitor().ok().flatten().or_else(|| {
          window
            .available_monitors()
            .ok()
            .and_then(|monitors| monitors.into_iter().next())
        });

        // 내용 기준 논리 픽셀 경계 (min, max). 모니터를 못 읽으면 None — config 값이 남는다.
        let bounds = monitor.map(|monitor| {
          let size = monitor.size();
          // 네이티브 Wayland에서는 `.setup()` 시점에 컴포지터가 아직 출력(output) 협상을
          // 끝내지 않아 scale_factor()가 0/비정상값을 반환할 수 있다(XWayland는 X11 API가
          // 동기식이라 이 문제가 없었다 — XWayland 강제가 항상 켜져 있던
          // 시절엔 드러나지 않던 경로). scale이 0이면 아래 연산이 전부 0으로 붕괴해
          // set_max_size(0, 0)이 호출되고 창이 거의 안 보일 만큼 쪼그라든다(실기기 재현,
          // 2026-07-12). 비정상 범위면 1.0으로 대체한다.
          let raw_scale = monitor.scale_factor();
          let scale = if raw_scale.is_finite() && raw_scale > 0.0 { raw_scale } else { 1.0 };
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

          // 데스크톱 확대 비율은 **창 크기로** 반영한다. 위에서 페이지 줌을 상쇄했으므로
          // 글자·아이콘·결과 필드·설정창처럼 CSS로 크기가 고정된 UI는 배율과 무관하게
          // 일정하게 그려지고, 대신 창이 그만큼 넓어져 키패드가 쓸 공간이 커진다.
          // 즉 "배율을 높였으니 앱을 크게 쓰겠다"는 의도는 살리되 화면 요소를 통째로
          // 확대하지는 않는다. 화면보다 큰 창은 쓸 수 없으므로 작업 영역으로 자른다.
          let min_width = (BASE_MIN_WIDTH * ui).min(work_width);
          let min_height = (BASE_MIN_HEIGHT * ui).min(work_height);
          let _ = window.set_min_size(Some(Size::Logical(LogicalSize {
            width: min_width,
            height: min_height,
          })));

          // 최대도 같은 이유로 배율만큼 천장을 올린다. 최대는 최소보다 작을 수 없다 —
          // 좁은 화면에서 둘이 뒤집히면 창 크기가 붕괴한다.
          let capped_max_width = (max_width * ui).min(work_width).max(min_width);
          let capped_max_height = (max_height * ui).min(work_height).max(min_height);
          let _ = window.set_max_size(Some(Size::Logical(LogicalSize {
            width: capped_max_width,
            height: capped_max_height,
          })));

          log::info!(
            "window bounds (logical): min={min_width}x{min_height} max={capped_max_width}x{capped_max_height} work={work_width}x{work_height}"
          );

          ((min_width, min_height), (capped_max_width, capped_max_height))
        });

        #[cfg(target_os = "linux")]
        {
          let bounds = bounds.map(|(min, max)| linux_geometry::Bounds { min, max });
          let state = linux_geometry::State::default();
          *state.bounds.lock().unwrap() = bounds;
          app.manage(state);

          // 지난번 내용 크기를 복원한다. 경계 밖이면 잘라 넣는다.
          if let Some((width, height)) = linux_geometry::load(app.handle()) {
            let (width, height) = match bounds {
              Some(b) => (width.clamp(b.min.0, b.max.0), height.clamp(b.min.1, b.max.1)),
              None => (width, height),
            };
            let _ = window.set_size(Size::Logical(LogicalSize { width, height }));
            log::info!("restored window content size (logical): {width}x{height}");
          }

          let tracked = window.clone();
          window.on_window_event(move |event| {
            if let tauri::WindowEvent::Resized(size) = event {
              linux_geometry::on_resized(&tracked, *size);
            }
          });
        }

        // Linux 외: tauri-plugin-window-state가 복원한 크기는 config의 minWidth/minHeight를
        // 무시하므로, 새 최소값보다 작게 복원됐으면 끌어올린다.
        #[cfg(not(target_os = "linux"))]
        if let Some(((min_width, min_height), _)) = bounds {
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
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app, event| {
      // Linux: 종료 직전에 마지막 내용 크기를 저장한다(창 닫기·앱 종료 명령 모두 여기로 온다).
      #[cfg(target_os = "linux")]
      if let tauri::RunEvent::Exit = event {
        if let Some(state) = app.try_state::<linux_geometry::State>() {
          if let Some(content) = *state.content.lock().unwrap() {
            linux_geometry::save(app, content);
          }
        }
      }
      #[cfg(not(target_os = "linux"))]
      let _ = (app, event);
    });
}
