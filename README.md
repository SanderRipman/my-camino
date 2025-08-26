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
