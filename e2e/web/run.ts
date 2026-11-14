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

        await app.step('앱 띄우기 (seed)', () => app.seed(scenario.seed));
        if (!scenario.knownBug) return scenario.run(app);

        // 알려진 앱 버그: 실패해야 정상. 통과하면 버그가 고쳐진 것 → 표시를 지우라고 빨갛게 알린다.
        // (test.fail() 과 같은 의미지만 메시지를 우리가 정하고, 요약이 known-bug 를 따로 센다)
        test.info().annotations.push({ type: 'known-bug', description: scenario.knownBug });
        let failure: unknown;
        try {
          await scenario.run(app);
        } catch (error) {
          failure = error;
        }
        if (failure === undefined) {
          throw new Error(`bug fixed — remove the known-bug mark (scenario.knownBug): ${scenario.knownBug}`);
        }
        test
          .info()
          .annotations.push({ type: 'known-bug-error', description: String(failure).split('\n')[0]!.slice(0, 200) });
      });
    }
  });
}
