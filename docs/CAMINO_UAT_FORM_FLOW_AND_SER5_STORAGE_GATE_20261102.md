# CAMINO – UAT-oppslag 02.11.2026: Skjemaflyt, SER5 og autentisering

## Funn fra faktisk mobil-UAT
- Ansatt på `demo.aidme.no/portal/form-runner.html` viste «Kontrollerer tilgang og kontekst» uten fremdriftsinformasjon. **Dette er fysisk observert, men teknisk rotårsak er ikke bekreftet for brukerens autentiserte økt.**
- Form-runner har gammel, separat mobilnavigasjon, mens portalens hovedside har ny.
- Tidligere syntetiske QA-role grants var satt til å utløpe 19.10.2026. Read-only SELECT 02.11: ingen aktive grants fra den tidligere `SYNTHETIC_QA_ROLE_PACK`-gruppen (ni rolletyper). Det kan blokkere form-tilgang og gjør UAT-retesten ufullstendig. **Ikke** forleng rettigheter med blind SQL.
- Deltaker fant ikke tydelig nok sin neste handling.
- Et menneske kan ha flere fagroller. Rollemengden er ikke en global superrolle: tilgang må kontrolleres per organisasjon, person, pilot, form og AAL2.

## Kode i denne UAT-PR – sikker og reversibel
- Form-entry guard viser hjelpetekst etter noen sekunder og en konkret, tidsbegrenset feil med forsøk-igjen/tilbake etter 12 sekunder. Ingen ny auth/rolle.
- Form-runner desktop beholder original arbeidsflyt; mobil viser ett innholdsområde i stedet for eldre ekstra sidemeny, med eksplisitt «Oppgaver» og «Til portal».
- Skjema-kontekst synliggjør *faktisk matchende* aktive arbeidsroller. Frontend-sjekk av scope hindrer forvirrende skriveforsøk, men **RLS er den autoritative sperren**.
- Eksisterende `via_roadmap`/`ser_daily`/`vida_plan` og operative skjema er urørt i DB. På hovedoversikten er én relevant handling prioritert basert på deltakernes faktiske fase eller ansattens eksisterende oppgavekø.
- Ingen ny realdatainnsamling, ingen nye GRANT, RLS, view eller service_role/Edge Function.

## Lagring av SER5: en egen sikkerhetsgate
- Gjeldende nye `ser-five-checkin-uat.html` er **syntetisk, uten lagring**; ingen produksjonsdata går til den.
- Én Supabase-prosjektinstans `ibloovohuhrceivrvhvn` deles mellom `demo.aidme.no` og `my.aidme.no`. Det finnes foreløpig **ikke** en isolert, godkjent UAT-database. Å opprette en ny versjonert form i `public.form_definitions/form_versions` kan gjøre den synlig i produksjon og krever sikker kontroll av `aidme_private.participant_form_allowed`/`staff_form_allowed_v2`, policies, scope og alias/pseudonym.
- Anbefalt fysisk UAT-gate: isolert Supabase-testprosjekt eller faglig godkjent, serveravgrenset syntetisk namespace med eksplisitt allowlist av QA-kontoer. Lagring via `form_submissions` eller separat isolert SER5-lager, `DRAFT`/`SUBMITTED`, RLS, AAL2, revisjonslogg, fiktive kodenavn, retur/overlevering til navngitt SER-leder; negativ test annen deltaker/feil pilot/for lav AAL.
- Verifiser at fagpersonen bare leser syntetiske besvarelser for sitt faktiske scope; superbruker gir ikke automatisk sensitivt faginnsyn.
- Forhindr dobbel innsending samme dag og behold historikk/skjemaversjon. Aggregert rapport må filtrere på SER5-modellen og ikke automatisk konvertere WHO-5 eller reversere tidligere `stress` som om dette var samme spørsmål.
- Etter fysisk autorisasjons-test, personvernformål, samtykke og faglige formuleringer: kontrollert produksjons-PR. **Ingen lagring i denne PR**.

## Billig, men trygg MFA
- Primær: TOTP/Authenticator, allerede AAL2 i prosjektet, ingen ekstra leverandørbetaling per OTP i app.
- Supabase Phone MFA SMS/WhatsApp er AAL2 via separat enrol/challenge/verify, men offisiell Supabase-pris 02.11.2026 er USD 75/mnd for første prosjekt (+ SMS/WhatsApp), tilsvarende USD 10/mnd for ytterligere prosjekt – ikke anbefalt aktivert uten budsjett-GO. Kilde https://supabase.com/docs/guides/auth/auth-mfa/phone og https://supabase.com/docs/guides/platform/manage-your-usage/advanced-mfa-phone.
- E-post magic link/OTP er brukervennlig AAL1, **ikke** AAL2. Kilde https://supabase.com/docs/guides/auth/auth-email-passwordless
- Passkey/WebAuthn er per 02.11 fortsatt eksperimentelt i Supabase Auth (krever ny SDK og styrt relying-party-origins). Ikke en godkjent AAL2-erstatning i Camino. Kilde https://supabase.com/docs/guides/auth/passkeys
- BankID er egen leverandør-/OIDC/ACR-gate. Fortsett med eksisterende AAL2 uten å presse brukerne inn i uferdig BankID-test.

## Fysisk UAT etter denne PR
1. Bruk `demo.aidme.no` med autorisert ansattkonto. Trykk skjema fra tildelt oppgave. Bekreft at det åpnes, eller at du får et tydelig valg «Prøv igjen»/«Tilbake» innen 12 sekunder; ikke evig «Kontrollerer».
2. Kontroller ny mobil visning og «Oppgaver»/«Til portal», ikke dobbel toppmeny.
3. Dersom ingen gyldige aktive fagroller, bruk riktig autorisert admin-prosess for fornyelse av **syntetisk** rollepakke; ikke forveksle en visningsrolle med faktisk grant.
4. Test samme person med to legitime tidsavgrensede fagroller, én riktig deltaker og én ikke-tildelt. Rett skal kunne åpnes; andre skal avvises i frontend **og** DB RLS.
5. Test med ekte QA-deltakerkonto (ikke «Deltaker (demo)» simulering): den fremhevede neste handlingen skal åpne riktig VÍA/SER/VIDA-steg, via AAL2 når påkrevd. Ingen sensitiv data i UAT.
6. Test SER5 kompakt utforming uten lagring. Lagring/cross-account ansattinnsyn er **OPEN** inntil separat dataprosjekt/sikkerhetsgate.
7. Registrer mislykkede auth/rollesteg med tid, testkontoens rolle og skjermbilde uten personopplysninger; beskriv hvilken handling brukeren tok. Ingen deling av passord, QR/TOTP eller personnummer.

## Kontrollpunkt
Denne PR endrer kun `demo-uat`-presentasjon og frontend preflight. Supabase DB, auth, published form versions, main/production og rettighetstildelinger er uendret. Ingen rollebaserte E2E-tester kan godkjennes automatisk uten fysiske, avgrensede kontoer.
