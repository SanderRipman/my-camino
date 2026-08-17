# AidMe VIDA – rolle-onboarding og kontekstnavigasjon

Status: implementasjonsgrunnlag, 2026-08-17.

## Prinsipp

Systemet kan være stort, men brukerflaten skal vise **neste relevante handling**, ikke hele systemet. Tilgang, introduksjon og obligatoriske steg følger rolle + scope + fase. Vi skal gjenbruke aktive skjema og programinformasjon før vi oppretter nye skjema.

## Kildegrunnlag

Denne modellen er avledet fra aktive Camino-kilder:

- `Fagroller_ansvar_og_etiske_grenser_v0_3_UTKAST.docx`
- `Operativ_malpakke_VIA_SER_VIDA_v0_3_A4.docx`
- VÍA → SER → VIDA-arkitekturen og gjeldende portal-RBAC.

Kildenes hovedregel er at ansvar følger kompetanse og mandat: VÍA krever avklaring, SER operativ ledelse og VIDA navngitt eier. Staff-only-styring skal holdes ute av deltakerløpet når den ikke er relevant. Grunnopplysninger registreres én gang og gjenbrukes.

## Første innlogging / ny rolle

Når en bruker får ny rolle eller nytt scope skal portalen opprette en kort onboarding-kø, ikke en generell dokumentdump.

### Felles for medarbeider/partner
1. **Hva rollen din betyr** – 1–2 minutters interaktiv introduksjon med «kan gjøre / skal ikke gjøre alene».
2. **Konfidensialitet og dataminimering** – eksplisitt bekreftelse på minste nødvendige innsyn og at privat refleksjon ikke blir operativ journal.
3. **Sikkerhet og eskalering** – hvem eier beslutninger, hva skjer ved gul/rød, hendelse og avbrudd.
4. **Rolle-spesifikk arbeidsflate** – direkte videre til første faktiske oppgave.

### VÍA-ansvarlig / relevant fagperson
- VÍA-prosess og frivillighet
- `via_roadmap`
- `individual_go_no_go`
- beslutningsgrenser og eventuell faglig eskalering
- skal ikke love SER før GO/NO-GO er lukket

### SER-/turleder og logistikk
- «frihet innen trygg ramme» og dagens operative roller
- Pilot-GO før avreise
- `ser_daily`, hendelse/avvik, pause/transport/avbrudd
- lokal nødvei og SOS-protokoll
- skal ikke drive behandling eller diagnostikk

### VIDA-eier
- navngitt ansvar før SER avsluttes
- 72 timer og 14/30/90-dagers oppfølging
- `vida_plan` som én levende plan
- konkret første handling og viderevei

### Systemadministrator
- bruker-/rolle-/scope-administrasjon
- audit og tilgangshendelser
- eksplisitt påminnelse: systemadmin gir **ikke automatisk faglig innsyn**

### Deltaker
Gjenbruk aktiv malpakke, i rekkefølge:
1. `info_before_via`
2. interesse / invitasjon
3. `via_roadmap`
4. egen program-/deltakerbekreftelse der den er relevant
5. SER-informasjon og sikkerhetsvalg etter GO
6. enkel daglig innsjekk under SER
7. `vida_plan` og neste handling hjemme

Ingen krav om personlig deling. Foto/media-samtykke er separat fra programdeltakelse.

## Kontekstnavigasjon – «alt henger sammen»

Et kort, badge eller felt skal som hovedregel være klikkbart når det finnes et naturlig neste nivå.

Eksempler:
- rød/gul teller → filtrert arbeidskø
- aktiv deltaker-tall → deltakerliste
- oppgave → deltaker + ansvar/eier + pilot/rute + riktig skjema/gate
- manglende GO → forklar hvorfor feltet er låst + lenke til `individual_go_no_go`
- GO, men ikke Pilot-GO → lenke til `pilot_go`
- SER-deltaker → operativ dag + dagens etappe + SER-logg
- VIDA → levende VIDA-plan + navngitt eier

Hvis bruker ikke har rettighet: skjul handling når kunnskap om den i seg selv ikke er nødvendig; ellers vis lås + kort forklaring og riktig ansvarlig, ikke en teknisk feilmelding.

## Teknisk implementeringsrekkefølge

1. UX-drilldown og gate-lenker i nåværende portal.
2. Serverstyrt kontekstkommando for endring av ansvar/pilot/scope der direkte endring er faglig legitim.
3. `role_onboarding_templates` + `user_onboarding_items`, versjonert og auditerbar.
4. Koble `admin-grant-role` til onboarding uten å gi rollen bredere datarettigheter.
5. Rolle-simulering for superbruker med syntetiske data og positiv/negativ tilgangsmatrise.

Ingen rolle-onboarding skal bli en ny parallell fagpakke. Den er en presentasjons-/oppgavemotor over eksisterende kildeinnhold og versjonerte skjema.
