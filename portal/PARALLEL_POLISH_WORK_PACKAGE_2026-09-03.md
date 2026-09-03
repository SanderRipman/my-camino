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

---

# PARALLEL RESULT

Completed 2026-09-03 in isolated branch `qa/parallel-polish-20260903`. No production deploy, no live Supabase write, no migration/Edge Function/RLS/grant/MFA/role/capability/form-gate change, no physical MYFB-008 fixture/state change, no `ser_daily` v2 change, and no canonical SharePoint write.

## Commits made in this parallel session
- `aa436328a8a43d8d04c569cbede537c50da8c184` — `fix(portal): load desktop density and clarify task semantics`
- `3fd806c7291011c15b0acf52458e233f242e404d` — `polish(admin): expose synthetic role QA lab`
- `f8d537c5a7569b9e4b49d251c9790ee0673babde` — `polish(qa): clarify credential lifetime and renewal path`
- `c6050a20beca0a74a2406d587bb91530d3b18679` — `test(portal): add isolated polish regression smoke`
- `b9589995ad2a570a439c4a560556e5f69190ef7f` — `ci(portal): run parallel polish regression smoke` (diagnostic attempt; subsequently neutralized so frozen Portal smoke baseline remained untouched)
- `72c3bec183c4e1977812e64cbe36d660ba50eb46` — `ci(portal): keep frozen baseline checks untouched`
- `ba995be0b29fe82de6410738c05f7b4b5ff411d8` — `ci(polish): run isolated presentation smoke`
- `2e57f4439ccef9c3d1fd67d25267bac2c751053f` — `polish(tasks): separate status attention and static empty context`
- `395f11c9703d6883c081cb139e4bbb21336a04bf` — `polish(portal): load isolated task presentation layer`
- `8cba0102b1c5f19b61f0b60ad3827f043c0e4bb6` — `test(polish): cover task presentation boundaries`
- `cac306979e9e4da703feb7544f1424a6abf6b2c5` — `ci(polish): syntax-check task presentation layer`

Branch also contains the two work-package/bootstrap commits created before this session; frozen merge-base remains `a3524bcd56726ab74a5e2aba7d1024536d990b28`.

## Files changed versus frozen base
Effective branch diff before this result update:
- `.github/workflows/parallel-polish-smoke.yml` — new isolated presentation-only CI.
- `portal/PARALLEL_POLISH_WORK_PACKAGE_2026-09-03.md` — work contract + this result.
- `portal/admin.html` — density stylesheet loaded; gated systemadmin LAB entry added.
- `portal/app-parallel-polish.js` — new presentation-only task-dialog polish layer; no Supabase/access/workflow writes.
- `portal/index.html` — density loaded; static status-vs-attention copy; task polish layer loaded after `app.js`.
- `portal/parallel-polish-smoke.mjs` — deterministic regression assertions.
- `portal/qa-role-pack.html` — credential-lifetime/clipboard copy, renewal-vs-recreate explanation, 44 px QA controls.

`portal/density.css` itself is unchanged from the frozen branch base; this session fixed its missing injection/use.

## Implemented / observations
### A — desktop density
- Existing `density.css` is now actually loaded by portal and admin.
- Density remains scoped to `@media (min-width: 1100px)`; no mobile/tablet breakpoint was added.
- Existing desktop pass reduces sidebar from 250 px to 220 px, workspace horizontal padding from 34 px to 27 px, plus moderate card/heading/sidebar spacing reductions.
- CSS/layout logic is compatible with the requested 1366×768, 1440×900 and 1920×1080 desktop references: no new fixed-width content wider than the available main column was introduced; existing responsive rules still collapse grids at <=1100 px.
- At exactly 1100 px both the existing `max-width:1100px` responsive rules and the later-loaded density rule apply; the later density values win only for overlapping properties while existing grids remain in their <=1100 responsive layout. No change was made because this preserves the safer compact boundary behavior.

### B — QA/LAB
- Added discoverable `LAB · syntetisk rolle-QA` entry inside the already gated `adminWorkspace`; `qa-role-pack.js` still independently requires AAL2 + active `system_admin`.
- Clarified that generated passwords are transient page-memory/DOM display, are not stored by the QA code in localStorage/sessionStorage/IndexedDB, and cannot be recovered from QA on another laptop.
- Kept existing copy buttons; copy now explicitly warns that OS clipboard history may retain copied credentials and should be cleared after QA.
- Visually/copy-wise separated `Opprett ny rollepakke` (may rotate temporary test passwords) from `Forny én uke` (existing `extend_week`, preserves password/MFA/testdata).
- Added deterministic 44 px minimum target for QA copy/action controls.

### C — task UX clarity
- Static task-page copy now explicitly separates `Arbeidsstatus: Åpen / I gang / Ferdig` from `Oppmerksomhet: Kritisk / Avklar / Normal`.
- Task-dialog eyebrow now presents the two concepts separately instead of `RØD/GUL/GRØNN · status`.
- Route-less tasks relabel the last context cell from `Distanse / frist` to `Frist`; context-dialog title is normalized to the same label.
- Deterministically actionless empty cells are cloned without click/key handlers so they no longer look/behave navigably:
  - participant `Ikke knyttet` when no participant exists;
  - route/stage `Ikke angitt` when the capability-aware context resolver already marked the cell informational.
- Empty pilot `Ikke knyttet` is intentionally not blanket-disabled because an own-participant view can legitimately expose Help/contact there.
- These changes live in additive `app-parallel-polish.js` after final `app.js`; smoke asserts that the layer contains no Supabase calls, role/capability logic or browser persistence.

## Tests run
Final relevant commit tested: `cac306979e9e4da703feb7544f1424a6abf6b2c5`.

PASS:
- `Parallel polish smoke` run #5 — PASS.
  - `node --check portal/qa-role-pack.js` — PASS.
  - `node --check portal/app-parallel-polish.js` — PASS.
  - `node portal/parallel-polish-smoke.mjs` — PASS.
- `Portal invite and onboarding smoke` run #25 — PASS.
- `Netlify site-aware router QA` run #81 — PASS.

Known blocked baseline:
- `Portal smoke` run #249 — FAILS at its first pre-existing/frozen source-parity assertion: repository has `22` `supabase/functions/*` directories while this frozen workflow expects `20`.
- Failure happens before maintained-JS syntax, build and portal smoke steps run.
- This session did not change any Supabase function source and did not weaken/update the expected list merely to get green.

## Visual / preview observations
- No production or authenticated Deploy Preview was used.
- No conclusion about authenticated Supabase behavior is drawn from branch/preview origin.
- Visual assessment here is CSS/DOM/static-test based; before integration, a normal 100% browser-zoom spot-check at 1366×768, 1440×900 and 1920×1080 is still appropriate for subjective density/readability.

## READY_TO_REVIEW
1. Desktop density injection for main portal + admin (existing branch-only CSS, now active).
2. Admin → LAB discoverability link with no new privilege.
3. QA password-lifetime/clipboard explanation and clearer `Opprett` vs `Forny` UX.
4. QA touch-target hardening.
5. Task status-vs-attention presentation separation.
6. Route-less `Frist` label.
7. Static presentation for deterministic actionless empty context cells.
8. Isolated `parallel-polish-smoke` CI and regression assertions.

## NEEDS_MAIN_CHAT
1. **Portal smoke source-parity baseline:** reconcile the current canonical/function-source set and expected workflow list (`22` present vs `20` expected in frozen branch) in the main integration flow. Do not infer that deleting two functions or weakening the test is correct.
2. **Refresh preservation:** not implemented. Existing `app-return-context.js` owns task → form gate → same-task return and strips return params after resume. Extending refresh persistence there could affect current gate/role continuity, so main chat should decide after physical staff QA.
3. **Pilot `Ikke knyttet` nuance:** presentation layer deliberately does not blanket-disable this cell because own-participant Help/contact can be a valid action. If main chat wants perfect action/no-action styling for every role, fold the rule into the capability-aware context resolver after the current staff milestone.
4. **Integration decision:** review/cherry-pick/merge PR #117 only after main chat's active MYFB-008 role milestone. Do not merge automatically.

## Possible conflicts with current `qa/myfb-008-staff`
Read-only conflict check at handoff time: current `qa/myfb-008-staff` head is still exactly frozen base `a3524bcd56726ab74a5e2aba7d1024536d990b28`; therefore there are **no current code conflicts** against a newer QA head at this moment.

Potential future overlap if main chat advances before integration:
- `portal/index.html`
- `portal/admin.html`
- `portal/qa-role-pack.html`

Additive files (`portal/app-parallel-polish.js`, `portal/parallel-polish-smoke.mjs`, `.github/workflows/parallel-polish-smoke.yml`) should be low-conflict. Do not rebase this branch; let main chat integrate against its then-current head.

## Handoff state
- `READY_TO_REVIEW`: YES, with the explicit Portal smoke baseline exception above.
- PR #117 must remain draft / unmerged.
- SharePoint canonical steering remains untouched by this parallel session.
