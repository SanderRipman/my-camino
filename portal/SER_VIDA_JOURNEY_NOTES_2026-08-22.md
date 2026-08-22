# SER day-0 / normaldag → VIDA

Denne pakken er en additiv presentasjons- og navigasjonsforbedring. Den endrer ikke RLS, roller, backend-gater eller realdata-policy.

## SER

- Første SER-dag behandles som en egen menneskelig oppstart: orientering, kontaktvei, gjennomførbar start og kort innsjekk.
- Normaldag bruker samme `ser_daily` som kanonisk deltakerhandling; ingen parallell journal eller alternativ skjemaflyt opprettes.
- Pause, kortere etappe, transport og annen tilpasning beskrives som legitime valg, ikke som nederlag eller automatisk avvik.
- Eksisterende staff-/sikkerhetsgater og hendelsesflyt beholdes uendret.

## VIDA

- VIDA presenteres som én levende plan med neste konkrete handling, ansvar og tidspunkt for oppfølging.
- Eksisterende `vida_plan` er kanonisk inngang. Pakken skal ikke opprette parallelle planer eller nye datalagre.
- Rolle/scope og eksisterende kommandolag er fortsatt autoritet.

## Release-regel

Pakken kan merge/deploy når Portal smoke er grønn. Den er reversibel og introduserer ingen nye backend-writes. Public realdata-intake påvirkes ikke og forblir CLOSED.
