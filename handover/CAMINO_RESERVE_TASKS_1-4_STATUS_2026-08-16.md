# CAMINO – reserveoppgaver 1–4 status

**Dato:** 2026-08-16

Dette notatet supplerer `CAMINO_CHECKPOINT_2026-08-16_WEB_DIGITAL_CONTINUITY.md`.

## Status
Reserveoppgavene som bruker ba om å utføre dersom Wix/SharePoint blokkerte hovedsporet, er nå **ferdig produsert lokalt og QA-kontrollert**. De er ikke ennå lastet inn i kanonisk SharePoint fordi SharePoint-runtime i denne chatten returnerer `tool has been disabled` før API-kall. Ingen eksisterende aktive 1–2 sider / Lett / Dyp-versjoner er endret eller erstattet.

## 1. Dyp fagpakke XXL
Ny fil:
`AidMe_VIDA_NO_Dyp_Fagpakke_XXL_KOMPLETT_v0_7_3.pdf`

- 90 sider
- ekte A4 210 × 297 mm
- bygger på de seks aktive dype fagmodulene i riktig rekkefølge
- løsning valgt fremfor å blåse opp den elegante 32-siders Dyp-bookleten med dobbeltinnhold
- formål: mottakere som ønsker komplett faglig tyngde / ca. 90-siders pakke ved behov

## 2. Komplett Kort partnerpakke
Ny fil:
`AidMe_VIDA_NO_Kort_Partnerpakke_KOMPLETT_v0_7_3.pdf`

- 27 sider
- A4
- samler de fire aktive Kort-modulene i naturlig rekkefølge
- enkeltmodulene skal fortsatt beholdes

## 3. Operative skjema som enkeltfiler
Det er eksportert 12 separate A4-PDF-er i tillegg til samlet master:

- Skjema 00 – Kort informasjon før VÍA
- Skjema 01 – Henvisning og interesse
- Skjema 02 – VÍA-veikart og beredskap
- Skjema 03 – Individuell GO / NO-GO
- Skjema 04 – Deltakeravtale og kontaktvalg
- Skjema 05 – Pilot-GO og operativ styring
- Skjema 06 – Daglig SER-operativlogg
- Skjema 06B – SER 1:1-oversikt
- Skjema 07 – Hendelses- og avvikslogg
- Skjema 08 – VIDA handlings- og aktivitetsplan
- Skjema 09 – Pilotevaluering og læringsrapport
- Vedlegg A – Digital og teknisk støtte

## 4. A4-korrigering
Tidligere operativ Word-master var faktisk satt til **US Letter 215,9 × 279,4 mm**, selv om den visuelt så A4-aktig ut. Dette forklarte tabeller som kunne flyte utenfor ved norsk standardutskrift.

Ny master:
`Operativ_malpakke_VIA_SER_VIDA_v0_3_A4.docx`

Ny PDF-QA:
`Operativ_malpakke_VIA_SER_VIDA_v0_3_A4.pdf`

- 25 sider
- ekte A4 210 × 297 mm
- ca. 13 mm sidekanter
- tabeller tilpasset ca. 184 mm skriveflate
- alle 25 sider rendret etter korrigering; ingen nye klipp/overløp observert

## Lokal distribusjonspakke
`CAMINO_reserveoppgaver_1-4_2026-08-16.zip`

Pakken inneholder XXL, komplett Kort, A4-master Word/PDF, 12 enkeltstående skjema, README og hash-manifest.

## Gjenstående når SharePoint virker
1. Les eksisterende målmapper og dokumentregister først.
2. Last filene som **nye tillegg/versjoner**, ikke blind overskriving.
3. Behold modulære filer aktive.
4. Oppdater dokumentregister, Project State/Handover der relevant.
5. Les tilbake og verifiser.
6. Vurder EN-speil først etter at NO-strukturen er godkjent; NO-first gjelder for denne faglige revisjonen.
