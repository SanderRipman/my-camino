# AidMe VIDA – ende-til-ende rolle- og brukerreise

Status: operativ implementerings- og QA-referanse. Faglig autoritet ligger i aktiv SharePoint-malpakke og styringsfiler.

## Styrende prinsipper

- Den offentlige deltakerreisen har tre steg: **VÍA · FØR → SER · UNDER → VIDA · ETTER**.
- **Trygghet følger alle tre steg.** Trygghet er fundamentet, ikke et fjerde steg.
- `ny VÍA` er et mulig senere startpunkt når retning må justeres, ikke et obligatorisk fjerde steg.
- Camino er arenaen, ikke behandling. Ingen effekt eller SER-plass loves ved interesse eller VÍA.
- Én person skal ha én sammenhengende sak/reise. Ikke opprett parallelle deltakerregistre, skjema eller planer for samme beslutning.
- Portalen skal normalt vise **neste lovlige handling**, ikke et dokumentbibliotek.
- Informasjon samles gradvis: minst mulig offentlig, mer først når formål, rolle, samtykke og tilgang tilsier det.
- Formelle beslutninger tas i riktig gate/skjema og av navngitt eier. Klikkbare felt er ikke automatisk redigerbare.
- Mini CRM er relasjons-/partnerarbeid og skal ikke bli et parallelt deltakerregister.

## Ende-til-ende-kjede

| Fase | Primær bruker | Neste intuitive handling | Kanonisk mal/skjema | Eier/gate | Personvern og rettigheter |
|---|---|---|---|---|---|
| 0. Offentlig interesse | Potensiell deltaker | `Se om dette kan passe for meg` → kort interesse | `info_before_via` / Skjema 00 som informasjonsgrunnlag; `interest_referral` / Skjema 01 når interesse registreres | Mottak/program | Bare dataminimal kontakt og formål. Ingen detaljert helse-/risikokartlegging offentlig. |
| 1. Mottak/triage | Programleder / VÍA-mottak | Trenger avklaring / Gå videre til VÍA / Anbefal annen vei / Avslutt | `interest_referral` | `manage_intakes` | Interesse ≠ godkjenning. Ikke opprett konto før personen faktisk skal inn i VÍA. |
| 2. VÍA-start | Deltaker + VÍA-eier | Opprett VÍA én gang → sikker invitasjon kobles til samme reise → `Din neste handling` | `info_before_via`, `interest_referral`, `via_roadmap` | VÍA-eier | Egenressurs for deltaker; staff kun innen rolle+scope. Sensitive VÍA-data krever AAL2. |
| 3. VÍA-avklaring | Deltaker + VÍA-eier + relevant fagperson | Fyll mangler i små steg → avklaring | `via_roadmap` / Skjema 02 | VÍA-eier | Deltaker kan korrigere egne opplysninger. Intern vurdering skilles fra deltakertekst. |
| 4. Individuell beslutning | VÍA-eier / relevant fagperson | GO / GO med vilkår / UTSETT / NO-GO nå | `individual_go_no_go` / Skjema 03 | `decide_go` | Ikke scorekort. Vilkår blir oppgaver med eier/frister. Deltakersammendrag skilles fra intern begrunnelse. |
| 5. Før SER | Deltaker + program/logistikk | Avtale, kontaktvalg, dokumenter, forsikring, VIDA-eier, praktisk beredskap | `participant_agreement` / Skjema 04 + `pilot_go` / Skjema 05 | Program/pilot-GO | Samlet SER/pilot-GO er egen gate etter individuell beslutning. |
| 6. SER – normal dag | Deltaker | Dagens etappe → kort innsjekk → be om kontakt/pause/tilpasning ved behov | `ser_daily` / Skjema 06 | SER-leder | Mobil først. Ingen krav om personlig deling. Normal bruk under ett minutt når alt er grønt. |
| 7. SER – operativt | SER-leder + logistikk | Trenger handling nå → signal/oppgave → deltaker/rute/eier | Skjema 06 + 06B 1:1 ved behov | SER-leder | Operativt minimum; SER får ikke sensitiv VÍA som standard. |
| 8. Hendelse/avvik | SER/fag etter mandat | Observerbare fakta → tiltak → varsling → eier/frister → lukking | `incident` / Skjema 07 | Operativ/faglig eier | Hendelseslogg bare ved reell hendelse. Akutt hjelp skal aldri avhenge av portal. |
| 9. SER → VIDA | Deltaker + VIDA-eier | Første handling innen 72 t + avtalt kontakt | `vida_plan` / Skjema 08 | Navngitt VIDA-eier | Santiago/målgang er overgang, ikke avslutning eller prestasjonskrav. |
| 10. VIDA | Deltaker + VIDA-eier/partner | Neste handling → 72t/14/30/90 i én levende plan | `vida_plan` | VIDA-eier | Én plan, ikke fire nye skjema. Del bare avtalt overføringssammendrag til partner. |
| 11. Evaluering | Prosjekteier/evaluator | Aggregert læring → forbedring | `pilot_evaluation` / Skjema 09 | Prosjekt/evaluering | Observatør/evaluator har aggregert tilgang som standard, ikke individuelle sensitive saker. |
| A. Teknisk støtte | Ved behov | Løs teknisk hinder uten å endre faglig beslutning | Skjema A | Teknisk/system | Teknisk admin betyr ikke automatisk saksinnsyn. |

## Rolleperspektiver som alltid skal syretestes

### Deltaker
- ser egen reise og én tydelig neste handling;
- ser hvorfor informasjon spørres om og hva som skjer etterpå;
- kan aldri se andre deltakere;
- møtes av menneskelig forklaring når noe er låst;
- pause, tilpasning, transport og avbrudd fremstilles som legitime sikkerhetstiltak.

### Programleder / mottak
- starter i `Trenger handling nå`;
- kan triagere interesse uten å åpne nytt parallelt skjema;
- ser sakstatus og ansvar, men ikke mer sensitive data enn mandatet krever;
- kan følge kø → oppgave → eier/gate → oppdatert sak.

### VÍA-ansvarlig
- eier avklaring og individuell beslutningsforberedelse;
- ser bare tildelt omfang;
- kan be om avklaring i samme sak;
- lover aldri SER før formell beslutning og samlet SER-gate er lukket.

### Relevant fagperson
- bidrar der vurderingen krever kompetanse;
- har ikke generell portal-/deltakertilgang utover mandat;
- klinisk/journalpliktig informasjon hører til ansvarlig helsetjeneste dersom helsehjelp faktisk ytes.

### SER-/turleder
- ser operativt minimum, dagens rute, sikkerhet, hendelser og oppgaver;
- får ikke sensitiv VÍA som standard;
- normal drift skal kunne håndteres raskt på mobil.

### Logistikk / beredskap
- rute, transport, forsikring/praktisk beredskap og SOS-respons innen mandat;
- kan ikke ta faglig GO/NO-GO.

### VIDA-eier / partner
- ser det som trengs for avtalt oppfølging og én levende VIDA-plan;
- får ikke VÍA-/hendelsesinnhold som standard;
- har navngitt ansvar og første kontakt innen 72 timer.

### Prosjekteier
- program, rapportering og Mini CRM/partnerrelasjoner;
- prosjektrolle gir ikke automatisk sensitivt deltakerinnsyn.

### Observatør / evaluator
- aggregert læring som standard;
- ingen individuell sensitiv sakstilgang uten særskilt, dokumentert grunnlag.

### Systemadministrator
- konto, roller/scopes, audit, konfigurasjon og systemhelse;
- teknisk makt er ikke automatisk faglig/sensitiv lesetilgang.

### Break-glass
- separat nødmekanisme, aldri normal rollepakke;
- midlertidig, begrunnet, tidsavgrenset og auditert.

## Kontekstnavigasjon

Standard: `indikator → filtrert kø → oppgave → relevant felt → detalj/eier/rute → riktig gate/skjema → oppdatert status`.

Et felt kan være trykkbart uten å være redigerbart. Ved manglende tilgang:
1. skjul kontrollen hvis selve eksistensen ikke bør være kjent;
2. ellers vis lås + menneskelig forklaring + trygg neste handling;
3. aldri bruk hover som eneste forklaring på mobil.

## Form- og datagrenser

- `info_before_via`: informasjon/forventningsavklaring før dypere VÍA.
- `interest_referral`: én inngang for interesse/henvisning.
- `via_roadmap`: én levende VÍA-avklaring; gjenbruk data fremfor gjentakelse.
- `individual_go_no_go`: formell individuell beslutning, ikke score.
- `participant_agreement`: avtale/kontaktvalg før SER.
- `pilot_go`: samlet operativ SER-gate; ikke synonymt med individuell GO.
- `ser_daily`: kort normaldag; privat refleksjon trenger ikke lagres.
- `incident`: bare faktisk hendelse/avvik.
- `vida_plan`: én levende plan med 72t/14/30/90 kontrollpunkter.
- `pilot_evaluation`: aggregert pilot-/programlæring.
- Skjema A: teknisk støtte ved behov.

## Mini CRM-grense

Mini CRM kan inneholde relasjonsminne om partner, finansiør, offentlig/NAV/kommune, fagperson, nettverk, media og leverandør. Det skal ikke brukes til VÍA-kartlegging, deltakersak, hendelseslogg eller VIDA-plan. Dersom en kontakt blir deltaker, går deltakerreisen gjennom intake/VÍA og den kanoniske deltaker-ID-en; CRM forblir partner-/relasjonsflate.

## P0/P1 før ekte persondata åpnes bredere

1. **LUKKET 2026-08-22:** `intake-command` er gjenopprettet fra aktiv Supabase-deploy til `supabase/functions/intake-command/` i Git og er igjen under gjenopprettbar kildekontroll. N2→N3-kjeden har i tillegg fått versjonskontrollert `admin-create-participant`. En bredere Supabase↔Git source-parity-audit gjenstår som teknisk hygiene, men blokkerer ikke denne brukerreisen.
2. **MITIGERT 2026-08-22:** Portalens lagre-/fullfør-handling går via `form-command`, som bruker innlogget brukers JWT og dermed bevarer eksisterende AAL2, RLS, `auth.uid()`, payloadvalidering, formelle GO-gater, samtykkeflyt, VIDA-synk og databaseaudit. Skjemakontekst og fullførte innsendinger er immutabile i kommandolaget, og egne utkast gjenbrukes for å unngå duplikater. Direkte PostgREST-skrivetillatelse på tabellen beholdes foreløpig som RLS-beskyttet reserve/kompatibilitet og skal vurderes for eksplisitt revoke før ekte sensitive data åpnes bredt; kommandolaget bruker ikke service-role og svekker derfor ikke databasenormen.
3. Offentlig `public-intake` forblir fail-closed til CAPTCHA/Turnstile, rate-limit, origin, personverntekst og dataminimering er verifisert samlet.
4. Alle sensitive rollebaner skal gjennom positiv + negativ scope-test, AAL1/AAL2, direkte URL/API-bypass, audit og utløp/tilbakekalling.

## QA-lab

`/portal/qa-role-pack.html` er den foretrukne realistiske, syntetiske rollepakken. Den oppretter tidsbegrensede `@example.invalid`-kontoer for deltaker, VÍA, relevant fagperson, SER, VIDA, logistikk, programleder, prosjekteier, observatør og evaluator. Den reelle systemadmin-kontoen brukes til systemadmin-test; break-glass testes separat og opprettes ikke som rutinepakke.
