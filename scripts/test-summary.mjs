#!/usr/bin/env node
/**
 * scripts/test-suite.sh 가 남긴 결과를 모아 test-results/summary.md(30줄 이하)와 summary.json 을 쓴다.
 *
 * 입력 (있는 것만 읽는다)
 * - test-results/.steps.jsonl   : 단계별 {layer, step, status, seconds, detail, log}
 * - test-results/vitest.json    : vitest JSON 보고서
 * - test-results/e2e-report.json: Playwright JSON 보고서 (web 층)
 * - test-results/app-report.json: Playwright JSON 보고서 (app 층 — 실제 Tauri 앱, playwright.app.config.ts)
 * 종료 코드: 실패한 단계가 하나라도 있으면 1
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const out = process.argv[2] || 'test-results';
const ranLayers = (process.argv[3] || '').split(/\s+/).filter(Boolean);
const MAX_LINES = 30;
const ALL_LAYERS = ['code', 'web', 'app'];
const read = (file) => {
  const p = path.join(out, file);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

const steps = existsSync(path.join(out, '.steps.jsonl'))
  ? readFileSync(path.join(out, '.steps.jsonl'), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  : [];

// vitest 숫자를 단계 detail 에 채운다
const vitest = read('vitest.json');
for (const s of steps) {
  if (s.step === 'vitest' && vitest) {
    s.detail = `${vitest.numPassedTests} passed, ${vitest.numFailedTests} failed, ${vitest.numPendingTests + (vitest.numTodoTests ?? 0)} skipped / ${vitest.numTotalTests}`;
    s.failures = (vitest.testResults ?? []).flatMap((f) =>
      (f.assertionResults ?? [])
        .filter((a) => a.status === 'failed')
        .map((a) => `${path.relative(process.cwd(), f.name)} › ${a.fullName}`),
    );
  }
}

// cargo: 로그에서 통과·실패 수를 읽는다 — 컴파일 실패 등으로 'test result' 줄이 없어도 죽지 않는다
for (const s of steps) {
  if (s.step !== 'cargo' || s.status === 'skip' || !s.log || !existsSync(s.log)) continue;
  const text = readFileSync(s.log, 'utf8');
  const sum = (re) => [...text.matchAll(re)].reduce((n, m) => n + Number(m[1]), 0);
  const passed = sum(/test result: \w+\. (\d+) passed/g);
  const failedN = sum(/; (\d+) failed/g);
  if (/test result:/.test(text)) s.detail = `${passed} passed, ${failedN} failed`;
  else if (s.status === 'fail') s.detail = 'did not run tests (build error?)';
}

// Playwright 보고서 → 프로젝트별 집계 (web 층 e2e-report.json, app 층 app-report.json)
function parseReport(report) {
  const projects = {};
  const failures = [];
  const knownBugs = [];
  const walk = (suite, trail) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        const p = (projects[t.projectName] ??= {
          passed: 0,
          failed: 0,
          flaky: 0,
          skipped: 0,
          todo: 0,
          capability: 0,
          knownBug: 0,
          ms: 0,
        });
        for (const r of t.results ?? []) p.ms += r.duration ?? 0;
        const ann = t.annotations ?? [];
        if (t.status === 'skipped') {
          p.skipped++;
          if (ann.some((a) => String(a.description ?? '').startsWith('TODO'))) p.todo++;
          else p.capability++;
        } else if (t.status === 'expected' && ann.some((a) => a.type === 'known-bug')) {
          p.knownBug++;
          knownBugs.push({
            project: t.projectName,
            title: [...trail, spec.title].filter(Boolean).join(' › '),
            bug: ann.find((a) => a.type === 'known-bug')?.description ?? '',
            error: ann.find((a) => a.type === 'known-bug-error')?.description ?? '',
          });
        } else if (t.status === 'expected') p.passed++;
        else if (t.status === 'flaky') p.flaky++;
        else {
          p.failed++;
          const last = t.results?.[t.results.length - 1];
          const trace = last?.attachments?.find((a) => a.name === 'trace')?.path;
          failures.push({
            project: t.projectName,
            title: [...trail, spec.title].filter(Boolean).join(' › '),
            error: String(last?.error?.message ?? '')
              // eslint-disable-next-line no-control-regex -- ANSI 색상 코드 제거
              .replace(/\u001b\[[0-9;]*m/g, '')
              .split('\n')[0]
              .slice(0, 160),
            trace: trace ? path.relative(process.cwd(), trace) : null,
          });
        }
      }
    }
    for (const child of suite.suites ?? []) walk(child, [...trail, child.title]);
  };
  for (const suite of report?.suites ?? []) walk(suite, []);
  return { projects, failures, knownBugs };
}

/** Playwright 를 돌린 단계 → 그 보고서 파일 (app 층의 build·cleanup 단계는 아님) */
const reportFileOf = (s) =>
  s.layer === 'web' && s.step === 'playwright'
    ? 'e2e-report.json'
    : s.layer === 'app' && !['build', 'cleanup'].includes(s.step) && s.status !== 'skip'
      ? 'app-report.json'
      : null;

const e2eFailures = [];
const knownBugs = [];
for (const s of steps) {
  const file = reportFileOf(s);
  if (!file) continue;
  const report = read(file);
  const parsed = parseReport(report);
  s.projects = parsed.projects;
  s.failures = parsed.failures;
  s.knownBugs = parsed.knownBugs;
  e2eFailures.push(...parsed.failures);
  knownBugs.push(...parsed.knownBugs);
  const total = Object.values(parsed.projects).reduce((n, p) => n + p.passed + p.failed + p.flaky + p.skipped, 0);
  if (report && total === 0) s.detail = 'no tests ran';
}

const producedThisRun = (file) => {
  try {
    return statSync(file).mtimeMs >= statSync(path.join(out, '.started')).mtimeMs;
  } catch {
    return false;
  }
};

const failed = steps.some((s) => s.status === 'fail');
const totalSeconds = steps.reduce((n, s) => n + (s.seconds || 0), 0);
const summary = {
  result: failed ? 'FAIL' : 'PASS',
  generatedAt: new Date().toISOString(),
  layersRan: ranLayers,
  layersNotRun: ALL_LAYERS.filter((l) => !ranLayers.includes(l)),
  totalSeconds,
  steps,
  reports: {
    junit: existsSync(path.join(out, 'e2e-junit.xml')) ? path.join(out, 'e2e-junit.xml') : null,
    appJunit: existsSync(path.join(out, 'app-junit.xml')) ? path.join(out, 'app-junit.xml') : null,
    // 이번 실행이 만든 보고서만 링크한다(Playwright 가 죽었으면 이전 실행의 것이 남아 있을 수 있다)
    html: producedThisRun('playwright-report/index.html') ? 'playwright-report/index.html' : null,
    appHtml: producedThisRun(path.join(out, 'app-html-report/index.html'))
      ? path.join(out, 'app-html-report/index.html')
      : null,
  },
};
writeFileSync(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');

// summary.md — 30줄 이하
const lines = [
  `# QCalc 테스트 요약 — ${summary.result} (${totalSeconds}s)`,
  `돌린 층: ${ranLayers.join(', ') || '(없음)'} · 안 돌린 층: ${summary.layersNotRun.join(', ') || '(없음)'}`,
  '',
  '| layer | step | result | detail | time (Playwright 프로젝트는 시험 시간 합 Σ) |',
  '|---|---|---|---|---|',
];
for (const s of steps) {
  const projects = s.projects ?? {};
  if (reportFileOf(s) && Object.keys(projects).length) {
    for (const [name, p] of Object.entries(projects)) {
      const skip = p.skipped
        ? ` · ${p.skipped} skipped (${[p.todo && `${p.todo} todo`, p.capability && `${p.capability} capability`].filter(Boolean).join(', ')})`
        : '';
      const known = p.knownBug ? ` · ${p.knownBug} known-bug(기대된 실패)` : '';
      const flaky = p.flaky ? ` · ${p.flaky} flaky` : '';
      const res = p.failed ? 'fail' : 'pass';
      lines.push(
        `| ${s.layer} | ${name} | ${res} | ${p.passed} passed · ${p.failed} failed${flaky}${known}${skip} | Σ${Math.round(p.ms / 1000)}s (${s.seconds}s) |`,
      );
    }
    if (s.status === 'fail' && !s.failures?.length)
      lines.push(`| ${s.layer} | ${s.step} | fail | ${s.detail || 'see log'} — ${s.log} | ${s.seconds}s |`);
  } else {
    lines.push(
      `| ${s.layer} | ${s.step} | ${s.status} | ${s.detail || ''}${s.status === 'fail' && s.log ? ` — ${s.log}` : ''} | ${s.seconds}s |`,
    );
  }
}
const allFailures = [
  ...steps.filter((s) => s.step === 'vitest').flatMap((s) => (s.failures ?? []).map((f) => `- [vitest] ${f}`)),
  ...e2eFailures.map((f) => `- [${f.project}] ${f.title} — ${f.error}${f.trace ? ` — trace: ${f.trace}` : ''}`),
];
const footer = `보고서: ${[summary.reports.junit, summary.reports.html, summary.reports.appJunit, summary.reports.appHtml, path.join(out, 'summary.json')].filter(Boolean).join(' · ')}`;
// 알려진 버그(기대된 실패): 증상 확인용으로 실제 오류 첫 줄을 보인다 — 시험별 한 줄(프로젝트 중복 제거)
const bugLines = [...new Map(knownBugs.map((b) => [b.title, b])).values()].map(
  (b) => `- ${b.title.slice(0, 50)} — ${b.error.replace(/^Error: /, '').slice(0, 90)}`,
);
if (bugLines.length)
  lines.push('', `known-bug ${bugLines.length}건 (기대된 실패 — 오류가 증상과 맞는지 확인):`, ...bugLines);
const room = MAX_LINES - lines.length - 3; // 빈 줄 + 제목 + footer
if (allFailures.length && room > 0) {
  lines.push('', `실패 ${allFailures.length}건:`);
  const shown = allFailures.slice(0, Math.max(1, room - 1));
  lines.push(...shown);
  if (allFailures.length > shown.length) lines.push(`- … 외 ${allFailures.length - shown.length}건 (summary.json)`);
}
lines.push('', footer);
writeFileSync(path.join(out, 'summary.md'), lines.slice(0, MAX_LINES).join('\n') + '\n');
process.stdout.write(lines.slice(0, MAX_LINES).join('\n') + '\n');
process.exit(failed ? 1 : 0);
