#!/bin/bash
#
# QCalc 빌드 스크립트
# 사용법: ./build.sh [linux|win|android|flatpak|all] [--skip-install]
#

set -euo pipefail

# ── 색상 출력 ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }
step()  { echo -e "\n${BLUE}${BOLD}── $* ──${NC}"; }

# ── 프로젝트 설정 ──
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

BUILD_DIR="./package"
VERSION=$(node -p "require('./package.json').version" 2>/dev/null) || error "package.json에서 버전을 읽을 수 없습니다."
SKIP_INSTALL=false

# ── 인수 파싱 ──
BUILD_TYPE="${1:-all}"
[[ "${2:-}" == "--skip-install" ]] && SKIP_INSTALL=true

# ── 유틸리티 ──
require_cmd() {
    command -v "$1" &>/dev/null || error "'$1'이(가) 설치되어 있지 않습니다. $2"
}

elapsed() {
    local start=$1
    local end
    end=$(date +%s)
    local diff=$((end - start))
    echo "$((diff / 60))m $((diff % 60))s"
}

# ── 환경 체크 ──
check_env() {
    step "환경 체크"
    require_cmd node "https://nodejs.org 에서 설치하세요."
    require_cmd yarn "npm install -g yarn 으로 설치하세요."

    local node_ver
    node_ver=$(node -v | cut -d'v' -f2)
    local yarn_ver
    yarn_ver=$(yarn -v)
    info "Node.js $node_ver / Yarn $yarn_ver / Version $VERSION"
}

load_env() {
    if [ -f .env ]; then
        info ".env 파일 로드 중..."
        set -a
        # shellcheck disable=SC1091
        source .env
        set +a
    fi
}

install_deps() {
    if [ "$SKIP_INSTALL" = true ]; then
        info "의존성 설치 건너뜀 (--skip-install)"
        return
    fi
    step "의존성 설치"
    yarn install --immutable
}

update_fallback_rates() {
    step "환율 스냅샷 갱신"
    if npx tsx scripts/fetch-fallback-rates.ts; then
        info "환율 스냅샷 갱신 완료"
    else
        warn "환율 스냅샷 갱신 실패 — 기존 스냅샷을 사용합니다."
    fi
}

# ── 빌드 함수 ──
build_linux() {
    step "Linux 빌드"
    local start
    start=$(date +%s)

    quasar build -m electron -T linux

    mkdir -p "$BUILD_DIR"
    find dist/electron/Packaged -name "*.AppImage" -exec mv {} "$BUILD_DIR/QCalc-$VERSION-linux.AppImage" \; 2>/dev/null || true
    find dist/electron/Packaged -name "*.snap" -exec mv {} "$BUILD_DIR/QCalc-$VERSION-linux.snap" \; 2>/dev/null || true
    [ -f dist/electron/Packaged/latest-linux.yml ] && cp dist/electron/Packaged/latest-linux.yml "$BUILD_DIR/"

    info "Linux 빌드 완료 ($(elapsed "$start"))"
}

build_windows() {
    step "Windows 빌드"
    local start
    start=$(date +%s)

    require_cmd wine "Wine이 필요합니다: sudo apt install -y wine64 wine32"
    export WINEARCH=win64
    export WINEPREFIX=~/.wine64

    quasar build -m electron -T win32

    mkdir -p "$BUILD_DIR"
    mv dist/electron/Packaged/*.exe "$BUILD_DIR/QCalc-$VERSION-win.exe"
    [ -f dist/electron/Packaged/latest.yml ] && cp dist/electron/Packaged/latest.yml "$BUILD_DIR/"

    info "Windows 빌드 완료 ($(elapsed "$start"))"
}

build_android() {
    step "Android 빌드"
    local start
    start=$(date +%s)

    [ -z "${ANDROID_HOME:-}" ] && error "ANDROID_HOME 환경변수가 설정되지 않았습니다."
    [ ! -d "$ANDROID_HOME/platform-tools" ] && error "Android SDK platform-tools를 찾을 수 없습니다."

    quasar build -m capacitor -T android

    mkdir -p "$BUILD_DIR"
    local keystore="${MY_JKS_KEY_FILE:-src-capacitor/android/app/my-release-key.jks}"

    if [ -f "$keystore" ]; then
        info "서명된 APK 빌드 중..."
        (cd src-capacitor/android && ./gradlew assembleRelease)
        cp src-capacitor/android/app/build/outputs/apk/release/app-release.apk "$BUILD_DIR/QCalc-$VERSION-android.apk"
    else
        warn "키스토어 없음 ($keystore) — 디버그 APK로 대체"
        find src-capacitor/android/app/build/outputs/apk/debug -name "app-debug.apk" \
            -exec cp {} "$BUILD_DIR/QCalc-$VERSION-android-debug.apk" \; 2>/dev/null || true
    fi

    info "Android 빌드 완료 ($(elapsed "$start"))"
}

build_flatpak() {
    step "Flatpak 빌드"
    local start
    start=$(date +%s)

    require_cmd flatpak-builder "sudo apt install flatpak-builder 로 설치하세요."
    bash flatpak/build-flatpak.sh build

    # .flatpak 번들을 package 디렉토리로 복사
    mkdir -p "$BUILD_DIR"
    local flatpak_bundle="/tmp/qcalc-flatpak-builder/io.github.from104.qcalc.flatpak"
    if [ -f "$flatpak_bundle" ]; then
        cp "$flatpak_bundle" "$BUILD_DIR/QCalc-$VERSION-linux.flatpak"
    fi

    info "Flatpak 빌드 완료 ($(elapsed "$start"))"
}

# ── 사용법 ──
usage() {
    cat <<EOF
${BOLD}QCalc 빌드 스크립트 v$VERSION${NC}

사용법: $0 [TARGET] [OPTIONS]

Targets:
  linux       Linux (AppImage + Snap)
  win         Windows (exe, Wine 필요)
  android     Android (APK, Android SDK 필요)
  flatpak     Flatpak 패키지
  all         linux + win + android (기본값)

Options:
  --skip-install  의존성 설치 건너뜀

예시:
  $0 linux                  Linux만 빌드
  $0 all --skip-install     전체 빌드 (의존성 설치 생략)
EOF
}

# ── 메인 ──
main() {
    local total_start
    total_start=$(date +%s)

    check_env
    load_env
    install_deps
    update_fallback_rates

    case "$BUILD_TYPE" in
        linux)   build_linux ;;
        win)     build_windows ;;
        android) build_android ;;
        flatpak) build_flatpak ;;
        all)
            build_linux
            build_flatpak
            build_windows
            build_android
            ;;
        help|-h|--help)
            usage
            exit 0
            ;;
        *)
            error "알 수 없는 타깃: $BUILD_TYPE\n$(usage)"
            ;;
    esac

    echo ""
    info "${BOLD}빌드 완료!${NC} (총 $(elapsed "$total_start"))"
    [ -d "$BUILD_DIR" ] && info "결과물: $BUILD_DIR/" && ls -lh "$BUILD_DIR/"
}

main
