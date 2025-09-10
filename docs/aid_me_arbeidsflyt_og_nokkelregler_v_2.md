# AidMe • Arbeidsflyt og Nøkkelregler (v2)

## 1. Mandat og visjon
AidMe er en strukturert plattform med dedikerte chatter (ChatKeys) og tekniske verktøy.  
Visjonen er å utvikle kjerneproduktet **AidMe • Camino Measures**: et måleverktøy for rehabilitering, mestring og helse.

All arbeidsflyt, prosesser og tekniske rutiner skal:
- Sikre ryddighet og minimere feil.
- Gi tydelig fokus pr. dedikert chat.
- Holde kontinuitet og minimere datatap.
- Sikre effektiv fremdrift mot kjerneproduktet.

## 2. Roller og dedikerte chatter
| ChatKey            | Mandat og fokusområde |
|--------------------|------------------------|
| **ops-workflow**   | Prosjektledelse, beslutninger, koordinering og tverrfaglig samhandling. |
| **dev-platform**   | Kjerneprodukt, teknisk utvikling (frontend/backend/API). |
| **product-roadmap**| Produktmål, features, milepæler, releases. |
| **pilot-studier**  | Planlegging, gjennomføring og evaluering av piloter. |
| **forskning-studier** | Samle og systematisere forskning/studier. |
| **partner-tilskudd** | Partnere, søknader, finansiering. |
| **turplan-camino** | Reiseruter, logistikk, datoer, inspirasjon. |
| **ideer-lab**      | Fryseboks for ideer/skisser. |
| **(planlagt) integrasjoner** | API-er, smartklokker, helsedata, Wix, eksterne kilder. |
| **(planlagt) optimalisering** | Drift, ytelse, kontrollpanel, feilretting. |

## 3. Nøkkelregler
- **Strengt fokus:** Hver chat holder seg til sitt mandat.  
- **Flytt ved feil:** Hvis tema passer bedre i en annen chat, avgjør ops-workflow og flytter.  
- **Kontinuitet:** Når chatter blir fulle, migreres automatisk til ny chat uten datatap.  
- **Kritisk sans:** Alle chatter skal være kritiske og foreslå forbedringer.  
- **Ops-workflow har mandat:** Prosjektlederrollen brukes aktivt for å sikre fremdrift.

## 4. Arbeidsflyt
1. **Bruker → dedikert chat.**  
2. **Dedikert chat → vurderer:** hører dette hjemme her, i annen chat, eller krever tverrfaglig samarbeid?  
3. **Ops-workflow → beslutning:** flytt/videresend, evt. start tverrfaglig løp.  
4. **Snapshot → index → distribusjon:** alle dedikerte chatter holdes synkronisert.  
5. **Aid Control Center:** brukes til å kjøre rutiner, migrasjoner og helsesjekk.  

## 5. Teknisk grunnmur
- **Repo:** GitHub (my-camino).  
- **Deploy:** Netlify (prod: my.aidme.no, dev: dev.aidme.no).  
- **Scripts:** PowerShell 7 (PS7) helpers i 	ools\ops\.  
- **Snapshots:** New-AidSnapshot -ChatKey <key>.  
- **Index:** AidMe-Index.md holdes oppdatert.  
- **Kontrollpanel:** Aid Control Center (QuickMenu), med alias sos, snap, ctrl.

## 6. Rutiner og koder
- **sos** = send utkast fra ops-workflow.  
- **snap** = snapshot + index.  
- **ctrl** = kontrollrapport.  
- **Aid Control Center:** kjørbar meny for rutiner (snapshot, migrasjon, helsesjekk m.m).  
- TODO: utvide med helsesjekk, auto-validering og varsling.

## 7. Integrasjoner og fremtid
- Planlagt ny chatkey: **integrasjoner**.  
- Planlagt ny chatkey: **optimalisering**.  
- TODO: automatisk varsling om feil, ytelsesproblemer og når migrasjon bør gjøres.  
- TODO: API-import fra smartklokker og eksterne kilder.  

## 8. Intensjon og bakgrunn
AidMe springer ut av Camino-pilotene (Frances, Portuges).  
Camino Measures skal bli et måleverktøy som kombinerer:
- Kartlegging (selvrapporterte skjema).  
- Datafangst (API, smartklokker, integrasjoner).  
- Visualisering (frontend).  
- Oppfølging (rehabilitering, mestring, helse).  

**Målet:** bidra til økt mestring, bedre helse og inkludering.  

## 9. TODO (kortliste)
- [ ] Slå sammen og forbedre Aid Control Center (inkl. Rutiner).  
- [ ] Etablere Integrasjoner-chat når API-volum øker.  
- [ ] Etablere Optimalisering-chat når drift/ytelse krever.  
- [ ] Helsesjekk og auto-validering.  
- [ ] Tilbake til utvikling av kjerneproduktet (AidMe • Camino Measures) så fort det er forsvarlig.
