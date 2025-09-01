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
