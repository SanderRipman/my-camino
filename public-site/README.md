# AidMe.no public site – Git anchoring

This directory establishes the Git-controlled home for the public `aidme.no` front door.

## Current production truth (verified 2026-08-17)

- Wix site: `6da1ca10-7965-40ee-a2ba-8035a51e3d99`
- Public production domain: `https://www.aidme.no/`
- Wix embeds the static Netlify project `aidme-public-preview`
- Netlify site ID: `0513db00-a62f-4154-8e09-5fefc7ce1fe4`
- Current production deploy: `6a818fb0563075817cf6ffdd`
- Netlify metadata confirms this deploy was created by API/upload and has no Git commit/ref (`commit_ref = null`, `public_repo = null`).
- The exact production ZIP was downloaded by the owner from Netlify and supplied back to the project on 2026-08-17. It is now archived in SharePoint under `Camino/11_Web_og_digital/01_Offentlig_aidme_no/03_Kildekode_og_deploy/` together with SHA-256 manifest and a patched candidate ZIP.

## Source-parity candidate

The candidate is a minimal patch on top of the exact downloaded production source, not the older prototype:

1. SER keeps the useful route/stage CTA and adds an explicit sequential `Gå videre til VIDA` / `Continue to VIDA`.
2. VÍA turns the previously visually empty callout into a deliberate `Under lading… / Charging…` battery motif while preserving the fachlig rule: no SER without sufficient VÍA and a realistic VIDA bridge.
3. CSS fixes contrast and mobile presentation for the callout and CTA pair.
4. The cross-origin Wix parent-scroll problem is handled separately by the reversible Wix Custom Embed `AidMe VIDA – iframe navigation top` (ID `8862699b-b4ba-4a55-b43e-f7e81715f719`).

## Safe migration rule

1. Preserve current Wix and Netlify rollback points.
2. Treat the owner-supplied Netlify ZIP as the exact production source baseline for this reconciliation.
3. Import the text source into Git and retain binary assets/checksums from the exact archive until the asset migration is completed.
4. QA all nine pages in NO/EN and mobile/desktop.
5. Fix public UX issues on staging, not by editing an older prototype.
6. Connect public interest intake only through the hardened server API; never direct anonymous DB writes.
7. Switch the public Netlify deploy source to Git only after parity/rollback verification.

## Repository boundaries

- `public-site/` – public information/interest front door
- `portal/` – authenticated `my.aidme.no`
- `supabase/` – backend migrations and Edge Functions

The public site remains informational and low-sensitivity. Authenticated participant/staff data belongs in the portal/backend boundary.
