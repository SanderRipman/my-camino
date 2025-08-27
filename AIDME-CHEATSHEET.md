# AidMe – “cheatsheet”

### Grener
- **main** = produksjon (Netlify → my.aidme.no)
- **dev**  = staging/test (Netlify → dev.aidme.no)
- **feat/***, **hotfix/*** = midlertidige grener → PR til dev

### GitHub Actions
- **release-pr.yml** – lager/oppdaterer PR fra `dev → main` (manuell/tidsplan).
- **feature-hotfix-to-dev.yml** – når du pusher til `feat/*` eller `hotfix/*`, åpnes PR til `dev`.
- **labeler.yml** – auto-labels på PR.
- **pr-summary.yml** – oppsummering i PR.

### Lokale kommandor (PowerShell 7)
- `Open-Repo` → cd til repo + `git status`
- `New-Feature "navn"` → oppretter `feat/navn` fra `dev` + push
- `Release vX.Y.Z "notat"` → tag + CHANGELOG + push til `main`
- `HealthCheck` → kjapp lokal sjekk
- `pwsh -File .\tools\auto-push.ps1 -Branch dev` → manuelt trigge auto-push
- **Meny:** `AidMe-Menu` (alias: `aid`) → klikkliste over alt

### Netlify
- Prod: **my.aidme.no** (branch: `main`)
- Dev: **dev.aidme.no** (branch: `dev`)
- Deploy Previews: hver PR har egen URL (vises i PR)

### Standard arbeidsflyt
1. `aid` → “Ny feature-branch”
2. Jobb, commit/push → sjekk PR-preview (Netlify)
3. Merge PR → `dev`
4. **release-pr.yml**: åpne “dev → main” PR
5. Sjekk dev og PR-preview; merge når OK (prod oppdateres)

