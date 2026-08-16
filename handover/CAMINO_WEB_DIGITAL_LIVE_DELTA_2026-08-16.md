# CAMINO WEB / DIGITAL – LIVE DELTA 2026-08-16

**Formål:** Dette dokumentet supplerer `handover/CAMINO_CHECKPOINT_2026-08-16_WEB_DIGITAL_CONTINUITY.md` og skal leses ETTER checkpointet. Det inneholder endringer og verifiseringer som skjedde etter at checkpointet ble skrevet.

## 1. Work-modus / connectorstatus – kritisk miljønotat

Bruker har 16.08.2026 i ChatGPT **Work** praktisk bekreftet lese-/skriverettigheter/integrasjon for:
- Wix
- SharePoint
- GitHub
- Netlify

Work-visningen viste disse som aktive kilder samtidig. Wix kunne lese konto/nettsteder, inkludert `aidme.no` og premium Studio-siden som på tidspunktet var knyttet til `myaimy.no`. Netlify-konto med fire nettsteder var tilgjengelig. GitHub `SanderRipman` / `SanderRipman/my-camino` var tilgjengelig. SharePoint var tilkoblet.

**Operativ læring:** Dersom Wix/SharePoint i vanlig lang chat-runtime returnerer `tool has been disabled`, bruk **Work i samme ChatGPT-prosjekt**. Work ser ut til å holde add-ons/connectorer persistent aktive og er foretrukket modus for videre web/digital-arbeid.

## 2. Reserveoppgaver 1–4 – status endret til PRODUSERT LOKALT / QA

Disse sto tidligere som åpne i hovedcheckpointet, men ble deretter gjennomført mens Wix/SharePoint-runtime var blokkert:

1. **XXL Dyp fagpakke** – ca. 90 sider A4. Samler de seks aktive fagmodulene i naturlig rekkefølge. Den elegante 32-siders Dyp-bookleten skal fortsatt beholdes uendret som hovedpresentasjon.
2. **Komplett Kort partnerpakke** – ca. 27 sider A4. Samlet versjon i tillegg til modulene.
3. **Operative skjema som enkeltfiler** – 12 separate A4 PDF-er, samtidig som samlet master beholdes.
4. **Operativ malpakke v0.3 A4** – korrigert fra US Letter til ekte A4 210 × 297 mm, ca. 13 mm sidekanter; tabeller holdes innen skriveflaten. Word + PDF produsert.

Det finnes en lokal pakke fra denne chatten: `CAMINO_reserveoppgaver_1-4_2026-08-16.zip`. **Ny chat kan ikke forutsette at lokal sandboxfil finnes.** Når SharePoint/Work brukes videre, må innholdet enten lastes opp fra gjeldende chat før bytte eller regenereres fra denne spesifikasjonen dersom nødvendig.

## 3. Offentlig aidme.no-prototype – status

En 9-siders implementasjonsprototype ble produsert lokalt som referanse for Wix:
- Hjem
- VÍA
- SER
- VIDA
- For deltakere
- For partnere
- Om AidMe
- Kontakt
- Ruter & etapper

Retning:
- original AidMe-logo
- norsk default + engelsk valg
- svært høy andel autentiske AidMe/Camino-bilder; mål >=70 %
- v0.7.3-booklet som visuell/d dramaturgisk fasit
- stor rute-/etappearkitektur
- Camino Portugués + Camino Francés
- grunnleggerhistorien personlig, ærlig og tydelig merket som egenerfaring
- Santiago, credencial/stempler, Compostela og Cruz de Ferro brukt som milepæler/symbolikk, ikke effektbevis

Lokal referansepakke fra denne chatten: `AidMe_VIDA_public_site_prototype_v1_2026-08-16.zip`. Ny chat kan ikke forutsette lokal filtilgang; bruk denne beskrivelsen + SharePoint-kilder og bygg/publiser i Wix.

## 4. my.aidme.no / GitHub – nyeste verifiserte utvikling

`SanderRipman/my-camino` er fortsatt teknisk arbeidsrepo. VIDA-workspace er allerede promotert til `main` i tidligere produksjonsrunde.

Etter checkpointet ble også en UX-runde gjort:
- original AidMe-logo inn i workspace-retningen
- minimalt 1:1-system / dekningsindikator med 0/2, 1/2, 2/2+ planlagte samtaler per deltaker uten lagring av fortrolig samtaleinnhold
- featurearbeid ble utført isolert før promotering

Videre mål er fortsatt:
- `my.aidme.no` som permanent operativ VIDA-arbeidsflate
- pseudonym/kodenavn
- lagring av demoopplysninger per pseudonym
- VÍA/SER/VIDA-skjema
- regelmessige avstemninger
- sammenligningsgrafer for én/flere deltakere, perioder og gruppesnitt

## 5. Wix-produksjonsmål – oppdatert fra Work-verifisering

Bruker ønsker:
- **`https://www.aidme.no/`** = offentlig AidMe VIDA-hovedside
- premium Wix Studio-side, som Work viste knyttet til **`myaimy.no`**, skal vurderes som mål for VIDA-arbeidsflaten og helst flyttes/kobles til **`my.aidme.no`**

Ny Work-chat skal bruke Wix-verktøyene til å identifisere eksakt site-ID/premiumplan/domainbinding før endring. Bevar gammel produksjon som backup når enkelt, men ikke la backup blokkere fremdrift.

## 6. Prioritert startsekvens i ny Work-chat

1. Les kanonisk SharePoint `CAMINO_LIVE_START_HER.md` + styringsfilene.
2. Les GitHub hovedcheckpoint + dette LIVE DELTA-dokumentet.
3. Verifiser Wix, SharePoint, GitHub og Netlify i Work.
4. Flett delta inn i SharePoint-styring og oppdater checkpoint/handover; ikke blind overskriving.
5. Fortsett punkt 7–9 autonomt.
6. Wix: identifiser riktig premiumsite for `aidme.no` og Studio-siten / `myaimy.no`; implementer/publiser ny hovedside og planlegg domeneflytting til `my.aidme.no`.
7. my.aidme.no: fortsett workspace + hosting/deploy via mest robuste kombinasjon av Wix Studio / GitHub / Netlify.
8. Kjør flere QA-runder: innhold, bildebruk, mobil/desktop, NO/EN, partner/deltaker, domener og live-deploy.
9. Når webfasen er ferdig, oppdater kanonisk SharePoint Handover og lag nytt datert checkpoint.

## 7. Ikke mist disse designkravene

- >=70 % ekte bilder fra `Camino/10_Media_og_markedsforing/02_Godkjent_for_bruk/`, særlig `01_Utvalgt_partnerpakker_2026-08-09`.
- `!` i bilde-navn = brukerfavoritt / høy prioritet, men kontekst og estetikk bestemmer endelig bruk.
- original `AIDME_Logo-transparent.png`.
- teal/navy + krem/off-white + varme gulltoner.
- stor plass til grunnleggerhistorie side 2–3-logikken fra Dyp booklet.
- stor rute-/etappearkitektur med bilder, distanser, formål, delmål, credencial, Santiago og diplomer.
- Cruz de Ferro-bildet: `legge fra seg noe → overgang → gå videre lettere`, med måte.
- frihet innen trygge rammer; ikke saueflokk.
- NO default, EN valg.

## 8. Sikkerhet

Wix API-nøkkel som tidligere ble limt inn i chatten skal regnes som eksponert og bør roteres. Ikke kopier den til GitHub/SharePoint/handover.

---

**Denne filen er siste web/digital-delta og skal alltid leses etter hovedcheckpointet fra 16.08.2026.**