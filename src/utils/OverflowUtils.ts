/**
 * @file OverflowUtils.ts
 * @description 이 파일은 요소의 텍스트가 가로로 넘쳤는지 판정하는 유틸리티를 정의합니다.
 *              결과 패널의 경고색, 수식 필드의 왼쪽 클리핑 표시, 툴팁 노출 등
 *              "잘려서 안 보이는 글자가 있는가"에 따라 UI가 달라지는 곳에서 함께 씁니다.
 */

/**
 * 넘침으로 치지 않을 허용 오차(px)
 *
 * 브라우저가 서브픽셀 레이아웃을 반올림하며 생기는 1px 미만의 오차를 흡수한다.
 * 이보다 작은 차이는 화면에서 잘린 글자로 보이지 않으므로 넘침이 아니다.
 */
export const OVERFLOW_EPSILON = 0.5;

/**
 * 요소 안의 텍스트가 가로로 넘쳐서 잘렸는지 판정합니다.
 *
 * @description
 * `offsetWidth < scrollWidth`(또는 `clientWidth < scrollWidth`)를 쓰지 않는 이유:
 * 이 속성들은 정수로 반올림된 값을 돌려주는데, 안쪽 너비는 내림이 되고 내용 너비는
 * 올림이 되는 식으로 엇갈린다. 그래서 요소 폭이 소수점이면 내용이 한 글자뿐이어도
 * 항상 1px 차이가 나 영구적으로 "넘침"으로 오판한다.
 *
 * WebKitGTK는 데스크톱 텍스트 배율을 페이지 줌으로 적용하므로(예: 1.25) 폭이 거의
 * 항상 소수점이 된다. 실측에서 여유 공간이 289px이나 남은 "0" 한 글자에도
 * `offsetWidth=306 < scrollWidth=307`이 되어 넘침으로 판정됐다.
 *
 * `getBoundingClientRect()`와 `Range`는 반올림하지 않으므로 이쪽을 비교한다.
 * `Range`는 `overflow: hidden`으로 잘린 글자도 원래 너비로 보고한다.
 *
 * @param element - 검사할 요소 (없으면 넘치지 않은 것으로 본다)
 * @param epsilon - 넘침으로 치지 않을 허용 오차(px)
 * @returns 텍스트가 잘릴 만큼 넘쳤으면 true
 */
export function isTextOverflowing(element: HTMLElement | null | undefined, epsilon = OVERFLOW_EPSILON): boolean {
  if (!element) {
    return false;
  }

  // 글자가 들어갈 수 있는 안쪽 너비 (테두리 상자에서 좌우 패딩·테두리를 뺀 값)
  const style = getComputedStyle(element);
  const horizontalInset =
    toPx(style.paddingLeft) + toPx(style.paddingRight) + toPx(style.borderLeftWidth) + toPx(style.borderRightWidth);
  const availableWidth = element.getBoundingClientRect().width - horizontalInset;

  // 요소가 아직 그려지지 않았거나 숨겨져 있으면 판정하지 않는다.
  // (숨은 탭 패널에서 폭이 0이 되어 넘침으로 오판하는 것을 막는다)
  if (!Number.isFinite(availableWidth) || availableWidth <= 0) {
    return false;
  }

  const range = document.createRange();

  // 레이아웃을 계산하지 않는 환경(jsdom 등)에는 Range 측정이 없다. 그때는 판정하지 않는다.
  if (typeof range.getBoundingClientRect !== 'function') {
    return false;
  }

  // 실제로 그려진 글자의 너비
  range.selectNodeContents(element);
  const contentWidth = range.getBoundingClientRect().width;

  if (!Number.isFinite(contentWidth)) {
    return false;
  }

  return contentWidth - availableWidth > epsilon;
}

/**
 * CSS 길이 문자열을 px 숫자로 바꿉니다. 값이 없거나 숫자가 아니면 0으로 봅니다.
 *
 * getComputedStyle은 레이아웃이 없는 환경에서 빈 문자열을 돌려줄 수 있는데,
 * 그대로 parseFloat하면 NaN이 되어 이후 비교가 전부 조용히 무너진다.
 */
function toPx(value: string): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
