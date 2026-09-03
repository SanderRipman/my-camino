# PARALLELL SPRÅKVASK / MIKROTEKST – ARBEIDSPAKKE

## Formål
Forenkle norsk brukerrettet språk i `my.aidme.no` uten å endre metode, sikkerhet, rettigheter eller arbeidsflyt. Språket skal være kort, saklig, menneskelig og lett å forstå. Tonen kan være varm og oppmuntrende, men aldri klinisk, moraliserende eller overforklarende.

AidMe VIDA-kjernen skal ligge fast: VÍA = før, SER = under, VIDA = etter. Ingen språkforenkling skal skjule reelle sikkerhetskrav, ansvar, frivillighet, go/no-go eller navngitt VIDA-eier.

## Kildehierarki før arbeid
1. `@SharePoint CAMINO LIVE` og aktiv `CAMINO_PROJECT_STATE.md` / `CAMINO_HANDOVER_LIVE.md`.
2. Prosjektinstruks.
3. Aktiv fagkjerne for programidentitet, deltakerløp/sikkerhet og fagroller/etiske grenser.
4. Gjeldende GitHub `main` og denne arbeidsgrenen.

Hvis språkforslag kolliderer med metode/fag/sikkerhet, er kilden autoritet og copy skal ikke endres blindt.

## Arbeidsgren og leveranse
- Arbeid KUN på `qa/parallel-language-polish-20260903`.
- Baseline ved oppstart: `main` `09895d2ffe6c50cd9db56c361d1294fbbf46ff45`.
- Ikke merge, ikke production-deploy, ikke rebase uten ny konfliktkontroll.
- Opprett til slutt en DRAFT PR mot `main` og merk den tydelig `READY_TO_REVIEW`.
- Hovedchatten avgjør eventuell integrasjon.

## Språkprinsipper
- Bruk vanlige norske ord når de dekker samme mening.
- Én setning = helst én idé.
- Forklar hva brukeren skal gjøre nå, før teknisk bakgrunn.
- Korte overskrifter og korte hjelpetekster.
- Unngå internsjargong i primærflaten: `scope`, `gate`, `workflow`, `aggregate-only`, `fail-closed`, `direct URL`, `runtime`, `fixture`, `submission` osv.
- Når et teknisk begrep faktisk må beholdes, legg menneskelig forklaring først og teknisk navn sekundært.
- Ikke bruk global search/replace. Vurder hvert ord i kontekst.
- Ikke gjøre teksten barnslig. Mål: profesjonell, rolig, forståelig.
- Ikke formulere AidMe VIDA som behandling, kur eller garantert effekt.
- Bevar `Ingen krav om personlig deling` der relevant.

## Eksempler på ønsket retning
Dette er eksempler, ikke en blind ordliste:
- `scope` → `tilgang`, `ansvarsområde` eller `det du har ansvar for`.
- `gate` → `kontrollpunkt`, `beslutningspunkt` eller konkret handling.
- `workflow` → `arbeidsflyt`, `forløp` eller `neste steg`.
- `aggregate-only` → `kun anonymisert gruppenivå`.
- `fail-closed` → brukerrettet: `tilgangen er sperret når noe er uklart`; behold teknisk term i admin-/utviklerdokumentasjon.
- `participant context` → `deltakeren saken gjelder` / `deltakerkontekst`, avhengig av flate.
- `pilot scope` → `piloten/gruppen du har ansvar for`.

## Fase A – inventar før endring
Lag først en liten oversikt over brukerrettet tekst i portal som er:
1. unødig teknisk,
2. for lang,
3. tvetydig,
4. lite handlingsrettet,
5. inkonsistent mellom sider.

Prioriter P1/P2/P3. Ikke endre kode i de første minuttene før mønsteret er forstått.

## Fase B – tillatte reversible endringer
Du kan selvstendig forbedre lavrisiko presentasjonstekst, blant annet:
- `Slik fungerer det` / guide-tekst,
- statiske hjelpetekster og forklarende mikrocopy,
- tomtilstander (`Ingen ... ennå`) der semantikken er åpenbar,
- oversikts-/introduksjonstekst,
- QA/LAB-forklaringer som ikke endrer sikkerhetskrav,
- ikke-funksjonelle etiketter/sekundærtekster der meningen er identisk.

Hvis NO/EN ligger som et eksplisitt par i samme komponent, kan begge oppdateres kontrollert når betydningen er entydig. Ellers er norsk autoritet; noter EN-delta til review i stedet for å gjette.

## IKKE RØR – hovedchatens aktive/testkritiske flater
Ikke gjør atferdsendringer eller semantiske endringer i:
- Supabase, RLS, capabilities, grants, MFA/AAL2, auth eller audit,
- form-definitioner, obligatoriske felt, validering eller beslutningsverdier,
- `returnContext` / task→gate→return-flyt,
- routing/deep-links,
- MYFB-008 aktive rolle-/scope-testforutsetninger,
- Pilot-GO-/GO/NO-GO-logikk,
- SER/VIDA workflow-semantikk,
- Netlify/DNS/build-konfig,
- QA credential-/rollepakke-livssyklus.

Unngå også å endre aktive `form-runner`-tekster som kan påvirke fysisk rolle-QA. Der kan du heller registrere språkforslag i resultatnotatet for hovedchatten.

## Kvalitetsregel
Ingen snarveier. En tekstendring er bare god hvis den:
- gjør brukerens neste handling tydeligere,
- ikke fjerner viktig sikkerhets-/ansvarsinformasjon,
- ikke introduserer nytt faglig innhold,
- ikke gjør rollen mer eller mindre autorisert enn før,
- ikke endrer betydningen av en status eller beslutning.

## Testing
For kodeendringer:
- kjør relevant Portal smoke,
- kjør Netlify router/site-aware QA hvis berørte filer omfattes,
- kjør eventuelle eksisterende copy/navigation smoke-tester,
- ingen deploy til production.

Hvis baselinefeil finnes fra før, dokumenter dem og ikke omgå dem for å få grønt resultat.

## Stop-regler
Stopp og legg i `NEEDS_MAIN_CHAT` hvis:
- copy påvirker juridisk/sikkerhetsmessig betydning,
- en teknisk term er nødvendig for presisjon og ingen trygg erstatning er åpenbar,
- filen samtidig endres i hovedsporet,
- endringen krever backend/rolle/form/workflow,
- du må velge mellom to faglig forskjellige betydninger.

## Sluttleveranse
Oppdater denne filen med seksjon `PARALLEL RESULT` og oppgi:
- hva som ble endret,
- hva som kun ble foreslått,
- tester/resultat,
- filer berørt,
- eventuelle konflikter mot nyere `main`,
- `READY_TO_REVIEW` og draft PR-nummer,
- `NEEDS_MAIN_CHAT` for punkter som krever beslutning.

Ikke merge eller deploy. Ikke skriv inn nye produktbeslutninger i SharePoint-styringen; hovedchatten integrerer godkjent resultat ved neste checkpoint.
