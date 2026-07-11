#!/bin/bash

# QCalc Flatpak 빌드 스크립트
# 사용법: bash build-flatpak.sh [build|install|run|clean]
#
# 2단계 빌드 방식:
# 1단계: `yarn tauri build`로 .deb 패키지 빌드 (로컬, Rust/cargo 필요)
# 2단계: flatpak-builder로 .deb를 Flatpak으로 패키징

set -e
set -u
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_ID="io.github.from104.qcalc"
MANIFEST="$SCRIPT_DIR/$APP_ID.yml"
# 빌드 아티팩트는 프로젝트 밖에 배치 (Vite 워처의 심볼릭 링크 루프 방지)
BUILD_DIR="/tmp/qcalc-flatpak-builder"
STATE_DIR="/tmp/qcalc-flatpak-state"
REPO_DIR="/tmp/qcalc-flatpak-repo"
DEB_FILE="$SCRIPT_DIR/qcalc.deb"
ICONS_DIR="$SCRIPT_DIR/icons"

# 색상 출력
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info() { echo -e "${GREEN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# 사전 조건 확인
check_prerequisites() {
    info "사전 조건 확인 중..."

    if ! command -v flatpak-builder &> /dev/null; then
        error "flatpak-builder가 설치되어 있지 않습니다.
설치 방법:
  Ubuntu/Debian: sudo apt install flatpak-builder
  Fedora:        sudo dnf install flatpak-builder
  Arch:          sudo pacman -S flatpak-builder"
    fi

    if ! command -v flatpak &> /dev/null; then
        error "flatpak이 설치되어 있지 않습니다."
    fi

    # 런타임 및 SDK 설치 확인 (org.freedesktop.* 에는 WebKitGTK가 없으므로
    # org.gnome.Platform/Sdk를 사용한다 — GNOME 런타임이 webkit2gtk-4.1을 내장)
    if ! flatpak info org.gnome.Platform//46 &> /dev/null; then
        warn "org.gnome.Platform//46이 설치되지 않았습니다. 설치합니다..."
        flatpak install -y --user flathub org.gnome.Platform//46
    fi

    if ! flatpak info org.gnome.Sdk//46 &> /dev/null; then
        warn "org.gnome.Sdk//46이 설치되지 않았습니다. 설치합니다..."
        flatpak install -y --user flathub org.gnome.Sdk//46
    fi

    info "사전 조건 확인 완료."
}

# 1단계: Tauri 앱 로컬 빌드 (.deb)
build_tauri() {
    info "1단계: Tauri 앱 빌드 중..."
    cd "$PROJECT_DIR"

    # 의존성 설치
    if [ ! -d "node_modules" ]; then
        info "의존성 설치 중..."
        yarn install
    fi

    info "yarn tauri build 시작 (Rust/cargo 필요)..."
    yarn tauri build --bundles deb

    # 빌드된 .deb 확인
    DEB_SRC=$(find "$PROJECT_DIR/src-tauri/target/release/bundle/deb" -maxdepth 1 -name '*.deb' | head -n1)
    if [ -z "$DEB_SRC" ]; then
        error ".deb 파일을 찾을 수 없습니다: $PROJECT_DIR/src-tauri/target/release/bundle/deb
tauri.conf.json의 bundle.targets에 deb가 포함되어 있는지 확인하세요."
    fi

    # flatpak 디렉토리로 복사
    info "빌드 결과물을 flatpak 디렉토리로 복사 중..."
    cp -f "$DEB_SRC" "$DEB_FILE"

    # 아이콘 복사
    mkdir -p "$ICONS_DIR"
    cp "$PROJECT_DIR/src-tauri/icons/128x128@2x.png" "$ICONS_DIR/io.github.from104.qcalc.png"

    info "1단계 완료: qcalc.deb 준비됨."
}

# 2단계: Flatpak 빌드
build_flatpak() {
    check_prerequisites

    # .deb가 없으면 먼저 빌드
    if [ ! -f "$DEB_FILE" ]; then
        warn "qcalc.deb가 없습니다. Tauri 앱을 먼저 빌드합니다..."
        build_tauri
    fi

    info "2단계: Flatpak 빌드 시작..."
    cd "$SCRIPT_DIR"

    flatpak-builder \
        --force-clean \
        --user \
        --state-dir="$STATE_DIR" \
        --install-deps-from=flathub \
        --disable-updates \
        --repo="$REPO_DIR" \
        "$BUILD_DIR/build" \
        "$MANIFEST"

    # .flatpak 번들 생성
    BUNDLE_FILE="$BUILD_DIR/$APP_ID.flatpak"
    info "Flatpak 번들 생성 중..."
    flatpak build-bundle "$REPO_DIR" "$BUNDLE_FILE" "$APP_ID"

    info "Flatpak 빌드 완료! 번들: $BUNDLE_FILE"
}

# Flatpak 설치 (로컬)
install_app() {
    # .deb가 없으면 먼저 빌드
    if [ ! -f "$DEB_FILE" ]; then
        warn "qcalc.deb가 없습니다. Tauri 앱을 먼저 빌드합니다..."
        build_tauri
    fi

    check_prerequisites

    info "Flatpak 빌드 및 로컬 설치 중..."
    cd "$SCRIPT_DIR"

    flatpak-builder \
        --force-clean \
        --user \
        --install \
        --state-dir="$STATE_DIR" \
        --install-deps-from=flathub \
        --disable-updates \
        "$BUILD_DIR/build" \
        "$MANIFEST"

    info "설치 완료! 'flatpak run $APP_ID'로 실행할 수 있습니다."
}

# Flatpak 실행
run_app() {
    if ! flatpak info --user "$APP_ID" &> /dev/null; then
        error "$APP_ID가 설치되어 있지 않습니다. 먼저 'bash $0 install'을 실행하세요."
    fi

    info "앱 실행 중..."
    flatpak run "$APP_ID"
}

# 빌드 아티팩트 정리
clean() {
    info "빌드 아티팩트 정리 중..."
    rm -rf "$BUILD_DIR" "$STATE_DIR" "$REPO_DIR" "$DEB_FILE" "$ICONS_DIR"
    info "정리 완료."
}

# 사용법 출력
usage() {
    echo "사용법: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  tauri       1단계: Tauri 앱 로컬 빌드 (qcalc.deb 생성, Rust/cargo 필요)"
    echo "  build       2단계: Flatpak 빌드 (qcalc.deb 필요)"
    echo "  install     전체 빌드 + Flatpak 로컬 설치"
    echo "  run         설치된 Flatpak 앱 실행"
    echo "  clean       빌드 아티팩트 정리"
    echo ""
    echo "첫 빌드 시에는 'install'을 사용하세요."
    echo "이미 qcalc.deb가 빌드되어 있다면 'build'만 실행해도 됩니다."
}

# 인수 처리
COMMAND="${1:-}"

case "$COMMAND" in
    tauri)
        build_tauri
        ;;
    build)
        build_flatpak
        ;;
    install)
        install_app
        ;;
    run)
        run_app
        ;;
    clean)
        clean
        ;;
    *)
        usage
        ;;
esac
