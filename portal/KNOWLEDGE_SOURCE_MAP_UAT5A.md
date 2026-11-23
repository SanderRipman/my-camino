# UAT 5A – Kildematrise for felles kunnskap/skjemavisning
Status: **Arbeidsutkast, ikke godkjent fagpublisering**. Utarbeidet 23.11.2026 fra fysisk lesing av aktiv SharePoint malpakke DOCX + rolleansvar v0.3 UTKAST + live Supabase form_definitions/form_versions. Ikke en ny skjemamaster.

## To nivåer, samme autoritet
- SharePoint under `Camino/09_Dokumentasjon_og_evaluering/Maler_og_skjema/00_AKTIV_MALPAKKE/` er redaksjonell kilde. Den har ikke automatisk portalmedarbeider-ACL. Nåværende fil `Operativ_malpakke_VIA_SER_VIDA_v0_3_A4.docx` er oppført v0.3, men **innvendig forside sier v0.2 UTKAST (15.08.2026)**. Kildeversjonen må korrigeres/godkjennes uten blind overskriving. Selv etter oppdatering er ikke dette en klinisk behandlingsprotokoll.
- GitHub `portal/knowledge-registry.js` er en **ikke-sensitiv adapter** for kort, generisk veiledning. Den eksponerer aldri rå SharePoint-URL-er, enkeltdeltakere eller privat dokumentinnhold. `/portal/knowledge.html` er AAL2-gatet for intern visning, mens backend-former og oppgaver har sine egne strengere rettigheter.

## Matrise
| Supabase key | SharePoint aktiv mal | Bruksregel | Veiledningstema |
|---|---|---|---|
| info_before_via | 0 Kort informasjon før VÍA | Ved innledende informasjon | journey |
| interest_referral | 1 Henvisning og interesse | Ved ny henvendelse | mal |
| via_roadmap | 2 VÍA-veikart/beredskap | Én versjonert VÍA-sak, revisjon ved behov | journey |
| individual_go_no_go | 3 Individuell GO/NO-GO | Kun formell beslutning | go |
| participant_agreement | 4 Deltakeravtale/kontaktvalg | Før SER, egne valg | privacy |
| pilot_go | 5 Samlet Pilot-GO | Før start; alle kritiske porter | safety |
| ser_daily | 6 Daglig SER-operativlogg | Per pilotdag/team, modellgap: runner har deltaker-required | ser |
| incident | 7 Hendelses-/avvikslogg | Bare faktisk hendelse | incident |
| vida_transition_prep | Ikke selvstendig del 0–9 i malpakken | Ny digital overgang til levende plan, **ikke egen VIDA-plan** | vida |
| vida_plan | 8 VIDA-plan | Samme plan ved 72t,14/30/90d | vida |
| pilot_evaluation | 9 Pilotevaluering | Aggregert læring etter pilot | evaluation |

## Tekniske sperrer – videre arbeid
1. Fysisk manuell UAT fagperson fortsatt 2/4 før samlet kildekonsept er godkjent. UAT #259 kildekort beholdes; referanselenker erstattes med portal-kunnskapsvisning i denne PR-en.
2. `system_admin` / `project_owner` kan **forhåndsvise** aktive form_version.schema_json med AAL2 og aktiv org-bred rolle i form av klient-LESING fra publikasjoner uten deltakerdata; dette gir ingen `decide_go`, `edit_via`, `form_submissions` eller innsyn i deltaker.
3. `form-command`, RLS, AAL2, trigger-/audit-regler, GO/SER/VIDA status, oppgavetildeling og `role_grants` er helt uendret. #249 AAL1/task RLS og #260 obligatorisk backend-rolleattestering fortsatt åpne.
4. Fremtidig endring i skjemaansvar, sertifisert kildeversjon, pilotdag/SER, faglig vurderingskø, kritiske varsler og VIDA-synk krever egne serverkontrakter, negative API-tester og separat review fordi Supabase er delt med produksjon.
5. Ingen kopi av hele internt kildedokument inn i frontend eller offentlig GitHub. Kun versjonert, redaksjonelt kontrollert og ikke-sensitiv operativ tekst.

## Release- og UAT-gate
- Dette er en isolert `demo-uat` PR; holdes **DRAFT** til både original UAT 4J smoke og ny UAT 5A pass, sikkerhetsgjennomgang og fysisk menneskelig vurdering. Ingen blind deploy til main/production/shared Supabase.
- Manuell test som superbruker AAL2: Skjema & rutiner → 11 kort + «Mer info / forhåndsvisning» → intern kunnskapsside, levende felter fra samme versjon, fyll testeksempler **lokalt uten Save**. Som fagperson AAL2, åpne eksisterende skjema → «Mer info» uten å miste påbegynt utkast. Rolleintro: gamle 2/4 bevares; «Les og bekreft her» → interne fagsider → trygg retur.
- Negative: en ikke-admin må **ikke** få forhåndsvisning av alle schemafelt (kun generisk veiledning); AAL1 eller ugyldig kildekey avvises; systemadmin uten fagrolle kan ikke åpne virkelig GO/NO-GO.
