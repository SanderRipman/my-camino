# UAT 5E — rolle × skjema × fase: fysisk inventar og gap (23.11.2026)

**Status: READ-ONLY OBSERVASJON / DRAFT – ikke rolle-, RLS-, GO- eller databaseendring.**

## Kilder, avgrensning og prioritet
- Fysisk kontroll av nåværende `demo-uat` etter merget PR #263 (`cd7a533319e7f7aef4969a28f2debb39b12766cc`).
- `portal/form-runner.js`: `ROLE_KEYS`, `PARTICIPANT_KEYS`, `participantAllowedKeys`, `PILOT_LEVEL_KEYS`, `PARTICIPANT_REQUIRED_KEYS`, `contextOk`, `chooseForm` og `payloadFromForm`.
- `portal/knowledge-registry.js` har 11 digitale form keys. Faktisk Supabase `public.form_definitions` metadata og `public.role_permissions` ble lest **uten bruker- eller deltakerpayload**, pr. 23.11.2026. Dette er rollepermisjoner, **ikke** resultat av autentisert RLS-/AAL1-test.
- Bruker har fysisk godkjent **superbrukerens syntetiske individuelle GO/NO-GO-forhåndsvisning** med 10 felt. Reelle beslutninger, scope og RLS ikke testet av skjermbilder. «Felles-GO» er ny offentlig betegnelse på intern `pilot_go`, ikke ny backend-beslutning.
- Øvrige samtidige CAMINO/SER/VÍA PR-er eller databasetabeller endres ikke. Issue [#247](https://github.com/SanderRipman/my-camino/issues/247) er arbeidseier.

## 11 skjemaer — faktisk klientmapping, ikke automatisk effektiv tilgang

| `form_definition.key` | Eksisterende form-runner-roller | Deltaker-kontekst | Vesentlig gate/observasjon |
|---|---|---|---|
| `info_before_via` | `via_owner`, `clinical_professional` | Egen VÍA | Tidlig, minimalt innhold |
| `interest_referral` | `program_lead`, `via_owner`, `clinical_professional` | Ingen i `PARTICIPANT_KEYS` | Krever valgt deltaker i dagens runner |
| `via_roadmap` | `via_owner`, `clinical_professional` | Egen VÍA / NY VÍA | Innsendt leses read-only via egen kontrollert side, tidligere UAT 4B PASS |
| `individual_go_no_go` | `via_owner`, `clinical_professional` | NEI | Beslutningsrett `decide_go`, fagmandat og aktivt deltakerscope må testes på backend. Superadmin har ikke UI-skriverett |
| `participant_agreement` | `via_owner`, `clinical_professional` | Egen etter individuell GO | Separat frivillig avtale/kontaktvalg |
| `pilot_go` | `project_owner`, `program_lead`, `logistics` | NEI | Presentert utad som **Felles-GO**. `project_owner` har `manage_program`, mens `program_lead`/`logistics` mangler denne i `role_permissions`. Ikke antatt backendtilgang |
| `ser_daily` | `ser_lead` | NEI | **ÅPENT datamodellgap:** dagens `PARTICIPANT_REQUIRED_KEYS` krever deltaker, mens operativ malpakke krever **én samlet teamlogg per gjennomføringsdag**. SER-spor eier endelig modell |
| `incident` | `ser_lead` | NEI | Hendelse bare ved faktisk avvik; ingen auto-GO/automatisk behandling |
| `vida_transition_prep` | **Ingen** i `ROLE_KEYS` | **Ingen** i `PARTICIPANT_KEYS` | **ÅPENT lenke-/løpgap**. Skal være kontrollert forberedelse/oppdatering av samme `vida_plan`, ikke ny plan |
| `vida_plan` | `vida_owner` | Egen VIDA | Én levende plan, oppfølging 72t og 14/30/90d |
| `pilot_evaluation` | `project_owner` | NEI | Vises utad som **Felles evaluering**, aggregert; ingen klinisk journal eller bredt deltakerinnsyn |

**Rollepermisjoner i faktisk Supabase, select-only:** `system_admin`: `manage_config,manage_roles,manage_users,view_audit`; `project_owner`: `manage_program,view_case_status,view_reports`; `program_lead` inkluderer `manage_tasks`, `view_go`, men ikke `edit_via` eller `decide_go`; `via_owner` og `clinical_professional` inkluderer `decide_go` og `edit_via`; `ser_lead` inkluderer `edit_ser`/`edit_incidents`; `vida_owner` inkluderer `edit_vida`; `logistics` har `edit_logistics` uten `manage_program`. Dette er ikke en eksplisitt fagmandatsgodkjenning.

## Gater og prioriterte kontroller
1. **P0 CAMINO #249:** autentisert vanlig AAL1/AAL2 API-lesetest av `tasks_read` OR-grener og revoked/expired grant. Bruk vanlig scoped JWT, ikke Supabase admin/service-role / `execute_sql` som falsk bruker. Policyfunn er ikke bevist datalekkasje.
2. **P1 #247:** faktisk `form-command`/RLS per rolle × skjema × deltaker/org/group scope × status/version, positiv og negativ. Kartlegg `form_submissions` og skjema lenker fra oppgaver/oversikt, og oppdater kun autorisert backend etter review.
3. **SER #208:** `ser_daily` én teamlogg per dag og deltaker-innsjekk separat, gjennomgang av `participant_id` nullable og unikhet. **Ingen** automatisk migrasjon/duplikasjon.
4. **VIDA:** `vida_transition_prep` er teknisk definert, men ikke i hovedrunner. Spesialmodul må kartlegges før man legger inn en ny tilgang eller plan.
5. **#260:** klinisk/operativt rolleansvar krever formell AAL2, versjonert servergating og auditerbar attest før sensitiv handling; klientkartet er aldri nok.
6. **#262:** kontrollert kildeversjon og redaksjonell publiseringsgodkjenning. «Felles-GO» utad vs `pilot_go` internt skal dokumenteres som ett begrep.

## Kontraktskontroll
`portal/role-form-readonly-uat5e-smoke.mjs` evaluerer nøyaktig de **eksisterende** konstante UI-rollelistene og sammenligner mot 11 aktive form keys i den felles katalogen. Stopper ved ukjent form, uventet løsriving, glemte kritiske begrensninger og høyprivilegerte roller i skrivekartet. Den dokumenterer to **kjente**, åpne feil som forventede eksplisitte avvik, ikke som «fikset»: `vida_transition_prep` utelatt og `ser_daily` participant-required. Testen er **kun en statisk advisory/CI** og må aldri brukes som bevis på effektiv tilgang/real-world API PASS.

## UAT-bevaring
Ingen endring i Minas ene VÍA `SUBMITTED`, eksisterende `via_go_review` OPEN hos Gmail +via, eller GO=0. Ingen endring i `main`, produksjon, delt Supabase, roller, oppgaver eller avviksdata. Fortsett fra nyeste SharePoint checkpoint og dette notatet, ikke repeter UAT 5D eller VÍA 4B.
