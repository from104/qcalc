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
#                           app  = 실제 앱(Tauri/Android) — 아직 없음
#   --platform web|linux|windows|android   app 층의 대상 (기본 web)
#   --setup                 브라우저 설치 후 끝낸다 (다른 층은 돌지 않음)
#   --rebuild               dist/spa 를 강제로 다시 빌드 (E2E_REBUILD=1)
#   -- <args>               뒤의 인자는 그대로 playwright test 에 넘긴다
#
# 결과: test-results/summary.md(20줄 이하), summary.json, e2e-junit.xml, 단계별 *.log
# 종료 코드: 실패한 층이 하나라도 있으면 1
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
OUT=test-results

usage() { sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; }

LAYERS=()
PLATFORM=web
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
      case "$2" in web | linux | windows | android) PLATFORM="$2" ;; *) echo "알 수 없는 플랫폼: $2" >&2; exit 2 ;; esac
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
rm -f "$OUT/vitest.json" "$OUT/e2e-report.json" "$OUT/e2e-junit.xml"

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
  if "$@" >"$log" 2>&1; then status=pass; else status=fail; fi
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
        # cargo 통과 수를 detail 로
        passed=$(grep -o 'test result: [a-zA-Z]*\. [0-9]* passed' "$OUT/code-cargo.log" | awk '{s+=$4} END {print s+0}')
        node -e 'const fs=require("fs"); const f=process.argv[1]; const l=fs.readFileSync(f,"utf8").trim().split("\n");
          const last=JSON.parse(l.pop()); last.detail=process.argv[2]+" passed"; l.push(JSON.stringify(last)); fs.writeFileSync(f,l.join("\n")+"\n");' \
          "$STEPS" "$passed"
      else
        echo "[code] cargo      … skip (cargo 없음)"
        record code cargo skip 0 "cargo not installed" ""
      fi
      ;;
    web)
      run_step web playwright npx playwright test "${PW_ARGS[@]}"
      if grep -q "Executable doesn't exist\|Host system is missing dependencies" "$OUT/web-playwright.log"; then
        echo "  ! 브라우저가 준비되지 않았다 — scripts/test-suite.sh --setup 을 먼저 실행" >&2
      fi
      ;;
    app)
      echo "[app] $PLATFORM … not implemented yet (Tauri: WebdriverIO, Android: Playwright _android — e2e/README.md 로드맵)"
      record app "$PLATFORM" skip 0 "not implemented yet" ""
      ;;
  esac
done

echo
node scripts/test-summary.mjs "$OUT"
