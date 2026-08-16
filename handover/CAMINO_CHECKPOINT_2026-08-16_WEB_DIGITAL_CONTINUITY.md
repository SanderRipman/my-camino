# CAMINO CHECKPOINT – WEB / DIGITAL / DOKUMENTKONTINUITET

**Tidspunkt:** 2026-08-16 ca. 04:56 CEST  
**Status:** REDUNDANT CHECKPOINT / HANDOVER – må flettes inn i kanonisk SharePoint-styring så snart SharePoint-connectoren er operativ.  
**Kanonisk regel:** SharePoint `Camino/` er levende fasit. Dette dokumentet skal aldri blindt overskrive nyere SharePoint-innhold.

## 0. KRITISK OPPSTART FOR NESTE CHAT / NESTE ARBEIDSBLOKK

Når SharePoint fungerer:
1. Les `Camino/00_Fremdrift_og_beslutninger/Handover/CAMINO_LIVE_START_HER.md`.
2. Les `CAMINO_PROJECT_STATE.md`, `CAMINO_HANDOVER_LIVE.md`, `Beslutningslogg_Camino_v0_3.md`, `CAMINO_DOKUMENTREGISTER.md` og `Neste_steg_Camino_v0_3.md`.
3. Flett dette checkpointet inn i dagens styringsfiler. Ikke blind overskriving.
4. Last checkpoint + ZIP til `Camino/00_Fremdrift_og_beslutninger/Handover/Arkiv/`.
5. Les tilbake og verifiser.
6. Fortsett web/digital-løpet uten å re-spørre om beslutningene nedenfor.

Ved checkpoint-forsøket 16.08.2026 svarte både SharePoint- og Wix-connectorene `tool has been disabled` før konto/site/filer kunne nås. GitHub fungerer og er derfor brukt som redundant kontinuitetslager.

# 1. KJERNE / RETNING

AidMe VIDA er overprogrammet: `VÍA → SER → VIDA → ny VÍA`.

- VÍA = Veivalg · Innsikt · Avklaring = FØR.
- SER = Selvverd · Egenkraft · Retning = UNDER.
- VIDA = Verdien I Deg Aktiveres = ETTER.
- Motto: `Ve. Sé. Vive.` / `La VIDA es la VÍA.`
- Ingen SER uten minimum VÍA og VIDA.
- Ingen avslutning uten navngitt VIDA-eier.
- Ikke markedsfør som behandling, kur eller garantert effekt.

Første pilot: smal, ressursorientert målgruppe. Første SER-rute Camino Portugués / Porto → Santiago ca. 230–270 km. Fallback Tui → Santiago ca. 115 km / 8–9 dager. Referanse: 8 deltakere, 3 operative ansatte, ca. 18 dager.

# 2. DOKUMENTARBEID – FERDIG / LÅST RETNING

Pre-fase-7 ble ferdigstilt med:
- 1–2 sider
- Lett / PR
- Dyp / fag
- tørre fagmoduler som referansebibliotek
- NO autoritet, EN kontrollert speil
- aktiv visuell serie v0.7.3

Dyp fagpakke er seks kategorier:
1. Prosjekt, identitet og partnermodell
2. Faggrunnlag, roller og retningslinjer
3. Deltakerløp, sikkerhet og beslutninger
4. SER: ruter og gjennomføring
5. Operativ malpakke, måling og evaluering
6. Budsjett og sensitivitet

SER-modell:
- roterende frontanker
- bakanker / sweep
- rover / relasjonsressurs
- elastisk grønn/gul/rød sikkerhetskorridor
- deltakere kan gå alene, i par, i stillhet eller møte andre pilegrimer når rammen tillater det
- fysisk telling avgang/ankomst + avtalte kontrollpunkt
- minst to planlagte 1:1-samtaler per deltaker på ca. 17 dager

Operativ malpakke:
VÍA/interesse → GO/NO-GO → deltakeravtale → Pilot-GO → daglig SER-logg → hendelseslogg ved behov → én levende VIDA-plan → pilotevaluering.

VIDA-plan: mål → konkret aktivitet → start/frist → ansvar/støtte → status/læring. NAV Aktivitetsplan kan speile relevante mål, men erstatter ikke AidMe VIDA-planen.

# 3. ÅPNE RESERVEOPPGAVER 1–4

Disse skal ikke glemmes. Punkt 7–9 har prioritet; oppgavene gjøres når web/digital står fast eller etterpå.

1. **XXL komplett fagvariant:** vurder hva som gikk fra ca. 100 sider til 32 sider. Inkluder alt fornuftig, spesielt budsjett, skjema og utdypende fagstoff, uten å svekke de gode 1–2/Lett/Dyp-versjonene.
2. **Sammenslåtte komplette fagpakker:** behold modulene, men lag i tillegg én komplett Dyp fagpakke og én komplett Kort partnerpakke.
3. **Skjema som enkeltfiler:** behold samlet malpakke og eksporter hvert skjema separat.
4. **A4-tabellflyt:** korriger tabeller som går utenfor norsk A4 med små/normal marger.

Status: åpne / ikke verifisert som ferdige.

# 4. PUNKT 7 – DIGITALISERING

Mål:
- digitaliser operative skjema
- norsk default, engelsk valg
- pseudonym/kodenavn som synlig identitet
- realistiske demodata
- data knyttet til pseudonym lagres
- minst mulig dobbelføring
- samme VÍA → SER → VIDA-logikk
- senere migrerbar til sikkert produksjonsmiljø

Demo skal ikke brukes for reelle sensitive helseopplysninger.

Analyse/grafer:
- stemning
- stress
- energi
- søvnkvalitet
- tilhørighet
- egenkraft
- retning
- én eller flere deltakere
- gruppesnitt
- 14/30/60/90 dager/hele perioden
- mønstre og samtalestøtte, ikke diagnose/behandlingseffekt

# 5. GITHUB – VERIFISERT STATUS

Konto: `SanderRipman`  
Repo: `SanderRipman/my-camino`

Verifisert produksjonscommit:
`6df0e9409df015ae8ee8852699dbd1f48784d484`
`Production: AidMe VIDA workspace v1`

Viktige branches:
- `main`
- `dev`
- `feat/vida-digital-v1`
- `feat/vida-production-root-v1`
- `release/vida-production-v1`
- `backup/camino-measures-v5.6.1-2026-08-16`
- `backup/my-aidme-production-pre-vida-2026-08-16`

`main/index.html` redirecter til `/vida/`, NO, `noindex,nofollow`.

Åpen visuell detalj: root-fallback bruker fortsatt enkel «A»-sirkel; bytt til original AidMe-logo.

Workspace i produksjonscommit har:
- NO/EN
- seks realistiske fiktive deltakere
- pseudonym/kodenavn
- localStorage
- lagring av nye deltakere/innsjekker
- JSON eksport/import
- 7 indikatorer 0–10
- grønn/gul/rød dagsstatus
- 14/30/60/90/hele perioden
- flerdeltakersammenligning + gruppesnitt
- skjema/rutineflyt VÍA → GO → SER → VIDA

Netlify-status på commit:
- `netlify/mycamino/deploy-preview` = SUCCESS
- `netlify/dev-aidme-no/deploy-preview` = FAILURE

GitHub-koden er på main, men live `my.aidme.no` må fortsatt verifiseres.

# 6. PUNKT 8 – `my.aidme.no`

Bruker har premium Wix Studio-side:
`https://sanderseim.wixstudio.com/my-site-1`

Ønsket permanent arbeidsflate:
`my.aidme.no`

Mulig tidligere binding mot `myaimy.no` må verifiseres i Wix.

Foretrukket:
- bruk Wix Studio-premium hvis ren kobling til `my.aidme.no`
- alternativt eksisterende GitHub/Netlify-workspace hvis mer robust
- subdomain `my.aidme.no` er ønsket og naturlig
- domenevalg skal ikke forsinke funksjonsutviklingen

Arbeidsflaten skal være funksjonell:
Oversikt · Deltakere · Innsjekk · Analyse · Skjema & rutiner · Innstillinger · VIDA-plan · grønn/gul/rød.

Original AidMe-logo også her.

# 7. PUNKT 9 – `aidme.no`

Produksjonsmål:
`https://www.aidme.no/`

Ny offentlig AidMe VIDA-hovedside. Eksisterende innhold kan bevares som backup dersom enkelt, men backup skal ikke blokkere fremdrift.

Visuell hovedregel:
- inspirasjon fra Dyp v0.7.3
- minst 70 % ekte AidMe/Camino-bilder
- SharePoint: `Camino/10_Media_og_markedsforing/02_Godkjent_for_bruk/`
- ekstra vekt: `01_Utvalgt_partnerpakker_2026-08-09`
- `!` i filnavn = favoritt/høy prioritet, men sammenheng vinner
- original `AIDME_Logo-transparent.png`
- teal/navy, krem/off-white, varm gull
- store fotoflater, personlig og profesjonelt
- ikke klinisk/institusjonelt

Navigasjon:
Hjem · VÍA · SER · VIDA · For deltakere · For partnere · Om AidMe · Kontakt.

NO default, EN valg.

Dramaturgi:
1. Hero
2. hvorfor AidMe VIDA finnes
3. grunnleggerhistorien
4. før–under–etter
5. frihet innen trygge rammer
6. stor rute-/etappearkitektur
7. Portugués + Francés
8. Santiago / credencial / Compostela
9. VIDA-broen hjem
10. partnerlogikk
11. deltakerforventninger
12. kontakt

Grunnleggerhistorie:
- Aimy AI-selskap verdsatt ca. 45 mill. NOK
- gründerskap/investorer/Innovasjon Norge/Forskningsrådet
- voldshendelse 2023
- skader/systemkamp
- sterke smertestillende/Valium utviklet seg for ham til rusmisbruk
- pilegrimsvandring ble personlig vendepunkt
- tre vandringer ga rytme, fellesskap, mestring og kraft
- alltid egenerfaring, aldri generell behandlingspåstand

Bevar essens: «Ingen skal måtte stå alene når systemet ikke henger sammen.»

Etappearkitektur skal ha stor plass:
- rute
- etapper
- distanser
- varighet
- bilder
- formål
- delmål
- tilpasning/pause/transport
- målgang
- credencial/stempler
- 0 km
- Santiago
- Compostela
- videre Finisterra/Muxía der relevant

Camino Portugués = første SER-rute.  
Camino Francés = eget rute-/inspirasjonsspor; Cruz de Ferro naturlig.

# 8. BILDEDRAMATURGI – MÅ IKKE GÅ TAPT

Slit/samhold/refleksjon:
- `Santiago4!` sliten, men glad
- `Santiago5!` gruppe å støtte seg til
- `Santiago6!` dagbok/refleksjon alene
- `Santiago7!` meditasjon/stillhet i solnedgang
- `Santiago20!` nye/langvarige bekjentskap
- `Santiago23!` legitim alenetid
- `Santiago17!` måltid med nye venner
- `Santiago15!` egne spor/refleksjon på stranden
- `Santiago8!` før soloppgang, liten i positiv forstand/nærvær
- `Santiago11` alene, men sammen
- `Santiago28!` enkel belønning etter innsats
- `Santiago26` yoga/mindfulness/nye praksiser

Delmål:
- `Santiago24!` 0 m / mål nådd
- `Santiago35` skilt/beskjeder
- `Santiago31` albergue/yoga
- `Santiago32!` påminnere/budskap
- `Santiago36` ny glede i det man tok for gitt
- `Santiago34` / `Santiago13` symbolmarkører
- `Santiago30!` Portugal → Spania

Credencial/diplom:
- `Compostela 3` credencial/stempler
- `Compostela!` hoveddiplom
- `Compostela 2!` hoveddiplom + Finisterra
- `Compostela 4` Muxía

Målgang:
- `Santiago!`
- `Santiago2!`
- `Santiago3!`
- `Santiago22!`
- `Santiago33!`
- `Santiago9!` humor/ikke-religiøs Camino-kontekst brukt respektfullt

Cruz de Ferro-bildet der Sander legger fra seg noe:
`legge fra seg noe → overgang → gå videre lettere`
Kan brukes flere steder med måte. Ingen krav om symbolhandling/deling.

«Camino provides» kan brukes nøkternt, ikke som garanti.

# 9. WIX – STATUS

Bruker har oppgitt premium:
- `https://www.aidme.no/`
- `https://sanderseim.wixstudio.com/my-site-1`

Det er tidligere generert et nytt AidMe VIDA-utkast/site i Wix-prosessen, men eksakt site-ID/premium-/domain-binding må re-verifiseres.

Ved checkpoint svarer Wix-verktøyet i ChatGPT:
`The Wix tool has been disabled`

Dette skjer før konto/site-autentisering.

Når Wix fungerer:
1. WixREADME
2. site-context/list sites
3. identifiser premiumsite for aidme.no
4. identifiser my-site-1 og eventuell myaimy.no-binding
5. bevar gammel side som backup hvis enkelt
6. publiser/oppdater aidme.no
7. koble arbeidsflaten til my.aidme.no
8. verifiser live
9. oppdater styring/checkpoint

Sikkerhet: en Wix API-nøkkel ble limt inn i chatten. Den skal regnes som eksponert og bør roteres. Ikke lagre nøkkelen i GitHub/SharePoint/handover.

# 10. AIDME ADMIN / GAMMEL WEB / TILGANG

`Camino/AidMe Admin` inneholder eldre web/app/program-materiale og mulig hosting/recovery-kontekst.

Fortsatt oppgave:
- gjennomgå konto/hosting/recovery-kontekst
- aldri gjengi passord/token/recovery codes
- identifiser kun tjeneste/konto/hvor materialet finnes

Tidligere mulige brukere:
- `sander@aidme.no`
- `sander@aimy.no`
- `zanderzeim@gmail.com`
Bruker tror `sander@aidme.no` er mest sannsynlig.

# 11. PERSONVERN / PRODUKSJON

Demo:
- fiktive data
- pseudonym
- localStorage OK
- lagring per pseudonym

Produksjon med reelle data krever:
- autentisering
- roller
- backend
- kryptering
- logging
- sletting
- databehandlerforhold
- lagringssted
- samtykke
- eventuell helse-/biometrisk behandling

Wearables kan senere være frivillig tillegg, men stress-score skal ikke være diagnostisk eller automatisk GO/NO-GO.

# 12. ARBEIDSREKKEFØLGE

1. Få SharePoint-connector tilbake.
2. Flett dette checkpointet inn i SharePoint styringsfiler + Handover/Arkiv og read-back.
3. Fortsett punkt 7 via GitHub.
4. Få Wix-connector tilbake og identifiser premium-sitene.
5. Bygg/publiser aidme.no.
6. Koble/publiser my.aidme.no.
7. Flere QA-runder: budskap, struktur, estetikk, bilder, mobil, navigasjon, NO/EN, CTA, partner/deltaker.
8. Verifiser live.
9. Oppdater styring/checkpoint.
10. Hvis Wix står fast: jobb reserveoppgave 1–4.

# 13. BRUKERFULLMAKT

Bruker ønsker:
- autonomitet
- kreativitet
- helhet
- effektivitet
- kontinuerlig fremdrift
- minst mulig manuelt arbeid
- proaktiv problemløsning
- synlig pågående arbeid i chat
- ingen stopp for små avklaringer
- spør kun ved reell kritisk blokkering
- backup ønskelig, men må ikke blokkere
- stor fullmakt til å endre/flytte/slette webinnhold i god tro, mens prosjektpraksis fortsatt bør favorisere backup/arkiv når enkelt

# 14. VERIFISERT / IKKE VERIFISERT

Verifisert:
- GitHub fungerer
- production commit 6df0e940 på main
- main root redirecter til /vida/
- daterte backup-branches finnes
- Netlify mycamino preview success
- Netlify dev-aidme-no preview failure
- workspace-kode har pseudonym, demodata, localStorage, målinger, grafer/sammenligning og skjemaflyt

Ikke verifisert i checkpoint-blokken:
- siste SharePoint-styringsinnhold
- checkpoint skrevet til SharePoint
- aktuell Wix premium/domain-binding
- om my-site-1 er bundet mot myaimy.no
- om my.aidme.no peker til Wix/Netlify/noe annet
- om tidligere generert Wix VIDA-site er riktig premiumsite
- at Wix API-nøkkel er rotert
- endelig live QA av aidme.no og my.aidme.no

# 15. DEFINISJON AV FERDIG WEBFASE

Ikke ferdig før:
- aidme.no viser ny AidMe VIDA-retning live
- my.aidme.no viser funksjonell VIDA-arbeidsflate live
- NO default + kontrollert EN
- aidme.no bruker original logo og ≥70 % ekte godkjente Camino-bilder
- grunnleggerhistorien er ærlig/kontrollert
- etappearkitektur har stor plass
- Portugués og Francés presentert
- Santiago/credencial/Compostela/Cruz de Ferro brukt riktig
- arbeidsflaten støtter pseudonym, lagring, innsjekk, grafer og skjema
- mobil/desktop testet
- gammel produksjon bevart som backup der enkelt
- GitHub/hosting/domainstatus dokumentert
- SharePoint styring/handover oppdatert og read-back verifisert
- demo vs produksjon-sikkerhet dokumentert

## END OF CHECKPOINT
