# Parallel polish work package — 2026-09-03

## Purpose
Use one isolated parallel chat to improve low-risk portal UX, presentation and regression coverage while the main chat continues physical MYFB-008 staff role testing.

This branch is a supplement, never a competing source of truth.

## Branch / integration contract
- Work only on `qa/parallel-polish-20260903`.
- Branch base is `qa/myfb-008-staff` as of creation.
- Treat that base snapshot as frozen: **do not rebase, merge, or pull newer `qa/myfb-008-staff` into this branch autonomously**. The main chat will integrate later.
- Do **not** push to `main` or `qa/myfb-008-staff`.
- Do **not** merge the branch or PR.
- Do **not** deploy to `my.aidme.no` production.
- Do **not** change live Supabase data/schema/functions/RLS/grants/MFA/roles/form definitions.
- Do **not** update canonical SharePoint steering files. Read them when needed for concept/method alignment.
- Do **not** touch current MYFB-008 role-test fixtures or current SER form/gate logic.
- If a task requires any item above, stop that task and log it as `NEEDS_MAIN_CHAT` instead.

## Canonical context to read first
1. `@SharePoint CAMINO LIVE` and current Project State/Handover.
2. Git `portal/USER_JOURNEY.md`.
3. Git `portal/END_TO_END_ROLE_JOURNEY.md`.
4. Git `portal/ROLE_SCOPE_QA_MATRIX.md`.
5. Git `portal/STREAMLINE_ROLE_FLOW_2026-08-24.md` when relevant.

Preserve VÍA → SER → VIDA, least privilege, no forced sharing, minimum necessary data and app/PWA-friendly responsive behavior.

## Priority A — desktop density / layout polish (safe presentation-only)
Own the existing branch-only `portal/density.css` workstream.

Acceptance:
- 100% browser zoom is the desktop reference.
- Reduce wasted sidebar/content spacing without sacrificing readability.
- Desktop-only at >=1100px unless an existing responsive defect is obvious.
- Do not alter role visibility, navigation permissions, workflow logic or DOM semantics used by security gates.
- Check 1366×768, 1440×900 and 1920×1080 assumptions from CSS/layout; avoid horizontal overflow.
- Keep mobile/tablet behavior unchanged unless a purely presentational regression is found.
- Add/extend deterministic smoke assertions for the density stylesheet/build injection where useful.

## Priority B — QA/LAB discoverability and operator ergonomics
Improve discoverability without changing authentication or credential security.

Candidate changes:
- Add a clear Systemadmin/Admin link to `qa-role-pack.html` in an appropriate admin/LAB surface.
- Clarify that generated QA passwords are one-time/browser-memory display and cannot be recovered later.
- Keep passwords out of localStorage, repo, logs and SharePoint.
- Make `Forny én uke` conceptually distinct from `Opprett ny rollepakke`.
- Add copy buttons only if they do not persist credentials.

Do **not** change password rotation, grant creation, MFA or expiry backend logic.

## Priority C — low-risk UX clarity already observed in physical QA
Only implement changes that are clearly presentation/copy and do not change access or workflow semantics.

Backlog candidates:
- Task list/modal should show workflow status (`Åpen`, `I gang`, `Ferdig`) separately from priority/attention (`Avklar`, etc.).
- For non-route program tasks, label deadline as `Frist` rather than `Distanse / frist`.
- `Ikke knyttet` / `Ikke angitt` cells should not visually imply navigation when no action exists.
- Preserve current view after refresh without cross-user/session leakage; if touching this would overlap current role/security code, test/document only and mark `NEEDS_MAIN_CHAT`.

Avoid `form-runner.js`, live form logic, role capability mapping and Supabase code unless only reading for context.

## Priority D — regression/test hardening
Prefer tests over runtime changes when they can catch the same problem.

Useful additions:
- density/build-injection smoke;
- no-password-persistence assertion for QA role pack;
- admin LAB-link existence/role visibility smoke;
- task status vs priority presentation smoke;
- static accessibility checks for buttons/labels/touch targets where deterministic.

Run existing relevant portal smoke tests after every runtime change. Do not weaken or delete failing assertions merely to get green.

## Explicit HOLD / no-touch list
The main chat owns these until MYFB-008 staff gate is finished:
- live Supabase and all migrations/functions/RLS;
- role/capability/grant semantics;
- `ser_daily` v2 and current SER write/audit test;
- VÍA/GO/Pilot-GO/VIDA form gates;
- physical QA fixtures and participant/pilot state;
- production Netlify deploys and `main`;
- canonical SharePoint Project State/Handover/Decision log/Next steps;
- final decision to merge/publish density or other polish.

## Working style
- Work autonomously within these boundaries.
- Make small coherent commits with descriptive messages.
- Prefer additive, reversible changes.
- No redesign from scratch.
- Do not spend time on speculative features or new frameworks.
- Stop only for an irreversible/security-sensitive choice; otherwise choose the simpler safe option.
- A branch/Deploy Preview may be used only for static/presentational inspection. Do not infer authenticated backend correctness from a preview if its origin is not explicitly supported by current Supabase CORS.

## Required handoff at end
Update this file with a final section `PARALLEL RESULT` containing:
- commits made;
- files changed;
- tests run + result;
- screenshots/preview observations if any;
- `READY_TO_REVIEW` items;
- `NEEDS_MAIN_CHAT` items;
- known conflicts with current `qa/myfb-008-staff` head.

Do not merge. The main chat will inspect/cherry-pick/merge after the active physical role-test milestone.
