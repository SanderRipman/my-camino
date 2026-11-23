import assert from 'node:assert/strict';
import test from 'node:test';
import { findOverlaps, markdownReport } from './uat-pr-overlap.mjs';
test('reports overlapping files for parallel PRs, including common CI workflow', () => {
  const prs = [
    { number: 244, files: ['.github/workflows/portal-smoke.yml', 'supabase/migrations/via.sql'] },
    { number: 245, files: ['.github/workflows/portal-smoke.yml', 'supabase/functions/task-command/index.ts'] },
    { number: 248, files: ['.github/workflows/portal-smoke.yml', 'portal/app-core-broken.js'] }
  ];
  const overlaps = findOverlaps(prs);
  assert.equal(overlaps.length, 3);
  assert.deepEqual(overlaps[0].paths, ['.github/workflows/portal-smoke.yml']);
  assert.match(markdownReport(prs, overlaps, 248), /3 overlaps.*2 involve this PR/);
});
test('independent PR paths produce no false conflict', () => {
  const prs = [{ number: 249, files: ['scripts/security-check.mjs'] }, { number: 248, files: ['portal/app.js'] }];
  assert.deepEqual(findOverlaps(prs), []);
  assert.match(markdownReport(prs, [], 249), /No shared changed paths detected/);
});
