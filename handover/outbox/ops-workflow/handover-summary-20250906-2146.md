# Handover summary (20250906-2146)

## 1) Migrasjonsrydd (ops-workflow)
- Dry-run kandidater: 0
- Flyttet: 1674
- Renamet: 0
- Duplikater fjernet: 0
- Rapport: handover\captures\ops-workflow\migration-report-20250906-2053.md

## 2) Dev-platform re-innhenting
- Kandidater totalt: 0
- Nye som ble lagt til: 0
- Rapport: handover\captures\dev-platform\reinnhenting-report-20250906-2117.md

## 3) Navnestandard (antall filer som matcher <chatkey>__*.md)
- ops-workflow: 1679
- dev-platform: 32

**5 nyeste ops-workflow:**
- handover\captures\ops-workflow\ci-netlify-setup-20250906-2136.md
- handover\captures\ops-workflow\navnestandard-verify-20250906-2134.md
- handover\captures\ops-workflow\navnestandard-verify-20250906-2130.md
- handover\captures\ops-workflow\navnestandard-verify-20250906-2127.md
- handover\captures\ops-workflow\migration-report-20250906-2053.md


**5 nyeste dev-platform:**
- handover\captures\dev-platform\reingest-report-20250906-212350.md
- handover\captures\dev-platform\reinnhenting-report-20250906-2117.md
- handover\captures\dev-platform\reinnhenting-report-20250906-2113.md
- handover\captures\dev-platform\reingest-report-20250906-2110.md
- handover\captures\dev-platform\reingest-report-20250906-2100.md


## 4) CI / Netlify Deploy Previews
- ci.yml: OK
- netlify-preview.yml: OK
- PR: chore: baseline CI + Netlify Deploy Preview — https://github.com/SanderRipman/my-camino/pull/15

## 5) Neste 3 tiltak
1. Fullfør/merge PR for CI/Netlify DP (eller opprett om nødvendig) og bekreft første Deploy Preview.
2. Kjør Fase 2 (dev-platform) «migrasjonsrydd» med samme trygg rekkefølge som ops-workflow.
3. Re-run navnestandard-verifisering + index-sjekk etter Fase 2 og klargjør Fase 3 (ev. turplan-camino).

## 6) Kjøreregler (kort)
- Alltid: dry-run → backup ZIP → utfør → snapshot + index → kort rapport.
- Kun én ChatKey om gangen. Ingen innholdsendringer i samme PR som flytt/rename.
- Bruk standard sti: handover/captures/<chatkey>/YYYY/MM/<chatkey>__YYYYMMDD-HHmm__topic.md.
