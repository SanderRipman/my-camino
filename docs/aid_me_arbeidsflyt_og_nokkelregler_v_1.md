# AidMe – Arbeidsflyt og nøkkelregler (v1)

> Levende dokument. Brukes som felles referanse for hvordan vi organiserer kunnskap, jobbflyt og prosjektledelse i AidMe.

---

## 1) ChatKeys – mandat og når de brukes

- **aidme-core**: All kjernefunksjonalitet for Camino Measures (arkitektur, plattform, datamodell, API, kvalitet, sikkerhet).
- **ops-workflow**: Prosjektledelse, beslutninger, status, koordinering og tverrfaglig samhandling.
- **product-roadmap**: Produktmål, milepæler, prioritering, releases.
- **pilot-studier**: Pilotplan, gjennomføring, observasjoner og funn.
- **forskning-studier**: Metode, studier, referanser, vedlegg.
- **partner-tilskudd**: Partnere, søknader, krav og oppfølging.
- **turplan-camino**: Reiserute, logistikk, datoer, inspirasjon (Beautiful Santiago Trips, detaljerte ruter mv.).
- **ideer-lab**: Fryseboks for ideer/skisser. Modne ideer flyttes senere til roadmap/aidme-core.

> **Regel:** Når innhold grenser mellom to områder,
> – produktfaglig går til **aidme-core** / **product-roadmap**;
> – styring/koordinering går til **ops-workflow**;
> – felt/pilot-innsikt går til **pilot-studier**;
> – reiseplan/inspirasjon går til **turplan-camino**.

---

## 2) Inntak/migrasjon (Kontrollsenter)

1. **[I] Importer** én gammel chat om gangen. Bruk originalt chat-navn som tittel.
2. **ChatKey-felt**:
   - Er du usikker → skriv `inbox` (ikke la feltet stå tomt/legacy-default).
   - Er du 100% sikker → sett endelig nøkkel (f.eks. `turplan-camino`).
3. **[A] AutoSplit** på mappen du nettopp importerte.
4. Gjenta (1–3) til alt er inne.

> **Trygghet:** AutoSplit kan kjøres flere ganger og er deterministisk nok for batcher. Den endrer ikke original-dumpen, kun lager `autosplit-*.md` i riktig mappe.

---

## 3) Om kombinasjonsmapper (`X Y inbox`)

- AutoSplit kan foreslå kombinasjoner dersom innhold *spenner* to domener – eksempel: `ideer-lab turplan-camino inbox`.
- Disse er *mellomstasjoner* (triage). Når du har sett over, promoter du innholdet til **endelig** ChatKey.

**Hovedregel for promotering**
- Finn *endelig eierskap* (domenet som faktisk skal forvalte innholdet).
- Promoter hele mappen til denne nøkkelen (se §6 for kommandoer).
- Gjenkjør snapshots + index (automatisk i skriptet nedenfor).

---

## 4) Kvalitetssjekk (QA)

**Sjekkliste etter migrasjon pr. ChatKey**
- Null tomme `autosplit-*.md`?
- Forventet antall seksjoner (≈ to per fil etter grov-splitt)?
- Første linjer (headings) ser meningsfulle ut?

**Kommandoer**
- `Test-AidMigrationStatus -ChatKeys <liste>` → summerer filer/sekjsoner.
- `Quick-ValidateLastImport -ChatKey <key> -Take 10` → sjekk siste batch.
- `Test-AidAutosplit -ChatKey <key> -Take 5` → få med første linje for manuell spot-sjekk.

---

## 5) Flytte/Promotere innhold til endelig ChatKey

**Eksempel** (kjør i PS7 etter at mapper er inspisert):
```
# Prioritér store mellomstasjoner først
$plan = @(
  @{ From='ideer-lab turplan-camino inbox'; To='turplan-camino' },
  @{ From='turplan-camino ideer-lab inbox'; To='turplan-camino' },
  @{ From='ops-workflow ideer-lab inbox'; To='ops-workflow' },
  @{ From='aidme-core ideer-lab inbox'; To='aidme-core' },
  @{ From='ops-workflow turplan-camino inbox'; To='ops-workflow' },
  @{ From='turplan-camino ops-workflow inbox'; To='turplan-camino' },
  @{ From='product-roadmap ideer-lab inbox'; To='product-roadmap' },
  @{ From='product-roadmap aidme-core inbox'; To='product-roadmap' },
  @{ From='aidme-core ops-workflow inbox'; To='aidme-core' } # REVIEW ved behov
)
$plan | ForEach-Object { Promote-AidInbox -From $_.From -To $_.To }
```

**Tips**
- Kjør i *små batcher* og valider mellom hver.
- Dersom du er i tvil om en mappe: promoter til `inbox` hos det mest sannsynlige domenet (eks. `turplan-camino`) og ta en runde til.

---

## 6) Snapshots, index og opprydding

Når du promoterer med `Promote-AidInbox`, kjøres dette automatisk:
- `New-AidSnapshot -ChatKey <key>`
- `Add-AidIndexEntry -ChatKey <key>`

Anbefalt etter en større økt:
- `Invoke-AidReportCleanup` (rydder artefakter/duplikater)
- Arkiver rå-dumps (`dump-*.md`) til `handover\archive\YYYYMMDD.zip` (valgfritt)

---

## 7) Deling og kunnskapsflyt

- **ops-workflow** er paraply for fremdrift/beslutninger. Speil viktige konklusjoner fra andre nøkler hit.
- **product-roadmap** henter krav/mål fra *aidme-core* og innsikt fra *pilot-/forskning-studier*.
- **ideer-lab** tømmes jevnlig for modne ideer → til *product-roadmap* eller *aidme-core*.

**Praktisk notatmal**
```
#### TL;DR (YYYY-MM-DD)
- Beslutning:
- Neste steg:
- Avhengigheter:
- Lenker: <internt filnavn / referanse>
```

---

## 8) Kontrollsenter – bruksmønster

- **[I] Import** → tittel = original chatnavn; **ChatKey = `inbox`** hvis usikker.
- **[A] AutoSplit** direkte etter hver import.
- **[G] Generer** (kun ved behov) sammendrag/roadmap-uttrekk.

**Forbedringsforslag** (backlog)
- Prefill ChatKey med `inbox` i UI.
- Forslag til ChatKey i import-dialogen (bruker `Invoke-AidSuggestChatKey` på et kort tekstutdrag).

---

## 9) Ukerytme (lettvekts)

- **Mandag**: triage `* inbox` → promotere 1–3 største mapper.
- **Onsdag**: roadmap/aidme-core dypdykk (maks 2 fokus-tema).
- **Fredag**: ops-workflow status + «risiko/avhengigheter»-scan.

---

## 10) Neste handlinger (nå)

1. Kjør status og identifiser topp 3 kombinasjonsmapper (størst først).
2. Promoter disse til endelige nøkler (små batcher; valider mellom hver).
3. Kjør `Invoke-AidReportCleanup`, deretter oppsummering i **ops-workflow** (TL;DR-malen).

---

**Versjon**: v1 • Sist oppdatert: {{today}}

