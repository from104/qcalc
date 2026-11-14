#!/usr/bin/env bash
# QCalc 자동 테스트 한 번에 돌리기 — LLM 없이 무인 실행. 안내: e2e/README.md
#
#   scripts/test-suite.sh                      # code + web (기본)
#   scripts/test-suite.sh --layer web -- --repeat-each=3 --project=webkit-desktop
#   scripts/test-suite.sh --setup              # Playwright 브라우저 설치(chromium, webkit)
#
# 옵션
#   --layer code|web|app    여러 번 줄 수 있다 (기본: code + web)
#                           code = yarn lint + vue-tsc + vitest + cargo test(src-tauri)
#                           web  = Playwright (운영 웹 빌드, 3개 프로젝트)
#                           app  = 실제 Tauri 앱 (Linux: Xvfb + tauri-driver + WebdriverIO, playwright.app.config.ts)
#   --platform linux|windows|android   app 층의 대상 (기본: 이 기계의 OS). 지금은 linux 만 — 나머지는 skip
#   --setup                 브라우저 설치 후 끝낸다 (다른 층은 돌지 않음)
#   --rebuild               dist/spa 와 app 층 바이너리를 강제로 다시 빌드 (E2E_REBUILD=1)
#   -- <args>               뒤의 인자는 그대로 playwright test 에 넘긴다 (web·app 층 모두)
#
# 결과: test-results/summary.md(30줄 이하, 시작할 때 지우고 끝에 새로 씀 — 어떤 층을 돌렸는지 포함), summary.json, *-junit.xml, 단계별 *.log
# 종료 코드: 실패한 층이 하나라도 있으면 1
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
OUT=test-results

usage() { sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; }

LAYERS=()
PLATFORM=
SETUP=0
PW_ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --layer)
      [[ $# -ge 2 ]] || { echo "--layer 값이 없음" >&2; exit 2; }
      case "$2" in code | web | app) LAYERS+=("$2") ;; *) echo "알 수 없는 층: $2 (code|web|app)" >&2; exit 2 ;; esac
      shift 2 ;;
    --platform)
      [[ $# -ge 2 ]] || { echo "--platform 값이 없음" >&2; exit 2; }
      case "$2" in linux | windows | android) PLATFORM="$2" ;; *) echo "알 수 없는 플랫폼: $2 (linux|windows|android)" >&2; exit 2 ;; esac
      shift 2 ;;
    --setup) SETUP=1; shift ;;
    --rebuild) export E2E_REBUILD=1; shift ;;
    -h | --help) usage; exit 0 ;;
    --) shift; PW_ARGS=("$@"); break ;;
    *) echo "알 수 없는 옵션: $1 (--help)" >&2; exit 2 ;;
  esac
done
[[ ${#LAYERS[@]} -gt 0 ]] || LAYERS=(code web)

# ─── --setup ────────────────────────────────────────────────────────────────
webkit_launches() {
  node -e "require('playwright-core').webkit.launch().then(b => b.close()).then(() => process.exit(0), e => { console.error(String(e).split('\n').slice(0, 12).join('\n')); process.exit(1); })"
}

# sudo 없이: Playwright 가 부족하다고 보고한 lib* 패키지를 apt-get download 로 받아,
# 헤드리스 WebKit(minibrowser-wpe)의 ldd 가 "not found" 라고 하는 라이브러리만
# Playwright 캐시 안(minibrowser-*/sys/lib)에 넣는다. 시스템은 건드리지 않는다.
webkit_local_libs() {
  command -v apt-get >/dev/null && command -v dpkg-deb >/dev/null && command -v ldd >/dev/null || return 1
  local base="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}" wk tmp pkgs missing soname src dir round copied
  wk=$(find "$base" -maxdepth 2 -type d -path '*/webkit-*/minibrowser-wpe' | sort | tail -1)
  [[ -n "$wk" ]] || return 1
  pkgs=$(npx playwright install-deps --dry-run webkit 2>/dev/null | awk '/^ +lib/ && !/-(dev|common)$/ {print $1}')
  [[ -n "$pkgs" ]] || return 1
  tmp=$(mktemp -d)
  # shellcheck disable=SC2086 # 패키지 이름 목록을 단어로 나눈다
  (cd "$tmp" && apt-get download $pkgs >/dev/null 2>&1) || { rm -rf "$tmp"; return 1; }
  for deb in "$tmp"/*.deb; do dpkg-deb -x "$deb" "$tmp/x"; done
  for round in 1 2 3 4; do
    missing=$(for f in "$wk"/bin/* "$wk"/lib/*.so*; do LD_LIBRARY_PATH="$wk/lib:$wk/sys/lib" ldd "$f" 2>/dev/null; done |
      awk '/not found/ {print $1}' | sort -u)
    [[ -n "$missing" ]] || break
    copied=0
    for soname in $missing; do
      src=$(find "$tmp/x" -name "$soname" | head -1)
      [[ -n "$src" ]] || continue
      for dir in "$base"/webkit-*/minibrowser-*/sys/lib; do cp -L "$src" "$dir/$soname"; done
      echo "  → $soname (round $round)"
      copied=1
    done
    [[ $copied -eq 1 ]] || break
  done
  rm -rf "$tmp"
}

if [[ $SETUP -eq 1 ]]; then
  echo "[setup] Playwright 브라우저 설치: chromium, webkit"
  npx playwright install chromium webkit
  if webkit_launches 2>/dev/null; then
    echo "[setup] WebKit 실행 확인 — 준비 완료"
    exit 0
  fi
  echo "[setup] WebKit 이 시스템 라이브러리 부족으로 뜨지 않는다. 정식 해결(관리자 권한 필요):"
  echo
  echo "    sudo npx playwright install-deps webkit"
  echo
  echo "[setup] 지금은 sudo 없이 우회한다 — 부족한 라이브러리를 Playwright 캐시 안에만 풀어 넣는다."
  if webkit_local_libs && webkit_launches 2>/dev/null; then
    echo "[setup] WebKit 실행 확인 (로컬 라이브러리 우회) — 준비 완료"
    exit 0
  fi
  echo "[setup] 우회 실패 — 위 sudo 명령을 실행한 뒤 다시 시도해 주세요." >&2
  exit 1
fi

# ─── 단계 실행·기록 ─────────────────────────────────────────────────────────
mkdir -p "$OUT"
STEPS="$OUT/.steps.jsonl"
: >"$STEPS"
touch "$OUT/.started"
# 낡은 결과가 이번 실행의 요약으로 남지 않게 모두 지운다 (summary 는 맨 마지막에 새로 쓴다)
rm -f "$OUT/vitest.json" "$OUT/e2e-report.json" "$OUT/e2e-junit.xml" "$OUT/app-report.json" "$OUT/app-junit.xml" \
  "$OUT/app-orphans.json" "$OUT/summary.md" "$OUT/summary.json"

# 이전 실행이 SIGKILL 로 죽어 남긴 e2e 서버(serve.mjs)만 정리한다 — pid 파일의 PID 이고 cmdline 이 serve.mjs 일 때만
PIDFILE="$OUT/.e2e-server.pid"
kill_stale_server() {
  local pid
  [[ -f "$PIDFILE" ]] || return 0
  pid=$(cat "$PIDFILE" 2>/dev/null || true)
  if [[ "$pid" =~ ^[0-9]+$ && -r "/proc/$pid/cmdline" ]] && tr '\0' ' ' <"/proc/$pid/cmdline" 2>/dev/null | grep -q 'e2e/support/serve.mjs'; then
    echo "[web] 이전 실행이 남긴 e2e 서버(pid $pid)를 정리한다"
    kill "$pid" 2>/dev/null || true
    sleep 1
  fi
  rm -f "$PIDFILE"
}
trap kill_stale_server EXIT

# ─── app 층 정리 — 이름·패턴이 아니라 이번 실행의 고유 표지로만 ─────────────────────
# e2e/app/env-linux.ts 가 띄우는 모든 프로세스(Xvfb·dbus·tauri-driver → WebKitWebDriver → 앱 → WebKit 하위
# 프로세스)는 환경변수 QCALC_E2E_RUN=<토큰> 을 물려받는다. 토큰은 test-results/.app-run.json 에 있다.
# 러너가 SIGKILL 등으로 정리를 못 하고 죽었을 때를 대비해, 앱 층 앞뒤로 그 토큰을 가진 프로세스만 찾아 끝낸다.
APP_RUN="$OUT/.app-run.json"
app_marked_pids() {
  local token pid env
  [[ -f "$APP_RUN" ]] || return 0
  token=$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).token || "")' "$APP_RUN" 2>/dev/null) || return 0
  [[ "$token" =~ ^[0-9a-f-]{36}$ ]] || return 0
  for env in /proc/[0-9]*/environ; do
    pid=${env#/proc/}
    pid=${pid%/environ}
    [[ "$pid" == "$$" ]] && continue
    grep -qzxF "QCALC_E2E_RUN=$token" "$env" 2>/dev/null && echo "$pid"
  done
}
# 남은 표지 프로세스를 끝내고 그 수를 출력한다. 임시 프로필(qcalc-e2e-app-*)도 남았으면 지운다.
sweep_app_leftovers() {
  local pids profile
  mapfile -t pids < <(app_marked_pids)
  if [[ ${#pids[@]} -gt 0 ]]; then
    kill "${pids[@]}" 2>/dev/null || true
    sleep 1
    kill -9 "${pids[@]}" 2>/dev/null || true
  fi
  if [[ -f "$APP_RUN" ]]; then
    profile=$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).profile || "")' "$APP_RUN" 2>/dev/null || true)
    # 임시 폴더 바로 아래의 qcalc-e2e-app-* 만 지운다 (.app-run.json 이 이상해도 다른 곳은 건드리지 않게)
    if [[ -n "$profile" && -d "$profile" && "$(basename "$profile")" == qcalc-e2e-app-* &&
      "$(cd "$(dirname "$profile")" && pwd -P)" == "$(cd "${TMPDIR:-/tmp}" && pwd -P)" && -z "${E2E_KEEP_PROFILE:-}" ]]; then
      rm -rf -- "$profile"
    fi
  fi
  echo "${#pids[@]}"
}

host_platform() {
  case "$(uname -s)" in
    Linux) echo linux ;;
    Darwin) echo macos ;;
    MINGW* | MSYS* | CYGWIN*) echo windows ;;
    *) uname -s ;;
  esac
}

# record <layer> <step> <pass|fail|skip> <seconds> <detail> <log>
record() {
  node -e 'const [layer, step, status, seconds, detail, log] = process.argv.slice(1);
    process.stdout.write(JSON.stringify({ layer, step, status, seconds: Number(seconds), detail, log }) + "\n");' \
    "$@" >>"$STEPS"
}

# run_step <layer> <step> <command...> — 출력은 test-results/<layer>-<step>.log
run_step() {
  local layer="$1" step="$2" log="$OUT/$1-$2.log" start=$SECONDS status
  shift 2
  printf '[%s] %-10s … ' "$layer" "$step"
  # 9>&- : 자식이 앱 층 락을 물려받지 않게 (고아가 락을 쥐면 다음 실행이 정리도 못 한다)
  if "$@" >"$log" 2>&1 9>&-; then status=pass; else status=fail; fi
  printf '%s (%ss)\n' "$status" "$((SECONDS - start))"
  record "$layer" "$step" "$status" "$((SECONDS - start))" "" "$log"
}

for layer in "${LAYERS[@]}"; do
  case "$layer" in
    code)
      run_step code lint yarn lint
      run_step code typecheck npx vue-tsc --noEmit
      run_step code vitest yarn test --reporter=default --reporter=json --outputFile.json="$OUT/vitest.json"
      if command -v cargo >/dev/null; then
        run_step code cargo bash -c 'cd src-tauri && cargo test --quiet'
        # 통과·실패 수는 test-summary.mjs 가 로그에서 읽는다 (파싱 실패가 실행기를 죽이지 않게 여기서는 하지 않는다)
      else
        echo "[code] cargo      … skip (cargo 없음)"
        record code cargo skip 0 "cargo not installed" ""
      fi
      ;;
    web)
      kill_stale_server
      run_step web playwright npx playwright test ${PW_ARGS[@]+"${PW_ARGS[@]}"}
      if grep -q "Executable doesn't exist\|Host system is missing dependencies" "$OUT/web-playwright.log" 2>/dev/null; then
        echo "  ! 브라우저가 준비되지 않았다 — scripts/test-suite.sh --setup 을 먼저 실행" >&2
      fi
      ;;
    app)
      plat="${PLATFORM:-$(host_platform)}"
      if [[ "$plat" != linux || "$(host_platform)" != linux ]]; then
        # Windows 는 Phase 3(gh workflow — e2e-app.yml), Android 는 Phase 4
        echo "[app] $plat … not implemented on this host ($(host_platform))"
        record app "$plat" skip 0 "not implemented on this host ($(host_platform))" ""
        continue
      fi
      # 같은 체크아웃에서 앱 층이 동시에 두 번 돌면 앞의 정리가 뒤 실행의 프로세스를 죽인다 — 하나만 허용
      exec 9>"$OUT/.app-layer.lock"
      if ! flock -n 9; then
        echo "[app] 다른 앱 층 실행이 진행 중이다 — 이번 실행은 건너뛴다" >&2
        record app "$plat" fail 0 "another app-layer run holds $OUT/.app-layer.lock" ""
        continue
      fi
      stale=$(sweep_app_leftovers)
      [[ "$stale" == 0 ]] || echo "[app] 이전 실행이 남긴 프로세스 ${stale}개를 정리했다"
      run_step app build node e2e/app/build.mjs
      if grep -q '"step":"build","status":"fail"' "$STEPS"; then
        record app linux skip 0 "app build failed — test-results/app-build.log" ""
      else
        run_step app linux npx playwright test -c playwright.app.config.ts ${PW_ARGS[@]+"${PW_ARGS[@]}"}
      fi
      # 정상이면 globalSetup 의 teardown 이 이미 다 끝냈다 — 여기서 찾으면 정리 실패다
      start=$SECONDS
      left=$(sweep_app_leftovers)
      orphans=$(cat "$OUT/app-orphans.json" 2>/dev/null || echo '[]')
      if [[ "$left" == 0 ]]; then
        record app cleanup pass "$((SECONDS - start))" "0 leftover processes (teardown killed outside the tree: $orphans)" ""
      else
        echo "  ! 앱 층이 끝난 뒤 남은 프로세스 ${left}개를 정리했다" >&2
        record app cleanup fail "$((SECONDS - start))" "$left leftover processes had to be killed after the run" ""
      fi
      ;;
  esac
done

echo
node scripts/test-summary.mjs "$OUT" "${LAYERS[*]}"
