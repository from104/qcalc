#!/usr/bin/env bash
#
# 릴리스 전 로컬 검증 — 패키지를 만들고, 설치해 보고, 실제로 뜨는지 확인한다.
#
# CI는 빌드가 성공했다는 것까지만 말해 준다. 설치되는지, 설치된 것이 실행되는지는
# 다른 문제이며 0.13.0의 Snap이 그 차이로 깨진 채 릴리스됐다(#117).
#
#   사용법: scripts/verify-release.sh [타깃...]
#   타깃  : deb rpm appimage windows   (생략하면 이 넷을 모두)
#           flatpak snap 은 오래 걸려 기본에서 빠져 있다 — 이름을 직접 적어야 실행된다.
#
# 요구 사항
#   deb/rpm  docker (설치 검증용 컨테이너)
#   windows  cargo-xwin, makensis      — 설치는 아래 안내 참고
#   실행 검증은 현재 데스크톱 세션의 Wayland/X11 소켓을 그대로 쓴다.
#   따라서 검증 중에 창이 잠깐씩 떴다 사라진다.

set -uo pipefail

cd "$(dirname "$0")/.."
ROOT=$(pwd)
BUNDLE="$ROOT/src-tauri/target/release/bundle"
WIN_BUNDLE="$ROOT/src-tauri/target/x86_64-pc-windows-msvc/release/bundle"
# 검증 대상 버전. 모든 산출물 이름에 이 문자열이 들어간다(QCalc_0.13.1_amd64.deb 등).
VERSION=$(node -p "require('$ROOT/package.json').version")

# 앱이 이 시간만큼 살아 있으면 "떴다"로 본다. 0.13.0 AppImage는 1초도 못 버티고
# SIGSEGV로 죽었으므로 즉사 회귀는 이 정도로 충분히 잡힌다.
ALIVE_SECONDS=${ALIVE_SECONDS:-15}

PASS=(); FAIL=(); SKIP=()

info() { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m  ✔ %s\033[0m\n' "$*"; PASS+=("$*"); }
bad()  { printf '\033[1;31m  ✘ %s\033[0m\n' "$*"; FAIL+=("$*"); }
skip() { printf '\033[1;33m  – %s\033[0m\n' "$*"; SKIP+=("$*"); }

have() { command -v "$1" >/dev/null 2>&1; }

# 지금 버전의 산출물 경로를 돌려준다. 파일명에 공백이 있으므로 glob 결과를 그대로 쓴다.
#
# 버전으로 걸러야 한다. 번들 디렉터리는 빌드해도 비워지지 않아서, 버전을 올리고 나면
# 옛 산출물이 그대로 남아 glob이 둘 이상을 문다. 전에는 그때 빈 문자열을 돌려줬고
# 호출부는 그걸 "찾지 못함"으로 찍었다 — **있는데 없다고 보고했다.**
only() {
  local matches=("$@") m hits=()
  for m in "${matches[@]}"; do
    [ -e "$m" ] || continue
    case "$(basename "$m")" in *"$VERSION"*) hits+=("$m") ;; esac
  done
  [ ${#hits[@]} -eq 1 ] && printf '%s' "${hits[0]}"
}

# 파일 크기. `du`를 쓰면 안 된다 — ZFS는 쓰기를 지연 할당하므로 방금 만든 80MB
# AppImage가 txg 동기화 전까지 1.0K로 보인다. stat은 논리 크기를 바로 준다.
fsize() { numfmt --to=iec --suffix=B "$(stat -c%s "$1")"; }

# 앱을 띄워 ALIVE_SECONDS 동안 살아 있는지 본다. timeout이 죽였으면(124) 살아 있던 것이다.
run_alive() {
  local label=$1; shift
  local log; log=$(mktemp)
  timeout "$ALIVE_SECONDS" "$@" >"$log" 2>&1
  local rc=$?
  if [ $rc -eq 124 ]; then
    ok "$label — ${ALIVE_SECONDS}초 생존"
  else
    bad "$label — ${rc}번으로 조기 종료 $([ $rc -ge 128 ] && echo "(시그널 $((rc-128)))")"
    sed -n '1,10p' "$log" | sed 's/^/      /'
  fi
  rm -f "$log"
}

# 컨테이너 안에서 GUI를 띄우기 위한 인자. 호스트의 Wayland 소켓을 그대로 넘긴다.
# Wayland 세션이 아니면 아무것도 넘기지 않는다 — 그때는 설치까지만 검증된다.
docker_gui_args() {
  local sock="${XDG_RUNTIME_DIR:-}/${WAYLAND_DISPLAY:-}"
  [ -n "${WAYLAND_DISPLAY:-}" ] && [ -S "$sock" ] || return 0
  printf '%s\0' \
    -v "$sock:/run/user/0/$WAYLAND_DISPLAY" \
    -e "XDG_RUNTIME_DIR=/run/user/0" \
    -e "WAYLAND_DISPLAY=$WAYLAND_DISPLAY" \
    --device /dev/dri
}

build_linux() {
  info "리눅스 패키지 빌드 (deb, rpm, appimage)"
  # 업데이터 서명 키가 없으면 마지막에 에러로 끝나지만 번들 자체는 이미 만들어져 있다.
  yarn build:tauri --bundles deb,rpm,appimage >"$ROOT/.verify-linux-build.log" 2>&1
  if grep -q "Finished .* bundle" "$ROOT/.verify-linux-build.log"; then
    ok "리눅스 번들 생성"
  else
    bad "리눅스 번들 생성 실패 — .verify-linux-build.log 참고"
    tail -15 "$ROOT/.verify-linux-build.log" | sed 's/^/      /'
    return 1
  fi
}

verify_appimage() {
  info "AppImage"
  local f; f=$(only "$BUNDLE"/appimage/*.AppImage)
  [ -n "$f" ] || { bad "AppImage를 찾지 못함"; return; }
  ok "산출물 $(basename "$f") ($(fsize "$f"))"
  run_alive "AppImage 실행" "$f"
}

verify_deb() {
  info "deb"
  local f; f=$(only "$BUNDLE"/deb/*.deb)
  [ -n "$f" ] || { bad "deb를 찾지 못함"; return; }
  ok "산출물 $(basename "$f") ($(fsize "$f"))"

  # 경로는 앞 5개 필드(권한·소유자·크기·날짜·시각) 뒤 전부다. productName에 공백이
  # 있어 파일명이 잘리므로 $NF 같은 단일 필드로 자르면 안 된다.
  local bins
  bins=$(dpkg-deb -c "$f" | awk '{ $1=$2=$3=$4=$5=""; sub(/^ +/, ""); print }' |
    grep -E '^\.?/?usr/bin/.')
  printf '      /usr/bin: %s\n' "$(echo "$bins" | tr '\n' ' ')"

  have docker || { skip "deb 설치 검증 — docker 없음"; return; }
  local args=(); mapfile -d '' -t args < <(docker_gui_args)
  # 파일 하나만 넣는다. 디렉터리째 걸고 /pkg/*.deb 로 부르면 버전을 올린 뒤 남아 있는
  # 옛 산출물까지 함께 설치 대상이 된다 — 검증하려던 것이 아닌 것을 검증하게 된다.
  docker run --rm -v "$f":/pkg/pkg.deb:ro "${args[@]}" ubuntu:24.04 bash -c '
    apt-get update -qq && apt-get install -y -qq /pkg/pkg.deb >/dev/null 2>&1 || exit 1
    dpkg -s q-calc >/dev/null || exit 1
  ' >/dev/null 2>&1 \
    && ok "deb 설치 (ubuntu:24.04, 의존성 해결됨)" \
    || bad "deb 설치 실패 (ubuntu:24.04)"
}

verify_rpm() {
  info "rpm"
  local f; f=$(only "$BUNDLE"/rpm/*.rpm)
  [ -n "$f" ] || { bad "rpm을 찾지 못함"; return; }
  ok "산출물 $(basename "$f") ($(fsize "$f"))"

  have docker || { skip "rpm 설치·실행 검증 — docker 없음"; return; }
  local args=(); mapfile -d '' -t args < <(docker_gui_args)
  local out
  # deb 쪽과 같은 이유로 파일 하나만 넣는다. 디렉터리째 걸면 옛 버전의 rpm이 함께
  # 잡혀 dnf가 같은 패키지 두 버전으로 충돌해 실패한다 — 패키지 결함으로 오인된다.
  out=$(docker run --rm -v "$f":/pkg/pkg.rpm:ro "${args[@]}" fedora:41 bash -c "
    dnf install -y /pkg/pkg.rpm >/dev/null 2>&1 || { echo INSTALL_FAIL; exit 0; }
    echo \"INSTALLED \$(rpm -q q-calc)\"
    echo \"BIN \$(rpm -ql q-calc | grep '^/usr/bin/')\"
    timeout $ALIVE_SECONDS \$(rpm -ql q-calc | grep '^/usr/bin/' | head -1) >/dev/null 2>&1
    echo \"RUN \$?\"
  " 2>/dev/null)

  case "$out" in
    *INSTALL_FAIL*) bad "rpm 설치 실패 (fedora:41)"; return ;;
  esac
  ok "rpm 설치 (fedora:41, 의존성 해결됨)"
  printf '      %s\n' "$(echo "$out" | grep '^BIN ')"
  if echo "$out" | grep -q '^RUN 124$'; then
    ok "rpm 실행 — ${ALIVE_SECONDS}초 생존"
  else
    bad "rpm 실행 — $(echo "$out" | grep '^RUN ')"
  fi
}

verify_windows() {
  info "Windows (NSIS, 리눅스에서 크로스빌드)"
  if ! have cargo-xwin; then
    skip "Windows 빌드 — cargo-xwin 없음 (cargo install --locked cargo-xwin)"
    return
  fi
  if ! have makensis; then
    skip "Windows 빌드 — makensis 없음 (sudo apt install nsis)"
    return
  fi

  # tauri CLI는 --bundles 값을 호스트 기준으로 검증해 리눅스에서 nsis를 거부한다.
  # 번들러 자체는 makensis를 호출할 수 있으므로 설정으로 넘겨 그 검증만 우회한다.
  yarn tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc \
    --config '{"bundle":{"targets":["nsis"]}}' >"$ROOT/.verify-windows-build.log" 2>&1

  local f; f=$(only "$WIN_BUNDLE"/nsis/*-setup.exe)
  if [ -z "$f" ]; then
    bad "NSIS 인스톨러 생성 실패 — .verify-windows-build.log 참고"
    tail -15 "$ROOT/.verify-windows-build.log" | sed 's/^/      /'
    return
  fi
  ok "산출물 $(basename "$f") ($(fsize "$f"))"

  # 로컬에는 업데이터 서명 키가 없어 tauri가 인스톨러를 다 만든 뒤 마지막에 실패로
  # 끝난다. 인스톨러 자체는 멀쩡하므로 종료 코드가 아니라 산출물로 판정하고,
  # 빠진 것이 무엇인지만 밝혀 둔다. 서명은 CI가 시크릿으로 붙인다.
  grep -q 'TAURI_SIGNING_PRIVATE_KEY' "$ROOT/.verify-windows-build.log" \
    && skip "업데이터 서명(.sig) — 로컬에 서명 키 없음, CI가 붙인다"

  # file(1)은 "Nullsoft Installer self-extracting archive" 라고 쓴다. 예전 패턴이
  # 'Nsis' 였는데 그 문자열은 어느 판본에서도 나오지 않아 **항상 실패**했다.
  file "$f" | grep -qi 'nullsoft' \
    && ok "Nullsoft 인스톨러로 인식됨" \
    || bad "인스톨러 형식이 아님: $(file -b "$f")"

  # 이름을 tauri.conf.json에서 읽어 대조한다. 박아 두면 안 된다 — mainBinaryName이
  # 빠지면 tauri는 조용히 app.exe를 만들고, 그게 #117의 뿌리였다. 여기서 이름까지
  # 확인해야 그 회귀가 빌드 단계에서 잡힌다.
  local binname; binname=$(node -p "require('$ROOT/src-tauri/tauri.conf.json').mainBinaryName || ''")
  if [ -z "$binname" ]; then
    bad "tauri.conf.json에 mainBinaryName이 없음 — 산출물이 app.exe로 나간다 (#117)"
  else
    local app_exe="$ROOT/src-tauri/target/x86_64-pc-windows-msvc/release/$binname.exe"
    [ -f "$app_exe" ] && file "$app_exe" | grep -q "PE32+ executable" \
      && ok "앱 바이너리 $binname.exe 가 64비트 PE로 빌드됨" \
      || bad "$binname.exe 가 없거나 올바른 PE가 아님"
  fi

  # 설치·실행 검증은 Windows가 필요하다. Wine에서는 WebView2가 없어 의미가 없다.
  skip "Windows 설치·실행 검증 — Windows VM 필요 (빌드까지만 확인함)"
}

verify_flatpak() {
  info "Flatpak"
  have flatpak-builder || { skip "Flatpak — flatpak-builder 없음"; return; }
  local deb; deb=$(only "$BUNDLE"/deb/*.deb)
  [ -n "$deb" ] || { bad "Flatpak 빌드에 필요한 deb가 없음"; return; }
  cp "$deb" flatpak/qcalc.deb
  # 하위 명령을 반드시 준다. 인자 없이 부르면 build-flatpak.sh는 사용법만 찍고
  # 0으로 끝나므로, 아무것도 빌드하지 않은 채 통과로 잡힌다.
  ( cd flatpak && ./build-flatpak.sh build ) >"$ROOT/.verify-flatpak.log" 2>&1 \
    && ok "Flatpak 빌드" \
    || { bad "Flatpak 빌드 실패 — .verify-flatpak.log 참고"; return; }

  local bundle=/tmp/qcalc-flatpak-builder/io.github.from104.qcalc.flatpak
  [ -f "$bundle" ] || { bad "Flatpak 번들이 생성되지 않음: $bundle"; return; }

  # --user 로만 설치한다 — 시스템 설치는 sudo를 요구하고 다른 사용자에게도 보인다.
  # 이미 깔려 있으면 재설치가 아니라 갱신이 되도록 --reinstall 을 준다.
  flatpak install --user --noninteractive --reinstall --assumeyes "$bundle" \
    >>"$ROOT/.verify-flatpak.log" 2>&1 \
    && ok "Flatpak 설치" \
    || { bad "Flatpak 설치 실패 — .verify-flatpak.log 참고"; return; }

  # 번들 안에 실행 파일이 mainBinaryName대로 들어갔는지 본다. Snap이 이 자리에서
  # 엉뚱한 실행 파일을 집어 앱이 뜨지 않은 채 릴리스된 적이 있다(#117).
  flatpak run --command=sh io.github.from104.qcalc -c 'test -x /app/bin/qcalc' \
    >>"$ROOT/.verify-flatpak.log" 2>&1 \
    && ok "Flatpak /app/bin/qcalc 존재" \
    || bad "Flatpak 번들에 /app/bin/qcalc 가 없음"

  run_alive "Flatpak 실행" flatpak run io.github.from104.qcalc
}

verify_snap() {
  info "Snap"
  have snapcraft || { skip "Snap — snapcraft 없음"; return; }
  local deb; deb=$(only "$BUNDLE"/deb/*.deb)
  [ -n "$deb" ] || { bad "Snap 빌드에 필요한 deb가 없음"; return; }
  mkdir -p snap/local && cp "$deb" snap/local/qcalc.deb
  snapcraft pack >"$ROOT/.verify-snap.log" 2>&1 \
    && ok "Snap 빌드" \
    || { bad "Snap 빌드 실패 — .verify-snap.log 참고"; return; }
  # 0.13.0에서 깨진 지점이 정확히 여기다: 빌드는 됐지만 command가 앱이 아니었다.
  local snapf; snapf=$(only ./*.snap)
  if [ -n "$snapf" ]; then
    # 목록을 변수에 담아 놓고 본다. `unsquashfs -l | grep -q` 로 쓰면 안 된다 —
    # grep -q 는 첫 매치에서 즉시 끝나고, 아직 출력 중이던 unsquashfs 가 SIGPIPE 로
    # 죽어 pipefail 이 파이프라인을 실패로 판정한다. 즉 **찾았기 때문에 실패로 잡힌다.**
    local listing; listing=$(unsquashfs -l "$snapf" 2>/dev/null)
    case "$listing" in
      *usr/bin/qcalc*) ok "snap 안에 usr/bin/qcalc 존재" ;;
      *)               bad "snap 안에 usr/bin/qcalc 없음 — #117과 같은 회귀" ;;
    esac
  fi
  [ -n "$snapf" ] || { bad "snap 파일이 생성되지 않음"; return; }

  # 서명이 없는 로컬 snap이라 --dangerous 가 필요하고, 설치는 시스템 전역이라
  # sudo 를 요구한다. 검증이 끝나면 아래에서 제거한다.
  sudo snap install --dangerous "$snapf" >>"$ROOT/.verify-snap.log" 2>&1 \
    && ok "Snap 설치" \
    || { bad "Snap 설치 실패 — .verify-snap.log 참고"; return; }

  # #117의 본체: 빌드도 되고 설치도 됐지만 실행하면 앱이 아니라 bubblewrap이 떴다.
  # 그래서 '설치됐다'가 아니라 '실행해서 계속 떠 있다'를 봐야 한다.
  #
  # 다만 로컬에서는 이 호스트에서 만든 deb를 snap에 넣는다. snapcraft.yaml의 base가
  # core22(glibc 2.35)인데 호스트가 그보다 새 배포판이면, 바이너리가 요구하는 glibc가
  # 런타임에 없어 실행이 반드시 실패한다 — 패키지 결함이 아니라 로컬 검증의 한계다.
  # CI는 deb를 ubuntu-22.04에서 빌드하므로 이 어긋남이 없다.
  local hostglibc base_max
  hostglibc=$(ldd --version 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+$')
  base_max=2.35   # core22
  if [ -n "$hostglibc" ] && [ "$(printf '%s\n%s\n' "$base_max" "$hostglibc" | sort -V | tail -1)" != "$base_max" ]; then
    skip "Snap 실행 검증 — 호스트 glibc $hostglibc > core22의 $base_max, 로컬에서는 실행 불가 (CI는 ubuntu-22.04에서 빌드)"
  else
    run_alive "Snap 실행" snap run qcalc
  fi

  sudo snap remove --purge qcalc >>"$ROOT/.verify-snap.log" 2>&1 \
    && ok "Snap 제거 (검증 뒷정리)" \
    || bad "Snap 제거 실패 — 남아 있으니 직접 지울 것: sudo snap remove --purge qcalc"
}

TARGETS=("$@")
[ ${#TARGETS[@]} -eq 0 ] && TARGETS=(deb rpm appimage windows)

# 리눅스 패키지가 하나라도 필요하면 한 번만 빌드한다.
for t in "${TARGETS[@]}"; do
  case "$t" in
    deb|rpm|appimage|flatpak|snap) build_linux || exit 1; break ;;
  esac
done

for t in "${TARGETS[@]}"; do
  case "$t" in
    deb)      verify_deb ;;
    rpm)      verify_rpm ;;
    appimage) verify_appimage ;;
    windows)  verify_windows ;;
    flatpak)  verify_flatpak ;;
    snap)     verify_snap ;;
    *)        bad "알 수 없는 타깃: $t" ;;
  esac
done

printf '\n\033[1m결과\033[0m  통과 %d · 실패 %d · 건너뜀 %d\n' \
  "${#PASS[@]}" "${#FAIL[@]}" "${#SKIP[@]}"
for s in "${SKIP[@]}"; do printf '  – %s\n' "$s"; done
for f in "${FAIL[@]}"; do printf '  ✘ %s\n' "$f"; done
[ ${#FAIL[@]} -eq 0 ]
