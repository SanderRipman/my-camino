# AidMe.no public site – Git anchoring

This directory establishes the Git-controlled home for the public `aidme.no` front door.

## Why now

The public page is becoming the beginning of the AidMe VIDA participant/partner journey. Before the public interest form is connected to `my.aidme.no`, the public source needs repeatable source control, staging, QA and rollback.

## Current production truth (2026-08-16)

- Wix site: `6da1ca10-7965-40ee-a2ba-8035a51e3d99`
- Public production domain: `https://www.aidme.no/`
- Wix embeds the static Netlify site `aidme-public-preview`
- Netlify site ID: `0513db00-a62f-4154-8e09-5fefc7ce1fe4`
- Current content-refinement deploy: `6a818fb0563075817cf6ffdd`
- Known rollback deploy: `6a815151c66dcde8610d9348`
- Current deploy was created from a manual source upload, not from Git.

## Recovered source baseline

The exact controlled early prototype package has been recovered from SharePoint:

`Camino/11_Web_og_digital/01_Offentlig_aidme_no/Prototyper/AidMe_VIDA_public_site_prototype_v1_2026-08-16.zip`

It contains the nine-page static site, CSS/JS and local WebP assets. The production content-refinement checkpoint explicitly states that the later production deploy is newer than this prototype. Therefore this prototype is a **verified historical baseline, not silently declared identical to production**.

## Safe migration rule

1. Preserve the current Wix and Netlify production rollback points.
2. Import/reconcile the recovered baseline with the current production deploy before using Git as deploy source.
3. QA all nine pages in NO/EN and mobile/desktop.
4. Fix public UX issues (scroll-to-top navigation, mobile margins, caption prominence) on staging.
5. Add the interest intake only through a hardened server API; never direct anonymous DB writes.
6. Switch deploy source to Git only after parity/rollback verification.

## Intended repository layout

- `public-site/` – public information/interest front door
- `portal/` – authenticated `my.aidme.no`
- `supabase/` – backend migrations and Edge Functions

This keeps one AidMe VIDA product repository while preserving clear security boundaries between public, authenticated and backend layers.
