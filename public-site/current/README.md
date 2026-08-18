# AidMe public site – current source parity candidate

This directory is the text-source mirror of the public AidMe site candidate derived from exact Netlify production deploy `6a818fb0563075817cf6ffdd` on 2026-08-18.

The candidate intentionally adds only controlled fixes already agreed in the Camino project:

- correct child content-height reporting for Wix iframe embedding;
- sequential SER → VIDA CTA while preserving route/stage access;
- visible VÍA callout with the `Under lading … / Charging …` micro-UI;
- mobile caption/touch/CTA refinements and cache-busted asset versions.

## Binary assets

Binary WebP assets are not duplicated in this Git text mirror yet. Exact file hashes, sizes and paths are recorded in `SOURCE_PARITY_MANIFEST_2026-08-18.json`. The complete deployable candidate including assets is archived in SharePoint at:

`Camino/11_Web_og_digital/01_Offentlig_aidme_no/Kildepakker/deploy-6a818fb0563075817cf6ffdd_MOBILE_QA_CANDIDATE_2026-08-18.zip`

Do not switch public Netlify production to this Git source until the binary assets are imported or the build/deploy process explicitly restores them from the controlled source package, and mobile/desktop QA has passed.
