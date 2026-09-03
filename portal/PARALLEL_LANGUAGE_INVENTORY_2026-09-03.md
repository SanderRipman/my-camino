# Parallelt språkinventar – 2026-09-03

Branch: `qa/parallel-language-polish-20260903`

Dette inventaret er laget etter gjennomgang av CAMINO LIVE, programidentitet/kjernefortelling, deltakerløp/sikkerhet, fagroller/etiske grenser, aktiv malpakke og portalens aktive brukerreise-/rolleflyt. Målet er klarspråk uten å endre fag, sikkerhet, tilgang eller arbeidsflyt.

## Språkramme fra fagkildene
- VÍA = før, SER = under, VIDA = etter; trygghet følger alle tre steg.
- Frivillighet, verdighet, reelle valg, minst mulig data og tydelig ansvar skal være synlig.
- Pause, tilpasning, transport og avbrudd er legitime sikkerhetstiltak.
- AidMe VIDA er ikke behandling, kur eller effektgaranti.
- Formelle beslutninger og ansvar må fortsatt være presise: GO / GO med vilkår / UTSETT / NO-GO, Pilot-GO, navngitt VIDA-eier og relevante sikkerhetskrav.

## P1 – høy nytte, lav risiko
| Flate | Nåværende mønster | Klarspråkretning |
|---|---|---|
| `index.html` beta-banner | `UI`, `produksjonsgater` | si `portalen` og `personvern- og produksjonskontroller` |
| `index.html` oppgaver | `kontekst` | forklar konkret: hva oppgaven gjelder, ansvar, eventuell rute og neste handling |
| `index.html` skjema-intro | intern arkitektur: `digitalisert malpakke`, `rolle- og sikkerhetsmodell` | si at opplysninger registreres ett sted og bare vises til riktig rolle |
| `index.html` dokumenter | `Metadata er klargjort`, `lagrings-QA` | si direkte at opplasting åpnes når lagring/sletting/eksport/tilgangslogging er ferdig testet |
| `admin.html` | `Ingen skjult adminmakt i nettleseren` | menneskelig overskrift: rettigheter kontrolleres på serveren |
| `admin.html` | bare `AAL2` i primærtekst | menneskelig først: `bekreftet tofaktor (AAL2)` |
| `owners.html` | `scope`, `gate`, `oppgavemotor` | `tilgang`, `må være på plass`, `oppgaver/overganger` |
| `pilot-ops.html` | `Gate / styring`, `SER-/pilottilgang` | `Før oppstart`, `tilgang til denne SER-gruppen` |
| `welcome.html` | systemorientert forklaring av rolle/skjema | forklar hva brukeren ser etter at grunnprofilen er lagret |

## P2 – nyttig, men QA/admin skal beholde teknisk bevis sekundært
| Flate | Nåværende mønster | Klarspråkretning |
|---|---|---|
| `qa-role-pack.html` | `Rolle- og scope-QA` | `Rolle- og tilgangstest (QA)` |
| `qa-role-pack.html` | `ekte RLS og AAL2` | menneskelig først: samme tilgangsregler (RLS) og tofaktor (AAL2) |
| `qa-role-pack.html` | `staff-grants`, `rolle-grants` | `tilganger for medarbeiderrollene` / `rolletilganger` |
| `qa-role-pack.html` testrekkefølge | `N1→N2-handoff`, `in-scope/out-of-scope`, `gate` | beskriv faktisk overgang og tillatt/ikke tillatt tilgang; behold sikkerhetskravet |
| `intake.html` QA-banner | `backend` | `lagres ikke i systemet` dersom eksisterende QA-smoke oppdateres samtidig |
| `crm.html` | `Neste utviklingsgate`, `QA-grønn`, `read-only`, `task-permissions` | utviklerstatus kan forklares med vanlige ord, men CRM er lavere prioritet enn deltaker-/staff-reisen |

## P3 – forslag, ikke autonom endring i dette sporet
- Dynamisk copy inne i `app-context.js`, `app-return-context.js`, `app-go-decision.js`, `app-ser-vida*.js` og andre rolle-/gate-/handofflag. Teksten kan være teknisk, men filene ligger tett på aktiv sikkerhets-/arbeidsflyt.
- Aktive `form-runner`-tekster og formdefinisjoner. De er testkritiske under fysisk MYFB-008.
- Formelle beslutningsnavn eller statusverdier (`GO`, `GO med vilkår`, `UTSETT`, `NO-GO`, Pilot-GO, AAL1/AAL2 når testnivå må identifiseres).
- `returnContext`/routing/deep-links og refresh-bevaring.

## Implementeringsregel
Endre først statisk presentasjonstekst i HTML. Ikke rør ID-er, href-er, data-attributter, rolle-/scope-logikk, skjema-/beslutningsverdier eller backendkall. Dersom en eksisterende smoke tester nøyaktig gammel presentasjonstekst, oppdater testen bare når teksten er rent presentasjonell og betydningen er uendret.
