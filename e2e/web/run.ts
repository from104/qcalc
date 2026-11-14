/**
 * 시나리오 그룹 → Playwright 시험. 스펙 파일은 이것만 부른다:
 *
 *   import basic from '../scenarios/basic';
 *   import { runGroup } from './run';
 *   runGroup(basic);
 */
import { test } from '../fixtures/test';
import { missingCapabilities, type ScenarioGroup } from '../scenarios/kit';

export function runGroup(group: ScenarioGroup): void {
  test.describe(group.name, () => {
    for (const scenario of group.scenarios) {
      test(scenario.title, async ({ app }) => {
        test.skip(!!scenario.todo, `TODO: ${scenario.todo}`);
        const missing = missingCapabilities(scenario, app);
        test.skip(missing.length > 0, `드라이버(${app.platform})에 없는 능력: ${missing.join(', ')}`);
        test.fixme(!!scenario.fixme, `앱 버그: ${scenario.fixme}`);

        await app.step('앱 띄우기 (seed)', () => app.seed(scenario.seed));
        await scenario.run(app);
      });
    }
  });
}
