# SER5 storage gate and role UAT — implementation handoff (2026-11-09)

**Status:** static code inspection only; no new persistent form, no database write, no authenticated end-to-end verification. Owner: WEB/PORTAL. Related: issue #208; draft PR #207.

## Verified from current demo-uat source
- `portal/ser-five-checkin-uat.html` contains five 0–5 sliders (agency, belonging, mood, energy, manageability). Missing values are `null`; only five answers produce an illustrative, non-validated score. The page explicitly states answers are not saved or sent.
- `portal/form-runner.js` already has a separate versioned `form_submissions` draft/update/submit path, with contextual participant/pilot and an existing resume read. **Do not equate that path with SER5 persistence.**
- The operational seven-indicator `ser_checkins` dataset must not be rewritten, migrated, or silently replaced.
- Canonical 2026-11-02 decision: five-question compact prototype is first in demo, seven-indicator historical form remains available; SER5 storage is HOLD because demo and production share Supabase.

## Safe next engineering work
1. Map existing form-definition/version and form-submission RLS, grants, AAL2, consent and retention; read-only metadata only.
2. Specify isolated synthetic-only SER5 write/read/deny environment, including strict scope and version identity; no shared production DB write until approved.
3. Implement separate synthetic test fixtures and automated checks for empty/null vs zero, 5/5 completion, duplicate-day handling, resume, rejected cross-participant access, revoked roles, and no accidental staff-note exposure.
4. After legitimate role authentication and approval, perform browser E2E: participant save/reopen, staff provenance only, VIDA owner and handoff, then negative RLS/API tests.
5. Require professional review of question wording/anchors, consent, DPIA and retention before collecting real answers.

## Release gates
- STATIC PASS is not browser PASS.
- Existing `form_submissions` persistence is not proof of SER5 persistence.
- No production promotion, Supabase migrations, new grants, participant data, or automated RAG/GO decisions from this work package.
- Retain TOTP/AAL2 and fail-closed BankID status.

## Execution
`node portal/ser-five-storage-gate-smoke.mjs`
`node portal/ser-vida-boundaries-smoke.mjs`

Both tests are static regression guards, not live backend checks.
