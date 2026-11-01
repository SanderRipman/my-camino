# WHO-5 og smartbånd – sikker, enkel videreføringspakke (2026-11-01)

**Status:** plan / ikke implementert som datainnsamling i produksjon. Eksisterende `demo.aidme.no/portal/who5-preview.html` er bevisst «ingen lagring». Ikke bruk ekte deltakerdata der.

## Faglig dataskille (må beholdes i GUI og API)
| Datakilde | Måletype | Periodisering | Kan WHO-5 erstattes? |
| --- | --- | --- | --- |
| AidMe `ser_checkins` | `agency`, `belonging`, `direction`, `mood`, `stress` etc., 0–10 | Dagens innsjekk | Nei |
| WHO-5 | Fem svar 0–5, totalsum 0–25 → `score_100 = raw*4`, tilbakeblikk 14 dager | VÍA-baseline, relevant avslutning SER, VIDA-oppfølging | Selve målingen |
| Wearable | Kildemerket søvn/puls/HRV og evt. leverandør-stressscore | Etter samtykket datautveksling og bekreftet API | Nei |

Ingen sammenslåing av WHO-5 og wearable-score til en egen oppfunnet «mental helse-score». Ingen automatisk diagnose, risiko-etikett eller GO/NO-GO fra én skår.

## Minst mulig arbeid for deltakeren
1. Deltaker får ett **frivillig** oppgavekort når WHO-5 er relevant. Forklar formål og 14 dager, fem trykk, send. Velger vedkommende nei, ingen gjentatte mas-påminnelser.
2. Forhåndsutfyll riktig deltaker-/pilotkontekst etter innlogging; ingen manuelt aliasbytte, dobbeltregistrering eller fagspråk i brukergrensesnittet.
3. Etter lagring: vis «Takk, ferdig» og eventuelt egen historikk. Ikke send sensitive svar per e-post. Fagperson får kun tydelig oppgavestatus og skår når tilgang er eksplisitt hjemlet og rollen krever den.
4. VÍA-eier ser baseline-status; SER-leder ser kun gjennomføringsstatus ved nødvendig oppfølging; navngitt VIDA-eier eier videre kontrollpunkt. Prosjekteier får aggregat kun når gruppestørrelse forsvarer det.
5. Knytt tidslinjepunktene til eksisterende `portal/END_TO_END_ROLE_JOURNEY.md`, `form-runner` og oppgavesystemet. Ikke bygg en parallell sjekkliste.

## Port og rettigheter – blokkerende før reell lagring
- Deltakerens uttrykkelige og frivillige valg, separat fra obligatorisk deltakelse. Juridisk grunnlag etter GDPR art. 6 og art. 9 vurderes og dokumenteres, inkl. maktbalanse.
- Definert dataansvarlig/ansvarlig fagperson, formål, dataminimering, innsyn, lagringstid, sletting, tilbaketrekking og DPIA-vurdering.
- Eksisterende RLS tillater i dag **ikke** at et nytt WHO-5-skjema automatisk blir deltakertilgjengelig. `aidme_private.participant_form_allowed`, `staff_form_allowed_v2`, `ROLE_KEYS`, rollegrenser og eventuelle oppgaveregler skal gjennomgås sammen. Forbud mot å skru av RLS eller gi en bred `manage_program`-rolle sensitiv tilgang.
- Servervalider svarene 0–5, nøyaktig fem felt, gyldig skjemaversjon, deltaker og tidsstempel. Krev autentisert bruker og aktiv rolle/egen deltaker, behold revisjon, nekt lesing på tvers.
- Behold målingens `source`, `measurement_type`, `measured_at`, `synced_at`, `status`, `consent_version` og eventuell `provider` som begreper, uten å opprette nye tabeller før arkitektur review.

## Smartbånd – passiv tilkobling senere
- Pilot: én testdeltaker/én leverandøridentitet, alias/pseudonym separat fra koblingsnøkkel, OAuth per individ, minst mulige API-scopes og datatyper.
- Vis dataenes opprinnelse og oppdateringstid. Ufullstendig synk er **ikke** negativ helsehendelse.
- Ikke bruk delt leverandørkonto for å blande ulike personers rådata. Verifiser dataregion Norge/Spania, DPA, eventuell tredjelandsoverføring og leverandørens eksakte API-felt før integrasjon.
- Enkle API-gateways/Edge Functions kan komme etter godkjenning, men aldri lagre token i nettleseren eller sende rå helsedata til andre roller.

## Testkrav før prod
- Syntetisk opptak og sletting, deltaker samtykker/avslår/trekker tilbake, rolleforvirring, riktig VIDA-eier, 0/100/ufullstendige WHO-5-svar, mobil og desktop, repetisjon, ingen e-post med svar.
- Faglig terminologi og WHO-5 norsk versjon/verktøybruk kontrolleres.
- GitHub PR + Deploy Preview; deretter isolert go/no-go. Ikke automatisk merge med demo-uat eller deploy sensitiv løsning bare fordi demo skåringskalkulator virker.
