# AidMe VIDA – app strategy

## Decision

Treat `my.aidme.no` as an **app-capable product now**, but do not create a separate native iOS/Android codebase yet.

The portal should first prove its participant journey, staff workflow, security model and pilot operations as one responsive product. Native packaging becomes valuable once the underlying workflows are stable enough that an app is a distribution/experience layer rather than a second product to maintain.

## Phase 1 – now

Build the web portal so it is already app-shaped:

- mobile-first navigation and task-first home screen
- installable PWA metadata
- standalone display mode
- deep-link-safe routes
- API-separated frontend/backend
- no desktop-only workflows
- minimal local storage
- no caching of API/auth/sensitive participant data
- notification model designed so push/email/SMS never needs sensitive payloads
- MFA/step-up authentication as part of the product model

## Phase 2 – after controlled pilot QA

Evaluate App Store / Google Play packaging when all of the following are true:

1. VÍA → SER → VIDA → new VÍA works end-to-end with real test roles.
2. Participant, VÍA, SER, VIDA and admin permissions have passed negative-access tests.
3. MFA/account recovery is usable for non-technical users.
4. Public intake → triage → invitation works safely.
5. DPIA/privacy/retention/backup/incident response controls are closed for the intended data.
6. Notification semantics are stable.

At that point, prefer a thin cross-platform/native shell around the same APIs and product logic rather than cloning the application into two independent products.

## Native-value candidates

- biometric re-entry after strong account authentication
- safe push notifications such as “Du har en ny oppgave” with no health/case detail
- camera/file capture for approved documents
- offline-safe access to deliberately non-sensitive trip information
- emergency/offline operational information that must remain available without portal connectivity
- better home-screen presence and participant adoption
- App Store / Google Play legitimacy and discoverability

## Explicit non-goals now

- no sensitive offline cache
- no health detail in push payloads
- no native-only business logic
- no app-store launch before the portal is operationally stable
- no duplicate authentication or role model outside the backend
