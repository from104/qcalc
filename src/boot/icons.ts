/**
 * @file icons.ts
 * @description 아이콘 이름을 SVG 경로로 바꿔 주는 Quasar iconMapFn 을 등록합니다.
 *              아이콘 웹폰트(MDI·Material Icons, 수천 개 클래스 CSS + woff2) 대신
 *              앱이 실제로 쓰는 아이콘만 SVG로 번들합니다. 맵은 scripts/gen-icon-map.mjs 가 생성합니다.
 */

import { defineBoot } from '#q-app/wrappers';
import { ICON_MAP } from 'src/constants/IconMap.generated';

export default defineBoot(({ app }) => {
  const warned = new Set<string>();
  app.config.globalProperties.$q.iconMapFn = (iconName: string) => {
    // CalcButtonSet 의 '@mdi-*' 표기도 허용
    const name = iconName.startsWith('@') ? iconName.slice(1) : iconName;
    const svg = ICON_MAP[name];
    if (svg) return { icon: svg };
    // SVG 경로·svguse: 등 이미 해석된 값은 Quasar 기본 처리에 맡긴다
    if (import.meta.env.DEV && /^[a-z][a-z0-9_-]*$/.test(name) && !warned.has(name)) {
      warned.add(name);
      console.warn(`[icons] 맵에 없는 아이콘: ${name} — node scripts/gen-icon-map.mjs 로 재생성 필요`);
    }
    return undefined;
  };
});
