# AidMe • Camino Measures

Denne repoen starter på **v5.6.1** (mest komplette baseline). Vi bruker enkel "single-file" webapp (`index.html`) + Netlify.

## Første gangs oppsett
1. Opprett GitHub‑repo (f.eks. `aidme-camino-measures`).
2. Initialiser git lokalt og push (se steg i svaret mitt).
3. Koble Netlify ⇒ *New site from Git* (Build command: blank, Publish directory: `.`).

## Branch-strategi
- `main` = produksjon
- `dev`  = utvikling
- feature‑branches: `feat/<kort-navn>` → PR til `dev` → PR til `main` for release

## Versjonering
`vMAJOR.MINOR.PATCH` – neste patch: `v5.6.2` (mobil tale‑hotfix).
