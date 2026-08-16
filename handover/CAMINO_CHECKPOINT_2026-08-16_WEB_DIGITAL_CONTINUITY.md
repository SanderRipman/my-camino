# CAMINO CHECKPOINT – WEB / DIGITAL CONTINUITY

Dato: 2026-08-16. Dette er en redundant sikkerhetskopi. SharePoint `Camino/` er kanonisk og denne filen skal flettes inn, aldri blindt overskrive nyere styringsfiler.

## Connector-status
- GitHub fungerer.
- Wix svarte ved checkpoint `The Wix tool has been disabled` før site-autentisering.
- SharePoint svarte ved checkpoint `tool has been disabled` før lesing av styringsfilene.
- Derfor er kanonisk SharePoint-checkpoint PENDING og må fullføres/read-back straks connectoren virker.

## GitHub-verifisert
Repo `SanderRipman/my-camino`.
Produksjonscommit på main: `6df0e9409df015ae8ee8852699dbd1f48784d484` – `Production: AidMe VIDA workspace v1`.
Backup-branches: `backup/camino-measures-v5.6.1-2026-08-16` og `backup/my-aidme-production-pre-vida-2026-08-16`.
Viktige branches inkluderer `dev`, `feat/vida-digital-v1`, `feat/vida-production-root-v1`, `release/vida-production-v1`.
`main/index.html` redirecter root til `/vida/` og har `noindex,nofollow`.
Netlify status på produksjonscommit: `mycamino/deploy-preview` SUCCESS, `dev-aidme-no/deploy-preview` FAILURE. Ikke påstå at `my.aidme.no` er live før domain/hosting er verifisert.

## VIDA-workspace v1
- NO default / EN valg
- pseudonym/kodenavn
- seks realistiske fiktive deltakere
- localStorage-demo
- nye deltakere/innsjekker lagres
- JSON eksport/import
- målinger: stemning, stress, energi, søvnkvalitet, tilhørighet, egenkraft, retning
- grønn/gul/rød dagsstatus
- analyse 14/30/60/90 dager/hele perioden
- én/flere deltakere + gruppesnitt
- operativ flyt VÍA → GO → SER → VIDA
- demo skal ikke brukes til reelle sensitive helseopplysninger
Åpent: bytt enkel A-logo i root-fallback til original AidMe-logo.

## Produksjonsmål
Offentlig: `https://www.aidme.no/`.
Arbeidsflate: premium Wix Studio `https://sanderseim.wixstudio.com/my-site-1`, ønsket koblet til `my.aidme.no`. Mulig gammel `myaimy.no`-binding må verifiseres. Alternativ GitHub/Netlify-hosting er akseptabel hvis mer robust.

## aidme.no – låste krav
- minst 70 % ekte AidMe/Camino-bilder fra SharePoint `02_Godkjent_for_bruk`, særlig `01_Utvalgt_partnerpakker_2026-08-09`
- `!` i filnavn = brukerfavoritt/høy prioritet, men sammenheng vinner
- original `AIDME_Logo-transparent.png`
- estetikk fra Dyp v0.7.3: teal/navy, krem/off-white, varm gull, store fotoflater, menneskelig/profesjonell
- NO default, EN valg
- synlig hovedmeny: Hjem · VÍA · SER · VIDA · For deltakere · For partnere · Om AidMe · Kontakt
- sterk grunnleggerhistorie, men alltid egenerfaring og aldri behandlingspåstand
- stor etappearkitektur med bilder, formål, etapper, distanser, delmål, credencial/stempler, Santiago og Compostela
- presenter både Camino Portugués og Camino Francés
- Cruz de Ferro-bildet brukes kontrollert som symbol: legge fra seg noe → overgang → gå videre lettere

## Grunnleggerhistorie
Aimy AI-selskap verdsatt ca. 45 mill. NOK; gründerskap/investorer/Innovasjon Norge/Forskningsrådet; alvorlig voldshendelse i 2023 og systemkamp; sterke smertestillende/Valium utviklet seg for Sander til rusmisbruk; pilegrimsvandring ble personlig vendepunkt der misbruket tok slutt; tre vandringer ga rytme, fellesskap, mestring og kraft til å møte livet hjemme. Personlig erfaring, ikke universell behandlingseffekt.
Bevar essens: «Ingen skal måtte stå alene når systemet ikke henger sammen.»

## Bildedramaturgi som ikke må mistes
Slit/samhold/refleksjon: `Santiago4!`, `5!`, `6!`, `7!`, `20!`, `23!`, `17!`, `15!`, `8!`, `11`, `28!`, `26`.
Delmål: `Santiago24!`, `35`, `31`, `32!`, `36`, `34`, `13`, `30!`.
Credencial/diplom: `Compostela 3`, `Compostela!`, `Compostela 2!`, `Compostela 4`.
Målgang: `Santiago!`, `2!`, `3!`, `22!`, `33!`, `9!`.
«Camino provides» kan brukes nøkternt, ikke som garanti.

## Dokumentstatus / reserveoppgaver
Pre-fase-7: v0.7.3 printserie, seksdelt Dyp fagpakke, Kort partnerpakke, Word-versjoner, operativ malpakke og språkstyring er gjennomført tidligere.
Åpne reserveoppgaver når web/digital står fast:
1. XXL komplett fagvariant ca. 80–100+ sider med alt fornuftig, inkl. budsjett/skjema/utdyping.
2. Én komplett sammenslått Dyp fagpakke + én komplett Kort partnerpakke i tillegg til modulene.
3. Eksporter hvert operativt skjema som egen fil i tillegg til samlet malpakke.
4. Korriger tabeller som flyter utenfor norsk A4 med små/normale marger.

## Sikkerhetsmodell
Frontanker + bakanker/sweep + rover er roterende funksjoner innen elastisk grønn/gul/rød sikkerhetskorridor. Deltakere kan gå alene, i par, i stillhet og møte andre når rammen tillater det. Minst to planlagte 1:1-samtaler per deltaker på ca. 17 dager. Walkie-talkie staff-to-staff. Wearables frivillig tillegg; stress-score aldri diagnostisk/automatisk GO-NO-GO.

## Wix neste gang connectoren virker
1. WixREADME.
2. Les/list premium-sitene.
3. Identifiser eksakt aidme.no-site.
4. Identifiser `my-site-1` og eventuell `myaimy.no` binding.
5. Bevar gammel produksjon som backup hvis enkelt, uten å blokkere.
6. Publiser ny `aidme.no`.
7. Koble/publiser arbeidsflaten på `my.aidme.no`.
8. Verifiser live desktop/mobil.
9. Oppdater SharePoint styring/checkpoint.

## SharePoint neste gang connectoren virker
Les `CAMINO_LIVE_START_HER.md` + Project State + Live Handover + Beslutningslogg + Dokumentregister + Neste steg. Flett checkpointet inn. Last datert checkpoint + ZIP til `Handover/Arkiv/` og read-back verifiser.

## Sikkerhet
En Wix API-nøkkel ble limt i chatten og skal regnes som eksponert. Roter den. Ikke lagre nøkkelen i GitHub/SharePoint/handover.

## Brukerfullmakt
Stor autonomitet/handlefrihet; vis fremdrift; spør bare ved reell kritisk blokkering; backup ønskelig men må ikke hindre fremdrift; minimalt manuelt arbeid for bruker.

Lokal full checkpoint-pakke SHA-256: `2be5f0f13fa9b79d6351822332bc72908cb419e723766c5ce093b32e0cc1cfa1`.
