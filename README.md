# AidMe Camino

Dette repoet inneholder prosjektfiler og scripts.

## Hurtigstart
- Bruk `Open-Repo` i PowerShell 7 for å gå til repoet.
- Opprett ny feature med `New-Feature 'navn'`.
- Lag release med `Release vX.Y.Z 'notat'`.

## CI & Deploy Previews

- **CI (Node 20)** kjører lint/test/build på \push\ og \PR\.
- **Netlify Deploy Preview**: PR får forhåndsvisning **hvis** \NETLIFY_AUTH_TOKEN\ og \NETLIFY_SITE_ID\ er satt i repo-secrets.
