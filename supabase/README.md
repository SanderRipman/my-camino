# AidMe VIDA – Supabase production layer

This directory is the Git source-control home for the AidMe VIDA backend used by `my.aidme.no`.

## Remote project

- Project ref: `ibloovohuhrceivrvhvn`
- Region: `eu-west-3`
- Database is production-oriented but **must not contain real participant-sensitive data before the privacy/DPIA/retention/backup controls are closed and the portal has passed role-based QA**.

## Current remote migration history

The following migrations are already applied remotely and are the current production foundation:

1. `20260816190729 aidme_portal_foundation_v1`
2. `20260816190910 aidme_portal_security_hardening_v1`
3. `20260816191231 aidme_portal_audit_and_participant_guards_v1`
4. `20260816191301 aidme_portal_reference_data_v1`
5. `20260816193727 aidme_portal_auth_mfa_and_bootstrap_v1`
6. `20260816193937 aidme_portal_rls_performance_cleanup_v1`
7. `20260816193951 aidme_portal_ser_policy_merge_v1`
8. `20260816194037 aidme_portal_self_access_read_v1`
9. `20260816194105 aidme_portal_staff_requires_aal2_v1`

The remote migration ledger remains authoritative for the already-applied SQL until all historical files are backfilled verbatim into `supabase/migrations/`. New migrations must be committed to Git before/with application.

## Security model

- Supabase Auth is the identity layer.
- Participant self-access is row-scoped.
- Staff access is capability-based through `role_grants` and `role_permissions`.
- **All staff capability checks require AAL2/MFA at database level.**
- Sensitive-domain tables additionally have restrictive AAL2 RLS gates.
- `aidme_private` contains non-public helper functions.
- Audit events are append-only from application roles.
- Public anonymous intake does not have direct table access.
- `break_glass` requires a reason and expiry.

## Server-side admin APIs

Edge Functions under `functions/` are deployed with JWT verification enabled. Admin operations require a valid signed-in user, AAL2, and an active `system_admin` grant.

Current functions:

- `admin-invite-user`
- `admin-grant-role`
- `admin-revoke-role`

## Public intake

The intended flow is:

`aidme.no interest form → hardened Edge Function → server-only intakes → triage task → invitation to VÍA → my.aidme.no`

Do not enable anonymous intake until CAPTCHA/rate limiting, privacy copy/version, abuse handling and field minimisation have been wired and QA-tested.
