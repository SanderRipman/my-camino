# Mini CRM implementation – 2026-08-19

**Status:** IN_WORK / VERIFY

## Beslutning
Mini CRM bygges inne i eksisterende `my.aidme.no` som en privat arbeidsflate for eksisterende prosjekteieridentitet. Det opprettes ikke en separat autentisert bruker `CRM Sander`.

Visningsnavn: **CRM – Sander**  
Navigasjon: **Mini CRM**

## Formål
Huske og følge opp relevante profesjonelle relasjoner, partnerdialoger, finansieringskontakter og nettverk med minst mulig friksjon.

CRM skal ikke brukes til deltaker-, helse-, klinikk-, sikkerhets- eller beredskapsdata.

## MVP-data
`kontakt → virksomhet → rolle → kontaktinfo → relasjon → prioritet → status → oppfølgingsdato → kort notat`

Første versjon bruker én additiv tabell: `public.crm_contacts`.

## Tilgang og sikkerhet
- eksisterende Sander/AidMe-login gjenbrukes;
- CRM krever AAL2 både i UI og server-side RLS;
- RLS håndhever `owner_user_id = auth.uid()`;
- brukeren må samtidig ha en aktiv `project_owner`-grant i samme `organization_id`;
- `anon` har ingen tabelltilgang;
- `authenticated` har SELECT/INSERT/UPDATE, men ikke DELETE;
- sletting er erstattet med `archived_at` / gjenåpning;
- alle endringer går gjennom eksisterende audit-trigger;
- `source_ref` er kun sporbar peker, ikke lagring av hele e-posttekster.

Supabase migration history:
- `20260819193201_aidme_mini_crm_owner_workspace_v1`
- `20260819193237_aidme_mini_crm_fk_index_v1`
- `20260819193753_aidme_mini_crm_require_aal2_v1`

Negativ tilgangstest:
- owner + AAL1 → 0 synlige CRM-rader;
- owner + AAL2 → syntetiske testdata synlige;
- annen bruker + AAL2 → 0 synlige CRM-rader.

## Oppgaver
Automatisk kobling til portalens `tasks` er **ikke** med i v1. Prosjekteierrollen har ikke generell `manage_tasks`, og vi utvider ikke rettigheter bare for CRM. Task-bro vurderes senere etter negativ tilgangs-QA.

## Outlook / AI-import
Ikke aktivert i v1.

Planlagt senere flyt:
`Outlook read-only → formålsfilter → relevans → sensitivitetssperre → deduplisering → import-preview → eksplisitt CRM-write`.

Ingen masseimport. Ingen full e-posttekst i CRM. Helse-, klage-, privat- eller deltakerrelatert korrespondanse skal avvises fra vanlig CRM-domene.

## QA-gater før merge
1. JavaScript syntax + portal build/smoke grønn.
2. CRM smoke: owner gate, AAL2, `crm_contacts`, archive-only og privacy-tekst.
3. Supabase security advisor uten ny CRM-sikkerhetswarning.
4. Supabase performance advisor uten manglende CRM-FK-indeks.
5. Syntetiske `DEMO-CRM-*` testkontakter kan brukes; ingen reelle persondata før eksplisitt senere gate.
6. Netlify preview / produksjonsbuild skal være `ready` før modulen regnes som VERIFY.

## Rollback
Frontend er branch/commit-reversibel. Databaseskjemaet er additivt og kan ligge ubrukt uten å påvirke eksisterende portal. Eventuell senere fjerning skal skje med egen eksplisitt migration – aldri ad hoc DROP i produksjon.
