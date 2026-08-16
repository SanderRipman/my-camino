# AidMe VIDA production portal

This folder is the controlled production-portal foundation for `my.aidme.no`.

## Current preview status – 2026-08-16

- Development branch: `portal-production-foundation-20260816`
- Draft PR: #22
- Netlify deploy-preview: `https://deploy-preview-22--mycamino.netlify.app/`
- Branch root redirects to `/portal/` for owner/user QA.
- Live `my.aidme.no` is intentionally unchanged until the first owner login + TOTP/AAL2 smoke test is green.
- A synthetic preview dataset exists for interest, VÍA, SER and VIDA workflow testing. Do not enter real participant or health information.

## Product principles

- participant: **Din neste handling**
- staff: **Trenger handling nå**
- VÍA → SER → VIDA → ny VÍA is the operational journey, not decoration
- information is collected once and reused where lawful and necessary
- roles and scopes are enforced server-side; UI hiding is never the security boundary
- staff/admin access requires MFA/AAL2
- system administration does not automatically grant participant-sensitive access
- sensitive API/auth/participant data must never be cached by the PWA service worker
- public interest intake is server-mediated and remains disabled until anti-abuse and privacy gates are closed

## Preview login model

The owner preview supports a temporary password-based login so the first account can be tested without depending on email redirect configuration. After login, a staff/admin account is forced to the Security view until Authenticator/TOTP is enrolled and the session reaches AAL2. A password-change form is available after AAL2.

Temporary credentials are intentionally **not** stored in Git or SharePoint. They must be rotated before any real-data phase.

## Security boundary

The browser uses only the Supabase publishable key. Database RLS, restrictive AAL2 policies, scoped role grants and server/Edge Function authorization are the security controls. Backend secret keys never belong in browser code.

## Before beta merge to live `my.aidme.no`

1. Owner login succeeds in deploy preview.
2. Owner enrolls Authenticator and reaches AAL2.
3. Core staff queue and administration page load correctly.
4. Basic negative-access tests are run with separate role accounts.
5. No real participant data is used during this phase.

Real sensitive data has additional gates: DPIA/privacy/legal basis, retention/deletion, backup/restore, incident response, processor/subprocessor review and final operational authorization.
