# AidMe – Arbeidsmåte (hurtigguide)

## Grunntanke
- Hver chat har én eierfil (ZIP): `<chatkey>-handover.zip`.
- ZIP-ene ligger felles under “AidMe → Add files” og speiles lokalt i `C:\Dev\my-camino\handover\`.
- Vi jobber etter dev→main med Release-PR og obligatoriske sjekker.

## Raskt i gang (PowerShell 7)
1) Åpne PS7 og kjør `aid` (standard) eller `aidm` (utvidet).
2) For ny funksjon: `New-Feature -Name "kort-navn"`.
3) Snapshot: `SNAPSHOT <chatkey>` (eller `snapall` for alle).

## Migrering av gamle chatter
- Lim inn innhold: `aidm` → M (migrer). Systemet foreslår chatkey automatisk (overstyr om ønskelig).
- Notatet lagres i `docs/migrations/<chatkey>/YYYYMMDD-HHmm.md` og blir med i neste snapshot.
- Bulk: legg .txt-filer i `_migrate\` og velg **B** i `aidm`.

## Når chat er “full”
- Fortsett i ny chat med *samme* `<chatkey>` (f.eks. `dev-platform`).
- Kjør `SNAPSHOT <chatkey>` for å oppdatere ZIP + AidMe-Index.
- Last opp ny ZIP til “AidMe → Add files”.

## Kvalitet og CI
- PR til `main` krever grønne sjekker (PS7 CI).
- Release-PR fra `dev` → `main` (via GitHub Actions).
- Bruk `HealthCheck` for å se status lokalt.

## Nøkkelkommandoer
- `aid`  → hovedmeny
- `aidm` → utvidet meny (migrering + snapshots)
- `aidx` → vis AidMe-Index
- `snapall` / `snapchg`

# AidMe • Camino Measures

Miljøer:
- Prod (main): https://my.aidme.no
- Dev  (dev):  https://dev.aidme.no
- Alle PR-er får egen Netlify “Deploy Preview”-URL.

## Slik jobber du

### A) Ny endring
```powershell
Open-Repo
New-Feature "kort-navn"   # lager branch feat/kort-navn fra dev
# gjør endringer, lagre filer
git add .
git commit -m "feat: beskriv kort"
git push                  # konsollen viser PR-lenke → åpne PR mot dev

## Arbeidsmåte og SNAPSHOT-prosess

Dette prosjektet (AidMe) bruker en struktur med handover-filer og dedikerte chatter. 
Hver aktiv chat har én tilhørende *eierfil* (`<chatkey>-handover.zip`) som ligger under “Add files”. 
Når en chat blir full, videreføres arbeidet i en ny chat (samme eierfil → versjon v2/v3).  

### Regler for arbeid
- Hold fokus i hver chat på sin egen eierfil/ZIP, men bruk andre chatter/ZIP-er som kilder ved behov.  
- Respekter dev→main releaseflyt (ingen direkte commits til main, kun via PR).  
- Store endringer → be om nytt snapshot ved å skrive:  
