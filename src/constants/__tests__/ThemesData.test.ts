/**
 * @file ThemesData.test.ts
 * @description 테마 색상 조합이 WCAG AA 대비 기준을 만족하는지 검증하는 회귀 테스트입니다.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { themes, type ThemeType, type ThemeColors } from '../ThemesData';

const src = readFileSync(join(process.cwd(), 'node_modules/quasar/src/css/variables.sass'), 'utf-8');
const PALETTE: Record<string, string> = {};
for (const line of src.split('\n')) {
  const m = line.match(/^\$([a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})/);
  const key = m?.[1];
  const hex = m?.[2];
  if (key && hex) PALETTE[key] = hex.toLowerCase();
}

function resolve(name: string): string {
  const hex = PALETTE[name];
  if (!hex) throw new Error(`Unknown Quasar color: ${name}`);
  return hex;
}

function luminance(hex: string): number {
  const channel = (i: number): number => {
    const v = parseInt(hex.slice(1 + i, 3 + i), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = [channel(0), channel(2), channel(4)];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function combos(t: ThemeColors): ReadonlyArray<readonly [string, string, string]> {
  return [
    ['panel text.normal / bg.normal', t.panel.text.normal, t.panel.background.normal],
    ['panel text.normalAccent / bg.normal', t.panel.text.normalAccent, t.panel.background.normal],
    ['panel text.warning / bg.warning', t.panel.text.warning, t.panel.background.warning],
    ['panel text.warningAccent / bg.warning', t.panel.text.warningAccent, t.panel.background.warning],
    ['select text.light / bg.light', t.select.text.light, t.select.background.light],
    ['select text.dark / bg.dark', t.select.text.dark, t.select.background.dark],
  ] as const;
}

describe('theme color contrast (WCAG AA)', () => {
  for (const [name, theme] of Object.entries(themes) as [ThemeType, ThemeColors][]) {
    const min = name === 'highcontrast' ? 7 : 4.5;
    for (const [label, fg, bg] of combos(theme)) {
      it(`${name}: ${label} >= ${min}:1`, () => {
        const ratio = contrast(resolve(fg), resolve(bg));
        expect(ratio, `${fg} on ${bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(min);
      });
    }
  }
});
