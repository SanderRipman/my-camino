# PARALLELL SPRÅKVASK / MIKROTEKST – ARBEIDSPAKKE

## Formål
Forenkle norsk brukerrettet språk i `my.aidme.no` uten å endre metode, sikkerhet, rettigheter eller arbeidsflyt. Språket skal være kort, saklig, menneskelig og lett å forstå. Tonen kan være varm og oppmuntrende, men aldri klinisk, moraliserende eller overforklarende.

AidMe VIDA-kjernen skal ligge fast: VÍA = før, SER = under, VIDA = etter. Ingen språkforenkling skal skjule reelle sikkerhetskrav, ansvar, frivillighet, go/no-go eller navngitt VIDA-eier.

## Kildehierarki før arbeid
1. `@SharePoint CAMINO LIVE` og aktiv `CAMINO_PROJECT_STATE.md` / `CAMINO_HANDOVER_LIVE.md`.
2. Prosjektinstruks.
3. Aktiv fagkjerne for programidentitet, deltakerløp/sikkerhet og fagroller/etiske grenser.
4. Gjeldende GitHub `main` og denne arbeidsgrenen.

Hvis språkforslag kolliderer med metode/fag/sikkerhet, er kilden autoritet og copy skal ikke endres blindt.

## Arbeidsgren og leveranse
- Arbeid KUN på `qa/parallel-language-polish-20260903`.
- Baseline ved oppstart: `main` `09895d2ffe6c50cd9db56c361d1294fbbf46ff45`.
- Ikke merge, ikke production-deploy, ikke rebase uten ny konfliktkontroll.
- Opprett til slutt en DRAFT PR mot `main` og merk den tydelig `READY_TO_REVIEW`.
- Hovedchatten avgjør eventuell integrasjon.

## Språkprinsipper
- Bruk vanlige norske ord når de dekker samme mening.
- Én setning = helst én idé.
- Forklar hva brukeren skal gjøre nå, før teknisk bakgrunn.
- Korte overskrifter og korte hjelpetekster.
- Unngå internsjargong i primærflaten: `scope`, `gate`, `workflow`, `aggregate-only`, `fail-closed`, `direct URL`, `runtime`, `fixture`, `submission` osv.
- Når et teknisk begrep faktisk må beholdes, legg menneskelig forklaring først og teknisk navn sekundært.
- Ikke bruk global search/replace. Vurder hvert ord i kontekst.
- Ikke gjøre teksten barnslig. Mål: profesjonell, rolig, forståelig.
- Ikke formulere AidMe VIDA som behandling, kur eller garantert effekt.
- Bevar `Ingen krav om personlig deling` der relevant.

## Eksempler på ønsket retning
Dette er eksempler, ikke en blind ordliste:
- `scope` → `tilgang`, `ansvarsområde` eller `det du har ansvar for`.
- `gate` → `kontrollpunkt`, `beslutningspunkt` eller konkret handling.
- `workflow` → `arbeidsflyt`, `forløp` eller `neste steg`.
- `aggregate-only` → `kun anonymisert gruppenivå`.
- `fail-closed` → brukerrettet: `tilgangen er sperret når noe er uklart`; behold teknisk term i admin-/utviklerdokumentasjon.
- `participant context` → `deltakeren saken gjelder` / `deltakerkontekst`, avhengig av flate.
- `pilot scope` → `piloten/gruppen du har ansvar for`.

## Fase A – inventar før endring
Lag først en liten oversikt over brukerrettet tekst i portal som er:
1. unødig teknisk,
2. for lang,
3. tvetydig,
4. lite handlingsrettet,
5. inkonsistent mellom sider.

Prioriter P1/P2/P3. Ikke endre kode i de første minuttene før mønsteret er forstått.

## Fase B – tillatte reversible endringer
Du kan selvstendig forbedre lavrisiko presentasjonstekst, blant annet:
- `Slik fungerer det` / guide-tekst,
- statiske hjelpetekster og forklarende mikrocopy,
- tomtilstander (`Ingen ... ennå`) der semantikken er åpenbar,
- oversikts-/introduksjonstekst,
- QA/LAB-forklaringer som ikke endrer sikkerhetskrav,
- ikke-funksjonelle etiketter/sekundærtekster der meningen er identisk.

Hvis NO/EN ligger som et eksplisitt par i samme komponent, kan begge oppdateres kontrollert når betydningen er entydig. Ellers er norsk autoritet; noter EN-delta til review i stedet for å gjette.

## IKKE RØR – hovedchatens aktive/testkritiske flater
Ikke gjør atferdsendringer eller semantiske endringer i:
- Supabase, RLS, capabilities, grants, MFA/AAL2, auth eller audit,
- form-definitioner, obligatoriske felt, validering eller beslutningsverdier,
- `returnContext` / task→gate→return-flyt,
- routing/deep-links,
- MYFB-008 aktive rolle-/scope-testforutsetninger,
- Pilot-GO-/GO/NO-GO-logikk,
- SER/VIDA workflow-semantikk,
- Netlify/DNS/build-konfig,
- QA credential-/rollepakke-livssyklus.

Unngå også å endre aktive `form-runner`-tekster som kan påvirke fysisk rolle-QA. Der kan du heller registrere språkforslag i resultatnotatet for hovedchatten.

## Kvalitetsregel
Ingen snarveier. En tekstendring er bare god hvis den:
- gjør brukerens neste handling tydeligere,
- ikke fjerner viktig sikkerhets-/ansvarsinformasjon,
- ikke introduserer nytt faglig innhold,
- ikke gjør rollen mer eller mindre autorisert enn før,
- ikke endrer betydningen av en status eller beslutning.

## Testing
For kodeendringer:
- kjør relevant Portal smoke,
- kjør Netlify router/site-aware QA hvis berørte filer omfattes,
- kjør eventuelle eksisterende copy/navigation smoke-tester,
- ingen deploy til production.

Hvis baselinefeil finnes fra før, dokumenter dem og ikke omgå dem for å få grønt resultat.

## Stop-regler
Stopp og legg i `NEEDS_MAIN_CHAT` hvis:
- copy påvirker juridisk/sikkerhetsmessig betydning,
- en teknisk term er nødvendig for presisjon og ingen trygg erstatning er åpenbar,
- filen samtidig endres i hovedsporet,
- endringen krever backend/rolle/form/workflow,
- du må velge mellom to faglig forskjellige betydninger.

## Sluttleveranse
Oppdater denne filen med seksjon `PARALLEL RESULT` og oppgi:
- hva som ble endret,
- hva som kun ble foreslått,
- tester/resultat,
- filer berørt,
- eventuelle konflikter mot nyere `main`,
- `READY_TO_REVIEW` og draft PR-nummer,
- `NEEDS_MAIN_CHAT` for punkter som krever beslutning.

Ikke merge eller deploy. Ikke skriv inn nye produktbeslutninger i SharePoint-styringen; hovedchatten integrerer godkjent resultat ved neste checkpoint.

---

# PARALLEL RESULT

Fullført 2026-09-03 på isolert branch `qa/parallel-language-polish-20260903`.

Ingen production-deploy, merge, Supabase-/RLS-/capability-/grant-/MFA-endring, form-/beslutningsendring, returnContext-/routingendring eller fysisk MYFB-008-stateendring er gjort. SharePoint er brukt som read-only faglig fasit; kanoniske styringsfiler er ikke skrevet til.

## Kildegrunnlag brukt før endring
- `CAMINO_LIVE_START_HER.md`, aktiv Project State og Live Handover.
- Beslutningslogg, Dokumentregister og Neste steg.
- `AidMe_VIDA_programidentitet_og_kjernefortelling_v0_2_UTKAST.docx`.
- `VIA_SER_VIDA_deltakerlop_sikkerhet_og_minimumskjerne_v0_3_UTKAST.docx`.
- `Fagroller_ansvar_og_etiske_grenser_v0_3_UTKAST.docx`.
- aktiv malpakke / `00_README_AKTIV_MALPAKKE.md`.
- GitHub `USER_JOURNEY.md`, `END_TO_END_ROLE_JOURNEY.md` og `STREAMLINE_ROLE_FLOW_2026-08-24.md`.

Språkendringene følger særlig disse etablerte prinsippene: neste handling først, én opplysning registreres ved riktig kilde én gang, minst nødvendig data, tydelig ansvar, frivillighet og menneskelig forklaring uten å svekke formelle sikkerhetskrav.

## Inventar
Eget P1/P2/P3-inventar er lagret i `portal/PARALLEL_LANGUAGE_INVENTORY_2026-09-03.md`.

Hovedmønstre:
1. internsjargong i primærtekst (`UI`, `scope`, `gate`, tekniske systemforklaringer),
2. systemarkitektur forklart før brukerens neste handling,
3. QA-/admintekst som var presis, men unødvendig teknisk før menneskelig forklaring.

## Endret
### `portal/index.html`
- beta-banner beskriver portalen og kontrollene med vanlige ord i stedet for `UI` og `produksjonsgater`;
- deltaker-/oppgaveintro forklarer konkret hva brukeren finner;
- Skjema & rutiner forklarer én registrering / riktig rolle i stedet for intern lagringsarkitektur;
- gammel skjemademo er tydelig merket som utviklingsreferanse og ikke sted for reelle opplysninger;
- dokumentopplasting bruker vanlig språk fremfor `lagrings-QA` / `metadata klargjort`;
- tofaktor forklares som `bekreftet tofaktor (AAL2)`;
- deaktivert kontaktfunksjon beskrives som ikke åpnet ennå, ikke som intern utviklingsblokk.

### `portal/admin.html`
- AAL2 forklares som bekreftet tofaktor;
- `Kodenavn i operativ arbeidsflate` er forenklet til `Kodenavn i arbeidsflaten`;
- sikkerhetsforklaring er snudd fra nettleser-/adminsjargong til `Rettigheter kontrolleres på serveren`, med `system_admin` beholdt sekundært som teknisk bevis.

### `portal/welcome.html`
- onboarding forklarer hva brukeren gjør nå og hva som skjer etter lagring, ut fra deltakerreise eller arbeidsrolle.

### `portal/owners.html`
- synlig `scope` og `gate` er erstattet med `tilgang` og konkret krav;
- navngitt VIDA-eier er fortsatt eksplisitt og ufravikelig;
- teknisk `oppgavemotor` er erstattet med vanlig forklaring om overganger og oppgaver.

### `portal/pilot-ops.html`
- `SER-/pilottilgang` er konkretisert til tilgang til denne SER-gruppen;
- `Gate / styring` er erstattet med `Før oppstart`;
- formelt `Pilot-GO` er beholdt og teksten sier fortsatt tydelig at det må være godkjent før SER starter;
- pause, kortere etappe, transport og avbrudd står fortsatt som legitime sikkerhetstiltak.

### `portal/qa-role-pack.html`
- `Rolle- og scope-QA` → `Rolle- og tilgangstest (QA)`;
- RLS/AAL2 beholdes, men får menneskelig forklaring først;
- `staff-grants` / `rolle-grants` er erstattet med tilganger/rolletilganger;
- Break-glass forklares som midlertidig nødtilgang, samtidig som det tekniske navnet beholdes;
- `in-scope/out-of-scope`, `handoff` og `gate` i testrekkefølgen er erstattet med konkret tillatt/avvist tilgang, overgang og kontrollpunkt;
- `Scope`-kolonnen heter nå `Tilgang`.

## Test- og regresjonsvern
Nye filer:
- `portal/language-polish-smoke.mjs`
- `.github/workflows/parallel-language-polish-smoke.yml`

Smoken kontrollerer både klarspråksforbedringene og at nødvendige formelle/sikkerhetsmessige begreper ikke forsvinner, blant annet:
- VÍA → SER → VIDA → ny VÍA,
- GO/NO-GO,
- navngitt VIDA-eier,
- Pilot-GO,
- AAL2,
- RLS,
- `system_admin`,
- Break-glass og direkte-URL-negativtest i QA.

## Tester/resultat på PR-head før dette resultatnotatet
PASS:
- `Parallel language polish smoke` run #1.
- `Portal smoke` run #262.
- `Netlify site-aware router QA` run #89.
- `Portal invite and onboarding smoke` run #28, jobb `smoke` PASS.

Ingen eksisterende test ble svekket eller slettet for å få grønt resultat.

## Filer berørt
- `.github/workflows/parallel-language-polish-smoke.yml` – ny, isolert copy-smoke.
- `portal/PARALLEL_LANGUAGE_INVENTORY_2026-09-03.md` – nytt språk-inventar.
- `portal/PARALLEL_LANGUAGE_POLISH_WORK_PACKAGE_2026-09-03.md` – dette resultatet.
- `portal/admin.html` – statisk mikrocopy.
- `portal/index.html` – statisk mikrocopy.
- `portal/language-polish-smoke.mjs` – ny deterministisk klarspråk-smoke.
- `portal/owners.html` – statisk mikrocopy.
- `portal/pilot-ops.html` – statisk mikrocopy.
- `portal/qa-role-pack.html` – QA/LAB-mikrocopy, ingen credential-/rollepakkeendring.
- `portal/welcome.html` – onboarding-mikrocopy.

## Kun foreslått / bevisst ikke endret
- dynamisk copy i `app-context.js`, `app-return-context.js`, `app-go-decision.js`, `app-ser-vida*.js` og tilsvarende rolle-/handofflag;
- aktive `form-runner`-tekster og formdefinisjoner under fysisk MYFB-008;
- formelle status-/beslutningsverdier;
- routing/deep-links/refresh-bevaring;
- SOS-/lokasjonsavsnittet med DPIA/beredskaps-/tilgangsregler er ikke omskrevet autonomt fordi en klarspråksendring kan påvirke personvern-/sikkerhetsbetydning;
- `Mottak og triage` beholdes foreløpig som intern staff-betegnelse; fysisk/eksisterende N2-smoke beskytter også denne implementeringsreferansen.

## NEEDS_MAIN_CHAT
1. Etter fysisk MYFB-008: vurder en kontrollert klarspråksrunde i dynamiske rolle-/kontekst-/handofftekster. Dette må gjøres sammen med eksisterende rolle- og workflow-smokes, ikke som global utskifting.
2. Vurder brukerrettet klarspråk for SOS/lokasjon/DPIA-teksten sammen med personvern-/beredskapsansvarlig; juridisk/sikkerhetsmessig betydning skal ikke forenkles ved gjetning.
3. Vurder om internbetegnelsen `triage` bør beholdes i staff-flaten eller forklares som `mottak og første vurdering`. Ingen endring er gjort fordi begrepet inngår i aktiv N2-implementerings-/QA-referanse.
4. Dersom de samme tekstene senere får eksplisitte NO/EN-par, oppdater engelsk kontrollert etter norsk godkjenning. Det ble ikke gjettet frem nye engelske speil i dette sporet.

## Konfliktkontroll mot `main`
Ved siste read-only kontroll før dette resultatnotatet var `main` fortsatt nøyaktig baseline `09895d2ffe6c50cd9db56c361d1294fbbf46ff45`. Branchen var derfor `behind_by: 0`, og ingen nyere `main`-konflikt var til stede.

## READY_TO_REVIEW
**YES.**

DRAFT PR: **#123 – `Polish: klarspråk og mikrocopy i portal`**
- base: `main`
- head: `qa/parallel-language-polish-20260903`
- status: DRAFT / åpen / ikke merget

Hovedchatten avgjør eventuell integrasjon. Ikke merge eller deploy fra dette parallellsporet.
