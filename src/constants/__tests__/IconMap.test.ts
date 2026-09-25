import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

describe('IconMap.generated', () => {
  it('소스에서 쓰는 아이콘과 생성된 SVG 맵이 일치한다 (불일치 시 node scripts/gen-icon-map.mjs)', () => {
    expect(() => execFileSync('node', ['scripts/gen-icon-map.mjs', '--check'], { stdio: 'pipe' })).not.toThrow();
  });
});
