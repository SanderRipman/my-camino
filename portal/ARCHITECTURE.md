# Full AidMe-produksjonsportal – arkitektur v1

## Mål

`my.aidme.no` skal være AidMe VIDAs sammenhengende arbeidsflate for oppfølging, informasjon, opplæring, ansvar og dokumentasjon gjennom hele VÍA → SER → VIDA-løpet.

## 1. Prinsipper

1. Én deltakerreise, minst mulig dobbelføring.
2. Neste handling er viktigere enn en stor dokumentmeny.
3. Tilgang følger kompetanse, mandat og konkret oppdrag.
4. Den enkelte ansatte får bare det minimumet rollen krever.
5. Pseudonym/kodenavn brukes som arbeidsidentitet der fullt navn ikke er nødvendig.
6. Identitetsdata, operativt sikkerhetsminimum, faglige vurderinger og eventuelt klinisk journalinnhold er forskjellige dataklasser.
7. Ingen klient kan omgå tilgangsstyring; tilgang må håndheves server-side/RLS.
8. Alle formelle beslutninger, rolleendringer, samtykkehendelser og relevante endringer skal kunne revideres.
9. Offentlig skjema på aidme.no samler bare nødvendig tidlig informasjon. Sensitiv VÍA-informasjon samles først i autentisert portal.
10. Offline/reisebruk skal aldri bety ukryptert lokal kopi av hele deltakerhistorikken.

## 2. Rollepakker

Rollepakkene bygger på SharePoint-dokumentet `Fagroller_ansvar_og_etiske_grenser_v0_3_UTKAST.docx`.

- `system_admin`: teknisk administrasjon, roller, konfigurasjon og audit. Ikke automatisk full innholdsinnsyn.
- `project_owner`: konsept, avtaler, kvalitetssystem og overordnet status.
- `program_lead`: sammenheng i VÍA–SER–VIDA, deltakerflyt og oppgaver.
- `via_owner`: VÍA-avklaring, forberedelse og overgang til SER.
- `clinical_professional`: relevant faglig vurdering innen skriftlig mandat. Klinisk journal hører ikke automatisk hjemme i ordinær portal.
- `ser_lead`: daglig logistikk, sikkerhet, hendelser og SER-operasjon.
- `vida_owner`: 72t/14/30/90-dagers aktivering og videre oppfølging.
- `logistics`: transport, forsikring, overnatting og beredskap – ikke deltakerfaglige beslutninger.
- `observer` / `evaluator`: aggregert eller pseudonymisert innsikt uten unødvendig individtilgang.
- `break_glass`: kortvarig, eksplisitt begrunnet nødtilgang med utløp og audit.
- `participant`: egen informasjon, egne skjema, egne oppgaver og egen VIDA-plan.

Samme person kan ha flere rollepakker. Rettighetene holdes likevel separate.

## 3. Datadomener

### A. Identitet
Navn, e-post, telefon, fødselsår og kontaktpreferanse. Separat fra de fleste arbeidsflater.

### B. Pseudonymisert deltakerkjerne
Deltaker-ID, kodenavn, fase/status og tildelinger.

### C. Operativt sikkerhetsminimum
Kun informasjon som er nødvendig for forsvarlig gjennomføring: nødkontakt, nødvendige medisiner/allergier, faresignaler, første tiltak, eskalering og hjemreiseplan.

### D. VÍA og GO/NO-GO
Ressurser, retning, belastning/tilrettelegging, stopplan, vilkår og formelle beslutninger.

### E. SER
Kort deltakerinnsjekk, operativ grønn/gul/rød og hendelser/avvik.

### F. VIDA
Levende handlingsplan med navngitt eier, 72t/14/30/90-dagers handlinger og neste vurdering.

### G. Audit og samtykke
Versjonerte informasjons-/samtykkehendelser, tilgangs-/beslutningsspor og systemhendelser.

## 4. Backend

Eksisterende AidMe Supabase-prosjekt i EU er valgt som produksjonsgrunnmur. Første skjema er allerede opprettet med RLS og kapabilitetsbasert tilgang.

Direkte klienttilgang brukes bare der RLS eksplisitt tillater den. Server-only områder – særlig offentlige interesser, roller/tilganger, systemadministrasjon og audit-skriving – går gjennom betrodde server-/Edge-funksjoner.

## 5. Autorisasjon

Tilgang gis som:

`bruker + rollepakke + organisasjon + valgfritt deltaker-scope + valgfritt pilot-scope + gyldighetsperiode`

Dette hindrer at for eksempel en SER-leder automatisk får tilgang til alle VÍA-opplysninger eller at en VIDA-eier ser hele SER-gruppens historikk.

## 6. Full portalreise

Offentlig besøk på `aidme.no` → minimal interesse → kontrollert backend → mottakskø → invitert til VÍA → konto → deltakerens neste handling → VÍA → formell GO/NO-GO → før-SER/pilot-GO → SER → overgang → VIDA → ny VÍA.

Hver overgang genererer en tydelig neste oppgave og en navngitt eier.

## 7. Varsling

Varsling skal være hendelsesdrevet og personvernbevisst:

- In-app kan vise kontekst.
- E-post/SMS/push skal som standard bare si at noe krever oppmerksomhet, ikke inneholde helse-/risikodetaljer.
- Kritiske hendelser skal ikke være avhengige av vanlig e-post alene.

## 8. Sensitive API-er

Planlagt mønster:

- offentlig interesse: kontrollert Edge/backend-endepunkt, minimal payload, rate-limit/CAPTCHA/server-verifisering;
- autentiserte data: bruker-JWT + RLS;
- partnerintegrasjon: eksplisitte server-til-server credentials, minste scope, roterbare nøkler, audit og idempotens;
- ingen service-role-nøkkel i nettleser.

## 9. Offline

Fase 1: offline lesing av lavsensitiv praktisk informasjon og køing av et minimum av nye operative hendelser. Ingen full lokal deltakerjournal.

Fase 2 vurderes først etter trusselmodell, kryptert lagring, fjernsletting/session-policy og konkret reisebehov.

## 10. Produksjonsporter

Før reelle sensitive data tillates må minst følgende være lukket:

- autentisering og MFA-policy;
- rolle-/scope-administrasjon;
- DPIA og behandlingsgrunnlag per datadomene;
- databehandler-/underleverandørkontroll;
- private backup/restore- og slettetester;
- revisjonslogg;
- sikker partner-/API-modell;
- incident response;
- mobil/offline-policy;
- juridisk/faglig avklaring av eventuell helsehjelp/journalplikt.
