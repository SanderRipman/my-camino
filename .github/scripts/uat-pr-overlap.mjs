import fs from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Read-only advisory: changed-path intersection signals collision, not code incompatibility.
export function findOverlaps(prs) {
  const pairs = [];
  for (let i = 0; i < prs.length; i++) {
    for (let j = i + 1; j < prs.length; j++) {
      const shared = [...new Set(prs[i].files)].filter(f => prs[j].files.includes(f)).sort();
      if (shared.length) pairs.push({ left: prs[i].number, right: prs[j].number, paths: shared });
    }
  }
  return pairs;
}

export function markdownReport(prs, overlaps, currentNumber, truncated = false) {
  const direct = overlaps.filter(x => x.left === currentNumber || x.right === currentNumber);
  const rows = overlaps.map(x => '| #' + x.left + ' ↔ #' + x.right + ' | ' + x.paths.map(p => '\u0060' + p.replace(/[|\u0060\r\n]/g, '') + '\u0060').join(', ') + ' |');
  return [
    '## UAT CAMINO · PR file overlap (advisory)',
    '',
    '**' + prs.length + ' open demo-uat PRs** scanned; **' + overlaps.length + ' overlaps**, of which **' + direct.length + ' involve this PR**.',
    truncated ? '**Incomplete inventory**: repo exceeded scan limit; no-clear conclusion must be drawn.' : '',
    '',
    '| PRs | Changed files in common |', '|---|---|',
    ...(rows.length ? rows : ['| No shared changed paths detected | — |']),
    '',
    'This check reads GitHub PR filenames only; it does not read code, change permissions, merge branches, or wake ChatGPT conversations.',
    'Shared paths require ownership/rebase coordination before merging. Different files may still be semantically coupled.',
    'Follow SharePoint LIVE and issues #247/#249; CODE/CI/deploy/physical AAL2 UAT are separate gates.'
  ].filter(Boolean).join('\n') + '\n';
}

async function run() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const current = Number(process.env.PR_NUMBER);
  if (!/^[-\w.]+\/[-\w.]+$/.test(repo || '') || !token || !Number.isInteger(current) || current < 1) throw new Error('Missing GitHub PR context');
  async function get(path) {
    const response = await fetch('https://api.github.com/repos/' + repo + '/' + path, {
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token, 'X-GitHub-Api-Version': '2022-11-28' }
    });
    if (!response.ok) throw new Error('GitHub API ' + response.status + ' on ' + path);
    return response.json();
  }
  const open = await get('pulls?state=open&base=demo-uat&sort=updated&direction=desc&per_page=100');
  const truncated = open.length > 40;
  const prs = [];
  for (const pr of open.slice(0, 40)) {
    const first = await get('pulls/' + pr.number + '/files?per_page=100&page=1');
    if (first.length === 100) throw new Error('PR #' + pr.number + ' has 100+ changed files; explicit review required');
    prs.push({ number: pr.number, files: first.map(x => x.filename) });
  }
  const overlaps = findOverlaps(prs);
  const report = markdownReport(prs, overlaps, current, truncated);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
  console.log(report);
  if (truncated) process.exitCode = 1;
}
if (process.env.GITHUB_ACTIONS === 'true' && resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  run().catch(e => { console.error('UAT PR overlap inventory failed: ' + e.message); process.exitCode = 1; });
}
