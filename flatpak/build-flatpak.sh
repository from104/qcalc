#!/bin/bash

# QCalc Flatpak 빌드 스크립트
# 사용법: bash build-flatpak.sh [build|install|run|clean]
#
# 2단계 빌드 방식:
# 1단계: Quasar + electron-builder로 linux-unpacked 디렉토리 빌드 (로컬)
# 2단계: flatpak-builder로 linux-unpacked를 Flatpak으로 패키징

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
LINUX_UNPACKED="$SCRIPT_DIR/linux-unpacked"
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

    # 런타임 및 SDK 설치 확인
    if ! flatpak info org.freedesktop.Platform//24.08 &> /dev/null; then
        warn "org.freedesktop.Platform//24.08이 설치되지 않았습니다. 설치합니다..."
        flatpak install -y --user flathub org.freedesktop.Platform//24.08
    fi

    if ! flatpak info org.freedesktop.Sdk//24.08 &> /dev/null; then
        warn "org.freedesktop.Sdk//24.08이 설치되지 않았습니다. 설치합니다..."
        flatpak install -y --user flathub org.freedesktop.Sdk//24.08
    fi

    if ! flatpak info org.electronjs.Electron2.BaseApp//24.08 &> /dev/null; then
        warn "org.electronjs.Electron2.BaseApp//24.08이 설치되지 않았습니다. 설치합니다..."
        flatpak install -y --user flathub org.electronjs.Electron2.BaseApp//24.08
    fi

    info "사전 조건 확인 완료."
}

# 1단계: Electron 앱 로컬 빌드
build_electron() {
    info "1단계: Electron 앱 빌드 중..."
    cd "$PROJECT_DIR"

    # 의존성 설치
    if [ ! -d "node_modules" ]; then
        info "의존성 설치 중..."
        yarn install
    fi

    # electron-builder의 Linux 타깃을 dir로 변경하여 빌드
    # (package.json을 직접 수정하지 않고 환경변수로 설정)
    info "Quasar + electron-builder 빌드 시작..."
    npx quasar build -m electron

    # linux-unpacked 디렉토리 확인
    UNPACKED_SRC="$PROJECT_DIR/dist/electron/Packaged/linux-unpacked"
    if [ ! -d "$UNPACKED_SRC" ]; then
        error "linux-unpacked 디렉토리를 찾을 수 없습니다: $UNPACKED_SRC
electron-builder의 Linux 빌드 타깃에 'dir'이 포함되어 있는지 확인하세요."
    fi

    # flatpak 디렉토리로 복사
    info "빌드 결과물을 flatpak 디렉토리로 복사 중..."
    rm -rf "$LINUX_UNPACKED"
    cp -a "$UNPACKED_SRC" "$LINUX_UNPACKED"

    # Flatpak에 불필요한 electron-builder 자동 업데이트 파일 제거
    # (cross-device hardlink 에러 방지)
    find "$LINUX_UNPACKED" -name "app-update.yml" -delete

    # 아이콘 복사
    mkdir -p "$ICONS_DIR"
    cp "$PROJECT_DIR/src-electron/icons/icon.png" "$ICONS_DIR/io.github.from104.qcalc.png"

    info "1단계 완료: linux-unpacked 준비됨."
}

# 2단계: Flatpak 빌드
build_flatpak() {
    check_prerequisites

    # linux-unpacked가 없으면 먼저 빌드
    if [ ! -d "$LINUX_UNPACKED" ]; then
        warn "linux-unpacked 디렉토리가 없습니다. Electron 앱을 먼저 빌드합니다..."
        build_electron
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
    # linux-unpacked가 없으면 먼저 빌드
    if [ ! -d "$LINUX_UNPACKED" ]; then
        warn "linux-unpacked 디렉토리가 없습니다. Electron 앱을 먼저 빌드합니다..."
        build_electron
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
    rm -rf "$BUILD_DIR" "$STATE_DIR" "$REPO_DIR" "$LINUX_UNPACKED" "$ICONS_DIR"
    info "정리 완료."
}

# 사용법 출력
usage() {
    echo "사용법: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  electron    1단계: Electron 앱 로컬 빌드 (linux-unpacked 생성)"
    echo "  build       2단계: Flatpak 빌드 (linux-unpacked 필요)"
    echo "  install     전체 빌드 + Flatpak 로컬 설치"
    echo "  run         설치된 Flatpak 앱 실행"
    echo "  clean       빌드 아티팩트 정리"
    echo ""
    echo "첫 빌드 시에는 'install'을 사용하세요."
    echo "이미 Electron 앱이 빌드되어 있다면 'build'만 실행해도 됩니다."
}

# 인수 처리
COMMAND="${1:-}"

case "$COMMAND" in
    electron)
        build_electron
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
