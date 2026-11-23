#!/usr/bin/env node
// Advisory, fail-closed static inspection of a pg_policies.tasks_read SELECT expression.
// Usage: psql -At ... | node scripts/security/audit-tasks-read-policy.mjs
// This is NOT a SQL parser or an authenticated RLS test.
import { readFileSync } from 'node:fs';

export function inspectTasksRead(qual) {
  if (typeof qual !== 'string' || !qual.trim()) throw new Error('Missing tasks_read qual');
  const normalized = qual.replace(/\s+/g, ' ').toLowerCase();
  const findings = [];
  // Independent OR arms: the existing policy begins with an assignee equality,
  // then ORs participant self-access and capability-based staff access.
  if (/assignee_user_id\s*=\s*\(\s*select\s+auth\.uid\(\)/.test(normalized) &&
      /\)\s+or\s+\(\(participant_id\s+is\s+not\s+null/.test(normalized)) {
    findings.push('ASSIGNEE_OR_ARM: assignee equality can grant SELECT independently of staff capability/AAL2');
  }
  if (/or\s+aidme_private\.has_capability\([^)]*'manage_tasks'/.test(normalized)) {
    findings.push('MANAGE_TASKS_OR_ARM: generic task capability may expose VÍA/SER review metadata; verify intended scope');
  }
  if (!normalized.includes('aidme_private.is_own_participant(')) {
    findings.push('PARTICIPANT_SELF_BRANCH_MISSING: verify legitimate self-access separately');
  }
  return findings;
}

if (process.argv[1]?.endsWith('audit-tasks-read-policy.mjs')) {
  const qual = process.argv[2] === '--file' ? readFileSync(process.argv[3], 'utf8') : readFileSync(0, 'utf8');
  const findings = inspectTasksRead(qual);
  console.log(JSON.stringify({ status: findings.length ? 'REVIEW_REQUIRED' : 'NO_KNOWN_PATTERN_FOUND_NOT_PASS', findings }, null, 2));
  if (findings.length) process.exitCode = 2;
}
