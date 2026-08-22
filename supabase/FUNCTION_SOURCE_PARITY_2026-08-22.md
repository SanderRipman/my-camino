# Supabase Edge Function source parity – 2026-08-22

Status: **20/20 aktive Edge Functions har versjonskontrollert kilde under `supabase/functions/`.**

Denne kontrollen ble utført mot aktivt Supabase-prosjekt `ibloovohuhrceivrvhvn`. Formålet er gjenopprettbarhet og å hindre at live backend blir en skjult kilde som divergerer fra Git.

| Function | Live version | verify_jwt | Live source hash (Supabase) |
|---|---:|---|---|
| admin-invite-user | 3 | true | `6a47c97aae5fff03c9771cb945ffcf362d7a38324c9a63913494025cf78ad456` |
| admin-grant-role | 3 | true | `3d8f368c9e9a422211156869b4496c2ae5af9f95ffb1115d12cc9e194080cf84` |
| admin-revoke-role | 2 | true | `183c9e3082b761631adb1f62b0dd8319debbe4778af2f9da6f28affa55c6db0c` |
| public-intake | 3 | false, custom fail-closed gates | `4a5dd41b4ad2d4e93838ed128af541b296b67babda2835990fca1ed756833bed` |
| bootstrap-owner-once | 3 | false, permanently closed/410 | `75c9c1714d56ffe504db80858b477beabd718ba54d4d6b6b7f141707e5a6c37a` |
| rls-preview-selftest | 2 | false, permanently closed/410 | `a68e2a49987a7cef8232f492bfbe5827e60c9218accd6501a4f2603783f2cc1f` |
| admin-create-participant | 3 | true | `3a9afdec37b1dc0a7b0fe5e7ac696b1e49477ace68a0f5c7d4a77b4c5547a41d` |
| admin-list-access | 1 | true | `9404da12a4425a83f3b614c9d774fdcb550b7221483d977f0241785708a3c4b0` |
| task-command | 2 | true | `d20b9d7b883e10188162e19203b812e759033305317d61e0b82f2ed5cd5848a3` |
| workflow-command | 3 | true | `a68d7e52a682269527ee801fdfcf64bfac628be9ef0d86e701401b81a01a4c1e` |
| intake-command | 2 | true | `0babfd73988de857c339e1f39da2d15cab37407ff3a5571f712ccc26068a059e` |
| case-command | 2 | true | `85f33dce031313e40edfd88cf63c2d4a1635cd308530a53b115cee927406532d` |
| sos-command | 1 | true | `a0c23b9e14613e26dabb8ff01be5c229af19897c3177b5488457a0bad36c05b5` |
| participant-profile-command | 1 | true | `e7a843b8db9a62e28cb4d1d2b061e2f829a59f212384cd8e7845a4b175922c57` |
| demo-create-interest | 1 | true | `f08042f184a1f702c8148ed6fb9f663f37f5d2f08e8f932f3b13084ac67fa203` |
| onboarding-command | 1 | true | `bc735166085fa7918a2da8fcab15d728344b0cb13163620439747b09e8e28421` |
| qa-create-role-pack | 1 | true | `04a2646025c531f1f6392cf367aa5d0849df2092d190a2d281e83de8f90dba23` |
| qa-cleanup-role-pack | 1 | true | `31795802a3327ffe02db91fddb405d6065ad38e9ef0d86e701401b81a01a4c1e` |
| account-setup-command | 1 | true | `c623be24f4b7dccf2a63a64d7070798ea56d9b0e879e58248e79a828c91cd91d` |
| form-command | 1 | true | `96fd9d8141971b660a15bf343692e6c5e33704655f897d6e55d66c80016b02c9` |

## Viktige funn

- `public-intake` i Git var eldre enn aktiv Supabase-kode og ble først korrigert til live-versjonen; N1/N2-inntakspakken er deretter produksjonsført som v3 med readiness-gate og separat henvisningsspor.
- `intake-command` og `admin-create-participant` ble gjenopprettet tidligere i N2→N3-pakken; `intake-command` er nå v2 med eksplisitt henviser→deltaker-identitetsgrense, og `admin-create-participant` v3 sikrer at konto-link gir deltakeren én konkret første VÍA-handling.
- `workflow-command` er v3 og gjenkontrollerer deltakeravtale, samlet Pilot-GO, VIDA-eier og åpne vilkår før SER kan startes.
- `form-command` ble opprettet kilde-før-deploy i P0 form-write-pakken.
- `bootstrap-owner-once` og `rls-preview-selftest` er fortsatt deployet, men returnerer permanent `410` og er ikke operative bakdører.
- CI forventer eksplisitt hele 20-funksjonssettet. Ny funksjon eller slettet kilde krever en bevisst parity-oppdatering.

## Regel videre

Backendendring skal normalt gå **Git-kilde → kontroll/PR → deploy → read-back**. Dersom en live-hotfix unntaksvis skjer først, skal eksakt live-kilde bringes tilbake til Git før neste backendarbeid.
