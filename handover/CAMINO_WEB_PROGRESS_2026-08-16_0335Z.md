# CAMINO web/digital progress – 16.08.2026

Dette notatet supplerer `CAMINO_CHECKPOINT_2026-08-16_WEB_DIGITAL_CONTINUITY.md` og Work-mode connectornotatet.

## 1. VIDA workspace UX v2 – promotert til main

PR #21 `VIDA UX v2: original AidMe-logo + 1:1-dekning` ble kvalitetssikret som en isolert diff og hadde grønn `netlify/mycamino/deploy-preview` før merge.

Squash-merge til `main`:
`48512164a961aedb6f9e1042367b34f229a8e3ee`

Innhold:
- original AidMe-logo som weboptimalisert asset i VIDA-hovedflaten
- original logo også på root-redirect
- ny `vida/one-to-one.html`
- 1:1-oversikten er lenket fra `Skjema & rutiner`
- viser 0/2, 1/2 og 2/2+ per pseudonymisert deltaker
- registrerer kun dato, ansatt, type samtale og om praktisk oppfølging trengs
- samtaleinnhold, helseopplysninger og fortrolige detaljer skal ikke registreres der
- innebygde `demo-*`-profiler får realistisk fiktiv 1:1-historikk slik at partnerdemoen umiddelbart viser ulik dekningsgrad; manuelt opprettede deltakere påvirkes ikke

Etter merge viser GitHub fortsatt:
- `netlify/mycamino/deploy-preview` = success
- `netlify/dev-aidme-no/deploy-preview` = failure

Dette betyr fortsatt at `my.aidme.no`/produksjonsdomene må verifiseres separat. Ikke anta live-domene kun fra main-merge.

Kosmetisk rest: `vida/forms.html` har fortsatt den eldre lille «A»-markøren i egen header. Dette er lav risiko/lav prioritet og bør byttes til original logo ved neste trygg tekstpatch eller når løsningen flyttes inn i Wix Studio.

## 2. Offentlig AidMe VIDA-side – statisk implementasjonsprototype ferdig lokalt

Fordi Wix-runtime i denne chatten fortsatt returnerer `tool has been disabled`, ble offentlig side videreført som en lokal, statisk implementasjonsfasit. Den skal brukes som referanse/innholdskilde for Wix – ikke som konkurrerende produksjonsplattform.

Lokal pakke:
`AidMe_VIDA_public_site_prototype_v1_2026-08-16.zip`

### Struktur – 9 sider
- `index.html` – Hjem
- `via.html` – VÍA
- `ser.html` – SER
- `vida.html` – VIDA
- `deltakere.html` – For deltakere
- `partnere.html` – For partnere
- `om.html` – Om AidMe / grunnleggerhistorie
- `kontakt.html` – Kontakt
- `ruter.html` – stor etappe-/ruteunderside koblet fra Hjem/SER

Felles:
- `site.css`
- `site.js`
- original AidMe-logo
- NO default / EN toggle via samme struktur

### Media
Prototypen bruker kun autentiske prosjektbilder i de store fotoflatene, blant annet:
- Santiago 5! – fellesskap/slit
- Santiago 8! – tidlig morgen/nærvær
- Santiago 23! – legitim alenetid
- Santiago 6! – dagbok/refleksjon
- Santiago 17! – sosial kontakt/måltid
- Santiago 30! – Portugal→Spania / overgang
- Santiago 33! – forventning før målgang
- Santiago 22! – teamwork/målgang
- Santiago 24! – 0 km
- Compostela 3! – credencial/stempler
- Compostela! – diplom/milepæl
- Cruz de Ferro-bildet – valgfri symbolhandling/overgang

Alle er weboptimaliserte WebP-derivater av godkjente/originale filer. Prototypen ligger dermed klart over kravet om minst 70 % ekte bilder.

### Innhold
Tekst og etappearkitektur er kontrollert mot `AidMe_VIDA_NO_Dyp_BOOKLET_A4_FAGLIG_v0_7_3.pdf`, ikke skrevet ut fra gammel webtekst.

Hjem følger dramaturgien:
hero → VÍA/SER/VIDA → hvorfor AidMe finnes / grunnleggerhistorie → alenetid/fellesskap/refleksjon → Portugués etappearkitektur → credencial/0 km/Santiago → partner-CTA.

`ruter.html` inneholder alle 0–17 trinnene fra aktiv Portugués-arkitektur, inkludert distanser, metodisk formål og VIDA-broene. Den har også eget Francés-spor med Pyreneene, Alto del Perdón, Meseta, León, Cruz de Ferro og Santiago.

Grunnleggerhistorien beholder den kontrollerte formuleringen fra Dyp-heftet: personlig vendepunkt og personlig erfaring, ikke generell behandlingspåstand.

### QA
- HTML-link/asset/alt-tekst-sjekk: 9 sider, 13 assets, ingen manglende lokale lenker/assets
- desktop Hjem og Ruter rendret visuelt med screen-CSS via WeasyPrint; ingen åpenbare layoutbrudd
- rutesiden vurdert som særlig vellykket visuelt: stor men oversiktlig etappearkitektur, booklet-lignende uttrykk
- Chromium i denne runtime-en blokkeres av administratorpolicy både for localhost og `file://`; derfor er endelig ekte browser/mobil-QA fortsatt et eksplisitt gjenstående punkt
- WeasyPrint mobilrender er ikke autoritativ fordi renderer ikke anvender viewport media queries som en normal nettleser. CSS har breakpoints ved 1050/650 px, men må bekreftes i Work/browser.

## 3. Neste handling i Work/Wix

Når Wix-connector fungerer i Work-modus:
1. Kjør `WixREADME` først.
2. Identifiser premium-siten som faktisk eier `aidme.no` og Wix Studio `my-site-1`.
3. Bruk den lokale statiske prototypen som struktur-/tekst-/designfasit; ikke generer en ny generell AI-side fra scratch.
4. Last opp/gjenbruk original logo og de autentiske bildene.
5. Implementer Hjem + Ruter først og sammenlign mot prototype/Dyp booklet.
6. Deretter VÍA, SER, VIDA, deltakere, partnere, Om og Kontakt.
7. Norsk default, kontrollert English toggle/versjon.
8. Ekte browser-QA desktop + mobil før domenebytte.
9. Publiser på premium `aidme.no` når QA er grønn.
10. For `my-site-1`: vurder raskeste robuste kobling til `my.aidme.no`; behold GitHub/Netlify VIDA-koden som funksjonell kilde/backup hvis det er enklere enn å omskrive logikken.

## 4. SharePoint

Kanonisk SharePoint-checkpoint og opplasting av reserveoppgaver 1–4 er fortsatt pending kun fordi connectoren i denne chat-runtime-en er deaktivert. Work-modus har nylig demonstrert faktisk lese-/skrivetilgang, så dette skal behandles som runtime-problem – ikke rettighetsproblem.
