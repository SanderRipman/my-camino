# AidMe VIDA – helhetlig N1/rolle/flyt-QA – 2026-08-21

## Formål

Kvalitetssikre at N1 ikke optimaliseres som en isolert nettside, men peker inn i en sammenhengende, intuitiv og minst mulig duplicerende reise for deltaker, fagroller, program, logistikk, VIDA, partner og system.

## Konklusjon

N1 kan stå LIVE / VERIFY frem til fysisk visuell test. Ingen funn krever ny public redesign før den testen. De viktigste gevinstene ligger nå i kontinuitet og rett neste handling fra interesse → mottak → VÍA → beslutning → SER → VIDA.

### Bekreftet retning

- VÍA, SER og VIDA er de tre programstegene.
- Trygghet følger alle tre steg og vises separat som fundament.
- `ny VÍA` er valgfritt senere startpunkt, ikke steg 4.
- Tidlig deltakerinngang er lavterskel og dataminimal; interesse er ikke påmelding/godkjenning.
- SER er den tydeligste erfaringsarenaen; andre ruter kan brukes når det er mer riktig.
- Santiago er overgang til VIDA, ikke slutten eller et prestasjonskrav.
- Klikkbare kontekstfelt følger `detalj → neste lovlige handling`; trykkbart betyr ikke redigerbart.
- Mini CRM forblir relasjons-/partnerflate og er ikke deltakerregister.

## Sammenhengende systemreise

Den operative normalformen er:

`aidme.no → kort interesse → mottak/triage → VÍA-invitasjon → VÍA-avklaring → individuell beslutning → avtale/beredskap → samlet SER-gate → SER → SER→VIDA → én levende VIDA-plan → aggregert evaluering / eventuell ny VÍA`

Hver overgang skal helst bruke samme saks-/deltakeridentitet og gjøre neste handling synlig uten å sende brukeren til et dokumentarkiv.

## Skjema og ansvar

| Nøkkel | Funksjon | Primær rolle |
|---|---|---|
| `info_before_via` | kort informasjon/forventning | deltaker/VÍA |
| `interest_referral` | interesse/henvisning | mottak/program/VÍA |
| `via_roadmap` | VÍA veikart/beredskap | deltaker + VÍA |
| `individual_go_no_go` | individuell formell beslutning | VÍA/relevant fagperson |
| `participant_agreement` | avtale/kontaktvalg | deltaker + VÍA/program |
| `pilot_go` | samlet operativ SER-gate | program/logistikk |
| `ser_daily` | kort normaldag | deltaker/SER |
| `incident` | faktisk hendelse/avvik | SER/fag etter mandat |
| `vida_plan` | én levende 72t/14/30/90-plan | deltaker + VIDA-eier |
| `pilot_evaluation` | aggregert læring | prosjekteier/evaluator |

Skjema 06B (SER 1:1) og teknisk støtte A brukes ved behov og skal ikke bli obligatoriske parallelle hovedløp.

## Rolle-QA

Eksisterende `/portal/qa-role-pack.html` er riktig hovedverktøy for realistisk syntetisk E2E-test. Den dekker deltaker, VÍA-ansvarlig, relevant fagperson, SER-/turleder, VIDA-eier, logistikk, programleder, prosjekteier, observatør og evaluator med tidsbegrensede testkontoer. Systemadmin testes med eksisterende admin. Break-glass holdes utenfor rutinepakken.

Testrekkefølge:
1. faktisk startside / neste handling;
2. in-scope positiv tilgang;
3. out-of-scope / direkte URL negativ tilgang;
4. AAL1 vs AAL2;
5. indikator → kø → oppgave → kontekstfelt → eier/rute → gate/skjema → tilbake;
6. mobil SER;
7. SER→VIDA og navngitt VIDA-eier;
8. audit/utløp/tilbakekalling.

## Eksterne designkontroller

Dette er inspirasjon/benchmark, ikke dokumentasjon av effekt for AidMe.

### Datatilsynet

Offisielle personvernråd peker mot å samle bare data som er nødvendige for eksplisitte formål, unngå unødvendige kopier og basere tilgang på tjenstlig behov. Dette støtter AidMe-prinsippene om dataminimal offentlig interesse, ett deltakerløp, rolle/scope og aggregert evaluering når identitet ikke trengs.

Kilder:
- https://www.datatilsynet.no/rettigheter-og-plikter/personvernprinsippene/grunnleggende-personvernprinsipper/dataminimering/
- https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/innebygd-personvern-og-personvern-som-standard/hva-er-personvern-som-standard/

### NAV

NAVs ungdomsgaranti beskriver tett, tilpasset oppfølging og fast kontaktperson så lenge det er nødvendig for unge som trenger hjelp til utdanning/arbeid. NAVs arbeidsrettede rehabilitering beskriver individuelt tilpassede motivasjons-/mestringsaktiviteter, veiledning og arbeidsutprøving. Dette støtter designet med navngitt eier, individuell tilpasning og tydelig overgang til aktivitet/arbeidsretning – men sier ikke at NAV skal finansiere SER eller Camino.

Kilder:
- https://www.nav.no/samarbeidspartner/ungdomsgaranti
- https://www.nav.no/arbeidsrettet-rehabilitering

### Venture Trust

Venture Trust er en særlig relevant operativ analog: community/outreach før og etter en intensiv wilderness journey, med personlig utvikling og egne employability-spor. Designlæringen for AidMe er at den intensive reisen bør være en del av et lengre før–under–etter-løp, ikke et frittstående turprodukt.

Kilder:
- https://www.venturetrust.org.uk/personal-development-programmes/
- https://www.venturetrust.org.uk/what-we-do/employability-programmes/
- https://www.venturetrust.org.uk/40-years-of-venture-trust/

Venture Trust bruker også egne terapi-/helsepåstander i enkelte tjenester. Disse skal ikke kopieres inn i AidMe VIDA; AidMe skiller personlig erfaring fra generelle effektpåstander og markedsfører Camino som arena, ikke behandling.

## Åpne realdata-/recovery-gater

### P0 – intake-command source recovery

`portal/intake.js` kaller `intake-command`, men funksjonskilden finnes ikke i `supabase/functions/` på `main` og ble heller ikke funnet i den relevante historiske `portal-ops-sos-intake-20260817`-grenen. Backend endres ikke før deployet funksjon er hentet/verifisert og gjenopprettbar kilde er etablert.

### P0/P1 – form write surface

`form-runner.js` skriver `form_submissions` via browser Supabase-klient. RLS/AAL2 kan gjøre dette sikkert, men før ekte sensitiv bruk må policy, write-scope, audit og behovet for autorisert serverkommando verifiseres eksplisitt. Ikke anta at en fungerende browser-write er tilstrekkelig sikkerhetsdesign.

### P0 – offentlig intake

`public-intake` forblir fail-closed for reelle data til CAPTCHA/Turnstile, rate-limit, origin, personverntekst, dataminimering og kilde/deploy-paritet er samlet grønne.

### Preprod – dev.aidme.no

Netlify `dev-aidme-no` har en stale prosjektinnstilling som forventer base directory `dev-platform-v1`, som ikke finnes i repo. Dette påvirker ikke live `aidme.no` eller `my.aidme.no`. Det bør ryddes når `dev.aidme.no` standardiseres som én ren preprod; det er ikke en N1-release-gate.

## Neste beslutningspunkt

1. La N1 stå stabil til fysisk visuell test.
2. Samle brukerens faktiske N1-observasjoner og eventuelle P0-regresjoner.
3. Bruk observasjonene som input til endelig N2-pakke, ikke som grunn til å starte arkitekturen på nytt.
4. Hold ekte public/sensitive data lukket til realdata-gatene ovenfor er verifisert.
