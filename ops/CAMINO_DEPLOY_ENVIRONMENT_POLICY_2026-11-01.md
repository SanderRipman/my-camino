# Camino – sikker publiserings- og grenmodell (2026-11-01)

## Beslutning
Behold **fire forskjellige formål**, uten sletting eller blind sammenslåing. Separasjon mellom `main` og `demo-uat` er tilsiktet, men *drift skal være synlig*.

| Miljø | Netlify-prosjekt | Git-gren | Rolle | Tillatt innhold |
|---|---|---|---|---|
| `aidme.no` | `aidme-public-candidate-20260817` | `main` | Offentlig nettsted | Godkjent redaksjonelt innhold |
| `dev.aidme.no` | `dev-aidme-no` | `main` (verifiser konkret deploy) | Offentlig utviklingsspeil | Pre-prod evaluering |
| `my.aidme.no` | `mycamino` | `main` | Operativ portal | Eksisterende personvern-/sikkerhetsport |
| `demo.aidme.no` | `mycamino-demo` | `demo-uat` | Syntetisk UAT | Kun fiktive/syntetiske data |
| `aidme-public-preview` | `aidme-public-preview` | Eget historisk deploy | Historisk referanse | Ikke migrer/slett uten eksplisitt behov |

`netlify-build-router.mjs` velger korrekt publisert kilde etter **Netlify site ID** og er viktigere enn repo-rotens katalogstruktur. Aldri endre ruteren uten egen site-aware QA.

## Kontrollerbar endringsflyt
1. **Hovedkilde**: nye sikkerhets-, rolle-, personvern- og produksjonsendringer eies av `main`, via liten feature/fix-branch, PR og tester.
2. **Demo**: `demo-uat` er bevisst isolert. Demospesifikke funksjoner implementeres med PR mot `demo-uat`, med tydelig **no-write/synthetic-only** grense. De skal ikke blindt kopieres inn i `main`.
3. **Selektiv synk**: når felles kilde eller sikkerhetsregler endres, sammenlign begge grener og flytt godkjente endringer eksplisitt. Oppgi hvilke filer og SHA som flyttes, og test mot begge Netlify-prosjektene.
4. **Ingen direkte destruktiv cleanup**: ikke slett branch, side, deploy, arkiv eller dokumenter; historiske preview-er er revisjonsspor. Bruk merking og oppdatert oversikt i stedet.
5. **Bildekvalitet**: originale godkjente bilder i mediebank beholdes. Foto med ansikt eller milepæl har `object-fit:contain`/trygg posisjon. Verifiser faktiske desktop- og mobilskjermbilder før publisering.
6. **Formular / oppgaver / roller**: aldri aktiver nytt skjema bare ved å legge til formdefinisjon. Krever rolletilgang, RLS, formålsavklaring, samtykke der relevant, versjonering, eier, navigering/oppgaveautomatikk og slutt-test for deltaker og fagperson. Ingen tvungen WHO-5; ingen sensorbasert WHO-5-syntese.
7. **Prod-GO**: PR tester grønt, visuelt QA, reversibel merge og kontroll av faktiske Netlify deploy-commit. Ikke likestill «ready» med test av alle UX-interaksjoner.

## Ukentlig ikke-destruktiv grenrevisjon
`.github/workflows/camino-branch-drift-audit.yml` dokumenterer ulikheter mellom `main` og `demo-uat` og arkiverer rapport som GitHub Actions artifact. Ikke automatisk merge, og ikke ukritisk krav om at alle filer er identiske. Flagges til manuell vurdering dersom endringer i `supabase/` eller sikkerhetskritisk `portal/` på `main` ikke er vurdert for `demo-uat`.

## WHO-5 og smartbånd
- AidMe-graf «Mestringstro / Tilhørighet / Tydelig neste steg» = egne 0–10 indikatorer.
- WHO-5 = fem subjektive spørsmål, referanseperiode 14 dager, transformert 0–100. Egen datakilde, måletype og evaluering; frivillig og aldri GO/NO-GO alene.
- Wearables = originale måletyper og kvalitetsmarkører. Skal ikke forveksles med subjektiv velvære.
- `demo.aidme.no/portal/who5-preview.html` er kun no-write test, **ikke** en vedtatt produksjonsintegrasjon.
- Design for fremtidig sikker lagring krever dokumentert rolle/eier, innsyn, tilbaketrekking, sletting, tilgangslogg, oppbevaring, pseudonym og egen vurdering av databehandler/overføring.

## Videreføring / QA
Oppfølging etter brukeroppdrag 1. november: finn forenklinger og dobbeltregistrering per VÍA/SER/VIDA-steg, bekreft navngitt VIDA-eier, lag en faktisk rollebasert ende-til-ende brukertest, og mål antall nødvendige klikk/valg før formål og oppgave er tydelig. Bruk kanonisk SharePoint ved konflikt, ikke denne notisen.
