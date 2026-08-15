# AidMe VIDA digital arbeidsflate – demo v1

Formål: demonstrere en enkel, intuitiv før–under–etter-arbeidsflate for VÍA → SER → VIDA uten å introdusere produksjonsklar behandling av sensitive data.

## Innhold
- Norsk som standard, engelsk som valg.
- Pseudonym/kodenavn som synlig deltakeridentitet.
- Realistiske, fiktive demodata for seks deltakere.
- Lokal lagring i nettleser (`localStorage`) per enhet/nettleser.
- Ny deltaker og nye innsjekker lagres videre i samme datasett.
- Eksport/import av JSON for demo og test.
- Regelmessig avstemning: stemning, stress, energi, søvnkvalitet, tilhørighet, egenkraft og retning (0–10).
- Operativ grønn/gul/rød dagsstatus. Dette er ikke diagnose.
- Analyse per 14/30/60/90 dager eller hele perioden.
- Én eller flere deltakere kan sammenlignes samtidig, med valgfritt gruppesnitt.
- Formbibliotek følger den konsoliderte operative reisen: VÍA → samlet GO → SER → VIDA.

## Avgrensning
Demoen skal ikke brukes for reelle helseopplysninger, samtykker eller annen sensitiv personinformasjon. Produksjon krever separat beslutning om autentisering, roller/tilgang, backend, kryptering, logging, sletting, databehandlerforhold og lagringssted.

## Videre plan
1. Kvalitetssikre informasjonsarkitektur og målinger i demo.
2. Digitalisere de resterende operative skjemaene som virkelige arbeidsflater, men gjenbruke deltaker-ID og eksisterende data fremfor dobbelføring.
3. Koble sikker backend når datamodellen er stabil.
4. Flytte løsningen til produksjon først etter kontrollert gjennomgang.
