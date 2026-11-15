/**
 * Scenario groups → Playwright tests on the real app (same rules as e2e/web/run.ts: needs → skip with a reason,
 * seed, then executeScenario for the known-bug verdict).
 */
import type { CalcApp } from '../drivers/CalcApp';
import { executeScenario, missingCapabilities, type ScenarioGroup } from '../scenarios/kit';
import { test } from './fixtures';
import type { TauriApp } from './tauri-app';

export function runGroup<A extends CalcApp>(group: ScenarioGroup<A>, { seed = true } = {}): void {
  test.describe(group.name, () => {
    for (const scenario of group.scenarios) {
      test(scenario.title, async ({ app }) => {
        const typed = app as TauriApp & A;
        test.skip(!!scenario.todo, `TODO: ${scenario.todo}`);
        const missing = missingCapabilities(scenario, typed);
        test.skip(missing.length > 0, `드라이버(${app.platform})에 없는 능력: ${missing.join(', ')}`);

        if (scenario.blockFromStart) await app.blockRequests(scenario.blockFromStart); // 앱이 받기 전에 — Scenario.blockFromStart
        if (seed) await app.step('앱 띄우기 (seed)', () => app.seed(scenario.seed));
        await executeScenario(typed, scenario, (type, description) =>
          test.info().annotations.push({ type, description }),
        );
      });
    }
  });
}
