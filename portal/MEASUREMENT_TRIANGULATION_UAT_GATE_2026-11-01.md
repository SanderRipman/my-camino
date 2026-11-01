# AidMe VIDA – tre perspektiver, rolle-/skjemaflyt og API-gater
**Dato:** 2026-11-01 · **Arbeidsstatus:** UAT-kandidat, synthetic-only. Ikke faglig/juridisk godkjent for reelle deltakere.  
**Autoritet:** SharePoint `CAMINO_PROJECT_STATE.md` > `CAMINO_HANDOVER_LIVE.md` > Beslutningslogg > `Maalings_og_evalueringsramme_VIA_SER_VIDA_v0_3_UTKAST.docx` > denne avledede tekniske arbeidsbeskrivelsen.

## Avklart nå
- Bevar én deltakerreise `VÍA → SER → VIDA → ny VÍA`. Ikke lag et parallelt WHO-5-deltakerregister eller en ny operativ staff-form.
- `ser_checkins`: daglig egenrapport 0–10, ikke diagnoser og ikke WHO-5. Staff `ser_daily`: observasjon og sikkerhet, ikke tilskriv personen følelser. `vida_plan`: én levende plan med 72t og 14/30/90 dager.
- WHO-5: fem spørsmål, *de siste 14 dagene*, deltakeren selv. Råsum 0–25; rapportert 0–100 = råsum ×4. Bruk korrekt norsk offisiell instrumenttekst og lisens, ikke lag en sensorbasert WHO-5.
- Wearable: faktiske enheter med `provider`, `metric`, `measured_at`, `synced_at`, `source_quality`, `wear_time`, `consent_version`, eventuell `device_model`; ikke lagringsbeslutning fra et datafelt alene.
- Null er ikke nullskår. Målerapporter må inkludere eventuelle negative/uteblitte effekter, frafall, tilpasninger, faktisk VIDA-oppfølging og kostnad.

## Foreslått pragmatisk hendelsesflyt (ikke implementert for persondata)
| Når | Kilde | Handling | Arbeids-/dataeier | Minste tillatte deling |
|--|--|--|--|--|
| VÍA før SER | Deltaker, frivillig WHO-5; opplevd retning i via_roadmap | Ett tidspunkt/oppgave, fem svar når samtykke og metode er avklart | VÍA-eier tilrettelegger, deltakeren svarer | Deltaker selv; fagperson bare etter individuelt mandat |
| VÍA go/no-go | Fagperson / VÍA-eier | Faglig vurdering, ikke samlet risikoskår fra bånd | `individual_go_no_go` / VÍA-eier | Tildelt beslutningsmandat; RLS og AAL2 |
| SER daglig | Deltaker, egen 0–10 innsjekk | Én kort mobilinnsjekk, pause/transport legitimt | `ser_checkins` | Egen innsjekk + oppfølgingsbehov |
| SER daglig | Operativ leder | Sikkerhet grønn/gul/rød, observerbar deltakelse og tilpasning | `ser_daily`, SER-leder | Operativ minimumsinformasjon, ingen generell klinisk/via-tilgang |
| SER daglig | Smartbånd (valgfritt) | Bakgrunnssynk av godkjent søvn/puls/HRV, kvalitet og tidspunkt | Deltakerautorisasjon, teknisk databehandler | Kun nødvendig målesammendrag; ikke opprett oppgaver basert på enkeltalgoritmer |
| SER → VIDA | Deltaker + VIDA-eier | Overlever første handling og kontakt | `vida_plan`, navngitt VIDA-eier | Avtalt overføringssammendrag; ikke rå-helsehistorikk |
| 72t / 14d / 30d / 90d | Deltaker / VIDA-eier | Avtalte oppgaver og valgfrie målinger, ingen fire parallelle skjema | `vida_plan` | Eget scope/avtalt partnerdel |
| Pilotslutt | Evaluator | Aggregerte utviklingskurver + gjennomføring, negative funn og kostnad | `pilot_evaluation` | Aggregering; for n=8 må småtall/hendelser skjermes |

## Tilgangsmatrise – **forslag, ikke gjeldende RLS**
- **Deltaker:** eget WHO-5, egen innsjekk og eget planlagt wearable-sammendrag dersom frivillig. Kan avslå/trekke tilbake separat uten å miste SER/VIDA-rettigheter. 
- **VÍA-eier/fagperson:** tildele/frigi oppgave; lesing bare med aktivt scope og tydelig formål. Klinisk/journalpliktig materiale utenfor Camino hvis helsehjelp faktisk ytes.
- **SER-leder:** egne operative loggdata, dagens sikkerhets-/handlingstatus; ikke automatisk rå WHO-5 eller høyoppløselige helsemålinger.
- **VIDA-eier:** avtalt plan/overgang og oppgaver, ikke tilgang til hele tidligere målehistorikk som standard.
- **Prosjekteier/evaluator:** aggregert rapport med n, mangler, periode, hvilke kilder som inngår. Åtte personer gir ikke automatisk anonymitet.
- **Teknisk admin:** auth/roller/audit og systemstatus – ikke automatisk fag-/rådata-innsyn.

## Faktisk read-only databaseinventar, 2026-11-01 (verified, no writes)
- Supabase-prosjekt `ibloovohuhrceivrvhvn`: tabellene `ser_checkins`, `form_definitions`, `form_versions`, `form_submissions`, `consent_events`, `consent_versions` har RLS på. `form_submissions`, `ser_checkins` og `consent_events` har restriktiv AAL2-policy for sensitive operasjoner. Rollebeslutninger er mer enn bare UI.
- Aktivt `form_definitions`-inventar har ikke `who5` eller WHO-5-variant; WHO-5 demokalkulator er **ikke** en aktiv, versjonert produksjonsform.
- `ser_daily` har metadata `scope=participant_staff`, mens eksisterende prosjektinstruks og `form-runner.js` behandler dette som **staff-only**. RLS er primær sikkerhet, men målrettet negativ deltaker/API-rolle-UAT er fortsatt obligatorisk; ikke åpne WHO-5 ved å klone `ser_daily`-metadata.
- Eksisterende `consent_events` og `consent_versions` beviser ikke at frivillig wearable/WHO-5-data har komplett formål/versjon/tilbakekalling. Ny godkjenning krever faktisk consent-purpose og kontrollert arbeidsflyt.
- Undersøkelsen leste kun schema, policies og formdefinisjonsnøkler (ikke person- eller målerader). Ingen DDL, migrasjon, nøkkel, RLS eller API-endring.

## Sikkerhet / personvern: konkret GO-blokkering
1. Definér behandlingsansvarlig, formål per datakilde og art. 6 + art. 9 hjemmel. Deltakerens informerte og eksplisitte helsevalgbaserte samtykke må være reelt fritt og kunne trekkes; tvungen programdeltakelse/utbytte må ikke styre.
2. Personvernkonsekvensvurdering **før** behandling: sensordata + selvrapport + observatørdata kombinert er monitorering/profilering av sårbare personer. Dokumentér GDPR art. 35-vurdering, dataminimering, tilbaketrekking, oppbevaringsfrister og avvik, inkludert Norge/Spania.
3. Krev AAL2, eksisterende `role_grants`, form-definisjoner og RLS/explicit GRANT. Lag positiv + negativ rettighetstest per rolle, inkludert direkte URL, API, scope- og org-krysstilgang. Ingen ny `service_role` i frontend.
4. Ingen automatisk diagnose/score for `GO/NO-GO`, ingen uverifisert risikoflagging fra bånd, ingen oppgaveløsning på bakgrunn av ubekreftede API-felt.
5. PDF rapport skal ikke automatisk sendes e-post. Autorisert eksport må være rolle-/individavgrenset, loggført, merket, forhindret på tvers; pilotrapport aggregeres med smågruppekontroll.

## Ekstern API-evidens og faktisk tilkoblingsstatus (per 2026-11-01)
| Leverandør | Verifisert teknisk | Kritisk uavklart for AidMe |
|--|--|--|
| **Huawei Health Industry SDK** | Offisielt SDK kan spørre wearable om `emotionStatus`, `valenceCharacter`, `arousalCharacter`. Lokal HarmonyOS/industriprodukt med time window 1m–24h og opptil 7d tilbake; eksakt produkt/land-/appgodkjenning kreves. | **Ikke** bevis på automatisk server-API i Norge/Spania, Band-modell eller nettleser-only integrasjon. Søk Huawei Health Industry om landskode, produktmodeller, SDK-tilgang, app-bridge, kommersiell lovlighet og samtykkedata, ikke anta `emotion.read` i browser. |
| **Huawei Health Kit** | Huawei beskriver autorisert read/write for fitness/health i app-/web-økosystem. | Datatype, emotional wellbeing, godkjenning og faktisk EU-/Spania-tilgang må bekreftes per bruker og produkt. |
| **Garmin Health API** | Dokumentert REST JSON: søvn, puls og stress; device sync via Connect; developer evaluation etter godkjenning. Starter Business kan begrense datakapasitet, historikk og push-only. | Kontrakt/kommersiell pris, eksakt CIRQA-datadekning, to land, scope og retten til pilot-/forskningsevaluering; ikke anta fritt enterprise API. |
| **Polar AccessLink v4** | Registrer API-klient, OAuth2 per individ, scopes `sleep:read`, `nightly_recharge:read`, `continuous_samples:read`/andre avhengig av behov; dokumenterte søvn, HRV/overnight HR og rytmeendringer. | Verifiser Polar Loop-enheten faktisk gir disse verdiene, tilgangsperiode, vilkår, databehandlerplassering og test på norsk og spansk brukeridentitet. |
| **WHOOP / Amazfit** | Ingen godkjent AidMe integrasjon dokumentert; markedsførte stress-/emotion-funksjoner er **ikke** automatisk eksportbare. | Dedikert verifisering av API-felter og eventuelle abonnement før pilotbeslutning. |

Offisielle referanser:
- https://developer.huawei.com/consumer/en/doc/huaweihealth-Guides/query-emotion-data-0000002557579167
- https://developer.huawei.com/consumer/en/doc/huaweihealth-Guides/apply-for-health-industry-sdk-service-0000002594109482
- https://developer.garmin.com/gc-developer-program/health-api/
- https://developer.garmin.com/gc-developer-program/overview/
- https://www.polar.com/polar-api-v4/
- https://www.who.int/publications/m/item/WHO-UCN-MSD-MHE-2024.01
- https://www.edpb.europa.eu/system/files/2026-04/edpb-summary-consent_en.pdf
- https://www.helsedirektoratet.no/normen/personvern-og-informasjonssikkerhet-i-forsknings-og-kvalitetsprosjekter/personvernkonsekvensvurdering-dpia

## Praktisk testport for 1 enhet
- Én leverandør, én testtelefon, en separat voksen testidentitet, NO-registrert og ES-registrert konto ved behov. Dokumenter avtale og rettigheter.
- Verifiser ekte felt, units, interval, time zones, null/garbage/off-wrist, batteri, eksport og frakobling/tilbaketrekking.
- Mock-data adapter → senere OAuth test → API gateway → normalisert kilde/quality → tilgangsstyrt datavisning. Hold reelle helseopplysninger ute av demo.
- Ingen 8-enheters innkjøp før skriftlig API+GDPR/dataoverføring+land+modell-GO.

## Demorevisjon / ikke ferdigstilt
- `portal/index.html` i `demo-uat` kan utvide en isolert, syntetisk sammenligning *i Analyse-flaten*, med uavhengige enheter, metodevarsler og direkte åpning av PDF-visning.
- `portal/measurement-comparison-preview.html` gir relative endringer som **visualisering** 100 = kildeegen start, aldri «felles WHO-5» eller effektvalidering.
- Role lens er forklart som simulering, **ikke** auth-grant. Roller og samtykke testes senere faktisk per eksisterende `qa-role-pack.html`.
- Ingen endringer i `main`, produksjonsdatabase, RLS, Supabase, form-runner, JWT eller persondata. Disse er egne GO-gater.

## Hensiktsmessig neste prioritet
1. Syntetisk role-by-role UAT i den eksisterende oppgave- og formflyten; WHO-5 som frivillig fem-spørsmålskort i korrekt fase, ikke eget parallellsystem.
2. Juridisk, faglig metode og mottakerpolicy; formversjon/autorisasjon og datafelt design. 
3. Provider 1-enhets POC: Polar (lettest dokumentert OAuth), Garmin (stress), Huawei (emotion hvis modell/land/SDK-godkjenning faktisk gis).
4. Rapportdistribution og aggregat-skjerming; sett målepunktene i kontekst av sikkerhet og faktisk VIDA-aktivering.
