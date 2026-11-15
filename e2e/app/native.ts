/**
 * native — what only the real desktop app can show: Tauri commands, the native window, the app process,
 * the on-disk profile, the system clipboard and the accessibility bus. App layer only.
 * Linux: Xvfb, runs everything. Windows (CI): the scenarios that need X windows ('xwindow') or AT-SPI ('atspi') skip
 * with that reason; the rest run against WebView2 — the clipboard through PowerShell, and Control+v through
 * navigator.clipboard (read_clipboard_text is Linux-only, lib.rs), so Windows outcomes there are unmeasured until CI says.
 *
 * Expected values come from the code:
 * - window: tauri.conf.json width/height 480×756; lib.rs BASE_MIN 384×604 × UI scale (1.0 under Xvfb: no
 *   XSETTINGS → gtk-xft-dpi unset); max = (work width / 2, work height × 2/3) on a landscape screen
 *   → 1280×960 on the 2560×1440 Xvfb screen (env-linux.ts SCREEN).
 * - window size is saved by lib.rs linux_geometry on RunEvent::Exit (window-size.json) — only a graceful exit
 *   (App.vue 'q' → quit_app → app.exit(0)) gets there; a WebDriver session end kills the process.
 * - Control+v / Shift+Control+v → ResultField.vue handlePaste('main' | 'sub') → read_clipboard_text (#109).
 * - '=' → ResultField.vue announce → announce_a11y → ATK `announcement` → AT-SPI object:announcement.
 * - theme applied → themesStore.updateTheme → set_boot_background → boot-bg.txt in the config dir.
 */
import { TAURI_LINUX_COPY_BUG } from '../scenarios/keyboard';
import { defineGroup, eventually, expectClipboard, expectMain, expectSub, tapKeys, typeKeys } from '../scenarios/kit';
import { SCREEN } from './env-linux';
import { DEFAULT_SIZE, MIN_SIZE, type TauriApp } from './tauri-app';

const MAX_SIZE = { width: SCREEN.width / 2, height: (SCREEN.height * 2) / 3 };

const sameSize = (expected: { width: number; height: number }) => (actual: { width: number; height: number }) =>
  actual.width === expected.width && actual.height === expected.height;

const expectInner = (app: TauriApp, expected: { width: number; height: number }) =>
  eventually('웹뷰 크기(innerWidth×innerHeight)', () => app.innerSize(), sameSize(expected));

/** the app's top-level X window (the 10×10 GTK leader window is filtered out) */
const expectNativeWindow = (app: TauriApp, expected: { width: number; height: number }) =>
  eventually(
    'X 창(xwininfo)',
    async () => app.nativeWindows(),
    (windows) => windows.length === 1 && sameSize(expected)(windows[0]!),
  );

export default defineGroup<TauriApp>('native', [
  {
    title: '부팅: X 창 하나가 480×756 으로 뜨고 창 제목 = 문서 제목',
    needs: ['xwindow'],
    run: async (app) => {
      await app.step('X 창이 하나 뜨고 크기는 480×756', () => expectNativeWindow(app, DEFAULT_SIZE));
      await app.step('창 제목(_NET_WM_NAME)이 document.title 과 같다 (tauri-shim setTitle)', async () => {
        const title = await app.browser.getTitle();
        if (!title) throw new Error('document.title 이 비어 있다');
        const [win] = app.nativeWindows();
        await eventually('창 제목', async () => app.nativeTitle(win!.id), title);
      });
    },
  },
  {
    title: '부팅: Tauri IPC 연결 · 둘러보는 동안 오류 없음',
    run: async (app) => {
      await app.step('window.globalVars: isTauri · isE2E', async () => {
        const flags = await app.browser.execute(() => {
          const g = (window as unknown as { globalVars?: { isTauri?: boolean; isE2E?: boolean } }).globalVars;
          return { isTauri: g?.isTauri ?? null, isE2E: g?.isE2E ?? null };
        });
        if (!flags.isTauri || !flags.isE2E) throw new Error(`globalVars ${JSON.stringify(flags)}`);
      });
      await app.step('모든 탭·화면을 돌아도 uncaught error · unhandled rejection · console.error 가 없다', async () => {
        await app.recordErrors();
        for (const tab of ['unit', 'currency', 'radix', 'formula', 'calc'] as const) await app.tab(tab);
        for (const screen of ['settings', 'help', 'about', 'record', 'calc'] as const) await app.openScreen(screen);
        await tapKeys(app, 'C7*6=');
        await expectMain(app, '42');
        const errors = await app.recordedErrors();
        if (errors.length) throw new Error(`오류 ${errors.length}건: ${errors.join(' | ').slice(0, 300)}`);
      });
    },
  },
  {
    title: 'get_package_env: 일반 설치(native)로 판정 · Snap/Flatpak 아님',
    run: async (app) => {
      const env = await app.invoke<string>('get_package_env');
      if (env !== 'native') throw new Error(`get_package_env = ${JSON.stringify(env)} (기대 "native")`);
      const flags = await app.browser.execute(() => {
        const g = (window as unknown as { globalVars?: { isSnap?: boolean; isFlatpak?: boolean } }).globalVars;
        return { isSnap: g?.isSnap, isFlatpak: g?.isFlatpak };
      });
      if (flags.isSnap !== false || flags.isFlatpak !== false) throw new Error(`globalVars ${JSON.stringify(flags)}`);
    },
  },
  {
    title: 'Control+v: 다른 프로그램이 가진 시스템 클립보드를 메인 칸에 붙인다 (read_clipboard_text, #109)',
    run: async (app) => {
      // WebKitGTK refuses navigator.clipboard.readText() here; the paste only works through the Rust command
      await app.setClipboard('1234.5');
      await app.key('Control+v');
      await expectMain(app, '1,234.5');
      await app.step('바뀐 클립보드는 다시 읽는다', async () => {
        await app.setClipboard('77');
        await app.key('Control+v');
        await expectMain(app, '77');
      });
    },
  },
  {
    title: '단위 탭: Control+v 는 메인, Shift+Control+v 는 보조 칸에 들어간다',
    run: async (app) => {
      // seed: length m → cm (fixtures/seed.ts)
      await app.tab('unit');
      await app.step('Control+v 2 → 메인 2 (m), 보조 200 (cm)', async () => {
        await app.setClipboard('2');
        await app.key('Control+v');
        await expectMain(app, '2');
        await expectSub(app, '200');
      });
      await app.step('Shift+Control+v 300 → 보조 300 (cm), 메인 3 (m)', async () => {
        await app.setClipboard('300');
        await app.key('Shift+Control+v');
        await expectSub(app, '300');
        await expectMain(app, '3');
      });
    },
  },
  {
    title: 'Control+c: 메인 칸 표시값이 시스템 클립보드로 간다 (밖에서 읽기)',
    knownBugOn: {
      'tauri-linux': {
        bug: TAURI_LINUX_COPY_BUG,
        symptom: /클립보드: .*"1,234\.5".*마지막 값 ""/,
      },
    },
    run: async (app) => {
      await tapKeys(app, 'C1234.5');
      await expectMain(app, '1,234.5');
      await app.setClipboard('sentinel');
      await app.key('Control+c');
      await expectClipboard(app, '1,234.5');
    },
  },
  {
    title: 'Shift+Control+c: 보조 칸 표시값이 시스템 클립보드로 간다 (단위 탭)',
    run: async (app) => {
      await app.tab('unit');
      await tapKeys(app, 'C2');
      await expectSub(app, '200');
      await app.setClipboard('sentinel');
      await app.key('Shift+Control+c');
      // displayedResult of the sub field carries the unit (keyboard.ts header)
      await expectClipboard(app, '200 cm');
    },
  },
  {
    title: '창: 첫 실행 크기 480×756 — 웹뷰 = X 창, 저장 파일 없음',
    needs: ['xwindow'],
    run: async (app) => {
      await app.relaunch({ fresh: true });
      await expectInner(app, DEFAULT_SIZE);
      await expectNativeWindow(app, DEFAULT_SIZE);
      if (app.configFile('window-size.json') !== null) throw new Error('새 프로필인데 window-size.json 이 있다');
    },
  },
  {
    title: '창: 최소 384×604 · 최대(작업 영역 1/2 × 2/3) 밖으로는 커지거나 줄지 않는다',
    needs: ['xwindow'],
    run: async (app) => {
      await app.step('200×200 요청 → 최소 384×604', async () => {
        await app.requestWindowSize(200, 200);
        await expectInner(app, MIN_SIZE);
        await expectNativeWindow(app, MIN_SIZE);
      });
      await app.step(`4000×4000 요청 → 최대 ${MAX_SIZE.width}×${MAX_SIZE.height}`, async () => {
        await app.requestWindowSize(4000, 4000);
        await expectInner(app, MAX_SIZE);
        await expectNativeWindow(app, MAX_SIZE);
      });
      await app.step('앱은 여전히 동작한다', async () => {
        await tapKeys(app, 'C9*9=');
        await expectMain(app, '81');
      });
    },
  },
  {
    title: '창 크기: q 로 끝내고 다시 켜면 그 크기로 뜬다 (window-size.json)',
    needs: ['xwindow'],
    run: async (app) => {
      await app.relaunch({ fresh: true });
      await app.seed(); // e2e page without first-run dialogs, so 'q' reaches the app's key binding
      await app.requestWindowSize(520, 800);
      await expectInner(app, { width: 520, height: 800 });
      await app.step("'q' → 앱이 스스로 끝난다 (quit_app)", () => app.quit('key'));
      await app.step('window-size.json 에 내용 크기가 저장됐다', async () => {
        const saved = JSON.parse(app.configFile('window-size.json') ?? 'null') as {
          width: number;
          height: number;
        } | null;
        if (!saved || !sameSize({ width: 520, height: 800 })(saved))
          throw new Error(`window-size.json = ${JSON.stringify(saved)}`);
      });
      await app.step('다시 켜면 520×800', async () => {
        await app.relaunch();
        await expectInner(app, { width: 520, height: 800 });
        await expectNativeWindow(app, { width: 520, height: 800 });
      });
    },
  },
  {
    title: "'q' 로 끝내고 다시 켜도 키패드는 평상 상태다 · Shift+q(sin)는 앱을 끄지 않는다",
    // 회귀 시험: 예전에는 'q' 가 앱 종료(App.vue)이면서 shift 기능 sin(CalcButtonSet.ts a3)의 단축키라, 끝내기 직전
    // triggerButtonClickByKey 가 켠 shift 고정이 저장돼 다시 켜면 숫자 키가 Pi·phi·e… 로 눌렸다.
    // 이제 shift 기능 q·w·e 줄은 Shift+q/w/e 이고 'q' 단독은 종료만 한다.
    run: async (app) => {
      await app.step('Shift+q 는 sin 이고 앱을 끄지 않는다', async () => {
        await tapKeys(app, 'C5');
        await app.key('Shift+q');
        await tapKeys(app, 'C7');
        await expectMain(app, '7');
      });
      await app.step("'q' 로 끝내고 다시 켠다", async () => {
        await tapKeys(app, 'C5');
        await expectMain(app, '5');
        await app.quit('key');
        await app.relaunch();
        await app.openE2E();
      });
      await app.step('키패드는 shift 고정이 아니다 (C → MC, 1 → Pi 가 아니다)', async () => {
        await tapKeys(app, 'C12');
        await expectMain(app, '12');
      });
    },
  },
  {
    title: '저장소: 계산 기록과 설정이 앱을 끄고 켠 뒤에도 남는다 (WebKit localStorage 디스크 저장)',
    run: async (app) => {
      await app.step('7*6= 계산 · 천 단위 구분 끄기(,)', async () => {
        await tapKeys(app, '7*6=');
        await expectMain(app, '42');
        await typeKeys(app, ',');
        await tapKeys(app, 'C1234');
        await expectMain(app, '1234');
      });
      await app.step('quit_app 으로 끝내고 시드 없이 다시 켠다', async () => {
        await app.quit('command');
        await app.relaunch();
        await app.openE2E();
      });
      await app.step('천 단위 구분이 꺼진 채다', async () => {
        await tapKeys(app, 'C1234');
        await expectMain(app, '1234');
      });
      await app.step('기록에 7 × 6= 42 가 남아 있다', async () => {
        await app.openScreen('record');
        await eventually('기록 첫 줄', async () => (await app.recordTexts())[0], '7 × 6= 42');
      });
    },
  },
  {
    title: "'=' 결과를 스크린리더에 알린다 (announce_a11y → AT-SPI object:announcement), 앱은 살아 있다",
    needs: ['atspi'],
    run: async (app) => {
      const listener = await app.startAnnouncementListener();
      try {
        await tapKeys(app, 'C7*6=');
        await expectMain(app, '42');
        await eventually(
          'AT-SPI 알림',
          async () => listener.all(),
          (heard) => heard.some((a) => a.app === 'qcalc' && /42/.test(a.text)),
        );
        // ATK without the announcement signal used to abort the app here (memory: atk-announcement-old-atk-crash)
        if (app.appPid() === null) throw new Error("'=' 뒤에 앱 프로세스가 없다");
      } finally {
        await listener.stop();
      }
    },
  },
  {
    title: '첫 페인트 배경: 테마 배경색이 boot-bg.txt 로 저장된다 (set_boot_background)',
    run: async (app) => {
      // themesStore: body background, or white when the body is transparent (light mode)
      const expected = await app.browser.execute(() => {
        const bg = getComputedStyle(document.body).backgroundColor;
        return bg === 'transparent' || /rgba\(.*,\s*0\)$/.test(bg) ? 'rgb(255, 255, 255)' : bg;
      });
      await eventually('boot-bg.txt', async () => app.configFile('boot-bg.txt'), expected);
    },
  },
]);
