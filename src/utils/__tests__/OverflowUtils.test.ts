// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';

import { isTextOverflowing, OVERFLOW_EPSILON } from '../OverflowUtils';

/**
 * jsdom은 레이아웃을 계산하지 않으므로 폭을 직접 심어 준다.
 *
 * @param boxWidth - 요소의 테두리 상자 너비(px)
 * @param contentWidth - 요소 안 글자의 실제 너비(px)
 * @param inset - 좌우 패딩/테두리 합(px)
 */
function makeElement(boxWidth: number, contentWidth: number, inset = 0): HTMLElement {
  const el = document.createElement('div');
  el.textContent = '측정 대상';
  document.body.appendChild(el);

  el.getBoundingClientRect = () => ({ width: boxWidth }) as DOMRect;
  el.style.paddingLeft = `${inset / 2}px`;
  el.style.paddingRight = `${inset / 2}px`;

  // Range는 jsdom에 측정 기능이 없으므로 이 테스트 동안만 채워 넣는다.
  Range.prototype.getBoundingClientRect = function () {
    return { width: contentWidth } as DOMRect;
  };

  return el;
}

describe('OverflowUtils', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    // @ts-expect-error 테스트에서 심어 둔 측정 함수를 걷어낸다
    delete Range.prototype.getBoundingClientRect;
  });

  describe('isTextOverflowing', () => {
    it('요소가 없으면 넘치지 않은 것으로 본다', () => {
      expect(isTextOverflowing(null)).toBe(false);
      expect(isTextOverflowing(undefined)).toBe(false);
    });

    it('글자가 안쪽 너비보다 좁으면 정상으로 본다', () => {
      expect(isTextOverflowing(makeElement(306, 16.93))).toBe(false);
    });

    it('글자가 안쪽 너비를 넘으면 넘침으로 본다', () => {
      expect(isTextOverflowing(makeElement(306, 491))).toBe(true);
    });

    it('좌우 패딩을 빼고 남는 너비로 판정한다', () => {
      // 상자 306px, 패딩 합 40px -> 안쪽 266px. 글자 280px는 넘친다.
      expect(isTextOverflowing(makeElement(306, 280, 40))).toBe(true);
      // 같은 조건에서 글자 250px는 들어간다.
      expect(isTextOverflowing(makeElement(306, 250, 40))).toBe(false);
    });

    it('허용 오차보다 작은 차이는 넘침으로 치지 않는다', () => {
      // 서브픽셀 반올림에서 생기던 1px 미만 오차 — 이 케이스가 결과 패널을
      // 영구히 경고색으로 만들던 회귀다.
      expect(isTextOverflowing(makeElement(306, 306 + OVERFLOW_EPSILON / 2))).toBe(false);
      expect(isTextOverflowing(makeElement(306, 306 + OVERFLOW_EPSILON * 2))).toBe(true);
    });

    it('허용 오차를 직접 지정할 수 있다', () => {
      expect(isTextOverflowing(makeElement(100, 103), 5)).toBe(false);
      expect(isTextOverflowing(makeElement(100, 103), 1)).toBe(true);
    });

    it('아직 그려지지 않아 너비가 0이면 판정하지 않는다', () => {
      // 숨은 탭 패널에서 폭이 0이 되어 넘침으로 오판하던 경우
      expect(isTextOverflowing(makeElement(0, 120))).toBe(false);
    });

    it('Range 측정을 지원하지 않는 환경에서는 판정하지 않는다', () => {
      const el = makeElement(306, 491);
      // @ts-expect-error 레이아웃 없는 환경을 흉내 낸다
      delete Range.prototype.getBoundingClientRect;
      expect(isTextOverflowing(el)).toBe(false);
    });
  });
});
