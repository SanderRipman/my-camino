# Strømlinjet rolleflyt — deltaker · ansatt · partner

Dato: 2026-08-24
Status: aktiv arbeidsregel for portalens videre UX/arbeidsflyt

## Grunnregel

Én opplysning eller handling registreres ved sin riktige kilde én gang. Senere roller får en rolleavgrenset visning eller handoff av samme kontekst når det er nødvendig; de skal ikke be om eller kopiere samme historie på nytt.

## SER-kjeden

| Kilde / rolle | Registrerer | Skal ikke gjøre |
|---|---|---|
| Deltaker | Kort egeninnsjekk i `ser_checkins`; egne ord og egen opplevelse | Fylle teamets operative SER-logg eller klassifisere egen dagsform som hendelse |
| Operativ ansatt / SER-leder | `ser_daily`: observerbare fakta, rute/tilpasning, tiltak, ansvar og nødvendig oppfølging | Kopiere deltakerens fritekst eller gjøre normal belastning/pause til avvik |
| Operativ ansatt ved faktisk hendelse | `incident`: fakta, umiddelbar risiko, tiltak/varsling, eier og lukking | Bruke hendelseslogg som ekstra normaldagslogg |
| VIDA-eier / relevant partner | `vida_plan`: avtalt handling, støtte/eier, frist og oppfølging hjemme | Kopiere rå SER-notater, private refleksjoner eller hendelsesdetaljer uten behov |
| Evaluator / prosjekt | `pilot_evaluation`: aggregert sikkerhet, erfaring, ressursbruk og læring | Opprette en ny individuell deltakerjournal |

## Partner betyr ikke bred generell tilgang

Det opprettes ikke en generell `partner`-rolle som snarvei. Eksterne aktører får eksisterende, navngitt rolle og nødvendig scope, for eksempel `vida_owner`, `evaluator` eller annen eksplisitt funksjon. RLS/AAL2 og rolle-/pilot-/deltakerscope er fortsatt autoritativt.

## UX-regler fremover

1. Vis kilden tydelig: «deltakerens egen innsjekk», «teamets operative vurdering», «VIDA-handoff» eller «aggregert evaluering».
2. Gjenbruk status og kontekst read-only der det sparer dobbelføring.
3. Ikke gjenbruk fritekst automatisk mellom rolleflater.
4. Hendelseslogg åpnes bare ved reell hendelse/avvik.
5. VIDA forblir én levende plan gjennom 72t/14d/30d/90d.
6. Partner-/evaluatorflater skal som standard vise mindre, ikke mer, enn operative interne flater.
7. Nye felter eller skjema må begrunnes med en informasjonskilde som ikke allerede finnes.

## Gjeldende implementering

`form-streamline-provenance.js` legger et read-only provenance-/arbeidsflytlag over eksisterende skjema. For `ser_daily` hentes kun siste `checkin_date` og `rag` fra eksisterende `ser_checkins` gjennom dagens RLS. Deltakerens `participant_note` hentes ikke. Laget har ingen insert/update/upsert/delete og endrer ingen schema-, RLS- eller rolledefinisjoner.
