# Camino – connector-/Work-modus-notat

**Dato/tid:** 2026-08-16 ca. 05:09 CEST

## Observasjon
Bruker bekreftet i en separat ChatGPT-chat i **Work-modus** ca. fem minutter før dette notatet at både **Wix og SharePoint hadde reell lese- og skrivetilgang**. Testen inkluderte faktisk opprette/endre/slette på et upublisert Wix-testnettsted og opprette/endre/lese tilbake/slette testfil og testmappe i SharePoint. Ingen produksjonsinnhold ble endret i testen.

Skjermbildet viste samtidig at Work-modus hadde **SharePoint, GitHub og Wix som vedvarende Sources/add-ons** i sidepanelet.

I den pågående Camino-chatten har de samme connectorene enkelte ganger blitt oppdaget med full funksjonsliste, men deretter stoppet av runtime med `tool has been disabled` før selve API-kallet nådde tjenesten. GitHub har vært stabilt operativt.

## Arbeidshypotese
Dette peker på at problemet sannsynligvis er **ChatGPT-runtime-/modusspesifikt**, ikke manglende Wix-/SharePoint-rettigheter eller feil konto. Work-modus kan være et mer stabilt miljø for langvarige arbeidsøkter der add-ons må være persistente.

## Anbefalt praksis
Ved fremtidig kritisk Camino-arbeid med mange SharePoint/Wix-skriveoperasjoner:
1. Foretrekk Work-modus når tilgjengelig og når connectorene vises som faste Sources.
2. Kjør en liten lesetest før større batch.
3. Ved `tool has been disabled`: ikke anta at konto/rettigheter er feil; verifiser først i Work-modus eller ny runtime.
4. Behold GitHub som redundant kontinuitetslager for web/digital handover når SharePoint-runtime er ustabil.
5. SharePoint `Camino/` er fortsatt kanonisk operativ sannhet; GitHub-handover skal flettes tilbake når SharePoint er tilgjengelig.

Dette notatet er teknisk driftsinformasjon og endrer ikke prosjektmetodikk eller innhold.