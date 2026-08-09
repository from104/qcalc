import { describe, it, expect } from 'vitest';

import { computeDownloadPercent } from '../TauriUpdaterUtils';

describe('computeDownloadPercent', () => {
  it('전체 크기 대비 누적 다운로드 바이트로 진행률을 계산', () => {
    expect(computeDownloadPercent(0, 100)).toBe(0);
    expect(computeDownloadPercent(25, 100)).toBe(25);
    expect(computeDownloadPercent(50, 100)).toBe(50);
    expect(computeDownloadPercent(100, 100)).toBe(100);
  });

  it('전체 크기를 알 수 없으면(0 이하) 0을 반환', () => {
    expect(computeDownloadPercent(50, 0)).toBe(0);
    expect(computeDownloadPercent(0, 0)).toBe(0);
    expect(computeDownloadPercent(50, -1)).toBe(0);
  });

  it('누적 바이트가 전체 크기를 초과해도 100을 넘지 않음', () => {
    expect(computeDownloadPercent(150, 100)).toBe(100);
  });

  it('여러 청크 누적 시나리오', () => {
    const total = 1000;
    let downloaded = 0;
    downloaded += 300;
    expect(computeDownloadPercent(downloaded, total)).toBe(30);
    downloaded += 400;
    expect(computeDownloadPercent(downloaded, total)).toBe(70);
    downloaded += 300;
    expect(computeDownloadPercent(downloaded, total)).toBe(100);
  });
});
