#!/usr/bin/env bash
# Flathub 제출용 스크린샷 5장(+ko 변형) 캡처 헬퍼.
#
# 사전 조건:
#   - Wayland 세션 (grim + slurp 사용; X11이면 spectacle/gnome-screenshot로 교체 가능)
#   - QCalc 앱이 실행 중 (yarn dev 또는 설치된 빌드)
#   - 각 모드로 직접 전환 후 ENTER로 캡처 트리거
#
# 사용:
#   bash flatpak/capture-screenshots.sh           # 5개 모드 (en + ko) 순차 캡처
#   bash flatpak/capture-screenshots.sh standard  # 단일 모드만
#
# 출력: assets/screenshot_v{version}_{mode}{-ko}.png

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUT_DIR="$PROJECT_DIR/assets"
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")

MODES=(standard unit currency radix formula)
LOCALES=(en ko)

YEL='\033[1;33m'; GRN='\033[0;32m'; NC='\033[0m'
prompt() { echo -e "${YEL}[준비]${NC} $*"; read -r -p "  ENTER 누르면 3초 후 캡처… " _; }
ok() { echo -e "${GRN}[저장]${NC} $*"; }

capture_one() {
    local mode=$1 locale=$2
    local suffix=""
    [ "$locale" = "ko" ] && suffix="-ko"
    local out="$OUT_DIR/screenshot_v${VERSION}_${mode}${suffix}.png"

    prompt "$mode 모드 ($locale UI) 화면 준비 — QCalc 창이 포커스 잡힌 상태로"
    sleep 3
    # grim + slurp: 사용자가 직접 영역 선택 (앱 창만 캡처하면 깔끔)
    grim -g "$(slurp)" "$out"
    ok "$out  ($(du -h "$out" | cut -f1))"
}

if [ $# -gt 0 ]; then
    # 단일 모드 캡처
    mode="$1"
    capture_one "$mode" en
    capture_one "$mode" ko
else
    # 전체 캡처
    echo "총 $((${#MODES[@]} * ${#LOCALES[@]}))장 캡처 시작 (모드 ${#MODES[@]}개 × 로케일 ${#LOCALES[@]}개)"
    echo "각 캡처 전에 QCalc에서 해당 모드 + 로케일로 직접 전환하세요."
    echo ""
    for mode in "${MODES[@]}"; do
        for locale in "${LOCALES[@]}"; do
            capture_one "$mode" "$locale"
        done
    done
fi

echo ""
echo -e "${GRN}완료.${NC} assets/ 내 새 파일:"
ls -lh "$OUT_DIR"/screenshot_v${VERSION}_*.png 2>/dev/null || echo "  (캡처 파일 없음)"
echo ""
echo "다음 단계:"
echo "  1. 캡처 결과 확인 (eog, xdg-open assets/...)"
echo "  2. 만족하면 git add assets/screenshot_v${VERSION}_*.png && git commit && git push"
echo "  3. metainfo의 <screenshot><image>URL을 새 파일명으로 업데이트"
