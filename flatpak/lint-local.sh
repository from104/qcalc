#!/usr/bin/env bash
# QCalc Flathub 제출 준비용 로컬 검증 헬퍼.
# Flathub 리뷰어가 돌리는 lint 단계를 동일하게 로컬에서 수행한다.
#
# 사용: bash flatpak/lint-local.sh [step]
# step:
#   metainfo  — appstreamcli validate (strict + pedantic)
#   desktop   — desktop-file-validate
#   manifest  — flatpak-builder-lint manifest <path>
#   all       — 위 셋 + (선택) 빌드까지
#   (생략)    — metainfo + desktop + manifest(존재 시) 빠른 검증

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ID="io.github.from104.qcalc"
METAINFO="$SCRIPT_DIR/$APP_ID.metainfo.xml"
DESKTOP="$SCRIPT_DIR/$APP_ID.desktop"
MANIFEST="$SCRIPT_DIR/$APP_ID.yml"
BUILDER="org.flatpak.Builder"

RED='\033[0;31m'; YEL='\033[1;33m'; GRN='\033[0;32m'; NC='\033[0m'
info()  { echo -e "${GRN}[ok]${NC} $*"; }
warn()  { echo -e "${YEL}[warn]${NC} $*"; }
fail()  { echo -e "${RED}[fail]${NC} $*"; exit 1; }

ensure_builder() {
    if ! flatpak info "$BUILDER" >/dev/null 2>&1; then
        warn "$BUILDER 설치 필요"
        echo "  flatpak install --user flathub $BUILDER"
        exit 1
    fi
}

check_metainfo() {
    [ -f "$METAINFO" ] || fail "metainfo 없음: $METAINFO"
    ensure_builder
    info "metainfo validate (strict + pedantic)"
    flatpak run --command=appstreamcli "$BUILDER" \
        validate --strict --pedantic "$METAINFO" \
        && info "metainfo OK" \
        || fail "metainfo validation 실패 — 출력 확인 후 수정"
}

check_desktop() {
    [ -f "$DESKTOP" ] || fail "desktop 없음: $DESKTOP"
    if command -v desktop-file-validate >/dev/null 2>&1; then
        info "desktop-file-validate (host)"
        desktop-file-validate "$DESKTOP" && info "desktop OK" || fail "desktop validation 실패"
    else
        warn "host에 desktop-file-validate 없음 — 'sudo apt install desktop-file-utils' 권장"
    fi
}

check_manifest() {
    [ -f "$MANIFEST" ] || { warn "manifest 없음: $MANIFEST (Flathub용 신규 매니페스트 작성 전이면 정상)"; return; }
    ensure_builder
    info "flatpak-builder-lint manifest"
    flatpak run --command=flatpak-builder-lint "$BUILDER" manifest "$MANIFEST" \
        && info "manifest OK" \
        || fail "manifest lint 실패"
}

build_and_check_repo() {
    [ -f "$MANIFEST" ] || fail "manifest 없음 — 빌드 불가"
    ensure_builder
    info "flathub-build 시작 (30~60분 소요)"
    cd "$SCRIPT_DIR"
    flatpak run --command=flathub-build "$BUILDER" \
        --install --user --repo=repo --force-clean "$MANIFEST"
    info "repo lint"
    flatpak run --command=flatpak-builder-lint "$BUILDER" repo repo \
        && info "repo OK" \
        || fail "repo lint 실패"
}

case "${1:-quick}" in
    metainfo)  check_metainfo ;;
    desktop)   check_desktop ;;
    manifest)  check_manifest ;;
    build)     build_and_check_repo ;;
    all)       check_metainfo; check_desktop; check_manifest; build_and_check_repo ;;
    quick|"")  check_metainfo; check_desktop; check_manifest ;;
    *)
        echo "사용: $0 [metainfo|desktop|manifest|build|all|quick]"
        echo ""
        echo "  quick   — metainfo + desktop + manifest(있을 시) 빠른 검증 (기본값)"
        echo "  all     — quick + 전체 빌드 + repo lint (30~60분)"
        echo "  build   — 전체 빌드 + repo lint만"
        exit 2
        ;;
esac
