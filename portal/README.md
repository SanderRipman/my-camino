# AidMe VIDA – produksjonsportal

Dette området er den nye produksjonsretningen for `my.aidme.no`.

## Beslutning

Portalen bygges som **Full AidMe-produksjonsportal**, ikke som en videreføring av `localStorage`-demoen som produksjonsløsning.

Den eksisterende `vida/`-demoen beholdes som visuell/faglig referanse og testflate inntil den nye portalen er kontrollert.

## Teknisk grunnmur

- Frontend: Netlify / `my.aidme.no`.
- Kode: GitHub `SanderRipman/my-camino`.
- Backend, Auth og PostgreSQL: eksisterende AidMe Supabase-prosjekt i EU-region.
- Tilgang: server-side/RLS, minst mulig privilegium, scope per organisasjon/pilot/deltaker.
- Sensitivitet: data som kan kobles tilbake til en deltaker behandles som personopplysninger/pseudonymiserte data, ikke som anonyme data.
- Klinisk journalføring er ikke automatisk del av portalen. Dersom det faktisk ytes helsehjelp, må journalplikt og ansvarlig helsevirksomhets systemkrav avklares særskilt.

## Primær brukeropplevelse

Portalen er oppgaveorientert, ikke dokumentorientert.

Deltaker starter på **Din neste handling**.
Ansatte starter på **Trenger handling nå**.

Reisen følger:

`interesse → VÍA → individuell GO/NO-GO → pilot-GO → SER → VIDA → ny VÍA`

Se `ARCHITECTURE.md` og `USER_JOURNEY.md`.

## Sikkerhetsstatus 2026-08-16

Supabase-skjema og første RLS-/rollegrunnlag er opprettet. Security Advisor er kjørt etter hardening. Gjenværende INFO-funn er bevisst låste server-only-tabeller uten klientpolicy. Ingen WARN/ERROR fra første hardeningrunde skal aksepteres før videre produksjonskobling.

Offentlig interesseinnsending er fortsatt **ikke åpnet direkte mot databasen**. Den skal gå gjennom kontrollert backend/Edge-funksjon med rate-limit/CAPTCHA eller server-til-server-kobling fra aidme.no.
