/**
 * 시나리오 그룹 → Playwright 시험. 스펙 파일은 이것만 부른다:
 *
 *   import basic from '../scenarios/basic';
 *   import { runGroup } from './run';
 *   runGroup(basic);
 *
 * known-bug 판정은 드라이버 중립인 kit.ts 의 executeScenario 가 한다(app 층과 공유).
 */
import { test } from '../fixtures/test';
import { executeScenario, missingCapabilities, type ScenarioGroup } from '../scenarios/kit';

export function runGroup(group: ScenarioGroup): void {
  test.describe(group.name, () => {
    for (const scenario of group.scenarios) {
      test(scenario.title, async ({ app }) => {
        test.skip(!!scenario.todo, `TODO: ${scenario.todo}`);
        const missing = missingCapabilities(scenario, app);
        test.skip(missing.length > 0, `드라이버(${app.platform})에 없는 능력: ${missing.join(', ')}`);

        if (scenario.blockFromStart) await app.blockRequests(scenario.blockFromStart); // 앱이 받기 전에 — Scenario.blockFromStart
        await app.step('앱 띄우기 (seed)', () => app.seed(scenario.seed));
        await executeScenario(app, scenario, (type, description) =>
          test.info().annotations.push({ type, description }),
        );
      });
    }
  });
}
