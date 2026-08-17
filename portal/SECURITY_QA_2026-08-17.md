# AidMe VIDA portal – security QA 2026-08-17

Status: synthetic / transactional verification only. No real participant data used.

## Verified boundaries

| Scenario | Expected | Result |
|---|---|---|
| Participant account, AAL2 | Sees only own active participant row | PASS – exactly `DEMO-VIA-01` |
| Participant account, AAL2 | Sees own participant-audience task | PASS – 1/1 |
| Participant account, AAL2 | Cannot see staff-only task linked to own participant | PASS – 0 visible |
| Participant account, AAL2 | Cannot see staff task for another participant | PASS – 0 visible |
| Participant account, AAL2 | Cannot read internal VÍA assessment merely because it owns participant record | PASS – 0 for own demo case |
| Participant account, AAL2 | Can read own SER check-ins | PASS |
| Participant account, AAL2 | Cannot read another participant's SER check-ins | PASS – 0 visible |
| VÍA owner scoped to one participant/pilot, AAL2 | Sees only scoped active participant | PASS – only `DEMO-VIA-01` |
| VÍA owner scoped to one participant/pilot, AAL2 | Sees scoped sensitive VÍA assessment | PASS – 1 visible |
| VÍA owner scoped to one participant/pilot, AAL2 | Cannot see another participant's VÍA assessment | PASS – 0 visible |
| VÍA owner, AAL2 | Does not gain SER check-in access without SER capability | PASS – 0 visible |
| VÍA owner, AAL1 | Staff access is blocked until MFA step-up | PASS – 0 active participants / 0 scoped VÍA rows |
| SER lead scoped to pilot, AAL2 | Sees active participants in pilot | PASS – 3 demo participants |
| SER lead scoped to pilot, AAL2 | Sees SER check-ins in pilot | PASS |
| SER lead scoped to pilot, AAL2 | Cannot read sensitive VÍA assessment | PASS – 0 demo VÍA rows |
| SER lead without task-management/assignment | Does not automatically see staff task queue | PASS – 0 tasks |
| System administrator alone, AAL2 | Does not automatically see active participant cases or sensitive VÍA/SER rows | PASS – 0 demo participant/VÍA/SER rows |
| System administrator alone, AAL2 | Can read audit trail | PASS |

## Method

Tests used existing synthetic preview identities, temporary role grants and/or participant linkage inside database transactions. Each transaction ended with `ROLLBACK`, so the test setup did not persist. RLS was exercised with an authenticated JWT context at AAL1 or AAL2 as applicable.

## Security posture after QA

- System administration remains separate from programme/fag access.
- Staff capabilities require AAL2 through `aidme_private.has_capability(...)`.
- Pilot-scoped roles are resolved through the participant's active pilot when the protected table does not store `pilot_id` directly.
- Participant task visibility is additionally constrained by task audience (`PARTICIPANT` / `BOTH`).
- Participant-facing access to internal VÍA/GO rationale remains deliberately separated.
- SOS location is event-bound, participant-initiated and time-limited; there is no general remote tracking endpoint.

## Remaining production gates

This matrix is not a substitute for external penetration testing, DPIA/privacy review, backup/restore testing or incident-response rehearsal. Real sensitive data remains gated. Supabase Auth leaked-password protection is the only current Security Advisor warning and must be enabled when configuration access is available.
