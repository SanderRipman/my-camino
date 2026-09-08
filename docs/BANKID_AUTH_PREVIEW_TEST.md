# BankID / Auth Preview Test — 2026-09-07

Status: **isolert testspor, ikke production**.

## Formål

Teste BankID som et tillegg/alternativ til eksisterende Supabase Auth uten å endre RLS, rolle/scope eller eksisterende Authenticator/TOTP/AAL2-modell.

## Fysisk funn 07.09.2026

Den aktive invitasjonsfunksjonen bruker hardkodet `https://my.aidme.no/welcome.html`. I tillegg finnes ikke root-filen `welcome.html`: Netlify fallback rewrites ukjente paths til root `index.html`, som sender videre til `/portal/`. Den faktiske onboarding-siden er `portal/welcome.html`.

Testsporet løser derfor to separate forhold:

1. redirect må følge aktiv Deploy Preview-origin, ikke production-host;
2. onboarding-path må være `/portal/welcome.html`.

Eksisterende `admin-invite-user` endres ikke i dette testsporet.

## Isolasjon

- Git branch: `bankid-auth-preview-20260907`
- separat draft PR / Netlify Deploy Preview
- PR #127, `camino-qa-20260906`, `main` og production skal ikke endres
- CI-vakt avviser filer utenfor den eksplisitte BankID/Auth-testflaten
- frontend-testside nekter å kjøre utenfor `deploy-preview-<nr>--mycamino.netlify.app`

## Supabase-komponenter

### `admin-invite-user-preview`

Additiv Edge Function. Krav:

- gyldig Supabase JWT
- `aal2`
- aktiv `system_admin`
- Deploy Preview-origin
- eksplisitt `testOnly=true`
- serverberegnet redirect til `<samme preview-origin>/portal/welcome.html`

Ingen production-fallback.

### `bankid-auth-attestation`

Read-only Edge Function. Den:

- verifiserer innlogget Supabase-bruker
- ser kun etter provider `custom:bankid-preprod` på samme bruker
- returnerer ikke provider-subjekt eller annen ekstern identifikator
- klassifiserer bare kjente BankID `acr`-verdier dersom claim faktisk er tilgjengelig
- gir aldri rolle/scope/RLS-effekt
- rapporterer om TOTP-step-up fortsatt kreves

## BankID / OIDC modell

Planlagt provider: `custom:bankid-preprod` via Supabase Custom OIDC Provider.

- OIDC discovery + JWKS-validering håndteres av Supabase Auth
- PKCE beholdes aktivert
- BankID High og BankID Biometric behandles som identitets-/assurance-signaler, ikke som Supabase `aal2`
- arbeidsroller må fortsatt gjennom eksisterende Authenticator/TOTP for sensitive operasjoner
- ingen BankID-identifikator skal brukes direkte som AidMe-rolle eller scope

## Sikker identitetskobling

Testflaten bruker manuell `linkIdentity()` fra en allerede innlogget AidMe-konto. For konto med arbeidsrolle kreves AAL2 før koblingen kan startes. Koblingen endrer ikke `role_grants`.

`Allow manual linking` skal **ikke** aktiveres som forutsetning for preview invitation-E2E. Flagget holdes av til faktisk BankID identity-linking skal testes, og aktiveres først da som en egen kontrollert gate.

Dette foretrekkes fremfor å stole på e-postbasert automatisk linking som hovedmekanisme for eksisterende AidMe-brukere.

## Preview invitation-E2E — bekreftet gate

- Eksakt Deploy Preview: `https://deploy-preview-128--mycamino.netlify.app`
- Fysisk bekreftet Redirect URL i Supabase Authentication → URL Configuration:
  `https://deploy-preview-128--mycamino.netlify.app/portal/welcome.html`
- `Site URL` står fortsatt på `http://localhost:3000` med vilje under denne isolerte preview-testen. Dette er **ikke** en invite-E2E-blokkering, men skal lukkes som separat production-auth-hardening før live.
- Neste fysiske gate er eksisterende `sander@aidme.no` med samme passord/TOTP → faktisk `aal2` + aktiv `system_admin` på PR #128 → nøyaktig én syntetisk preview-invitasjon.

## Stoppunkter før fysisk BankID E2E

1. BankID preprod-avtale/client ID/client secret må foreligge.
2. BankID må registrere Supabase callback URI:
   `https://ibloovohuhrceivrvhvn.supabase.co/auth/v1/callback`
3. Supabase Custom OIDC provider `custom:bankid-preprod` må opprettes med BankID preprod issuer og riktige scopes/authorization parameters.
4. `Allow manual linking` aktiveres først når faktisk BankID identity-linking skal testes.
5. Custom claim `acr` må verifiseres fysisk før assurance-klassifisering brukes som mer enn informasjonsbevis.
6. Fysisk test må kjøres med syntetiske BankID testbrukere og kontrollert testkonto.

## E2E-bevis som kreves

- invitasjon mottas
- auth-handoff returnerer til samme Deploy Preview + `/portal/welcome.html`
- onboarding åpnes med gyldig session
- deltaker får bare egen reise
- mellomnivå får bare tildelt scope
- BankID kan kobles til eksisterende AidMe-bruker uten ny rolle
- arbeidsrolle forblir `aal1` etter BankID-login til Authenticator/TOTP er fullført
- fallback eksisterende e-post/passord/magic link + Authenticator fungerer
