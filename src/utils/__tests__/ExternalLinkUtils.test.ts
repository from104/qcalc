import { describe, it, expect, vi, afterEach } from 'vitest';

const openUrlMock = vi.fn();
vi.mock('@tauri-apps/plugin-opener', () => ({ openUrl: openUrlMock }));

import { openExternalLink } from '../ExternalLinkUtils';

describe('openExternalLink', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    openUrlMock.mockClear();
  });

  it('Tauri 환경에서는 tauri-plugin-opener의 openUrl로 연다', async () => {
    openExternalLink('https://example.com', true);
    await vi.waitFor(() => expect(openUrlMock).toHaveBeenCalledWith('https://example.com'));
  });

  it('Tauri 환경에서는 window.open을 호출하지 않는다', async () => {
    const mockOpen = vi.fn();
    vi.stubGlobal('window', { open: mockOpen });
    openExternalLink('https://example.com', true);
    await vi.waitFor(() => expect(openUrlMock).toHaveBeenCalled());
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('비Tauri 환경에서는 window.open으로 새 창을 연다', () => {
    const mockOpen = vi.fn();
    vi.stubGlobal('window', { open: mockOpen });
    openExternalLink('https://example.com', false);
    expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener');
    expect(openUrlMock).not.toHaveBeenCalled();
  });
});
