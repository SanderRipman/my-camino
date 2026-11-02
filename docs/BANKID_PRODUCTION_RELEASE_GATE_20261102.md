# CAMINO – BankID produksjonsport 02.11.2026 (ikke gjennomført)

**Konklusjon:** AidMe har implementert et isolert testspor og presentert BankID som *planlagt* alternativ for deltakerne, men produksjonsinnlogging er ikke teknisk, leverandørmessig eller sikkerhetsmessig godkjent.

## Eksisterende kjerne – IKKE RESTART
- PR #128 ble merged til `main` 08.09.2026: `bankid-auth-test.html/js`, read-only attestasjon og preview-invitasjon, uten autorisasjonseffekt. Syntetisk invitasjon/onboarding fysisk PASS, **ikke faktisk BankID**.
- PR #173 ble merged til `demo-uat` 17.09.2026: BankID foretrukket *testspor* i sikkerhetsvisningen og Authenticator fallback, utan dead production button. Ingen ny RLS, rolle eller faktisk BankID-sign-in.
- Supabase Edge Functions `admin-invite-user-preview` og `bankid-auth-attestation`: ACTIVE v2, verify_jwt=true ved read-only kontroll 02.11. Dette er **ikke** BankID OIDC provider-konfigurasjon.
- Gjeldende følsomme skjema krever Supabase `aal2` i database/RLS. BankID High `acr=urn:bankid:bid;LOA=4`, BankID Biometric `acr=urn:bankid:bis;LOA=3` er **andre** sikkerhetsindikatorer enn Supabase `aal2`.
- BankIDs biometri kan falle tilbake på BankID High internt uten at rapportert Biometric LoA endres til 4; kontroller faktisk `acr` fra signert token i fysisk test.
- Produksjonsinnlogging som **valgfritt tillegg** til eksisterende e-post/passord/Authenticator er målet. Ansattroller skal foreløpig fortsette AAL2 via eksisterende TOTP til sikker ekvivalens er validert. Ingen skjult rolletildeling ved e-post/BankID-subjekt.

## Seks dokumenterte GO-gater før produksjon
1. **Leverandør:** velg BankID partner, få riktig test- og production client_id/secret, avtale, pris og behandlingsvilkår. Aldri legg hemmeligheter i GitHub.
2. **Test-OIDC:** verifiser riktig issuer/discovery/JWKS, Supabase custom provider-konfig `custom:bankid-preprod` og registrert callback `https://ibloovohuhrceivrvhvn.supabase.co/auth/v1/callback`; korrekt NO/ES brukerkontekst ved behov.
3. **Fysisk identitet:** syntetisk BankID preprod-testperson, login → samme origin → rett AidMe konto. `linkIdentity()` bare autorisert og kontrollert, ingen ny rolle/scope. Ingen personnummer til klientlogg, frontend, URL, analytics eller profil som standard.
4. **Autentiseringsnivå:** verifiser faktisk signert `acr`, leverandørens garanti/LoA, alders- og tilgjengelighetsbegrensninger. Ikke sett Supabase `aal2` på grunnlag av frontendtekst. BankID som alternativ for sensitiv handling krever backend-verifisert og revidert ekvivalensmodell med eksplisitte RLS-/policytester.
5. **Sikkerhet/GDPR:** controller, avtale, DPIA-vurdering, identity/PII-minimering, kontooverføring, manuell koblings-/frakoblingsprotokoll, gjenoppretting og negative API/RLS tester. Ekstern faglig sikkerhetsreview og operativ rollback.
6. **Go-live:** kontrollert egen PR til `main`, Netlify preview, naturlig språk «Logg inn med BankID» / «Logg inn med e-post»; Synlig BankID først etter faktisk testrunde, overvåkingsplan og eksplisitt produksjons-GO.

## Kilder kontrollert 02.11.2026
- BankID partner/provisioning: https://developer.bankid.no/bankid-oidc-provider/resources/provisioning/
- BankID ACR/LoA: https://developer.bankid.no/bankid-oidc-provider/core-concepts/identity-providers/
- BankID test: https://developer.bankid.no/bankid-with-biometrics/testing/
- Supabase custom OAuth/OIDC: https://supabase.com/docs/guides/auth/custom-oauth-providers
- Supabase MFA/AAL: https://supabase.com/docs/guides/auth/auth-mfa

**Beslutning:** Behold production BankID *HOLD*, bruk demo BankID testflate uten å simulere faktisk verifisert BankID. Dette blokkerer ikke trygg syntetisk UAT av de øvrige deltaker- og måleskjemaene.
