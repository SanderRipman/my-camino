Hvis innholdet er produktfunksjoner, rutes til aidme-core.

Skip to content
===

# You said:

# Jeg ønsker å bruke denne chatten til å utforske og utvikle funksjonalitet, tekniske løsninger og produktinformasjon for et digitalt oppfølgingssystem til Camino-prosjektet (Pilotprosjekt for mestring). All kontekst, målsetning og verdigrunnlag finner du primært i chatten Pilotprosjekt for mestring, men dette er ikke begrensende – du må gjerne hente inn ytterligere innsikt der det er relevant. Vennligst lagre dette som grunnforståelse.

# 

# 🔍 Oppdrag og ønsket leveranse:

# Jeg ønsker å teste ut Spond som mulig system, men du skal også gi en helhetlig vurdering av Spond og andre relevante systemer du finner – med tanke på følgende krav og funksjoner:

# 

# ✅ Kravspesifikasjoner for systemet:

# Struktur:

# 

# Prosjektet skal kunne opprettes som en serie “events” – én for hver dag på turen.

# 

# Hver event bør kunne inneholde:

# 

# Informasjon til deltaker

# 

# Tildelte oppgaver eller undersøkelser fra en administrator

# 

# Dagbokfunksjon:

# 

# Bruker skal kunne skrive dagbok, helst koblet til hver event/dag

# 

# Må kunne være:

# 

# Privat for bruker

# 

# Synlig for admin

# 

# Delt med et brukerdefinert utvalg

# 

# Admin bør kunne definere standard-innstillinger for synlighet for å beskytte sensitiv informasjon

# 

# Admin-oppfølging:

# 

# Admin må ha oversikt over deltakernes svar, innsendinger og progresjon

# 

# Bør støtte visuell oppfølging og varsling

# 

# Personvern og GDPR:

# 

# Systemet må støtte eller ha potensial til å tilfredsstille personvernsnivå som kreves i norsk helsevesen

# 

# Papir + digital dagbok:

# 

# Brukere som skriver dagbok for hånd skal kunne bruke enkel skanning (gjerne via app eller 3. part) for å legge det inn i systemet

# 

# Motivasjon:

# 

# Motiverende funksjoner som poengsystem, milepæler eller belønning for gjennomføring er ønskelig

# 

# Tilgangsnivåer:

# 

# Minst 3 typer:

# 

# Vanlig deltaker/bruker

# 

# Admin med begrenset tilgang

# 

# Admin med full tilgang

# 

# Eksport og integrasjon:

# 

# Eksportmuligheter for data

# 

# Sekundært: API eller webintegrasjon (mot f.eks. NAV eller andre systemer på sikt)

# 

# 🧠 Hva du skal gjøre:

# Vurder Spond opp mot alle kravene

# 

# Foreslå alternative systemer dersom Spond ikke oppfyller kravene optimalt

# 

# Kom med kreative og proaktive forslag til hvordan Camino-prosjektet kan struktureres best mulig – både i Spond og i eventuelle bedre egnete systemer

# ChatGPT said:

# Takk, dette er en tydelig og omfattende spesifikasjon. For å kunne gi en presis vurdering av Spond og andre mulige systemer, kan du også svare på følgende:

# 

# Skal systemet støtte både app og nettversjon, eller holder det med én av delene?

# 

# Har dere allerede noen krav til kostnadsnivå (f.eks. gratis, lavkost, lisensbasert)?

# 

# Er det viktig at systemet er norskutviklet eller tilgjengelig på norsk?

# 

# Er det ønskelig med integrasjon mot helsenorge.no, NAV, Altinn eller lignende i fremtiden?

# 

# Hvor mange brukere (anslagsvis) er det per prosjekt – og hvor mange samtidige prosjekter kan være aktive?

# 

# Disse detaljene vil hjelpe meg med å gi en mer treffsikker analyse.

# 

# You said:

# 1\. Beggge er en fordel, men ikke krav

# 2\. Nei, men gratis trial/prøve versjon er en fordel

# 3\. Ja, tilgjengelig på Norsk er en stor fordel

# 4\. I fremtiden kan det være aktuelt. Men ikke utelukk gode systemer som ikke fyller dette kravet, men du kan nevne det

# 5\. Som nevnt, bruk chatten "Pilotprosjekt for mestring" som kontekst og grunnforståelse. Lagre dette. Det vil være opp til 5 brukere og 2-3 admin per prosjekt. Fordel om du kan tilgangstyre admin til full eller kun til dedikerte projekter. Vil maksimalt gå 2 prosjekter som overlapper samtidig.  

# ChatGPT said:

# Takk! Jeg setter i gang en grundig vurdering av Spond som digitalt oppfølgingssystem for Camino-prosjektet, og sammenligner det med andre relevante alternativer.

# 

# Jeg vil kartlegge hvordan Spond møter kravene dere har, spesielt knyttet til event-struktur, dagbok, personvern, oppfølging, motivasjon og tilgangsstyring. Jeg vil også foreslå alternative systemer dersom Spond ikke dekker behovene optimalt – med forslag til hvordan Camino-prosjektet best kan struktureres i hvert system.

# 

# Jeg gir beskjed så snart vurderingen er klar.

# 

# Research completed in 10m · 23 sources · 98 searches

# Vurdering av Spond og alternativer for Camino-prosjektet

# 

# Vurdering av Spond for Camino-prosjektet

# Introduksjon

# Camino-prosjektet (Pilotprosjekt for mestring) planlegger en strukturert oppfølging av deltakere gjennom en “reise” med daglige aktiviteter, refleksjoner og oppgaver. Prosjektet trenger et digitalt oppfølgingssystem som kan støtte daglige eventer (hendelser), deltakeres dagbokskriving, administrativ oppfølging, motivasjonstiltak og strenge krav til personvern. Denne rapporten vurderer Spond, en populær app for gruppeorganisering, opp mot kravspesifikasjonene, og sammenligner den med mulige alternativer (Notion, Asana, MinMemoria, Lifekeys samt et par helserettede verktøy). Formålet er å identifisere hvilken løsning som best oppfyller behovene og foreslå hvordan Camino-prosjektet kan struktureres i det valgte systemet.

# Kravspesifikasjon (oppsummert)

# Struktur og hendelser: Systemet må la oss opprette en serie hendelser (f.eks. én per dag på en tur). Hver hendelse skal inneholde informasjon til deltakerne samt tildelte oppgaver eller “undersøkelser” (f.eks. spørsmål eller skjema) fra administrator. Dagbokfunksjon: Deltakerne skal kunne føre dagbok (helst knyttet til riktig dag/hendelse). Dagbokinnlegg må kunne markeres som private for brukeren selv, synlige for administrator eller delte med et brukerdefinert utvalg av andre deltakere. Administrator bør kunne definere standard synlighet (f.eks. at dagbøker som standard kun deles med admin med mindre brukeren ønsker annet). Administrativ oppfølging: Administratorer må kunne følge opp deltakernes svar, innsendinger og progresjon. Dette inkluderer å se hvem som har levert eller svart, og få oversikt via visuelle verktøy (diagrammer, lister e.l.) og motta varsler på manglende svar eller nye innsendinger. Personvern/GDPR: Løsningen må som et minimum være GDPR-compliant. Ideelt sett bør den støtte (eller kunne tilrettelegges for) det strenge personvern-nivået som kreves i norsk helsesektor, da sensitiv informasjon om mestring og helse kan inngå. Papir + digital dagbok: Noen deltakere vil kanskje skrive for hånd i en fysisk dagbok. Det er ønskelig med en enkel måte å digitalisere dette på – for eksempel via mobilapp (skanne eller ta bilde) – slik at man kan samle også håndskrevne notater i systemet. Motivasjon: Systemet bør helst ha motiverende elementer – som poeng, milepæler, “badges” eller belønninger – for å oppmuntre deltakerne til å gjennomføre oppgaver og skrive dagbok. Tilgangsnivåer: Det trengs minst tre nivåer av tilgang: Deltaker (kun egne data), Begrenset admin (kan følge opp deltakere men kanskje ikke endre alt) og Full admin (prosjektleder med alle rettigheter). Det må også være mulig å avgrense en administrators tilgang til kun sitt prosjekt (dvs. én admin skal ikke automatisk se alle prosjekter, med mindre de eksplisitt er satt som admin der). Dataeksport og integrasjon: Det bør være mulig å eksportere data (f.eks. alle dagbokinnlegg eller svar) i et lesbart format for rapportering eller analyse. Sekundært er API-tilgang eller webintegrasjoner en fordel, slik at systemet eventuelt kan integreres med f.eks. offentlige systemer (NAV, Helsenorge e.l.) på sikt. Praktiske preferanser: Norsk språklig grensesnitt er en stor fordel. Tilgjengelighet både via app og nettleser er ønskelig. En gratis prøveversjon eller gratis bruk for pilot-skala (ca. 5 deltakere, 2–3 administratorer, og maks to parallelle prosjekter) er et pluss. Under følger en detaljert vurdering av Spond opp mot disse kravene, og deretter en gjennomgang av alternative løsninger på de punktene der Spond eventuelt kommer til kort.

# Vurdering av Spond opp mot kravene

# Struktur og hendelser i Spond

# Spond er i utgangspunktet laget for å organisere aktiviteter i grupper (typisk idrettslag, turgrupper, korps osv.), og har sterk støtte for hendelser og kalender. Opprette serie av events: I Spond kan man opprette enkeltstående hendelser for hver dag i en tur. Det finnes ikke én “serie” som automatisk genereres, men man kan manuelt lage flere hendelser (en for hver dag) og invitere de samme deltakerne. Hver hendelse (event) kan inneholde en beskrivelse med informasjon til deltakerne (sted, tid, notater etc.), og man kan legge ved filer (f.eks. PDF med detaljert program) som vedlegg

# help.spond.com

# . Tildelte oppgaver i event: Spond har en egen “Tasks in events”-funksjon som lar administrator knytte oppgaver til en hendelse

# spond.com

# . Administrator kan legge til en oppgave under eventet (for eksempel “Besvare evalueringsskjema for dag 3” eller “Ta bilde av dagens notat”) og enten tildele den til en spesifikk person eller gjøre den åpen for at noen i gruppen kan påta seg den

# spond.com

# . Denne funksjonen er i utgangspunktet ment for å fordele praktiske oppgaver (kjøring, utstyr osv.), men kan kreativt brukes til å delegere “gjøremål” som deltakerne skal utføre den dagen. Spond støtter at man lager maler for oppgaver som går igjen, og at status på oppgaver vises (f.eks. “venter på bekreftelse” inntil en deltaker aksepterer oppgaven)

# spond.com

# spond.com

# . “Undersøkelser”/spørsmål: Spond har ikke avanserte surveys med skjemasvar, men det har en avstemmingsfunksjon (poll) som kan brukes for enkle spørsmål. Avstemminger kan opprettes enten som flervalg (tekstvalg) eller som valg av dato/tid

# help.spond.com

# . Man kan stille et spørsmål og opp til 30 svaralternativer som medlemmene kan velge blant

# help.spond.com

# . Relevant for oppfølging er at man kan velge om avstemmingsresultatene skal være synlige for alle eller kun for administrator (“skjule stemmer”)

# help.spond.com

# . Dette betyr at Spond kan brukes til enkle spørreundersøkelser hvor bare admin ser hvem som har svart hva – dog begrenset til flervalgsspørsmål, ikke fritekstsvar

# help.spond.com

# help.spond.com

# . For fritekst “undersøkelser” måtte man i Spond heller be deltakerne om å svare via kommentarer eller meldinger (se Dagbokfunksjon nedenfor), eller lenke til et eksternt skjema. Vurdering: Spond oppfyller kravet om struktur med daglige events. Det er enkelt å lage en kalender av daglige hendelser med tilhørende info. Tildeling av oppgaver per dag støttes gjennom tasks-funksjonen, og enkle spørreundersøkelser kan gjennomføres med polls. Dette dekker grunnleggende behov, selv om mer avanserte skjema må løses kreativt (f.eks. via lenker).

# Dagbokfunksjon i Spond

# Her har Spond klare begrensninger. Spond er designet for gruppedeling av informasjon, ikke for individuelle, personlige dagbokinnlegg. Medlemmers mulighet til å poste: I en standard Spond-gruppe kan bare administratorer opprette nye innlegg (posts) i gruppen

# help.spond.com

# . Vanlige medlemmer (deltakere) kan ikke poste fritt til alle; de kan kun kommentere på innlegg eller hendelser, og sende meldinger. Dette betyr at en deltaker ikke har en naturlig plass å skrive sitt eget dagboknotat som kun de eller admin kan se. Mulige arbeid rundt (workarounds):

# Kommentarer under hendelser: Spond tillater at man kommenterer på en hendelse. En deltaker kunne skrive et “dagboknotat” som en kommentar under den aktuelle dagens event. Men: som standard vil alle i gruppen da se kommentaren. Det finnes ingen måte å gjøre en kommentar privat til bare admin i en gruppehendelse. Så fremgangsmåten ville eksponere dagboken for hele gruppen, hvilket strider mot kravet om private dagbøker. (Man kan riktignok slå av kommentarfeltet helt på et innlegg/hendelse, men ikke begrense det til kun admin

# help.spond.com

# .)

# Private meldinger: Deltakeren kan sende en privat melding (chat) direkte til en administrator med sine refleksjoner. Dette ville fungere som en helt privat dagbok (kun den deltaker og admin involvert). Ulempen er at disse meldingene ikke er knyttet til “Dag X” annet enn det man selv skriver. Admin vil heller ikke ha en samlet oversikt per deltaker per dag uten å manuelt sortere meldingstrådene.

# Separate undergrupper: Spond har støtte for undergrupper. En mulig løsning er å opprette en privat undergruppe for hver deltaker, der kun vedkommende og administrator(er) er medlemmer. I den gruppen kan deltakeren få admin-rettigheter slik at han/hun kan poste egne innlegg (som dagbokinnlegg)

# help.spond.com

# . Da kan deltaker skrive et innlegg per dag i sin egen gruppe. Dette vil da være synlig for deltaker og involverte admin, men ikke for de andre deltakerne (siden de ikke er med i denne undergruppen). Man kan også bruke hendelser i undergruppen hvis man vil strukturere dagbok etter dato. Denne løsningen oppfyller kravet om privat dagbok synlig for admin. Skulle deltakeren ønske å dele noe med utvalgte andre, måtte man i Spond manuelt invitere disse personene inn i sin undergruppe eller kopiere innholdet over til hovedgruppen – altså ingen elegant “del med utvalg”-funksjon.

# Synlighetskontroll: Spond har et par enkle innstillinger for synlighet på innlegg: man kan poste til kun voksne medlemmer, inkludere foresatte osv., beregnet for idrettslag med barn

# help.spond.com

# . Dette er imidlertid generelle valg og ikke per bruker. Det finnes ingen funksjon i Spond for at en bruker kan poste noe som kun et utvalg (ikke alle) av gruppens medlemmer ser, utover det å benytte separate undergrupper. Konklusjon: Spond har ingen innebygd dagbokmodul for personlige journaler. Det krever omgåelser som fort blir kompliserte. For Camino-prosjektet vil dette være et svakt punkt: man kan ikke uten videre la deltakerne skrive sine daglige refleksjoner i Spond og samtidig oppfylle ønsket om privatliv eller selektiv deling. Hvis man velger Spond, måtte man enten:

# a) akseptere at dagbokskriving skjer utenfor systemet (f.eks. på papir), eventuelt at deltaker skanner/laste opp notater (mer om det under Papir+digital), eller

# b) sette opp kreative løsninger som en privat undergruppe per deltaker for å samle dagbøker (noe som er mulig, men gir mer administrativt merarbeid og ikke er en bruksmessig elegant løsning for deltakerne).

# Administrativ oppfølging i Spond

# Spond er laget nettopp for at gruppeadministratorer skal kunne organisere og følge opp, så her har den flere nyttige funksjoner:

# Oversikt over svar: For hver hendelse kan admin se hvem som har svart “kommer/kommer ikke” (påmelding) – relevant hvis man bruker Sponds påmeldingsfunksjon for å fange opp om deltaker har deltatt den dagen. Admin kan sende påminnelser til de som ikke har svart på en invitasjon. For avstemninger (polls) kan admin se hvem som har stemt og hva de har stemt (spesielt hvis man valgte “skjulte stemmer” så kun admin ser resultatene)

# help.spond.com

# . For oppgaver (tasks) knyttet til en hendelse ser admin hvem som har tatt ansvar for oppgaven og om den er bekreftet utført

# spond.com

# spond.com

# . Spond sender også notifikasjoner – brukere får push-varsel eller e-post når nye hendelser legges ut, når de får tildelt en oppgave osv., og administrator kan trigge ekstra påminnelser (f.eks. “minn alle om avstemningen” før fristen)

# help.spond.com

# .

# Samlet dashboard: Spond har ikke et avansert dashboard med grafer for progresjon eller slikt, men for en gruppe kan administrator liste ut alle medlemmer, se status på hvem som har svart på hendelser, oppgaver og avstemninger, alt innen appen. Ved behov kan man eksportere f.eks. en liste over svar på en avstemning eller deltakerliste. (Merk: Spond tilbyr ikke en åpen API, så automatisert datainnhenting må evt. gjøres via eksportfunksjoner manuelt

# help.spond.com

# .)

# Varsling til admin: Admin får varsel ved nye kommentarer, meldinger eller når noen melder seg på/av en aktivitet. Dette gjør at om man ber deltakerne om noe (f.eks. “skriv OK i kommentarfeltet når du er ferdig med dagens oppgave”), vil admin få med seg aktiviteten fortløpende.

# Visualisering: Spond genererer ikke egne grafer for “progresjon over tid” eller lignende. Administrator må i stor grad lese av lister (hvem har svart, hvem gjenstår). For fem deltakere er ikke dette uoverkommelig – man kan manuelt føre en oversikt hvis ønskelig. Alt i alt dekker Spond grunnleggende administrativ oppfølging: hvem har svart/gjort hva, med mulighet for påminnelser og direkte meldinger. For mer avansert analyse av progresjon eller sentiment (f.eks. se utvikling i deltakers humør via dagbok) gir ikke Spond støtte, siden den heller ikke har slike datafelter innebygd.

# Personvern og GDPR i Spond

# Spond er utviklet i Norge og tar generelt personvern på alvor. Alle Spond-produkter er GDPR-kompatible, og overholder personvernlovgivning som et kjernefokus

# help.spond.com

# . Infrastrukturmessig lagres alle data i EU (Amazon AWS i Irland og Tyskland) og Spond er underlagt norsk Datatilsyn (Datatilsynet) som tilsynsmyndighet

# help.spond.com

# . Dette betyr at Spond oppfyller de generelle kravene til databehandleravtaler, GDPR samtykker osv., som er nødvendig for bruk også i offentlig sektor. Når det gjelder norsk helsesektors nivå: For å brukes til helseopplysninger kreves normalt streng tilgangskontroll, kryptering, logging og ofte at leverandøren har konsesjon for behandling av helseopplysninger. Spond er ikke spesifikt designet som en journalsystem eller medisinsk app, men den har mange av de samme sikringene (kryptert transport, kryptert lagring, rollebasert tilgang). Det er verdt å merke seg at Spond ikke er ment for lagring av følsomme diagnoser eller medisinske data – og vil man bruke den i helsesammenheng måtte man få på plass en avtale/DPA (Data Processing Agreement) for formålet. Spond tilbyr standard databehandleravtaler for sine kunder og har en dedikert personvernansvarlig (DPO) i organisasjonen

# help.spond.com

# help.spond.com

# . I praksis, for Camino-piloten, er Spond sannsynligvis akseptabelt hvis innholdet primært er dagboknotater og ikke rene helsejournaler. Deltakerne kan opptre under fullt navn eller pseudonym etter behov, og man kan slette data ved prosjektets slutt. En fordel er at Spond er et modent system – sikkerhetstesting kjøres årlig av uavhengige aktører, data er trygt lagret og man har kontinuerlige sikkerhetskopier

# help.spond.com

# help.spond.com

# . Konklusjon personvern: Spond tilfredsstiller GDPR og har potensial til å tilfredsstille helse-sektorens krav, selv om det ikke er et offisielt helsesystem. For et pilotprosjekt i liten skala vil det mest kritiske være å sikre samtykke fra deltakerne om at deres personlige data (dagboknotater etc.) lagres i appen, og eventuelt begrense svært sensitive opplysninger.

# Papir + digital dagbok i Spond

# Spond har ingen innebygd “skannermodul”, men å legge inn bilder er fullt mulig. I hver gruppe finnes en Fil-seksjon der man kan laste opp filer eller bilder, og til og med opprette mapper

# help.spond.com

# . Administrator kan for eksempel opprette en mappe per deltaker, som kun er synlig for administratorer (man kan markere en mappe som “kun admin” med låsesymbol)

# help.spond.com

# . Deltakeren selv (hvis hun ikke er admin) vil riktignok ikke se en slik mappe, så dette er mest nyttig for at admin kan samle inn skannede dagboksider som deltaker sender på annet vis. Mer lavterskel er at deltakeren kan ta bilde av sin dagbokside med mobilen og legge ved bildet som en kommentar eller melding. I Spond-mobilappen, når man skriver en kommentar eller melding, er det enkelt å “attach” et bilde fra galleriet eller direkte kamera. Dette vil fungere greit for å få inn håndskrevne notater. (Man bør gi litt opplæring i å ta leselige bilder, men utover det kreves ingen spesialverktøy.) Dersom man ønsker en mer strukturert scanning, måtte man bruke en separat app (f.eks. Microsoft Lens, Adobe Scan, el.l.) for å scanne til PDF og så laste opp PDFen i Spond. Spond støtter PDF- og DOCX-filer i opplastning

# help.spond.com

# &nbsp;(opptil 100 MB per fil, så det er romslig)

# help.spond.com

# help.spond.com

# . Vurdering: Spond oppfyller behovet for å kunne digitalisere papirdagbøker i den forstand at man kan laste opp bilder eller filer via mobilappen

# help.spond.com

# . Det er ingen automatisk tolking av tekst (OCR), men det var heller ikke et krav. Løsningen vil være at deltakerne tar bilde av sidene og sender dem privat til admin (via melding) eller laster dem opp i en avtalt kanal. Dette krever at deltakerne er komfortable med mobilbruk, men ettersom Spond er mobilapp-basert er det sannsynlig.

# Motivasjonselementer i Spond

# Spond i seg selv har få “gamification”-elementer. Appen er laget for organisering, ikke motivasjon, så den har ingen poengsystem for oppmøte eller badges for gjennomførte oppgaver, utover at man selvfølgelig kan se sin egen aktivitetskalender (noen brukere kan oppleve det som en motivasjon å få 100% oppmøte etc., men dette er ikke framhevet som poeng). Det finnes enkelte uformelle innslag – f.eks. hvis man blar gjennom medlemmenes profil kan man se statistikk som hvor mange prosent av hendelser de har deltatt på – men det er primært i Spond Club-kontekst for idrettslag. I Camino-prosjektet kan man likevel skape motivasjon manuelt i Spond. Administrator kan sende oppmuntrende meldinger, offentlig anerkjenne deltakere (f.eks. “Gi en applaus til Per som har skrevet dagbok alle 7 dager denne uka!” som innlegg i gruppen) eller gi “belønninger” utenfor appen basert på data man samler (f.eks. trekke en liten premie blant de som har fullført alle oppgaver). Men selve appen gir ingen automatisk belønning eller visuell fremdriftsmåler for deltakerne. Konklusjon: Spond er svak på motivasjonselementer – ingen innebygde poeng eller milepæler. Hvis dette er viktig, måtte prosjektet selv implementere kreative løsninger (enten manuelt, eller ved å kombinere Spond med et annet verktøy som tracker oppgaver og gir belønning).

# Tilgangsnivåer og rettigheter i Spond

# Spond oppfyller kravet om flere adgangsnivåer. Rollestyring er ganske fleksibelt:

# Deltaker (medlem): Standardrollen for de som blir invitert i gruppen. De kan se innhold (hendelser, innlegg) og svare, men har begrensede rettigheter til å poste eller administrere.

# Administrator: Man kan legge til én eller flere administratorer i en gruppe. Spond støtter også ulike administratorroller med differensierte rettigheter

# help.spond.com

# . For eksempel kan man ha en “Hjelpetrener”-rolle som ikke får opprette nye innlegg eller legge til medlemmer, eller en “Redaktør” som kun kan poste men ikke endre gruppesettinger. Hvilke rettigheter en admin-rolle har, styres under “Roles and rights” i gruppeinnstillingene

# help.spond.com

# . Eksempel: Om en admin ikke ser mulighet til å opprette en avstemning, kan det skyldes at rollen vedkommende har fått er begrenset

# help.spond.com

# help.spond.com

# .

# Hovedadmin (gruppeeier): Som oppretter av gruppen har man automatisk full tilgang (kan redigere alle innstillinger, legge til/fjerne admins osv.). Dette tilsvarer “full admin” nivå.

# Minst tre nivåer er dermed dekket: deltaker, admin med begrenset tilgang (man kan definere en rolle som f.eks. kun lese/kommentere eller kun håndtere en del av oppgavene) og admin med alle tilganger. Disse rollene gjelder per gruppe, så man kan avgrense tilganger per prosjekt: En person som er admin i Gruppe/Prosjekt A, men ikke lagt til i Gruppe B, har ingen tilgang til B i det hele tatt. Det er dermed lett å holde prosjektene adskilt. Hvis samme organisasjon har to Camino-grupper, kan man velge hvilke admins som legges i hver. Det er verdt å merke at Spond (per i dag) ikke har en overordnet “superadmin” på tvers av alle grupper med et kontrollpanel – med mindre man tar i bruk Spond Club som er en betalt løsning for klubbadministrasjon. For vårt formål er det ikke nødvendig; gratisappen håndterer flere separate grupper fint. Konklusjon: Spond scorer bra her. Det tillater flere adminnivåer og man kan granulært styre rettigheter. Admin-tilgang er også begrenset per prosjektgruppe, slik at man oppfyller kravet om å avgrense admins til sitt prosjekt.

# Eksport av data og integrasjoner i Spond

# Spond tilbyr noen eksportmuligheter, men har sine begrensninger:

# Kalendersync: Deltakere kan synkronisere Spond-hendelser til sin personlige kalender (Google, iCal)

# help.spond.com

# . Dette er nyttig for brukerne, men ikke en “dataeksport” for oppfølgingsdata.

# Eksport: For avstemninger kan admin laste ned resultater (f.eks. en CSV med hvem som svarte hva) via menyvalg

# help.spond.com

# help.spond.com

# . Man kan også kopiere ut medlemslister og lignende. For oppmøte på hendelser finnes det ikke et ferdig rapporteringsverktøy, men man kan se på skjermen og eventuelt ta ut skjermdump/skriv til Excel manuelt. Spond Club (den utvidede plattformen) har mer rapportering for klubbmedlemskap osv., men i gratisappen er det relativt begrenset.

# API: Spond har ikke offentlig API tilgjengelig

# help.spond.com

# . De evaluerer muligens å åpne noe i fremtiden, men per nå må integrasjoner løses ved at man manuelt henter ut data eller bruker import/eksport-funksjoner der de finnes

# help.spond.com

# . For et pilotprosjekt betyr det at man ikke lett kan koble Spond til for eksempel et NAV-system automatisk.

# Integrasjoner: Utover kalendersynkronisering har Spond integrert betalingsløsninger for medlemsavgift etc., men det er irrelevant her. Det finnes ingen direkte integrasjon mot Helsenorge eller lignende (Spond er jo ikke et helsesystem).

# Oppsummert: Data kan hentes ut, men ikke elegant. For fem deltakere kan en admin alltids manuelt sammenstille data ved å kopiere fra Spond-grensesnittet. Dersom prosjektet skulle skaleres eller integreres i større system, er Spond ikke ideelt siden den er lukket (men man kunne f.eks. eksportere CSV og så importere i et analysesystem).

# Oppsummering av Spond

# Spond dekker mange av de grunnleggende behovene: struktur med daglige hendelser, mulighet for å legge til oppgaver pr. dag, administrativ oversikt over hvem som svarer på hva, god tilgangskontroll og solid personvern. Det er brukervennlig, tilgjengelig på norsk, gratis i bruk, og deltakerne får tilgang via en velkjent app. Hovedsvakheten er dagbokfunksjonaliteten – Spond mangler en mekanisme for at hver deltaker kan føre en privat eller delvis privat dagbok som er knyttet til dagen. Dette er et sentralt krav i Camino-prosjektet. Man kan forsøke å bøte på det innenfor Sponds rammer (som diskutert), men det vil ikke være like elegant som en løsning som er laget for journaling. I tillegg har Spond ingen innebygde motivasjonsspillifiseringer, noe som er et “ønske”-krav. Nedenfor vurderes noen alternative systemer, spesielt med tanke på de områdene hvor Spond er svak: dagbok og motivasjon, samt hvorvidt de kan oppfylle øvrige krav like godt eller bedre.

# Alternative systemer og deres egnethet

# Når vi ser bort fra Spond, finnes det flere typer systemer som kan tilpasses Camino-prosjektets behov:

# Generelle samhandlingsverktøy: Notion og Asana faller i denne kategorien. De er fleksible og kan formes til mye, men er ikke laget spesifikt for helseoppfølging.

# Spesialiserte oppfølgings- eller helseverktøy: MinMemoria og Lifekeys nevnes, og vi supplerer med CheckWare som er mye brukt i helsesektoren. Disse har funksjoner for personlig innhold og evt. klinisk oppfølging, men varierer i relevans.

# Andre verktøy (ikke spesifikt nevnt): Det finnes rene dagbokapper, habit-tracking apps med gamification osv., men de fleste av disse mangler en admin-rolle. Vi fokuserer derfor på de nevnte/verklignende systemene.

# Nedenfor følger en gjennomgang av hver kategori/verktøy med fokus på kravene.

# Notion

# Notion er en svært fleksibel plattform for notater, databaser og prosjekter. Den kan nesten betraktes som et bygge-sett for et eget oppfølgingssystem. Struktur – hendelser og oppgaver: I Notion kan man opprette sider eller databaseelementer for hver dag av Camino-turen. For eksempel kan man lage en database kalt “Turkalender” hvor hver rad er en dag (med dato), og innen hver har man felt for informasjon, oppgaver osv. Notion har maler for kalender og kan vise data som kalender, tidslinje eller liste. Det er ingen ferdig “invite”/påmelding per event som i Spond, men man kan definere en oppgave som et avkrysningsfelt eller statusfelt i hver dags side. Oppgaver/undersøkelser til deltakere kan gjennomføres ved at man f.eks. legger en sjekkliste eller et skjema på siden. Notion støtter ikke direkte spørreskjema-utsending, men man kan lage en tabell for besvarelser eller integrere et eksternt skjema i en side. Dagbokfunksjon: Notion egner seg godt til journaling. Hver deltaker kan få sin egen private side eller seksjon for dagbok. En måte å gjøre det på er å opprette en mal for dagbokoppføring per dag som deltakerne fyller ut. Notion har granular tilgangskontroll på sidenivå: En side kan gjøres privat for en bruker, eller deles med spesifikke personer

# notion.com

# notion.com

# . For eksempel kunne man lage en side “Dagbok – \[Navn]” som kun deles mellom den aktuelle deltaker og admin (så admin kan lese). Inne i denne siden kan deltakeren ha sub-sider per dato eller en løpende logg. Hvis deltaker vil dele et enkelt innlegg med noen andre, kan man til og med dele akkurat den sub-siden med en annen person ved å invitere dem til den

# notion.com

# . Notion gir altså full fleksibilitet til å ha private, delte eller offentlige notater – men det krever teknisk konfigurasjon. Brukeren selv kan måtte beherske å opprette sider og gi tilgang, med mindre admin setter opp alt på forhånd. Administrativ oppfølging: Admin kan se alt innhold de har tilgang til i arbeidsområdet. Man kan filtrere tabeller for å se f.eks. hvilke oppgaver som er huket av av hver deltaker. Notion har ingen automatisk “varsle når X ikke gjort” funksjon, men man kan manuelt sjekke. Det finnes noen integrasjoner og automasjoner (Notion API kan brukes til å sende påminnelser via tredjepart). Visuelt kan man lage dashbord-sider i Notion som oppsummerer progresjon (f.eks. en bar som viser % av oppgaver gjort pr deltaker, hvis man legger til rette for det). Dette er relativt avansert å sette opp, men mulig. Notion er mer som et blankt ark – det gir mange verktøy, men administratoren må selv bygge rapporter om ønskelig. Personvern: Notion er en skyløsning som er GDPR-compliant på generelt nivå; de tilbyr databehandleravtale for betalende kunder. Data lagres dog i USA (pr. 2023) om man ikke har enterprise-avtale, selv om de nå har gjort tjenesten tilgjengelig på norsk språk. Man må vurdere nøye om sensitive data skal inn i Notion. For et pilotprosjekt med samtykke fra deltakerne kan det gå greit, men Notion oppfyller ikke “norsk helsenivå” strengt tatt – den er ikke en helseautorisert plattform. Papirdagbok: Notion lar brukere laste opp bilder og filer på sider, så scanning av fysisk dagbok er kurant. På mobil kan deltaker bruke Notion-appen til å lage en ny dagbok-side og legge ved foto. Motivasjon: Ingen innebygd gamification her heller. Man kunne lage en side med en poengoversikt manuelt, men systemet i seg selv deler ikke ut poeng. Tilgangsnivåer: Notion har workspace owners (admin), members og guests, pluss side-spesifikke rettigheter (full redigering, kommentering, kun visning etc.)

# notion.com

# . Dette gir stor fleksibilitet. Man kan gi hver deltaker kun tilgang til egne dagboksider (ikke andres), og ha noen med admin-tilgang som ser alt. Begrenset admin (som kan se men ikke endre alt) er ikke en egen rolle ut av boksen, men man kan for eksempel gjøre noen til member uten å være owner, da kan de ikke endre globale innstillinger men fortsatt se alt de er invitert til. Dermed kan man simulere “begrenset admin”. Eksport/Integrasjon: Notion-sider kan eksporteres (til Markdown, PDF osv.) enkelt. Notion har også et API for integrasjon og masse integrasjonsmuligheter via Zapier m.m. Dette er et pluss om man vil trekke ut data til andre systemer. Oppsummering Notion: Meget fleksibelt og kan oppfylle de fleste krav med nok konfigurering. Dagbøker og tilpasset synlighet er en styrke (man kan gjøre ting akkurat så privat/offentlig man vil)

# notion.com

# notion.com

# . Ulempene er at det ikke er et ferdig spesialisert oppfølgingsverktøy – man må sette opp mye manuelt og lære deltakerne å bruke det. Språkmessig finnes det nå norsk UI (beta), men det er kanskje litt mer teknisk enn Spond for vanlige brukere. Personvernmessig er det ikke optimalt for helse-sensitiv info. Notion kan egne seg dersom man verdsetter fleksibiliteten og er klar for å bygge strukturen selv.

# Asana

# Asana er et prosjektstyringsverktøy primært for oppgaver og team-samarbeid. Det er mer strukturert enn Notion på at det handler om lister av oppgaver, frister og ansvarlige. Struktur – hendelser og oppgaver: I Asana vil man typisk representere Camino-prosjektet som et prosjekt med oppgaver. Man kan lage en seksjon eller et prosjekt for “Dag 1, Dag 2, ...” og under hver legge oppgaver. For eksempel kan man for Dag 1 ha en oppgave med beskrivelse av dagens etappe som alle skal lese (ikke noe de trenger å “gjøre” annet enn å lese), og en oppgave “Dagbokinnlegg Dag 1” for hver deltaker som de skal fullføre. Asana er svært god på å tildele oppgaver til personer og sette forfallsdato. En deltaker vil få varsel om oppgaven sin og kan hake den av når utført eller skrive en kommentar under den. Man kan også bruke Asanas Form-funksjon (skjema) i premiumversjon til å la deltakerne fylle ut et skjema som genererer et oppgavesvar. Dagbokfunksjon: Asana har ingen dagbok som sådan, men man kan modellere det som oppgaver: En dagbokoppgave per dag per deltaker, der deltakeren skal f.eks. legge inn en kommentar med sin refleksjon og deretter merke oppgaven som fullført. Kommentartråden under oppgaven vil fungere som innhold. Dette er ikke ideelt for lengre sammenhengende tekst, men det fungerer. Et alternativ er å bruke Asanas oppgavebeskrivelse-felt som dagboktekst – en deltaker kan redigere beskrivelsen av sin oppgave og skrive der. Imidlertid vil da alle med tilgang til prosjektet kunne lese det, med mindre man segmenterer prosjektene (se tilgang). Så Asana krever litt oppfinnsomhet for privat dagbok: Man kunne lage et eget prosjekt pr deltaker for dagboken og bare dele med admin og den deltaker. I så fall har man 5 separate “dagbok-prosjekter”, noe som er håndterlig med få deltakere. Da kan hver deltaker ha sine daglige oppgaver der de skriver fritt, isolert fra andre. Administrativ oppfølging: Asana er laget nettopp for å følge opp hvem har gjort hvilke oppgaver. Administrator (eller prosjektansvarlig) kan på en oversikt se status (fullført/ikke) for alle deltakernes oppgaver. Asana har også dashboards med enkle grafer (f.eks. hvor mange oppgaver fullført av totalt). Varsler er innebygget: hvis en frist nærmer seg eller passeres, eller noen kommenterer, får ansvarlig og eventuelt prosjektleder beskjed. Man kan filtrere på person og se alt vedkommende har gjort eller mangler. Så her scorer Asana høyt – det er et oppfølgingstool by design. Personvern: Asana er et kommersielt verktøy, GDPR-compliant generelt, men data hostes trolig i USA. De har mange bedriftskunder globalt og tilbyr nok EU Model Clauses for data. For et lite pilotprosjekt vil ikke Asana oppfylle “helse IT”-krav formelt, men praktisk sett kan det være greit om innholdet ikke er svært sensitivt. UI finnes ikke på norsk pr nå (svensk finnes, norsk er uvisst)

# help.asana.com

# , så deltakerne må takle engelsk grensesnitt eller svensk. Innhold kan selvsagt skrives på norsk. Papirdagbok: Asana lar vedlegg på oppgaver, så deltaker kan ta bilde og legge ved sin oppgave eller i kommentar. Ganske likt som Spond på det området. Motivasjon: Asana har ingen formelle belønningssystemer. Den har dog en liten morsomhet: av og til når man huker av en oppgave dukker det opp en enhjørning eller fe som grafikk på skjermen – en liten gratulasjon. Dette kan virke motiverende for noen, men det er mer en gimmick. Man kunne manuelt sette opp at fullførte oppgaver gir poeng (f.eks. i en spreadsheet utenfor), men Asana tilbyr ikke poengtavle. Tilgangsnivåer: I gratisutgave er Asana ganske åpent innenfor et team: alle medlemmer av prosjektet ser alle oppgaver (med mindre man markerer dem private, men det er begrenset). I premium kan man ha comment-only prosjekter og ulik tilgang

# asana.com

# . Man kan også invitere folk som Guests slik at de bare ser det man eksplicit deler. Asana har på organisasjonsnivå Admin og Super Admin for brukerhåndtering, men for oss er det prosjekt-nivå som gjelder. Man kan absolutt oppnå 3 nivåer:

# Deltaker: kun medlem i sitt eget dagbokprosjekt (ev. kommentator i fellesprosjekt).

# Begrenset admin: man kan ha en prosjektleder for Camino-prosjektet som ikke er org-admin men som likevel kan se og redigere prosjektet.

# Full admin: en organisasjonsadministrator (i en Asana-organisasjon) som har kontroll på alle prosjekter.

# Det er litt mer komplekst enn Spond, men Asana har fleksibilitet her også. Comment-only prosjekt er en måte å la deltaker se ting uten å endre (hvis det var relevant)

# asana.com

# asana.com

# . For privat dagbok måtte man trolig ha separate prosjekter per bruker som nevnt. Eksport/Integrasjon: Asana er sterk på integrasjoner. Man kan eksportere prosjekt til CSV, og Asana har et velutviklet API. Skulle man ville integrere med NAV eller egne systemer, er det teknisk mulig (men krever utvikling). Data ut kan dermed tas relativt lett. Oppsummering Asana: Asana oppfyller mange krav: struktur (ja), dagbok (mulig med workaround, men ikke out-of-box), admin oppfølging (svært bra), tilgangskontroll (mulig, men gratisversjonen har noen begrensninger), eksport (ja). De svake punktene er dagbok (må behandles som oppgaver), ingen norsk språk i UI, og personvern (ikke ideelt for helseinfo). Hvis man primært vektlegger oppgave/progresjonskontroll og kan leve med litt rigging for å få til dagbok, kan Asana fungere. Brukergrensesnittet er moderne og finnes som app og web, så tilgjengeligheten er god.

# MinMemoria

# MinMemoria er et verktøy utviklet for eldreomsorg, med fokus på livshistorie og kommunikasjon mellom beboere, pårørende og helsepersonell. Det er ikke et generelt prosjektverktøy, men heller en digital “minnebok”. Struktur – hendelser: MinMemoria er ikke laget for å planlegge et forløp med daglige aktiviteter for en bruker. I stedet handler det om å lagre personens livshistorie gjennom bilder og tekster. Det finnes ingen funksjon for å opprette en rekke dags-events med oppgaver. Så på dette punktet treffer det dårlig – man kunne kanskje lage et “kapittel” for Camino-turen i personens profil, men hele konseptet er annerledes. Dagbokfunksjon: Verktøyet har en form for “gjestebok” der familie og personal kan legge inn hilsener og oppdateringer på vegne av beboeren

# vilmer.no

# . Beboeren selv (dersom i stand) eller med hjelp kan også legge inn ting om hverdagen. Dette ligner en dagbok, men typisk brukes det til å dele med alle inviterte (familie, venner) for å holde dem oppdatert. Privat dagbok gir ikke mening i MinMemoria – poenget er jo deling for å bli sett og hørt

# vilmer.no

# . Systemet legger opp til at informasjon deles med et nettverk av kjente rundt brukeren, ikke holdes for seg selv. Dermed bommer det på kravet om privat/kun admin. Administrativ oppfølging: I MinMemoria finnes ikke “oppgaver” eller ting å levere inn, så oppfølging er mer å se om det legges inn nye minner. Helsepersonell kan bruke livshistorien for å gi bedre personsentrert omsorg (f.eks. vite hva pasienten liker osv.)

# vilmer.no

# vilmer.no

# . Men det har ikke dashboard for “progresjon” – MinMemoria er ikke et oppfølgingssystem, mer et informasjonsarkiv kombinert med sosial deling. Personvern: Sikkerhet er ivaretatt; bare inviterte får tilgang

# vilmer.no

# . MinMemoria er laget nettopp for kommuner, så det følger nok GDPR og sannsynligvis behandler det som ikke å inneholde helseopplysninger (de presiserer faktisk at ingen helseopplysninger skal inn, nettopp for å unngå streng regulering)

# vilmer.no

# . Fra et helserettlig perspektiv er det derfor enklere – man deler minner, ikke medisinske data. For vårt prosjekt med mestringsnotater ville kanskje noe kunne falle under “helseopplysning” likevel. Papirdagbok: Det er en app, så man kan laste opp bilder. Familien bruker den jo til å dele bilder fra hverdagen

# minmemoria.vilmer.no

# . En deltaker kunne i teorien laste opp et bilde av sin dagbokside, men det ville da deles med alle pårørende i løsningen (eller admin) avhengig av oppsettet. Det er ikke designet for scanning av innleveringer. Motivasjon: Ingen slike elementer – igjen, det er ikke fokus i denne typen app. Tilgangsnivåer: Her har man roller som beboer (bruker), pårørende (flere kan inviteres) og helsepersonell/administrator for profilen. Systemet har god tilgangskontroll på at kun inviterte ser personens data

# vilmer.no

# , men ikke noe hierarki av admin. For flere prosjekter (flere personer) måtte man administrere hver person separat. Det er ikke laget for å ha en gruppe av likeverdige brukere slik Camino-prosjektet har (hvor alle går samme tur) – i MinMemoria er hver “gruppe” en person og dens omgangskrets. Oppsummering MinMemoria: Dette verktøyet er ikke egnet for Camino-prosjektets formål. Det oppfyller knapt noen av kravene utover god personvernkontroll. Det er rett målgruppe (mestring/helse), men feil use-case. MinMemoria er nevnt muligens fordi det handler om digital historiefortelling, men for et pilotprosjekt med oppgaver og dagbok per dag vil det føles veldig malplassert.

# Lifekeys (Resilience \& Well-being plattform)

# Lifekeys er en norsk tjeneste for mental helse som opprinnelig tilbyr psykologkonsultasjoner online. Relevant for oss er deres digitale plattform rettet mot bedrifter og individer for selvhjelp. Lifekeys har utviklet en “Resilience \& Well-Being Kit” – en digital løsning med selvhjelpskurs, øvelser og verktøy som digital dagbok

# lifekeys.no

# lifekeys.no

# . I tillegg finnes et administrativt Insight Portal for HR/leder hvor man kan sende ut undersøkelser og få rapporter

# lifekeys.no

# . Denne plattformen er ganske ny og skreddersydd for oppfølging av mental trivsel, som ligger nært opp til vårt mestringsfokus. La oss se på kravene: Struktur – hendelser og oppgaver: Lifekeys-plattformen er mer modul-basert enn dag-for-dag eventer. Den inneholder selvguidede kurs og øvelser deltaker kan gjøre i sitt eget tempo

# lifekeys.no

# . For Camino-prosjektet måtte man sannsynligvis lage et kurs med moduler for hver dag. Plattformen støtter at admin (via Insight Portal) kan tildele aktiviteter til brukerne

# lifekeys.no

# . Det er ikke helt klart om man kan definere egendefinerte oppgaver per dag, men “assigning and monitoring activities” tyder på at man kan gi deltakerne konkrete ting å gjøre, som da kanskje dukker opp i deres app

# lifekeys.no

# . Det finnes også psykologiske vurderinger (assessments) som kan tilsvare spørreskjema/undersøkelser deltaker fyller ut

# lifekeys.no

# . Disse kan planlegges, for eksempel at deltaker får et kort spørreskjema om sin sinnsstemning hver dag. Riktig kalenderfunksjon (som f.eks. oversikt “Dag 1, Dag 2...”) er uviss – det kan hende admin må gi beskjed manuelt hver dag. Lifekeys har nok en mer fleksibel tilnærming der brukeren kan gjøre ting når som helst (selv om man kan indikere rekkefølge). For et definert forløp som Camino, kunne man bruke kombinasjon av daglig påminnelse (via survey) og en modul for hver dag. Dagbokfunksjon: Dette er et av Lifekeys’ kjerneelementer. I pakken beskrives digital dagbok som et av verktøyene brukeren har

# lifekeys.no

# lifekeys.no

# . Det betyr at deltakerne har et sted i appen hvor de kan skrive ned sine tanker og refleksjoner daglig. Vanligvis vil denne dagboken være privat for brukeren (slik at de kan være ærlige). I bedriftskontekst ville man neppe dele det med leder – men i vårt prosjekt kan man instruere deltakerne om å gi tilgang til sin veileder/admin hvis det er en del av oppfølgingen. Siden Lifekeys handler om mental helse, er det sannsynlig at de har tenkt gjennom personvern her: enten dagboken holdes helt privat (med psykolog-innsyn kun ved samtykke) eller at man kan velge å dele utdrag. Dette måtte avklares med Lifekeys – men teknisk er dagboken der. Den er trolig strukturert per dag (muligens med stemningsregistrering etc.). Administrativ oppfølging: Lifekeys Insight Portal gir dashbord og rapporter. Admin kan sende ut egne spørreundersøkelser (eller bruke maler fra dem) og se resultater og trender samlet

# lifekeys.no

# . Man kan dermed følge med på f.eks. daglige skårer fra deltakerne på humør eller liknende over tid. Dette er mer avansert enn Spond/Asana, da det er laget for å måle effekt av tiltak. Portalens instant reporting og trendidentifisering vil være til stor hjelp for en admin som vil se hvem som henger etter eller hvordan gruppens psykologiske stress utvikler seg

# lifekeys.no

# . For dagbokspørsmål (fritekst) er det mulig admin kan lese dem via portalen hvis det er lagt opp for det, men det kan også hende de anses private – dette måtte man sjekke. Uansett, Lifekeys oppfyller kravet om at admin kan følge med på progresjon gjennom kvantitative data og tildelte øvelser. Varsling er selvsagt – deltakerne får pushvarsler om nye oppgaver eller spørsmål, og admin kan trolig også få beskjed om manglende innsendinger. Personvern: Lifekeys opererer i helsesegmentet og tar sikkerhet på alvor. Som norsk selskap følger de GDPR og alt innhold er konfidensielt. De har lisensierte psykologer bak tjenesten, så man kan forvente at plattformen tilfredsstiller personvernkrav i bedriftshelse-sammenheng. For bruk i vårt prosjekt – dersom deltakerne samtykker – vil dataen deres være på en sikker plattform dedikert til mental helse. Det er sannsynlig at Lifekeys lagrer data i EU også (hovedkontor i Bergen). I og med at de selger til bedrifter, finnes trolig databehandleravtale. Så personvern- og sikkerhetsmessig oppfyller Lifekeys høyst sannsynlig norsk helsesektors krav (kanskje med unntak av at det ikke er integrert med Helsenorge, men for pilot er ikke det tema). Papirdagbok: Lifekeys mobilapp kunne i prinsippet la en bruker laste opp et bilde i sin dagbok, men det er mer tvilsomt om den har en filopplasting-funksjon. Fokuset er på å skrive direkte digitalt. Om noen absolutt vil skrive for hånd, måtte de da eventuelt skrive i sin digitale dagbok “Bilde av dagens side” og så kanskje sende det via en øvelse som tillot fil? Dette er usikkert – scanning er ikke en primærbruk her. Kanskje best at de som velger Lifekeys, går “all digital” på journaling. Motivasjon: Lifekeys sin plattform bygger på kurs, øvelser og resultater snarere enn spillifisering. Det er ikke oppgitt at det finnes poeng eller badges. Dog kan man anta at det å fullføre kursmoduler i seg selv vises med en fremdriftsprosent, og at deltakerne får en følelse av mestring ved å se at de gjennomfører. Om plattformen har noe belønningsikon vites ikke. Sannsynligvis belønnes man med innsikt – f.eks. kan man se endring i sine assessment-resultater over tid, hvilket kan virke motiverende. Tilgangsnivåer: Lifekeys har i praksis to hovednivåer: bruker (deltaker) og administrator/leder (som bruker Insight Portal). I tillegg er det profesjonell støtte (psykolog) i deres opplegg, men i vårt prosjekt ville kanskje ikke den delen benyttes med mindre man kombinerer med psykologtimer. Det er nok mulig å ha flere admin-brukere (HR, prosjektleder etc.) med begrenset eller full innsikt. Man kan antagelig begrense en admin til en bestemt gruppe (f.eks. man kjøper tilgang for en avdeling i en bedrift). Så 2–3 admin går fint, men om man har to parallelle prosjektgrupper må man kanskje sette dem opp som to “teams” i portalen med respektive admins. Lifekeys er laget for bedrifter så det burde håndtere flere samtidige grupper med separate tilganger. Eksport/Integrasjon: Lifekeys tilbyr rapporter i portalen; det er ikke kjent om man kan eksportere rådata direkte, men som kunde vil man nok kunne be om data. Ingen åpen API er kjent. Integrasjon med NAV e.l. finnes ikke ute av boksen. Men siden de har fokus på målinger, har de nok eksportmulighet for rapportformål. (Kanskje PDF-rapporter eller CSV av survey-svar.) Oppsummering Lifekeys: Dette fremstår som en svært lovende løsning for Camino-prosjektet. Den er trolig den som best oppfyller dagbokkravet (egen digital dagbok for hver bruker) og gir samtidig et system bygget for å måle mestring/mental progresjon. Admin får verktøy for oppfølging som er mer avanserte enn i Spond. Personvern er ivaretatt på helsenivå. Språk kan muligens velges (de tilbyr tjenester på norsk). Den eneste store ulempen er kostnad og tilgjengelighet: Lifekeys er en betalt tjeneste (nevnt pris fra 30 kr pr ansatt/mnd for basis

# lifekeys.no

# ). For 5 brukere blir det ~150 kr/mnd, pluss eventuelt portal-modulen til ~150 kr/mnd, totalt ~300 kr/mnd. For en tidsbegrenset pilot kan dette være overkommelig, men det er en investering vs. gratisløsninger. En annen potensiell utfordring er at løsningen er generisk for mental helse; noe tilpasning må til for å matche Caminoens konkrete dagsplan. Man bør kontakte Lifekeys for å høre i hvilken grad plattformen kan tilpasses et slikt pilotprosjekt.

# CheckWare (digital hjemmeoppfølging)

# CheckWare er ikke nevnt av brukeren, men det er relevant som et eksempel på et helsesektorgodkjent oppfølgingssystem. CheckWare brukes i hele spesialisthelsetjenesten i Norge for digital pasientmedvirkning

# checkware.com

# &nbsp;– bl.a. til hjemmeoppfølging innen psykisk helse og rus. Det er en profesjonell plattform hvor klinikere kan sette opp behandlingsforløp med spørreskjema, dagbøker og program. For Camino-prosjektet ville CheckWare uten tvil kunne oppfylle kravene:

# Man kan definere et nettbasert behandlingsprogram med moduler pr dag (tilsvarende events med info og oppgaver).

# Pasienten (deltaker) kan fylle ut daglige selvrapporteringsskjema (f.eks. en dagbok med fritekstfelt “hvordan var dagen i dag?” og skalaer for humør). Disse blir tilgjengelige for behandler/admin umiddelbart.

# Administrator får oversikt gjennom at CheckWare automatisk samler inn data og kan vise endringsgrafer etc. Plattformen er laget for å måle pasientens status og utvikling over tid

# checkware.no

# .

# Personvern er topp: CheckWare tilfredsstiller alle krav, og informasjonssikkerhet og personvern er ivaretatt i henhold til regelverk og beste praksis

# checkware.no

# . Data ligger i Norge, og systemet krever to-faktor og legitimering via Helsenorge ved bruk i helsevesenet.

# Det er mulig for pasienten å logge inn via Helsenorge ID-porten etc. (men for et forskningsprosjekt kan man opprette brukere separat).

# Tilgangsnivå: Man kan ha prosjektspesifikke behandlerteam, etc.

# Motiviasjon: CheckWare i seg selv har ikke “poeng”, men siden det er klinisk brukes det ofte sammen med at behandler gir tilbakemelding. Dog kunne man lage for eksempel en automatisk generert tilbakemelding (“gratulerer med å ha fullført 5 av 5 dager!”) som en del av programmet.

# Eksport: Full eksport av data for analyse er mulig, og integrasjoner med sykehusenes systemer eksisterer. For NAV-integrasjon på sikt ville en slik plattform være mest realistisk.

# Hvorfor ikke bare CheckWare? Det kommer an på tilgang og kost. CheckWare er normalt lisensiert til helseforetak og kommuner, og for et enkeltstående prosjekt kan det være vanskelig å få tak i uten samarbeid med noen som allerede har det. Det kan også være overkill – systemet er komplekst og krever opplæring både for admin og brukere. For bare 5 deltakere i en kort pilot vil det neppe lønne seg å kjøpe en slik tjeneste med mindre man har planer om skalering i helsevesenet etterpå. Men det er verdt å nevne som målbilde for hva som er mulig: CheckWare er et system som helt klart dekker funksjonelt alt, men kostnads- og kompleksitetsmessig er det i en annen klasse enn Spond/Notion.

# Oppsummerende sammenligning av verktøy

# For å sammenfatte nøkkelpunktene, viser tabellen under en sammenligning av Spond og de aktuelle alternativene opp mot kravspesifikasjonene:

# Krav	Spond	Notion	Asana	Lifekeys	MinMemoria	CheckWare

# Struktur (daglige events)	✔️ Hendelser (kalender)	✔️ Tilpasses (kalender/side pr dag)	✔️ Oppgaver (med dato)	⚠️ Begrenset (moduler/kurs, men ikke kalendervisning)	❌ Nei (ingen event-funksjon)	✔️ Ja (program/forløp)

# Info \& oppgaver per dag	✔️ Beskrivelse + Tasks

# spond.com

# ✔️ Tekst på side; sjekklister	✔️ Oppgavebeskrivelse; deloppgaver	✔️ Øvelser og spm. tildeles

# lifekeys.no

# ❌ (ikke støttet)	✔️ Skjemautfylling, oppgaver

# Dagbokfunksjon (privat)	❌ Ingen (kronglete workaround)	✔️ Ja (private sider per bruker)

# notion.com

# ⚠️ Delvis (som oppgaver; krever isolerte prosjekter)	✔️ Ja (egen digital dagbok i app)

# lifekeys.no

# ⚠️ Delvis (livshistorie, men delt med familie)	✔️ Ja (dagbok/skjema med fritekst)

# Dagbok – deling kontroll	❌ Kan ikke dele til utvalg (kun alle/ingen)	✔️ Granulær deling pr side

# notion.com

# ⚠️ Mulig via prosjektdeling pr bruker	⚠️ Ukjent (trolig privat, ev. deling begrenset)	❌ Ingen individuell deling (alt delt med inviterte)	✔️ Admin har tilgang; pasient kan se egne

# Admin oppfølging	✔️ Ser svar på event, poll, oppgaver; manuell oversikt	✔️ Kan bygge oversikt (krever konfigurering)	✔️ Innebygget oppgaveliste, status og dashboard	✔️ Dashboard med trender \& rapporter

# lifekeys.no

# ❌ Ikke relevant (ingen “svar” å følge opp)	✔️ Klare rapporter, grafer for utvikling

# Varsling/påminnelse	✔️ Push/epost for invitasjoner, kan minne på polls

# help.spond.com

# ⚠️ Ingen auto-påminnelse (må gjøres manuelt/eksternt)	✔️ Påminnelser om frister (e-post/app)	✔️ Ja (push for oppgaver/surveys)	–	✔️ Ja (automatisk påminnelse om skjema)

# Personvern (GDPR)	✔️ GDPR-ok, data i EU

# help.spond.com

# help.spond.com

# ⚠️ GDPR-ok, men data trolig USA-basert	⚠️ GDPR-ok, servere utenfor Norge	✔️ GDPR, designet for helse (Norge)	✔️ GDPR, unngår helseopplysninger	✔️ Fullt helse-nivå (brukes av sykehus)

# checkware.no

# Papir -> digital	✔️ Bildelasting via app

# help.spond.com

# ✔️ Bildefil på side	✔️ Vedlegg på oppgave	⚠️ Ikke primær fokus (mulig begrenset)	⚠️ Kan dele bilde, ikke tilpasset scanning	✔️ Egen modul eller melding med vedlegg

# Motiverende elementer	❌ Ingen innebygde poeng/belønning	❌ Ingen (kan lage manualt opplegg)	❌ Ingen (kun “konfetti” ved oppg.fullføring)	⚠️ Indirekte (viser fremdrift, mestring via resultater)	❌ Nei	⚠️ Indirekte (framdrift i program, resultater)

# Tilgangsnivåer	✔️ Medlem / begrenset admin / full admin

# help.spond.com

# ✔️ Eier / medlem / gjest

# notion.com

# &nbsp;(kan styres pr side)	✔️ Medlem / commenter / admin

# asana.com

# ✔️ Bruker / admin (egne grupper)	⚠️ Beboer / pårørende / personal (ikke hierarki for prosjekt)	✔️ Pasient / behandler / administrator (rolleoppsett)

# Avgrense per prosjekt	✔️ Ja (egen gruppe per prosjekt)	✔️ Ja (egen workspace eller sider per prosj.)	✔️ Ja (prosjekt og team tilgang styrer det)	✔️ Ja (separat oppsett for grupper)	– (ikke relevant, individuelt fokus)	✔️ Ja (tilgang pr behandlingsforløp/progr.)

# Dataeksport	⚠️ Begrenset (polls/CSV, ingen API)

# help.spond.com

# ✔️ Ja (eksport sider, API finnes)	✔️ Ja (CSV eksport, API)	⚠️ Trolig via portal (rapporter, ikke åpen API)	❌ Nei (ingen standard eksport utover manuelt)	✔️ Ja (rapporter, CSV og API mulig)

# Norsk språk	✔️ Ja (app og hjelp på norsk)	✔️ Ja (Norsk UI beta)	❌ Nei (per 2025, svensk finnes)	✔️ Ja (innhold og støtte på norsk)	✔️ Ja (hele systemet norsk)	✔️ Ja (system på norsk)

# App \& web	✔️ Begge deler (fullverdig)	✔️ Begge (mobilapp og nett)	✔️ Begge	✔️ Begge (portal på web, bruker-app)	✔️ App (web for admin)	✔️ Web (pasient via web, ingen egen app men mobilvennlig)

# Kostnad / tilgang	✔️ Gratis (full bruk)	✔️ Gratis\* (grunnfunksjoner; team-plan koster)	✔️ Gratis\* (opp til 15 pers; premium koster)	❌ Kostnad per bruker (abon. modell)

# lifekeys.no

# ❌ Kun via avtale (kommuner)	❌ Kostbar (lisensiert til helseorg.)

# Legend: ✔️ = oppfyller, ⚠️ = delvis / kan tilpasses, ❌ = oppfyller ikke, (– = ikke relevant) <br>

# Gratisversjoner av Notion/Asana har begrensninger (færre medlemmer eller funksjoner); kan likevel være tilstrekkelig for liten pilot.

# Anbefaling og forslag til strukturering

# Basert på vurderingene over peker Lifekeys seg ut som en svært god match for Camino-prosjektet, spesielt på de kritiske punktene dagbok og administrativ innsikt. Lifekeys-plattformen er laget for å fremme mental mestring og har funksjoner for både digital dagbok og spørreundersøkelser med trendgrafer – noe som treffer pilotens mål. I tillegg er den norsk, personvernet er gjennomtenkt for helsedata, og den har både app og webportal. Ulempen er kostnad og at det krever dialog med leverandøren for oppsett. Hvis budsjettet tillater det, vil Lifekeys kunne gi pilotdeltakerne en moderne opplevelse hvor de logger seg inn daglig, får dagens oppgave/innhold, skriver sin dagbok i appen, og hvor prosjektleder via portalen kan følge med og støtte underveis. Hvordan strukturere Camino-prosjektet i Lifekeys: Man kan sette opp et eget program i plattformen kalt f.eks. “Camino Mestring 14-dagers” der hver dag har en modul:

# Dag 1: Inneholder tekst om dagens etappe/tema. Tildelt oppgave: “Skriv en refleksjon i dagboken din om …”. Kanskje også et par spørsmål (1–10 skala om dagsform, etc.).

# ... og så videre for hver dag.

# Deltakerne får notifikasjon hver dag om å fullføre dagens modul. De skriver i dagboken (som kan ligge integrert i modulen, eller separat men man instruerer dem). Administrator bruker Insight-portalen til å sende ut eventuelle meldinger (f.eks. “Husk å fyll ut i kveld”) og til å se besvarelsene. Dersom dagboken i Lifekeys er helt privat, kan man be deltakerne kopiere ut noe de vil dele inn i et skjema som admin kan lese, eller eventuelt få tilgang som “psykolog” i systemet for å lese dagbokposter (detaljer avklares med Lifekeys). Siden deltakerantallet er lite, går det også an å avtale ukentlige videomøter med en psykolog via Lifekeys som en del av pilotens støtte, hvis ønskelig – det er en ekstra mulighet plattformen har.

# Dersom Lifekeys av en eller annen grunn ikke er tilgjengelig eller ønskelig, vil vi se på nest beste alternativ:

# Spond kombinert med fysiske dagbøker: Dette alternativet gir robust struktur og enkel kommunikasjon, men selve dagboknotatene føres for hånd. Deltakerne kan så velge å dele dem ved å ta bilder og sende til admin (privat). Admin kan føre en logg over deltakernes progresjon manuelt. Motivasjon kan ivaretas ved at man i Spond-gruppen legger ut jevnlige oppmuntringer, og kanskje et poengsystem offline (for eksempel at man fysisk deler ut små belønninger underveis på turen). Fordelen med denne modellen er at Spond er gratis og velkjent – terskelen for deltakerne er lav. Ulempen er at mye oppfølging blir analogt/manuelt, og man mister muligheten til å analysere data (man får f.eks. ikke lett ut alt deltakerne har skrevet for evaluering uten å transkribere bilder).

# Notion som prosjektplattform: Her får man fleksibilitet til å gjennomføre alt digitalt. For eksempel kan man sette opp en Notion workspace for Camino-prosjektet. Lage en side for hver dag med info og en oppgave, samt en mal for dagbokoppføring. Gi hver deltaker en privat side (eller database) der de kopierer inn dagbokmalen hver dag og fyller ut. Administrator kan strukturere det slik at de private dagboksidene er delt med admin. Man kan også ha en hovedside med oversikt (hvor admin kan krysse av etter hvert som dagbøker kommer inn). Dette vil tilfredsstille kravene ganske bra: deltakerne vil ha én innlogging (Notion) og finne alt der. Dog krever det litt opplæring – Notion er ikke laget for 5 tilfeldige personer uten teknisk bakgrunn, så man må lage en lettfattelig navigasjon til dem. Personvern er greit hvis man unngår de mest sensitive temaene (Notion er ikke EU-basert hosting per nå). Notion kan anbefales hvis man har en person på admin-siden som liker å sette opp systemer og deltakerne er komfortable med PC/mobilverktøy utover det vanlige.

# Asana for oppgaver + annet for dagbok: Asana alene kan håndtere mye, men som diskutert er dagbok i Asana litt unaturlig. En idé er å bruke Asana til å styre alle oppgavene (f.eks. “Gjennomfør dagens refleksjon” som en oppgave som deltaker huker av), mens selve dagboktekstene kan deltakerne skrive i et annet privat rom. Det kunne være så enkelt som at de deler et Google Docs med admin for sin dagbok, eller til og med en delt OneNote. Dette er ikke ideelt – det sprer informasjonen – men lar Asana fokusere på oppgavestyringen (hvor det er sterkt) og et annet verktøy brukes for fritekst (der Asana er svakt). Et slikt oppsett begynner å bli tungvint, så det er kun aktuelt hvis man av en eller annen grunn må bruke gratisverktøyene og finner Spond utilstrekkelig.

# Konklusjon: Valg av system bør baseres på hvilke krav som er absolutt nødvendige å oppfylle, og ressurser tilgjengelig:

# Hvis privat dagbokoppfølging er avgjørende og man ønsker profesjonell helsesektor-standard: Gå for en spesialisert plattform som Lifekeys (eller CheckWare via en samarbeidspartner) – det vil gi det beste faglige utbyttet og trygghet rundt data. Lifekeys vil samtidig gi brukervennlig app-opplevelse for deltakerne, noe som kan øke engasjementet.

# Hvis budsjett eller kompleksitet gjør at man heller vil ha en enkel løsning deltakerne allerede kan bruke: Spond er et trygt valg for struktur og kommunikasjon. Man kan gjennomføre pilotprosjektet med Spond ved å fokusere på gruppe-aktiviteter og la selve dagboken være et valg fritt for deltakerne (papir eller digitalt ved siden av). Spond vil fungere fint for å dele turinformasjon daglig og for at admin kan stille spørsmål og motta noe respons (f.eks. via avstemninger eller meldinger). Sørg i så fall for å avtale tydelig med deltakerne hvordan de skal levere/reflektere (f.eks. “skriv i notatboka, og ta kontakt med veileder om du trenger det”).

# Mellomløsninger (Notion, Asana): Disse kan vurderes hvis man har entusiasme for å sette dem opp. De kan oppfylle kravene, men krever mer administrativ konfigurasjon. En Notion-workspace kan fint oppbevare alt fra reiseplan til dagbøker på ett sted og eksporteres til en rapport i etterkant. For en engasjert pilotleder som liker digital struktur kan dette være et givende alternativ.

# Uansett valg, bør man gjøre en kort pilot/test internt i forkant: legg opp et par “dager” og la noen prøve som om de var deltaker, for å avdekke brukeropplevelsen. Spesielt dagbokflyten er viktig å teste – deltakerne må forstå hvor og hvordan de skal skrive, og føle seg trygge på personvernet rundt det. Anbefalt valg: Lifekeys vurderes som best oppfyllende. Hvis ressurser tillater, bør prosjektet ta kontakt med Lifekeys og presentere behovene – det er mulig de kan tilby en pilot-avtale. Alternativt, Spond kan brukes dersom man håndterer dagbok utenfor. Da drar man nytte av Sponds enkelhet for det organisatoriske, og man kan heller inkludere en fysisk/digital dagbok som en parallell aktivitet. Camino-prosjektet har ambisiøse krav til både struktur og personlige prosesser – det perfekte system finnes knapt “rett ut av boksen”. Valget står derfor mellom å prioritere enkel brukeropplevelse (Spond) vs. prioritere rik funksjonalitet for dagbok og måling (Lifekeys eller lignende). Denne rapporten har belyst at Spond vil være enklest å ta i bruk men mangler dagbok, mens Lifekeys (eller en helseplattform) vil dekke dagbok og oppfølging meget godt mot mer innsats og kost. Avslutningsvis bør prosjektgruppen vurdere hvor viktig den daglige digitale dagboken er for pilotens suksess. Hvis det er selve kjernen, gå for verktøyet som best støtter det (selv om det betyr å lære noe nytt eller betale litt). Om dagboken like gjerne kan skrives på papir for så å bli samtalegrunnlag, kan man trygt velge en enkel løsning som Spond for resten. Ved å holde fokus på brukernes mestringsopplevelse og dataenes sikkerhet, vil man kunne lykkes uansett valg av plattform.

# 

# 

# 

# 

# 

# 

# Sources

# You said:

# Uploaded image

# \- Se om "workaround" kan gjøres relativt brukervennlig med at jeg kan kopiere "hovedgruppe" til individuelle "undergrupper" med samme event/prosjekter hvor deltager kan føre dagbok for hver dag/event prosjekt: b) sette opp kreative løsninger som en privat undergruppe per deltaker for å samle dagbøker (noe som er mulig, men gir mer administrativt merarbeid og ikke er en bruksmessig elegant løsning for deltakerne).

# \- Kom gjerne med andre proaktive forslag for et best mulig oppsett

# \- Jeg er nå igang å lage en test på Spond. Jeg valgte Scouting som gruppe. Kan du gi en steg for steg oppsett for videre

# ChatGPT said:

# Updated saved memory

# Flott at du er i gang med testen i Spond! Her er en konkret og strukturert steg-for-steg-guide samt forslag til hvordan du kan bruke undergrupper for dagbokføring, samtidig som du bevarer brukervennlighet og minimerer administrativt merarbeid.

# 

# ✅ Mål:

# Lage en hovedgruppe for Camino-piloten

# 

# Lage én undergruppe per deltaker (for privat dagbok og oppfølging)

# 

# Kopiere daglige events fra hovedgruppe til hver undergruppe

# 

# Oppnå god struktur, motivasjon og personvern

# 

# 🧭 Steg-for-steg-oppsett i Spond

# 1\. Opprett hovedgruppen

# Gå til: https://spond.com/client/groups

# 

# Skriv inn gruppenavn, f.eks. Camino 2025 – Pilotgruppe

# 

# Velg "Scouting" som aktivitetstype (du har gjort dette)

# 

# Klikk Next

# 

# 2\. Legg til undergrupper – én per deltaker

# Klikk på + Add subgroup

# 

# Navngi etter formatet: Dagbok – \[Fornavn], f.eks. Dagbok – Lise

# 

# Legg til én undergruppe for hver deltaker (5 stk)

# 

# Disse brukes som privat dagbokrom mellom deltaker og admin

# 

# Klikk Next

# 

# 💡 Fordel: Undergruppene er isolerte. Deltakerne ser bare sin egen, og kan dermed skrive fritt uten at andre deltakere får innsyn.

# 

# 3\. Legg til deltakere i hver undergruppe

# Etter opprettelse, gå inn på hver undergruppe og inviter bare:

# 

# Den aktuelle deltakeren

# 

# Admin(er) med oppfølgingsansvar

# 

# På den måten har du full personvernsisolering.

# 

# 4\. Lag hoved-eventrekke i hovedgruppen

# Lag daglige hendelser (f.eks. "Dag 1 – Porto", "Dag 2 – Vila do Conde", osv.)

# 

# Legg til:

# 

# Informasjon om dagen

# 

# Oppgaver via “Tasks” (f.eks. “Skriv dagbok”, “Svar på spørsmål”)

# 

# Last gjerne opp en fil eller bilde av dagens rute

# 

# 5\. Kopier disse events til undergruppene

# Gå til en undergruppe (f.eks. Dagbok – Lise)

# 

# Lag samme event som i hovedgruppen, men:

# 

# Endre navnet til noe personlig, f.eks. “Dag 1 – Lise sin refleksjon”

# 

# Legg til en oppgave: “Skriv dagboktekst og legg til i kommentar, eller last opp bilde av fysisk dagbok”

# 

# 🔁 Dette er manuelt, men med 5 deltakere og 14 dager er det håndterbart – særlig hvis du lager en mal og kopierer.

# 

# 💡 Proaktive forbedringer og forslag

# 🔁 Bruk "kopi-mal" for events

# Lag først én “mal” for daglig event med oppgaver

# 

# Bruk denne for alle dagene og for alle deltakere (ved å duplisere og tilpasse)

# 

# 📋 Logg ark for admin

# Lag en enkel oversikt i Excel eller Notion der du fører:

# 

# Hvem som har skrevet hva, når

# 

# Manglende innsendinger (hvis aktuelt)

# 

# Kommentarer som krever oppfølging

# 

# 📸 Papirdagbok – bildeopplasting

# Instruer deltakere i undergruppen sin om:

# 

# “Ta bilde av dagboksiden og legg ved som kommentar eller last opp i meldingsfeltet”

# 

# Dette er svært enkelt fra mobilen

# 

# 🧩 Enkelt poengsystem

# Du kan poste i hovedgruppen en gang per uke:

# 

# “Ukas Camino-helter: Disse har skrevet dagbok hver dag 💪👏”

# 

# Ikke fullt gamification, men nok til å skape motivasjon

# 

# 🎯 Fordeler med denne strukturen

# Fordel	Hvordan oppnås

# Personvern	Hver deltaker kun i sin egen undergruppe

# Struktur og forutsigbarhet	Daglige events med tydelig info og oppgave

# Brukervennlighet for deltaker	All info og dagbok på ett sted – i mobilappen

# Lett oppfølging for admin	Du får varsler, og kan se dagbokkommentarer i én kanal

# Skalerbart	Kan enkelt gjentas for nye prosjekter eller grupper

# 🚦 Videre neste steg

# Fullfør opprettelsen av hovedgruppen og undergrupper

# 

# Lag dag 1-event i hovedgruppen (inkl. oppgaver)

# 

# Lag dag 1 i hver undergruppe (med refleksjonsoppgave)

# 

# Inviter admin og én deltaker til å teste første dag

# 

# Si fra når du er klar, så hjelper jeg deg gjerne med å:

# 

# Lage forslag til standardtekster for events og dagboksoppgaver

# 

# Lage et enkelt “progresjonsark” i Excel/Notion

# 

# Skrive brukerveiledning til deltakerne (f.eks. hvordan bruke appen og skrive dagbok)

# 

# Ønsker du å teste noen av de andre systemene i parallell, kan vi også sette opp et komprimert testscenario i f.eks. Notion eller Lifekeys.

# 

# You said:

# Uploaded image

# Da har jeg laget eksempler på undergrupper med fiktive navn. Jeg skal koble disse med fiktive test deltagere. Kan du lage revidert steg for steg plan som er så reell så mulig. Bruk aktuell, detaljert, oppdatert data/opplysninger fra chatten "Pilotprosjekt for mestring". Ta med så mye informasjon og detaljer som mulig for et reelt og brukervennlig oppsett i Spond

# ChatGPT said:

# Flott! Du har nå satt opp undergrupper i Spond med testnavn – og dette gir et meget godt utgangspunkt for et realistisk og brukervennlig oppsett for Camino-pilotprosjektet. Nedenfor får du en revidert og detaljert steg-for-steg-plan for oppsett i Spond basert på all relevant informasjon fra chatten Pilotprosjekt for mestring, inkludert målsetning, verdigrunnlag og praktiske behov.

# 

# 🧭 REVIDERT STEG-FOR-STEG-PLAN FOR SPOND – CAMINO 2025

# 🎯 Mål:

# Skape et trygt, strukturert og motiverende system for oppfølging og egenrefleksjon gjennom daglig oppmøte, dagbok, praktisk info og administrativ støtte – for inntil 5 deltakere + 2–3 admin i et lavterskel mestringsprosjekt i bevegelse.

# 

# 1\. Opprettelse av hovedgruppe

# Felt	Innhold

# Gruppetype	Scouting (valgt)

# Navn	Camino 2025 – Pilotgruppe

# Beskrivelse	Hovedgruppe for Camino-prosjektet, inkl. fellesinfo og deling

# Varslinger	Push for app-brukere, e-post eller SMS for øvrige

# 🛠 Hva skjer her?

# 

# Hovedgruppen fungerer som kommunikasjonsnav for fellesmeldinger, motivasjonsinnhold og ukentlig oppsummering.

# 

# Her publiseres også overordnede “milepæler” og info som gjelder alle deltakere.

# 

# 2\. Opprettelse av undergrupper

# Undergruppe	Bruksområde

# Dagbok – Sander	Privat dagbok og kommunikasjon

# Dagbok – Ole	Privat dagbok og kommunikasjon

# Dagbok – Kari	Privat dagbok og kommunikasjon

# Dagbok – Felles	Frivillig refleksjonsdeling

# 🔐 Personvern:

# 

# Bare deltaker og admin(er) har tilgang til sin respektive dagbok-gruppe.

# 

# Dagbok – Felles er valgfri og anonym hvis ønskelig.

# 

# 📲 Tips til deltakeropplevelse:

# 

# “Alt du trenger er i denne ene gruppa”

# 

# Deltaker får én melding per dag og ett sted å skrive dagbok

# 

# Mulighet for å legge inn bilde, lyd eller video for de som heller vil uttrykke seg slik

# 

# 3\. Administrativ rollefordeling

# Admin	Rolle

# Admin A	Full tilgang – struktur og daglig publisering

# Admin B	Begrenset – kun tilgang til spesifikke grupper

# Admin C	Observatør/backup (om ønskelig)

# 🧩 Tips:

# 

# Bruk rollen “Hovedgruppe-admin” med tilgang til alle

# 

# Undergruppene kan ha egne admins for mer personlig oppfølging

# 

# Kan deles mellom for eksempel en veileder og en psykolog

# 

# 4\. Oppsett av dagsaktiviteter ("events")

# 📅 Format for daglige events:

# 

# Felt	Eksempel

# Event-navn	Dag 1 – Porto til Vila do Conde

# Beskrivelse	Praktisk info + inspirasjon + refleksjonstema

# Oppgaver	“Hva var mest utfordrende i dag?”

# Vedlegg	Kart, bilde, kort video, refleksjonsøvelse

# Synlighet	Privat i undergruppe + valgfritt deling i felles

# 🔁 Gjenbruk:

# 

# Lag en “dag 1-mal” → dupliser og juster for hver ny dag

# 

# Publiser samme event (evt. med navn ‘Dag X – \[Navn]’ i undergrupper)

# 

# 5\. Dagbokinnlevering

# 📓 Slik skriver deltaker dagbok:

# 

# Enten rett i meldingsfeltet (“Kommentarfeltet” i eventet)

# 

# Eller ved å laste opp bilde av håndskrevet dagbok

# 

# Evt. lydklipp eller video – alt støttes

# 

# 🎯 Standard melding i event:

# 

# «I dag ønsker vi at du reflekterer over:

# 

# Hva ga deg energi?

# 

# Hva kjente du på mentalt?

# 

# Ønsker du å dele dette videre i Felles-dagbok (valgfritt)?»

# 

# 6\. Oppfølging og motivasjon

# 👁 For admin:

# 

# Du får varsel når deltaker publiserer noe i gruppa

# 

# Du kan svare med emoji, kommentar eller personlig melding

# 

# Du kan se alle events og innsendinger under “Events” > “Past”

# 

# 🏅 Motivasjonstiltak:

# 

# Ukentlig melding i hovedgruppe:

# 

# «Alle som har levert 7 av 7 dagbøker denne uken får Camino-stjerne ⭐»

# 

# Del refleksjoner i anonymisert form i fellesgruppa (frivillig)

# 

# 7\. Avslutning og eksport

# 📤 Eksport av data:

# 

# Gå til en event, klikk “Export responses” (CSV/PDF)

# 

# Last ned dagboknotater for dokumentasjon eller evaluering

# 

# Admin kan lagre individuelle logger eller gjøre samlet vurdering

# 

# 📚 Oppsummering per deltaker:

# 

# En admin lager “tilbakeblikk” med nøkkelpunkter

# 

# Deltaker får oppsummering + evt. neste steg

# 

# 📦 Andre verktøy som kan støtte Spond

# Verktøy	Bruk

# Google Disk	Lagring av bilder/skanninger av papirdagbøker

# Notion	Intern admin-logg og evaluering

# Forms (Google/Microsoft)	Supplerende undersøkelser/tilbakemelding

# 🎁 Klar for test?

# Neste steg:

# 

# Klikk “Create group” på oppsettet du har laget

# 

# Inviter testbrukere (test-epost eller kolleger)

# 

# Lag 2–3 test-events i en privat undergruppe

# 

# Skriv en test-dagbokinnsending som om du var deltaker

# 

# Evaluer som admin: får du varsel? Er det brukervennlig?

# 

# Ønsker du nå:

# 

# Standardtekstmaler for daglige events?

# 

# Enkel illustrasjon over gruppe/struktur?

# 

# En felles oversiktsside for admin i Notion eller Excel?

# 

# Jeg kan sette opp dette umiddelbart.

# 

# You said:

# Jeg limer inn denne i chat her, da det var en teknisk diskusjon. Jeg ønsker fremdeles å bruke Spond til mest mulig, med supplimenter der det må for privat dagbok, ell. Kan du gi en Steg for Steg med reelle data fra chatten Pilotprosjekt for mestring som jeg kan ligge inn i Spond, samt inkluder nødvendige tillegsløsninger beskrevet under:

# 

# Takk, det er svært nyttig! Jeg setter nå i gang med å identifisere og anbefale:

# 

# \* Et oppsett for digital dagbok og aktivitetsplan med online tilgang, tilpasset bruk i gruppe (f.eks. Camino-prosjektet), som speiler NAVs begreper og metodikk der relevant.

# \* Enkle skytjenester (OneDrive, Google Drive m.fl.) for fildeling og administrasjon.

# \* Eksisterende gratis/åpne systemer som kan brukes til deltakerens personlige refleksjon/journal og samtidig ha en adminvisning eller eksportfunksjon.

# \* Et forslag til hvordan strukturen i NAVs aktivitetsplan (basert på innsikten fra rapporten “Utydelig til stede”) kan gjenskapes eller speiles i f.eks. Google Forms/Sheets eller Microsoft Forms/Lists for testing og fremtidig integrasjon.

# 

# Jeg vil også vurdere skalerbarhet, GDPR-vurderinger, og hvordan dette lett kan presenteres som en prototype for NAV eller fond. Jeg gir beskjed så snart den funksjonelle oversikten er klar.

# 

# 

# \# Digitalt system for Camino-piloten: Anbefaling og oppsett

# 

# \## Oversikt og krav til løsningen

# 

# Camino-pilotprosjektet trenger en digital plattform der hver deltaker kan \*føre en privat dagbok\* med daglige refleksjoner og oppgaver, samt \*følge en aktivitetsplan\* som ligner NAV sin. Systemet må la deltakeren loggføre personlige notater (som veileder kun ser ved samtykke), motta oppgaver strukturert som i NAVs aktivitetsplan (med \*\*mål, aktiviteter, dialog, progresjon\*\* osv.), og la prosjektleder administrere det hele effektivt. På sikt bør data enkelt kunne overføres eller integreres med NAVs egne systemer (f.eks. via eksport til Word/Excel/Forms eller gjennom et API).

# 

# For pilotfasen anbefales det å bruke \*\*gratis eller lavterskel skytjenester\*\* – for eksempel verktøy fra \*\*Google Workspace\*\* eller \*\*Microsoft 365\*\* – fordi disse gir rask oppsett, enkel tilgang via nettleser/mobil og kjente grensesnitt. Under presenteres to alternative oppsett (Google-basert og Microsoft-basert) som begge ivaretar behovene. Løsningene vektlegger gjenkjennelig struktur fra NAVs aktivitetsplan, god personvern/sikkerhet, og mulighet for senere skalering eller migrering til NAVs plattform. Forslaget er praktisk gjennomførbart, raskt å teste ut i liten skala, og gjør det lett å dokumentere og evaluere tiltaket underveis.

# 

# \## Valg av plattform: Google Workspace vs. Microsoft 365

# 

# \*\*Google Workspace (eller gratis Google-verktøy)\*\* tilbyr Google Skjemaer, Dokumenter og Regneark som kan brukes for å lage dagbøker og aktivitetsplaner. Fordelen er at det er gratis for alle med Google-konto, brukervennlig på mobil og PC, og krever minimalt av teknisk oppsett. Google Skjema er særlig egnet for en daglig journal: deltakeren kan fylle ut et skjema fra mobil/PC, og svarene lagres automatisk i et Google Regneark. Dette gjør det enkelt å \*spore utvikling over tid\* og analysere eller eksportere data senere. Man kan dessuten skreddersy spørsmålene i skjemaet (f.eks. refleksjonsspørsmål hver dag) etter prosjektets behov. Google Drive kan huse en mal for aktivitetsplan som kopieres for hver deltaker. Google-verktøy er kjent for en \*lav terskel\*: deltakerne trenger bare klikke en lenke for å skrive i dagboken, og veileder/prosjektleder kan få tilgang til regnearkene sentralt.

# 

# \*\*Microsoft 365\*\* (f.eks. gjennom en test-tenant eller bruk av gratisversjoner der mulig) gir tilsvarende muligheter via Microsoft Forms, OneNote/Word Online, Excel Online eller \*\*Microsoft Lists\*\*. MS Forms kan benyttes likt som Google Skjema for daglige innrapporteringer, med datafangst inn i Excel. Alternativt kan OneNote brukes som digital dagbok med deling. Microsoft Lists (en app i 365) egner seg godt for å lage en digital aktivitetsplan: det er i praksis delte lister (tabeller) som kan inneholde kolonner for mål, aktiviteter, frister, status, notater osv., og som kan deles med den aktuelle deltakeren og veileder. Lists kommer med ferdige maler (f.eks. “Issue tracker” eller “Work progress tracker”) som kan tilpasses. Fordelen med Microsoft-løsningen er at den ligger nær opp til verktøy NAV selv bruker (NAV benytter bl.a. Office 365). Data i Excel/Lists kan enklere migreres inn i offentlige systemer senere, og plattformen oppfyller strengere sikkerhetskrav (lagring i EU, avtaler for offentlig sektor, etc.). Ulempen er at det kan kreve at deltakerne har en Microsoft-konto eller at man oppretter gjestebrukere for dem i systemet. For pilotformål kan man eventuelt bruke gratisversjonen av OneDrive/Excel for deling (eller opprette et begrenset antall Microsoft 365-lisenser for pilotdeltakerne).

# 

# \*\*Oppsummert valg:\*\* Begge plattformer kan oppfylle kravene. \*\*Google Workspace\*\*-tilnærmingen gir rask og enkel start uten kostnad – fint for en rask pilot med digitale dagbøker via skjema og aktivitetsplan som regneark. \*\*Microsoft 365\*\*-tilnærmingen kan på sin side være mer fremtidsrettet ift. integrasjon mot NAV, ved å bruke lignende teknologi som NAV (Excel/Lists/Forms). I det følgende beskrives et oppsett som kan gjøres med begge plattformer: vi forklarer struktur basert på aktivitetsplanen til NAV, og gir konkrete forslag til implementasjon med Google- og Microsoft-verktøy.

# 

# \## Etterligning av NAVs aktivitetsplan i struktur og begreper

# 

# For at deltakerne og veilederne skal kjenne seg igjen, bør det digitale systemet bruke samme \*struktur og terminologi\* som NAVs egen aktivitetsplan. En aktivitetsplan hos NAV inneholder typisk:

# 

# \* \*\*Mål:\*\* Deltakerens hovedmål (f.eks. “Komme i jobb som kokk”). I NAVs plan registrerer brukeren sitt mål, som både bruker og veileder kan se.

# 

# \* \*\*Aktiviteter:\*\* Konkrete aktiviteter eller tiltak brukeren skal gjennomføre for å nå målet, f.eks. “Delta på jobbsøkerkurs”, “Oppdatere CV”, “Melde meg på treningsgruppe”. Aktiviteter i NAV-planen opprettes av bruker eller veileder, og kan ha frister og statuser.

# 

# \* \*\*Status for aktiviteter:\*\* Indikasjon på progresjon – i NAV sin digitale plan markeres om en aktivitet er fullført, pågår, avbrutt etc. (NAVs grensesnitt viser f.eks. aktivitetskort med status som “Planlagt”, “Gjennomføres”, “Fullført”, “Avbrutt” etc., se figur 1).

# 

# \* \*\*Veiledernotater/møtereferat:\*\* Felt der veileder kan notere oppfølging, f.eks. oppsummering fra veiledningssamtaler. I NAVs løsning kan veileder legge inn referat fra møter direkte i aktivitetsplanen.

# 

# \* \*\*Dialog:\*\* En logg eller meldingstjeneste for kommunikasjon mellom deltaker og veileder. NAV har en egen dialogfunksjon integrert, som ligner meldingstråder. I vår pilotløsning må vi finne en måte å fange opp dialog – enten som kommentarer i dokumenter, eller bruke et tillegg (evt. egen chat-kanal). For pilotformål kan en enkel løsning være at deltaker skriver meldinger/spørsmål som del av dagboken eller i et delt notatfelt, og veileder svarer der.

# 

# \* \*\*Progresjon/oppfølging:\*\* Oversikt over framdrift. I NAVs aktivitetsplan vil både deltaker og NAV-veileder til enhver tid se hvilke aktiviteter som er planlagt, fullført osv., og dette hjelper begge parter å følge med. I pilotløsningen bør det derfor være tydelig merking av hva som er gjennomført og hva som gjenstår for hver deltaker.

# 

# \&#x20;\*\*Figur 1: Skjermbilde av NAVs digitale aktivitetsplan.\*\* Denne viser hvordan brukeren ser målet sitt (“Mitt mål”) og kan \*\*“Legg til aktivitet”\*\*, samt en oversikt over aktiviteter sortert på status (Planlegger, Gjennomføres, Fullført osv.). Vårt system bør etterligne slike begreper for gjenkjennelighet for deltakerne.

# 

# For å etterligne dette, bør vi utforme pilotens datafelter slik at de tilsvarer disse punktene. Konkret foreslås følgende struktur i våre verktøy:

# 

# \* \*\*Dagbok (privat journal):\*\* Dette er uten direkte NAV-analog, men fungerer som et ekstra element i Camino-piloten. Strukturen kan være fri tekst per dag, men man kan også inkludere \*støttespørsmål\* som hjelper deltakeren å reflektere (f.eks. “Hva var dagens høydepunkt?”, “Hvilke utfordringer møtte du i dag?”). Dette ligner en Q\\\&A-form for daglig journalføring. Journalsvarene trenger ikke følge en NAV-mal, men bør kunne knyttes til aktiviteter/mål (“Hvordan bidro dagens aktivitet til målet ditt?”).

# \* \*\*Mål:\*\* I aktivitetsplan-dokumentet registreres deltakerens hovedmål. Dette kan være et eget tekstfelt øverst på et ark (Google Sheet) eller en kolonne i en liste (Microsoft Lists) hvor mål beskrives. Hvis deltakeren har flere delmål, kan man liste dem opp.

# \* \*\*Aktivitetstabell:\*\* Hoveddelen av aktivitetsplanen er en tabell med kolonner som:

# 

# &nbsp; \* \*Aktivitet:\* Beskrivelse av oppgaven/aktiviteten.

# &nbsp; \* \*Frist/dato:\* Tidsfrist eller planlagt dato for aktiviteten.

# &nbsp; \* \*Status:\* Verdier som “Planlagt”, “Gjennomføres”, “Fullført”, “Avbrutt” – i en Google Sheet kan dette være en rullegardinliste med disse valgene, og i Microsoft Lists kan det være en Choice-kolonne med tilsvarende alternativer.

# &nbsp; \* \*Ansvarlig/veileder:\* Hvem som skal følge opp (kan for pilot bare stå veiledernavn eller initialer).

# &nbsp; \* \*Notater:\* Et felt for kommentarer, hvor veileder kan skrive inn f.eks. referat eller oppfølgingsnotat til aktiviteten.

# \* \*\*Dialog/kommentarer:\*\* For pilotens del kan dialog håndteres ved at veileder skriver i notatfelt eller som kommentarer i dokumentet. Google Regneark tillater f.eks. kommentarbobler per celle som veileder og deltaker kan bruke til samtale. I Microsoft Lists/Excel kan man også legge inn kommentarer eller ha et eget felt “Dialog” hvor meldinger legges inn kronologisk (dette er ikke like elegant som en chat, men mulig). Alternativt kan en delt \*\*OneNote-side\*\* brukes spesifikt til dialog mellom deltaker og veileder, siden OneNote støtter at flere skriver samtidig og synliggjør navnet på forfatteren – men dette er en tilleggsidé dersom det trengs mer chat-lignende funksjonalitet.

# 

# Ved å speile NAVs språk og felter (mål, aktivitet, status, veiledernotat, dialog), vil deltakerne oppleve at pilotens plan ligner det de senere vil møte i NAV. Dette gjør overgangen enklere og sørger for at dokumentasjonen fra pilotfasen potensielt kan oversettes til NAVs format.

# 

# \## Forslag til struktur og oppsett av løsningen

# 

# Nedenfor foreslås et konkret oppsett som kombinerer en \*\*daglig digital dagbok\*\* for hver deltaker og en \*\*aktivitetsplan-fil\*\* per deltaker, satt opp enten i Google- eller Microsoft-miljøet. Oppsettet er modulært – man kan begynne med gratis Google-verktøy for enkelhet, eller benytte tilsvarende i Microsoft 365 hvis det er tilgjengelig.

# 

# \### Daglig digital dagbok (privat journal)

# 

# \*\*Verktøy:\*\* \*Google Skjema\* (Google Forms) anbefales for å loggføre daglige refleksjoner. For hver deltaker lages et individuelt skjema kalt f.eks. “Dagbok – \\\[Navn]”. Dette skjemaet består av et sett spørsmål som deltaker besvarer hver dag. Minste oppsett kan være ett åpent tekstfelt (“Dagens refleksjon”), men man kan gjerne ha flere spørsmål for strukturert refleksjon: for eksempel “Hva gjorde du i dag?”, “Hvordan følte du deg?”, “Er det noe du trenger hjelp med?”. Google Skjema lar oss enkelt tilpasse slike spørsmål. Svarene sendes inn ved å trykke \*Send\*, og skjemaet kan fylles ut på nytt hver dag (ubegrenset antall ganger).

# 

# Hvert skjema er privat for den enkelte deltaker; kun prosjektleder/veileder (skjemaeier) har innsyn i svarene. Dersom veileder skal ha innsyn kun ved samtykke, kan man avtale at deltakeren periodisk gir tilgang eller deler sin dagbok-data – men i praksis, for enkelhet, vil veileder allerede ha teknisk tilgang siden de står som eier av skjemaet/svar-arket. Et samtykke kan innhentes ved oppstart av pilot.

# 

# \*\*Gjennomføring:\*\* Deltakeren kan åpne skjemaet via en fast lenke. For å gjøre det enkelt, kan prosjektleder generere en \*kort lenke eller QR-kode\* til hver deltakers skjema. Man kan også utnytte at mobiltelefoner lar deg lagre en nettside som ikon på hjemskjermen – deltakerne kan legge til dagbokskjemaet sitt som et “app-ikon” på telefonen for kjapp tilgang. Google Skjema fungerer utmerket på mobil; deltakerne kan \*\*loggføre sine svar når som helst via smarttelefon, nettbrett eller PC\*\*.

# 

# For å minne deltakerne på å skrive dagbok hver dag, kan man bruke \*\*kalenderintegrasjon\*\* eller e-postvarsler:

# 

# \* Eksempel: Prosjektleder oppretter en \*daglig kalenderhendelse\* (f.eks. kl 20:00 hver kveld) som sendes til hver deltaker, med en beskrivelse og lenke til skjemaet for dagboken. Da plinger telefonen deres med en påminnelse om å fylle ut.

# \* Alternativt kan Google Forms sende en kvitteringsmail med kopi av svar hver gang (deltaker kan da se hva de skrev), men for påminnelse må man bruke eksterne midler. Et triks er å \*planlegge automatiske e-poster\* med f.eks. add-on eller script som sender ut lenken hver dag. Men en enkel løsning er ofte best: kalenderinvitasjoner eller SMS-varsler.

# \* I Microsoft-verdenen kan man gjøre tilsvarende med \*Microsoft Forms\*: et forms per deltaker, og bruke f.eks. \*Power Automate\* til å sende en påminnelses-mail hver dag med lenken til forms. Alternativt kan man bruke \*Teams/Outlook\* til å sette opp en daglig reminder med lenke.

# 

# \*\*Lagring av dagbokdata:\*\* I Google-skjema klikker man på “Responses” og velger “Opprett regneark” for å samle svar. Da lages et Google Regneark (f.eks. “Dagbok \\\[Navn] – svar”) der hver rad er én dags entry med tidsstempel. Veileder kan lese dette regnearket for å følge med eller evaluere fremgang (forutsatt samtykke). Data er trygg lagret på prosjektets Google Drive. Tilsvarende i Microsoft: et Forms-skjema lar seg koble mot Excel – man kan enten eksportere manuelt eller (hvis forms er opprettet i en gruppe/SharePoint) få svarene direkte inn i en Excel-fil i skyen. Et alternativt verktøy er \*OneNote\*: man kan gi hver deltaker en egen delt OneNote-notatblokk med en seksjon for dagbok. Deltakeren kan opprette en ny side per dag (datert). OneNote tillater mer fritekst, bilder, lydopptak etc., og synkroniseres automatisk. Det gir stor frihet (f.eks. kan deltaker \*tegne eller legge ved foto i dagboken\*), men til gjengjeld er det mindre struktur for analyse i etterkant. For en enkel pilot vil skjema + regneark være mer oversiktlig for dokumentasjon.

# 

# \*Eksempeloppsett Google:\* Opprett et Google Skjema med tittel “Dagbok – Ola Nordmann (Camino)”. Legg inn 2-5 spørsmål (tekstsvar) som deltaker svarer på daglig. Generer lenke. Under \*\*Innstillinger\*\* kan man la deltaker redigere svarene sine senere eller sende dem en kopi av svar (valgfritt). Ikke krev Google-innlogging for å svare (gjør det enklere – deltaker kan være anonym i selve skjemaet, men siden det er ett skjema per person, vet man uansett hvem sine svar det er). Aktiver “Tidsstempel” hvis ikke default, for å logge dato automatisk. Velg “Opprett regneark” for svarene. Del \*redigeringsrettighet\* til regnearket med veileder/prosjektleder (hvis ikke allerede eier). Deltaker selv trenger i utgangspunktet ikke tilgang til svar-arket, siden de kan se sine dagboksnotater gjennom e-postkvittering eller via et sammendrag om ønskelig – men man kan gi dem tilgang hvis de vil lese alt de har skrevet i en liste.

# 

# \*Eksempeloppsett Microsoft:\* Opprett et nytt skjema i Microsoft Forms kalt “Dagbok – \\\[Navn]”. Legg inn tilsvarende spørsmål. Under Innstillinger, ikke sett skjemaet som “Alle kan svare” med lenke (med mindre man er innenfor en organisasjon – i så fall “kun personer i org. med lenke kan svare” for å få innlogging). For pilot kan man bruke “Alle med lenke kan svare” for enkelhet og dele lenken med deltakeren. Slå på “E-postbekreftelse til svarperson” hvis man vil at brukeren får kopi (merk: dette krever at man innhenter e-post i skjemaet eller bruker organisasjonskonti). Svarene kan sees i Forms, og man kan klikke “Åpne i Excel” for å få dem ut. For en mer automatisert løsning kan man lage en \*Excel Online\* i OneDrive som datakilde via Power Automate, men det er mer avansert. Enklere: jevnlig eksportere til Excel manuelt. OneNote-varianten: Opprett en delt notatblokk med deltaker (f.eks. via OneNote Online, inviter brukeren via e-post). Lag en seksjon “Dagbok” hvor brukeren skriver sider. Veileder kan lese notatene ved behov.

# 

# \*\*Brukervennlighet:\*\* Det beskrevne oppsettet er designet for å være \*lett å bruke daglig\*. Skjema-tilnærmingen gir et svært strømlinjeformet grensesnitt – deltakerne kan fokusere på å svare på de korte spørsmålene uten distraksjoner. Som en erfaren bruker sier, er denne metoden “et praktisk og brukervennlig alternativ for å føre en journal, som du kan raskt loggføre fra hvor som helst, også med smarttelefon”. Siden svarene automatisk havner i et regneark, slipper man manuelt notatarbeid med å samle dem – noe som \*\*sparar tid i etterkant\*\* ved evaluering.

# 

# \### Aktivitetsplan og oppgaveoppfølging

# 

# \*\*Verktøy:\*\* For hver deltaker lages det en \*\*digital aktivitetsplan\*\* som et separat dokument (ark eller liste). Dette kan gjøres ved hjelp av en mal:

# 

# \* \*Google-alternativ:\* En \*\*Google Regneark-mal\*\* utformes med faner eller tabeller for “Mål” og “Aktiviteter”. Denne malen inneholder de nevnte kolonner (Aktivitet, Frist, Status, Notater, etc.) og gjerne litt instruksjonstekst. For hver ny deltaker opprettes en kopi av malen (Google Drive: Høyreklikk mal -> Lag en kopi, gi nytt navn). Navngi filene f.eks. “Aktivitetsplan – \\\[Navn]”. Del dette regnearket med deltakeren (lese- og skriveadgang til vedkommende selv, og til veileder/prosjektleder). Både deltaker og veileder kan da åpne regnearket i nettleser eller Google Sheets-appen på mobil for å se og oppdatere planen.

# \* \*Microsoft-alternativ:\* Bruk enten \*\*Excel Online\*\* eller \*\*Microsoft Lists\*\*. I Excel kan man ha et ark med tabell for aktiviteter. En mal-arbeidsbok kan kopieres for hver deltaker (f.eks. lagre en tom “Aktivitetsplan-mal.xlsx” og duplisere den i OneDrive/SharePoint for hver deltaker). Microsoft Lists er imidlertid mer elegante for denne bruken: Man kan opprette en ny liste fra mal, for eksempel ta utgangspunkt i mal for “Issue tracker” eller “Work progress” som allerede har kolonner for status, prioritet osv., og tilpasse navnene til “Aktivitet” og “Mål” etc. Deretter oppretter man en instans av denne listen for hver deltaker, eller man kan ha én liste med alle deltakere som separate kategorier – men for personvern er separat liste per deltaker å foretrekke. Hver liste kan legges under et SharePoint-område eller i Microsoft Teams kanal hvis pilotdeltakerne er gjester i en Teams, slik at de kun ser sin egen. Microsoft Lists støtter også at man kan \*lage maler selv\* – så man kan designe én liste med ønskede kolonner, eksportere som mal og raskt opprette for neste deltaker.

# 

# \*\*Innhold i aktivitetsplanen:\*\* Begynn med å fylle inn deltakerens \*mål\* øverst. I regneark kan man bare skrive det inn i en fremhevet celle. I Lists kan man legge mål som et eget listeelement, eller i beskrivelsen av listen. Deretter fyller man inn kjente aktiviteter (kanskje i oppstartsmøtet mellom deltaker og veileder identifiseres noen aktiviteter). Veileder kan for eksempel opprette et par aktiviteter i samråd med deltaker, som et utgangspunkt. Deltakeren kan selv legge inn nye aktiviteter gjennom pilotperioden (enten ved å selv redigere regnearket eller via et inputskjema). \*\*Google Sheets\*\* kan forbedres med et tilkoblet Google Skjema for aktivitetsplanen også: f.eks. at deltaker fyller ut et skjema “Ny aktivitet” som legger seg som ny rad i regnearket. Men det kan være enklere at deltaker skriver direkte i arket hvis de er komfortable med det – det gir mer eierskap. Google Sheets tillater samskriving i sanntid, slik at deltaker og veileder \*begge\* kan legge inn eller endre informasjon samtidig, akkurat som i NAVs aktivitetsplan der begge parter ser alt.

# 

# I \*\*Microsoft Lists\*\* er grensesnittet enklere for ikke-regneark-kyndige: man klikker “Ny” og får opp et skjema for å legge til et listeelement (aktivitet), med felter for hver kolonne. Dette kan være mer intuitivt for deltaker (det føles mindre som å redigere et regneark og mer som å fylle ut et skjema med ett element om gangen). Lists har i praksis innebygde skjema for oppretting og redigering av elementer.

# 

# \*\*Bruk av NAV-terminologi:\*\* Sørg for å navngi kolonner og valg likt NAV. For eksempel, en \*Status\*-kolonne skal ha verdiene “Planlagt”, “Gjennomføres”, “Fullført”, “Avbrutt” (og evt. “Ikke Godkjent” dersom det er relevant å skille). I Microsoft Lists kan du definere disse som valg i en rullegardin (Choice field). I Google Sheets kan du bruke Datavalidering til å lage en rullegardinliste med disse ordene. \*\*Dialog\*\*: Dersom det er ønskelig å føre dialog her, kan man legge en kolonne “Siste melding” eller “Kommentar”, men det er bedre å holde dialog ved siden av, se eget avsnitt om dialog nedenfor.

# 

# \*\*Oppfølging og oppdatering:\*\* Deltakeren bør oppmuntres til å jevnlig oppdatere status på aktiviteter (for eksempel markere som fullført når noe er gjort). Veileder kan også gjøre dette etter samtaler. For sporbarhetens skyld kan man innføre en enkel konvensjon at veileder skriver initialer og dato i notatfeltet når de legger inn noe (slik at man vet hvem som skrev hva). Dette ligner NAVs “referat”-funksjon der veileder dokumenterer oppfølging. I et delt Google-ark kan man også aktivere \*Versjonshistorikk\* som viser endringer over tid; i Microsoft Lists kan man slå på \*Versjonskontroll\* for listeelementer (da kan man se endringslogg per felt).

# 

# \*\*Eksempel – Google Sheets aktivitetsplan:\*\* Fanen “Mål” (valgfri) kan liste hovedmål og delmål. Fanen “Aktiviteter” har kolonne A: Beskrivelse, B: Frist, C: Status, D: Notater/Kommentar. Sett gjerne farget format: f.eks. gult for “Planlagt”, grønt for “Fullført” osv., for visuelt å se progresjon. Dette kan gjøres med betinget formatering basert på statuskolonnen. Del arket med deltakerens Gmail (eller generer en lenke som krever Google-pålogging og gi deltaker tilgang via e-post).

# 

# \*\*Eksempel – Microsoft Lists aktivitetsplan:\*\* Opprett en liste “Aktivitetsplan – \\\[Navn]” med kolonner:

# 

# \* Title (standard kolonne) kan brukes til Aktivitetens navn/beskrivelse.

# \* “Frist” (Date column).

# \* “Status” (Choice: Planlagt, Pågår, Fullført, Avbrutt).

# \* “Notat” (Multiple lines of text).

# \* “Kategori” eller “Mål-ID” hvis man vil knytte til et bestemt mål (ev. ikke nødvendig hvis én liste per mål/deltaker).

# \* Man kan også legge til “Veileder” (Person column) om man vil ha navnet på ansvarlig veileder.

# 

# Gi deltaker tilgang til listen (via Teams-adding eller direkte share). Deltakeren kan da bruke \*\*Microsoft Lists mobile app\*\* eller nettleser for å se oppgavene. Lists har også flere visninger: man kan lage en \*Kalendervisning\* for aktiviteter etter dato, eller en \*Galleri/Kort-visning\*. Dette kan være nyttig for deltaker som tenker visuelt. Lists integrerer med Teams slik at deltaker/veileder kan prate i en Teams-chat parallelt med at de ser listen (men det krever at de er lagt inn i Teams).

# 

# \&#x20;\*\*Figur 2: Eksempel på digital aktivitetsplan som en tabell med statusfelt.\*\* (Illustrasjonen viser Microsoft Lists med en liste lignende en aktivitetsplan – hver rad er en aktivitet med kolonner for type, beskrivelse, alvorlighetsgrad og status. I vår kontekst kan vi bruke liknende oppsett: aktiviteter med statuskolonne gjør det lett å følge progresjonen visuelt). Både Google Regneark og MS Lists støtter filtrering og sortering, slik at deltaker og veileder kan filtrere på f.eks. “ikke fullført” for å se gjenstående oppgaver.

# 

# \*\*Dialog og kommunikasjon:\*\* For å etterligne dialogtjenesten i NAV, kan man bruke flere metoder:

# 

# \* En enkel måte i pilot er å la \*dagboken fungere som dialogarena\* – deltaker skriver kanskje i dagboken spørsmål eller meldinger til veileder, og veileder kan svare neste dag ved å legge en kommentar i aktivitetsplanen eller ta det muntlig. Dette er ikke ideelt som asynkron dialog, men kan fungere.

# \* Alternativ: Opprett en \*\*egen felles OneNote\*\* mellom deltaker og veileder, eller bruk en delt Google Doc kalt “Dialog \\\[Navn]” hvor begge kan skrive meldinger fortløpende (datert). Dette blir som en chat-logg på et dokument. Fordelen er at da holdes all skriftlig dialog også dokumentert skriftlig, noe NAV ofte ønsker (NAVs dialoger lagres jo i aktivitetsplan-systemet). Husk at i offisiell løsning kan ikke meldinger slettes; i pilot bør man også unngå å slette ting i dialogdokumentet, for å kunne vise helheten ved evaluering.

# \* Hvis Microsoft Teams er en opsjon (deltakere som gjester): Da kunne man faktisk bruke Teams chat eller en privat kanal for hver deltaker for dialog. Dette er sannsynligvis for tungvint for en liten pilot, men verdt å nevne for skalering – Teams gir logging av dialoger som kan arkiveres.

# \* E-post kan brukes som backup dersom deltakerne sliter med nye verktøy: Deltaker sender mail til veileder med spørsmål, veileder kan kopiere relevant info inn i aktivitetsplan-notatfelt for dokumentasjon.

# 

# \## Sikkerhet, personvern og brukervennlighet

# 

# En viktig vurdering i pilotfasen er å sikre \*tilstrekkelig personvern\* og \*enkelt brukergrensesnitt\*, uten at det blir for komplekst å administrere.

# 

# \*\*Tilgangsstyring og passordbeskyttelse:\*\* Løsningen må sikres slik at kun autoriserte parter ser innholdet. I Google-oppsettet betyr det at alle dagbokskjema og aktivitetsfiler kun deles direkte med de det angår. Google Skjema kan settes opp åpent (lenke) eller begrenses til bestemte Google-kontoer. For høy sikkerhet, opprett gjerne en Google Workspace konto for prosjektet og legg deltakerne inn som brukere der under hver sin konto – da kan du begrense skjemaene til innlogging i den organisasjonen. Men dette kan være unødvendig tungt for pilot. Et alternativ er å generere lange, unike lenker (Google Forms gir komplekse lenker) og dele dem én-til-én med deltaker (sannsynligheten for at andre gjetter lenken er minimal). Aktivitetsplan-regnearket bør kreve innlogging for å redigere; man inviterer deltakerens e-post spesielt. \*\*Passordbeskyttelse\*\* av dokumenter utover dette er ikke trivielt i disse verktøyene (man kan ikke legge passord på et Google-dokument som allerede er delt via Google-aksesskontroll – passordbeskyttelse er mer relevant for statiske filer). Så den reelle beskyttelsen er \*konto-pålogging\*. Det bør vektlegges at deltakerne bruker sikre passord på sine Google/Microsoft-kontoer, og evt. tofaktorautentisering, for å unngå uautorisert innsyn.

# 

# I Microsoft-oppsettet vil man trolig ha en \*Azure AD\*-konto for hver deltaker eller bruke deres private Microsoft-kontoer som “gjester”. Uansett vil deltakeren da måtte logge seg inn for å se sin plan. OneNote, Excel osv. kan også beskyttes via delingsinnstillinger. For eksempel kan man i OneDrive dele en fil med “password required” hvis man deler via lenke – men det enkleste er å dele direkte til e-post og kreve innlogging.

# 

# \*\*Dataminimalisering og lagringstid:\*\* Siden dette er en pilot, anbefales det å lagre \*minst mulig sensitive personopplysninger\*. Man kan f.eks. unngå fødselsnummer og heller identifisere deltakerne ved fornavn eller kallenavn i systemet. Dagboksinnhold kan være sensitivt (personlige refleksjoner), så det må behandles konfidensielt. Når piloten er over, bør dataene slettes eller anonymiseres med mindre det er behov for videre lagring. NAVs egne systemer lagrer aktivitetsplan permanent etter arkivloven, men for en avgrenset pilot kan man nøye seg med at data lagres trygt i skytjenesten i prosjektperioden og eksporteres til et trygt format ved avslutning (f.eks. PDF-arkivering av hver aktivitetsplan og dagbok som legges i NAVs arkivsystem dersom det kreves, deretter slettes fra sky).

# 

# \*\*Brukervennlighet:\*\* På brukervennlighet er nøkkelen å \*gjøre tilgangen så enkel som mulig\*.

# 

# \* Som nevnt: legg til rette for mobilbruk. Google-regneark og -skjema har mobilvennlig grensesnitt, og Microsofts løsninger har dedikerte mobilapper (Excel app, OneNote app, Lists app). Deltakerne kan \*\*legge til bokmerker eller app-ikoner\*\* for sine verktøy. En deltaker kan f.eks. installere Google Sheets appen for å oppdatere aktivitetsplan, eller bare bruke nettleser.

# \* \*\*Opplæring:\*\* Gi en kort opplæring i bruk. En trinnvis guide med skjermbilder kan hjelpe. F.eks. skjermbilde av hvordan man legger til skjema-lenken som snarvei på telefonen, eller hvordan man oppdaterer en rad i regnearket.

# \* \*\*Enkel navigasjon:\*\* Det kan være lurt å lage en \*oversiktsside\* for deltakerne. Eksempel: et Google-dokument eller en e-post som deltaker kan lagre, som inneholder \*\*alle lenker\*\* de trenger – “Klikk her for dagbok, klikk her for aktivitetsplan”. I en Microsoft-løsning kunne man bruke en Teams-oversikt eller SharePoint-side med disse lenkene. Dette reduserer friksjon så de slipper lete etter ulike dokumenter.

# \* \*\*Mobilgrensesnitt evaluering:\*\* Microsoft Lists sitt mobilgrensesnitt er ganske nytt, men skal støtte å se og editere lister på en måte tilpasset små skjermer. Google Sheets på mobil kan være litt kronglete for lange tekster, men greit for statuser. Hvis deltaker sliter med regneark på mobilen, kan man vurdere å supplere med skjema for innlegging: f.eks. deltaker kan hake av “Fullfør aktivitet X” via et enkelt skjema som oppdaterer sheet/list (mulig via integrasjon, men i pilot kan de heller bare si fra til veileder som oppdaterer for dem).

# 

# \*\*Sikker kommunikasjon:\*\* Unngå å spre lenker offentlig eller via usikre kanaler. Send personlig til deltakerne. Instruer dem i å ikke dele videre. Dette er spesielt viktig hvis man ikke krever innlogging for skjema (da kan i prinsippet hvem som helst med lenken legge inn falske svar, eller lese hvis man dummer seg ut og gir redigeringslenker). For å være trygg kan man godt \*\*kreve innlogging på skjema\*\*: i Google kan man krysse av “Limit to 1 response per user – requires login”. Hvis deltakerne har Google-kontoer, dette funker fint og sørger for at dagbokskjemaet bare åpnes når de er logget inn. I Microsoft Forms kan man velge “Only people in my organization can respond” for tilsvarende beskyttelse, men da må deltaker ha en AAD-konto.

# 

# \## Valg av skytjeneste i pilotfasen og migrering senere

# 

# I piloten er fleksibilitet og fart viktig, mens man på lengre sikt må tenke på integrasjon med NAVs systemer. Her er en vurdering av hvilket oppsett som er \*mest hensiktsmessig nå\* og \*skalerbart senere\*:

# 

# \* \*\*Google-løsningen (Forms/Sheets):\*\* Svært kjapp å sette opp uten IT-infrastrukturkrav. Den egner seg godt for testing av konseptet – man kan komme i gang i løpet av få timer. Evaluering av tiltaket blir enkelt fordi alt er i Google-regneark som kan lastes ned som Excel/PDF ved behov. Ulempen er at NAV som etat nok ikke kan ta i bruk Google-løsningen direkte i sin oppfølging; data må i så fall overføres manuelt. Likevel, data fra Google kan \*eksporteres til kjente formater\* (Excel, CSV, Word) som NAV kan lese. Under pilot holder det kanskje at prosjektleder drar ut rapporter. Google-løsningen er mindre ideell for skalering utover pilot fordi det ikke uten videre lar seg integrere med NAVs API. Likevel kan man, om pilot skal utvides, benytte Googles API-er til å skrive til for eksempel en database eller integrere med andre systemer – men dette krever utviklerkompetanse. For pilotformål anbefales heller å holde det som en frittstående løsning og heller planlegge migrering senere.

# 

# \* \*\*Microsoft-løsningen (Forms/Lists/Excel):\*\* Denne krever kanskje litt mer initialt (opprette kontoer eller et tenant-miljø hvis man ikke har det), men den har fordelen av \*mulig direkte videreføring inn i NAVs miljø\*. NAV bruker selv Office 365 (veiledere har epost i Outlook, dokumenter i SharePoint osv.). Om pilotprosjektet senere tas opp av NAV, kan man enklere importere Excel-lister til NAVs system eller gjenbruke SharePoint-lister. For eksempel: Data i en Microsoft List kan via \*Power Automate\* sendes til et API eller en database som NAV har tilgang til, noe som gjør integrasjon mer sømløs. Allerede nå kan man tenke seg å strukturere lister/regneark likt som databasefeltene i aktivitetsplanen. NAVs digitale aktivitetsplan har neppe et åpent API for eksterne pilotprosjekt per i dag, men man kan sikre at formatet er kompatibelt. For eksempel, hvis NAV krever at en aktivitetsplan leveres som et Word- eller PDF-dokument ved avslutning, kan vi lage en mal som autofylles med data fra listene.

# 

# \*\*Anbefaling for pilot:\*\* Start med den løsningen som dere raskest får opp og stå med de ressurser dere har. Dersom prosjektgruppen ikke har ferdigheter eller tilgang på Microsoft 365, kjør Google-varianten – den vil oppfylle alle funksjonskravene i pilotfasen (dagboklogging, aktivitetsplan, deling, etc.). Google Workspace er gratis eller billig, og mange er kjent med Google-skjema fra før. \*Hvis\* prosjektet har tilgang til NAVs testtenant eller kan få Microsoft-lisenser, kan det være verdt å bruke Microsoft-løsningen for å få erfaring direkte på den plattformen NAV foretrekker. Det gir ett steg mindre ved overføring.

# 

# Uansett valg, \*\*dokumentér strukturen nøye\*\* under pilot. Lag f.eks. en oversikt over hvilke felter/kolonner som brukes og hvordan de tilsvarer NAVs system. Slik kan man i etterkant enkelt \*mappe pilotdata til NAVs aktivitetsplan\*. NAVs krav til dokumentasjon (arkivering av all oppfølging) kan ivaretas ved at dere ved pilot-slutt overfører all informasjon til et varig format:

# 

# \* Aktivitetsplan per deltaker kan eksporteres til PDF/Excel og legges ved sak/mapper i NAV.

# \* Dagbokdata kan oppsummeres og eventuell relevant info trekkes ut for NAV (NAV vil kanskje ikke lagre personlige dagboksrefleksjoner, men innsikter derfra kan komme med i en sluttrapport).

# \* Dialog/meldinger logges og eksporteres.

# 

# \## Oppfyllelse av NAVs krav til dokumentasjon og framtidig integrasjon

# 

# NAV stiller krav om at oppfølging av brukere skal dokumenteres, og at all vesentlig info skal kunne journalføres. Vår løsning kan imøtekomme dette slik:

# 

# \* \*\*Fullstendig dokumentasjon:\*\* Alt som skjer i pilotverktøyene vil bli liggende skriftlig – daglige notater, aktiviteter, endringslogger. Ved pilotens slutt (eller underveis ved behov) kan man hente ut rapporter. For eksempel kan man generere en \*aktivitetsplanrapport\* for hver deltaker som viser mål, alle aktiviteter og deres status, samt en logg over kommentarer/dialog. Fordi vi benytter strukturerte verktøy, er dette relativt enkelt: et Google-regneark kan skrives ut til PDF med tabelloversikt; en Microsoft List kan eksporteres til Excel og formateres pent. Veileder kan også skrive ut en oppsummering via f.eks. Word-fletting (i Microsoft kan man koble Excel data til Word-mal).

# \* \*\*NAVs fagsystem:\*\* Per i dag vil nok ikke NAVs aktivitetsplan ha en direkte importfunksjon for våre pilotdata. Men vi kan \*etterligne formatet\* for en mulig manuell overføring. For eksempel, i NAVs system må veileder kanskje registrere manuelt aktivitetsplanen uansett etter at en bruker formelt er innsøkt. Vår pilot kan da fungere som forarbeid: veileder kan bruke pilotens aktivitetsplan som grunnlag og raskt copy-paste relevant innhold inn i NAVs løsning. Siden terminologi og oppsett er likt, blir dette enkelt (“Mål” felt fra Google-arket tas inn i “Mål” i NAV, osv.).

# \* \*\*Integrasjonsmuligheter:\*\* Skulle NAV på sikt ønske å hente data elektronisk, er det mulig å utvikle integrasjoner. Google Sheets tilbyr API-er for å hente ut data programmatisk (JSON/REST), det samme gjør Microsoft via Graph API for Lists/Excel. For en fremtidig løsning kunne man tenke seg at NAV lager en importtjeneste der man kan sende over aktivitetsplanposter. Inntil så skjer, vil vi sørge for at data er tilgjengelige i maskinlesbart format (CSV/Excel) som kan importeres via NAVs eventuelle verktøy eller i det minste legges ved i journal.

# \* \*\*Krav om sikker lagring:\*\* Offentlig forvaltning krever gjerne at data lagres i sikre miljø. En pilot kan ha noe mer fleksibilitet, men man bør uansett velge EU-baserte servere og kjente leverandører. Google Workspace for Europe og Microsoft har begge høye sikkerhetsstandarder og mulighet for databehandleravtaler. For en kort pilotperiode anses det som akseptabelt å bruke disse, men hvis pilotdata skal over i NAV, må man slette dem fra tredjepartene etter bruk.

# \* \*\*Arkivering:\*\* Som nevnt, alt innhold som er generert (aktivitetsplaner, dagboknotater) bør ved avslutning arkiveres i henhold til NAVs rutiner. Det kan bety utskrift til PDF/A eller lignende format og lagring i NAVs arkivsystem. Vår løsning legger til rette for dette ved at vi enkelt kan generere slike dokumenter fra de digitale kildene.

# 

# \*\*Skalerbarhet videre:\*\* Skulle Camino-programmet utvides kraftig, vil Google Forms/Sheets-modellen kunne håndtere mange brukere, men administrasjon av mange individuelle filer kan bli tungvint. Da vil det være naturlig å se mot mer integrerte systemer eller dedikerte apper. Imidlertid, \*\*Microsoft Lists/SharePoint-løsningen er forholdsvis skalerbar\*\* – man kan ha mange lister eller items, og man kan automatisere mye med Power Platform. For eksempel kunne man i fremtiden ha et \*standard aktivitetsplan-skjema\* som oppretter listeelementer via PowerApps, og integreres i NAV. Men alt dette er steg som kan tas basert på erfaringene fra piloten.

# 

# Til syvende og sist vil dette oppsettet gi Camino-piloten et oversiktlig digitalt system som reflekterer NAVs egen plan. Deltakerne får et sted å \*skrive sine daglige refleksjoner\* og \*holde oversikt over aktiviteter mot målene sine\*, veileder får innsyn og mulighet til å komme med innspill (med samtykke), og prosjektleder kan administrere deltakeroppfølgingen mer effektivt enn via papir. Systemet er raskt å prøve ut og justere underveis. Vedlagt er skjermbilder som illustrerer konseptet, og valg som er tatt for å sikre at løsningen både fungerer nå og legger grunnlag for en eventuell overgang til NAVs systemer senere.

# 

# \*\*Kilder:\*\*

# 

# \* NAV, \*Aktivitetsplan – introduksjon\* (beskrivelse av funksjoner i NAVs aktivitetsplan)

# \* Proba Societal Analysis, \*Digital aktivitetsplan for NAV og brukerne\* (2022) (nytteverdien av digital aktivitetsplan for veiledere og brukere)

# \* Adam Moody, \*Google Forms Journaling\* (2023) – om bruk av Google Forms for daglig journalføring

# \* Samuel Wright, \*How to Journal using Google Forms\* (2015) – tips til rask tilgang via mobilen

# \* Microsoft 365, \*How to use OneNote to create a personal journal\* (2023) (OneNotes fleksibilitet for dagbok)

# \* Microsoft, \*Lists Quickstart Guide\* (2021) (Microsoft Lists tilgjengelig på mobil, lik funksjonalitet som desktop)

# \* Microsoft 365 produktbeskrivelse, \*Microsoft Lists\* (2025) (tracking av oppgaver med statusfelt, maler og deling i Lists)

# ChatGPT said:

# Flott, du har nå et svært godt og realistisk utgangspunkt i Spond! Her er en oppsummering med konkrete neste steg og forslag til optimalisering av testoppsettet ditt:

# 

# ✅ Neste umiddelbare steg i testfasen (Spond)

# 🔹 1. Fullfør gruppeopprettelsen

# Klikk Create group → opprett hovedgruppen med de fire undergruppene:

# 

# Dagbok – Sander

# 

# Dagbok – Ole

# 

# Dagbok – Kari

# 

# Dagbok – Felles

# 

# 🎯 Tips: Bruk forskjellige e-postadresser/testkontoer som medlemmer for å simulere ekte brukere.

# 

# 🔹 2. Legg til testbrukere

# Legg til fiktive deltakere i hver undergruppe – for eksempel:

# 

# Navn	Rolle	Tilgangsgruppe

# Sander	Deltaker	Dagbok – Sander

# Ole	Deltaker	Dagbok – Ole

# Kari	Deltaker	Dagbok – Kari

# Admin A	Admin full	Alle grupper

# Admin B	Admin begr.	Kun Dagbok – Sander

# Admin C	Observer	Fellesgruppe + 1 delt.

# 📩 Bruk e-poster du kontrollerer, eller bruk alias som sander+test1@domene.no osv.

# 

# 🔹 3. Opprett test-events

# Opprett én daglig event i hver privat undergruppe:

# 

# Eksempel (Dag 1)	Innhold

# Tittel	Dag 1 – Porto til Vila do Conde

# Beskrivelse	Dagens rute, kartlenke, inspirasjonsnotat, fysiske mål

# Refleksjon	Hva ga deg energi i dag? Hva var krevende?

# Vedlegg	Kart (bilde), video (motiv), evt. spørsmål

# 📅 Lag 3 slike events og test:

# 

# Hvordan deltaker svarer/skriver dagbok

# 

# Hvordan admin får varsel og tilgang

# 

# Hvordan struktur føles i praksis

# 

# 🔹 4. Test og vurder personvern og brukervennlighet

# 🛡️ Personvern-sjekk:

# 

# Kan deltakerne se hverandres undergrupper? (de skal ikke)

# 

# Kan du begrense admin-tilgang? Test ulike konfigurasjoner

# 

# 👍 Brukervennlighet:

# 

# Klarer deltaker å forstå hvor og hvordan de skal skrive?

# 

# Føles meldingsfelt som en “dagbok”?

# 

# Er det enkelt å legge ved bilde, lyd, tekst?

# 

# 🔹 5. Evaluer oppfølging og varsling

# 👁️ Som admin:

# 

# Får du varsler når noe postes?

# 

# Kan du raskt se “status” for deltakere (har skrevet / ikke skrevet)?

# 

# Fungerer push/SMS/e-post riktig?

# 

# 🧭 Lag testmeldinger med ros/milepæler, f.eks.:

# 

# “Flott innsats første dag! ⭐ 3 av 3 har skrevet dagbok – vi heier på dere!”

# 

# 🧠 Valgfritt: Strukturillustrasjon og tekstmaler

# Ønsker du:

# 

# 🗂️ En enkel visuell skisse (f.eks. i PNG/PDF-format) over gruppe–undergruppe–event-struktur?

# 

# 📄 Maltekst for daglige events og refleksjoner (generisk og tilpasningsklar)?

# 

# 📊 Excel- eller Notion-maler for intern oversikt (progresjon, kommentarer, innsendinger)?

# 

# → Si ifra, så leverer jeg det klart og tilpasset umiddelbart.

# 

# Vil du også at jeg skal begynne å vurdere alternative systemer til Spond nå, med tanke på kravene som ikke løses like elegant (f.eks. dagbok i meldingsfelt, personvern på API-nivå, integrasjon, skjemaløsninger)?

# 

# You said:

# 1\. og 2. takk

# ChatGPT said:

# Matplotlib Chart

# 

# 

# Output image

# Her er en visuell illustrasjon av strukturen du har satt opp i Spond for Camino 2025 – Pilotgruppe, med tilknytning mellom hovedgruppe, undergrupper for individuell dagbok og daglige eventer. Basert på denne modellen følger en oppdatert og realistisk steg-for-steg-plan:

# 

# 🔧 Steg-for-steg oppsett i Spond for Camino 2025 – Pilotgruppe

# 1\. Opprett hovedgruppe

# Navn: Camino 2025 – Pilotgruppe

# 

# Gruppetype: Scouting

# 

# Språk: Norsk (valgfritt)

# 

# Formål: Samle alle deltakere og administratorer for oversikt, varsling og prosjektorganisering.

# 

# 2\. Opprett én undergruppe per deltaker + felles

# Navn: Dagbok – \[Navn] (eks: Sander, Ole, Kari)

# 

# Tilleggsgruppe: Dagbok – Felles for felles refleksjon eller oppsummering.

# 

# Hensikt: Gi hver deltaker et "privat rom" for daglige dagboksaktiviteter, kun synlig for deltaker + dedikert admin.

# 

# Tips: La deltakerne kun være medlem av sin egen dagbok-undergruppe og fellesgruppen.

# 

# 3\. Tilordne testdeltakere og admin

# F.eks. bruk fiktive e-postadresser som sander@camino.test, kari@camino.test osv.

# 

# Legg til deg selv som full admin i hovedgruppen.

# 

# For admin kun for én undergruppe: Bruk tilgangsstyring (hvis mulig i Spond).

# 

# 4\. Opprett daglige "Events" i hver undergruppe

# Tittel: Dag 1 – Dagbok, Dag 2 – Dagbok osv.

# 

# Beskrivelse:

# 

# Inkluder refleksjonsspørsmål.

# 

# Evt. link til ekstern spørreskjema, video eller oppgave.

# 

# Innstillinger:

# 

# Påminnelse samme dag kl. 20:00.

# 

# Kun respondenter i gruppen ser sitt event.

# 

# 5\. Felles Event i hovedgruppen (valgfritt)

# Ukentlig eller ved milepæler: “Ukesrefleksjon”, “Digital samling”, “Frivillig deling”

# 

# Alle inviteres – viktig for fellesskapsfølelse og struktur.

# 

# 💡 Brukervennlige workaround-forslag

# Problem	Forslag til løsning

# Deltakere må klikke inn i “Dagbok – \[Navn]” for å skrive dagbok	Bruk push-varsel med direktelink til eventet. Del tydelig instruks i hovedgruppe.

# Ingen reell "dagbok" inne i Spond	Bruk event-kommentar som dagbokinnlegg (den er personlig hvis gruppen er lukket).

# Admin må opprette mange events manuelt	Lag maler i Google Docs eller Notion for daglig tekst og kopier inn manuelt dag for dag (eller kopier events i Spond hvis mulig).

# Deltakere har varierende teknisk kompetanse	Bruk første uke til å lære dem systemet. Lag f.eks. “Camino – intro” med video/gjennomgang.

# 🛠 Teknisk realistiske begrensninger

# Spond tillater ikke skjult event per person inne i én gruppe, men undergrupper gir deg «semi-privat» oppsett.

# 

# Ingen direkte dagbokmodul, men event-kommentarer dekker mye.

# 

# Begrenset admin-rolle per gruppe, men f.eks. én hovedadmin kan styre det meste.

# 

# Ønsker du nå en PDF med full struktur + eksempelinstruks for deltakere og admin, eller at jeg setter opp 7 dager med eksempelinnhold for deg? 

# 

# You said:

# Uploaded image

# Uploaded image

# Uploaded image

# \- Kan "poll" bruker som individuelle "dagbøker"?

# \- Hva settinger i vedlegg 2

# \- Kan alternativt Custom fields brukes som workaround til private dagbøker

# \- Ser Task templates kan potensielt forenkle repiterende oppgaver/journalføring/dagbøker 

# \- Vedlegg 3 ser du de har et utvalg av tilganger. Noen muligheter her?

# \- Kommer du med revidert oppsett, ta med detaljert og reell data fra hovedchat (Camino prosjektet)

# 

# ChatGPT said:

# Flott fremgang! Basert på dine opplastede skjermbilder, nåværende oppsett og innsikten fra hovedchatten «Pilotprosjekt for mestring», får du her:

# 

# 🔁 Revidert og detaljert oppsett i Spond for Camino Pilotprosjektet

# Dette oppsettet er utviklet for å:

# 

# oppfylle kravene til struktur, dagbok, tilgangsstyring, admin-oppfølging, og GDPR-hensyn,

# 

# samtidig som vi utnytter Sponds styrker og lager smarte workaround-løsninger der det trengs.

# 

# 📌 1. Struktur og gruppesetting

# Hovedgruppe: Camino Pilotprosjekt

# Brukes til:

# 

# Fellesinformasjon

# 

# Overordnet admin-oversikt

# 

# Invitasjon/koordinering

# 

# Maler og repeterende elementer (Task templates)

# 

# Undergrupper (én per deltaker + felles):

# 

# Dagbok – Sander

# 

# Dagbok – Ole

# 

# Dagbok – Kari

# 

# Dagbok – Felles

# 

# 🔹 Bruksområde: Dagbokføring, oppgaver, kommunikasjon og varsling til én bruker per gruppe.

# 🔹 Fordel: Synlighet og kontroll kan styres enkelt via tilgang og innstillinger.

# 🔹 Tips: Gi admin kun tilgang til sine tildelte undergrupper ved behov.

# 

# 📖 2. Dagbokfunksjon – realistiske alternativer i Spond

# ✅ Anbefalt workaround: "Post + Kommentar" i undergruppe

# Dagbok-innlegg opprettes av bruker som Post (f.eks. "Dag 3 – tanker").

# 

# Admin kan lese og kommentere ved behov.

# 

# Brukeren velger selv om det er synlig for alle i gruppen eller bare admin.

# 

# Hver bruker har «sin» undergruppe, og sensitivitet kontrolleres her.

# 

# ⚠️ Alternativer vurdert, men med begrensninger:

# Polls: Ikke egnet som dagbok – for rigide og resultatorienterte.

# 

# Custom fields: Ikke ment for løpende skriftlige refleksjoner.

# 

# Files: Kan brukes som PDF-samlinger av skannet papirdagbok (se #4).

# 

# 📂 3. Strukturering av daglige events (Camino-dager)

# I hovedgruppen Camino Pilotprosjekt, bruk:

# 

# Events for hver dag (f.eks. “Dag 1 – Porto → Vila do Conde”)

# 

# Legg inn:

# 

# 📝 Dagens oppgave eller refleksjonsspørsmål

# 

# 📌 Praktisk informasjon

# 

# 🔔 Svarfrist hvis respons ønskes

# 

# ➡️ Hver deltaker kan respondere med "Kommer", "Kanskje", "Kan ikke" som daglig innsjekk

# ➡️ Undergruppene brukes til mer utdypende refleksjon i postform (dagbok)

# 

# 🧩 4. Bruk av papirdagbok + opplasting

# Papirdagbøker kan skannes (f.eks. via mobilkamera) og lastes opp slik:

# 

# I undergruppen → Files

# 

# Navngis etter dag eller dato: Dagbok\_2025-11-19.pdf

# 

# Admin får oversikt og kan følge opp

# 

# 🔐 5. Tilgangsstyring og roller (jf. vedlegg 3)

# Spond tilbyr:

# 

# Gruppestyrer – full tilgang (admin-nivå)

# 

# Hjelper – begrenset admin

# 

# Member – vanlig deltaker

# 

# Anbefalt rollefordeling:

# 

# Person	Gruppe(r)	Rolle	Kommentar

# Hovedadmin	Alle grupper	Gruppestyrer	Full oversikt og styring

# Deltaker	Dagbok – \[navn]	Member	Begrenset tilgang

# Veileder/mentor	Én spesifikk dagbokgruppe	Hjelper	Kan lese og følge opp

# Bruk Permissions-tabellen (vedlegg 3) til å:

# 

# Skru av alt annet for Member

# 

# La Hjelper få kun Create posts og View files

# 

# 🧠 6. Task templates – for daglige journalspørsmål

# Bruk denne funksjonen til å:

# 

# Lage faste “oppgavepakker” som kan brukes hver dag

# 

# Innholdseksempel:

# 

# «Hva ga deg energi i dag?»

# 

# «Hva utfordret deg?»

# 

# «Hva ønsker du å huske?»

# 

# ➡️ Opprett Task templates for events, bruk malene i de daglige Events

# ➡️ Kan også postes som daglig Post i deltakerens undergruppe

# 

# 🧪 7. Dataeksport og oppfølging

# I hovedgruppen:

# 

# Export attendance history (f.eks. for daglige innsjekk via event-svar)

# 

# Files-oversikt (skannede dagbøker)

# 

# Manuell oversikt over innlegg og kommentarer i undergrupper

# 

# 📍 På sikt: API-integrasjon er ikke støttet i gratisversjonen – men data kan eksporteres manuelt.

# 

# ✨ Oppsummert forslag: realistisk dagbokstruktur i Spond

# Funksjon	Løsning i Spond

# Dagbok – privat eller delt	Undergruppe + Post

# Papirdagbok – digitalisert	Skanning → Upload i Files

# Admin-oppfølging	Tilgang per gruppe, varsling via app/SMS

# Struktur daglig fremdrift	Events i hovedgruppe

# Motivasjonspoeng	Ikke innebygd – vurder ekstern løsning

# Tilgangsnivåer	Gruppestyrer, Hjelper, Member

# Eksport	Attendance (CSV) + manuell filhåndtering

# Ønsker du neste steg?

# ✅ Veiledning for hvordan dette settes opp teknisk i rekkefølge (på norsk)

# ✅ Eget forslag til evalueringsskjema (Google Forms eller liknende) for innsamling etter test

# ✅ Vurdering av alternativer til Spond hvis noen krav ikke møtes fullstendig

# 

# Skal jeg gå videre med én av disse?

# 

# You said:

# Knyttes events til undergrupper. Venligst kom med detaljert steg for steg igjen. (jeg har ikke opprettet brukere eller koblet de)

# ChatGPT said:

# Flott! Her kommer en detaljert steg-for-steg-guide for å knytte events til undergrupper i Spond – spesielt tilpasset oppsettet ditt med Camino Pilotprosjektet, hvor hver deltaker har sin egen undergruppe (dagbok).

# 

# 🧭 Hensikt

# Målet er at hver deltaker får individuelle events (f.eks. daglige refleksjonsoppgaver eller praktisk fremdrift), direkte i sin gruppe, uten at andre deltakere ser det.

# 

# 🔧 FORARBEID: Opprett brukere og knytt til riktig undergruppe

# 📍1. Opprett brukere

# Gå til venstre meny → Velg en undergruppe, f.eks. Dagbok – Kari

# 

# Klikk på Members-fanen

# 

# Klikk på “Add member”

# 

# Legg inn:

# 

# Navn

# 

# E-post eller telefonnummer

# 

# Valgfritt: fødselsdato, adresse etc.

# 

# Klikk “Add”

# 

# 🔁 Gjenta for hver deltaker og legg dem kun til sin egen dagbok-gruppe.

# 

# 📅 2. Opprett event i undergruppe (individuell daglig oppfølging)

# Steg-for-steg:

# Gå til aktuell undergruppe (f.eks. Dagbok – Ole)

# 

# Klikk på “Event” (ikonet med kalender) øverst

# 

# Fyll ut:

# 

# Title: Dag 2 – Vila do Conde

# 

# Description: Dagens refleksjonsspørsmål eller praktisk info

# 

# Location: Hvis fysisk møte (ellers la stå tomt)

# 

# Time: Sett ønsket klokkeslett for påminnelse

# 

# Under Response options:

# 

# Velg: “Kommer” / “Kan ikke” / “Usikker”

# 

# (Dette fungerer som daglig innsjekk)

# 

# Huk av: “Send push notification/reminder” (valgfritt)

# 

# Klikk “Create Event”

# 

# 🔔 Brukeren vil nå få push/SMS-varsling og kan svare direkte.

# 

# 🛠️ 3. Repetere dette for hver dag

# Enten manuelt, eller:

# 

# ✨ Bonus: Bruk “Task templates for events”

# Gå til hovedgruppen Camino Pilotprosjekt

# 

# Klikk på “Task templates for events”

# 

# Lag mal for “Daglig refleksjon”

# 

# Neste gang du lager event i en undergruppe → Bruk mal

# 

# 🧪 4. Kontroll og oversikt som admin

# For hver undergruppe:

# 

# Gå til Events-fanen i undergruppen

# 

# Klikk på hvert event → Se hvem som har svart

# 

# Kommentarer kan brukes for utdypende svar (valgfritt)

# 

# 👥 5. Admin-tilgang per gruppe

# Hvis du ønsker å tildele ulike veiledere/admin til hver deltakers undergruppe:

# 

# Gå til undergruppe (f.eks. Dagbok – Kari)

# 

# Klikk på Members → Add administrator role

# 

# Velg:

# 

# Rolle: Hjelper eller Gruppestyrer

# 

# Tilgang: Som ønsket (se forrige svar om “Permissions”)

# 

# 📌 Eksempel – Daglig flyt for deltaker (f.eks. Kari)

# Tidspunkt	Aktivitet	Hvordan det fungerer

# Kl. 08:00	Varsel: “Dag 3 – event”	Får push/SMS hvis satt opp i eventet

# I løpet av dagen	Svarer “Kommer” eller “Kan ikke”	Registreres som fremmøte

# Kl. 20:00	Skriver dagbok	Lager en “Post” i sin gruppe “Dagbok – Kari”

# 🚨 Viktig merknad:

# Events kan kun knyttes til den gruppen du oppretter dem i. De kan ikke “pushes” automatisk til flere grupper fra én og samme kilde. Det betyr:

# 

# Daglige events må lages per deltaker hvis de skal være private

# 

# Evt. kan du lage én felles event i hovedgruppen hvis innholdet ikke er sensitivt

# 

# Ønsker du nå:

# 

# At jeg hjelper deg sette opp mal for daglige events?

# 

# Lage forslag til struktur for en uke i Camino-opplegget?

# 

# ELLER vise deg hvordan alt kan kopieres for nye brukere?

# 

# Gi beskjed, så tar jeg deg videre!

# 

# You said:

# Kan jeg bruke min epost (zanderzeim@gmail.com eller sander@aidme.no) på alle brukere med en unik signatur/gjenkjenning så jeg ser hvilken bruker de kommer fra

# ChatGPT said:

# Du kan ikke bruke én og samme e-postadresse direkte for flere brukere i Spond. Spond bruker e-post (og/eller telefonnummer) som unik identifikator per bruker – så du vil få en feilmelding dersom du prøver å registrere flere brukere med samme e-post.

# 

# 🔄 Men! Det finnes flere smarte workarounds du kan bruke for testing og oversikt:

# ✅ Løsning 1: Bruk +alias i Gmail (Gjelder for zanderzeim@gmail.com)

# Gmail støtter "e-postalias" via pluss-tegn:

# 

# zanderzeim+kari@gmail.com

# 

# zanderzeim+ole@gmail.com

# 

# zanderzeim+sander@gmail.com

# 

# ➡️ Alle e-postene havner fortsatt i innboksen din på zanderzeim@gmail.com, men Spond leser dem som ulike brukere. Du vil da kunne se hvilken bruker det kommer fra.

# 

# Fordeler:

# Krever ikke flere e-postkontoer

# 

# Du kan spore og skille alt

# 

# Ideelt til test eller utvikling

# 

# ✅ Løsning 2: Bruk engangsmailer eller sekundære alias i Outlook

# For sander@aidme.no er dette mulig hvis du oppretter:

# 

# Alias som testkari@aidme.no, testole@aidme.no

# 

# Eller bruk Outlook sin støtte for "+-alias" hvis det er aktivert (sjekk Exchange-innstillingene)

# 

# ✅ Løsning 3: Bruk falske telefonnummer i testmodus

# Hvis e-post ikke er påkrevd (og push-varsling ikke trengs), kan du i noen tilfeller registrere testbrukere med dummy-nummer – men dette fungerer kun dersom du ikke aktiverer kontoen via SMS.

# 

# Ikke anbefalt for faktisk bruk, men greit for strukturtesting.

# 

# ✅ Tips for å spore alt i innboksen din

# Lag filtrering i Gmail:

# 

# Søk etter to: zanderzeim+kari@gmail.com → Lag en etikett “Kari – Camino”

# 

# Automatisk arkivering/tagging per testbruker

# 

# 🔒 Husk

# Når prosjektet går live med ekte brukere, må du:

# 

# Slette testbrukerne

# 

# Registrere faktiske deltakere med egen kontaktinfo

# 

# 🚀 Klar for neste steg?

# Vil du at jeg hjelper deg:

# 

# Lage oversikt over fiktive e-poster for testbrukere?

# 

# Lage eksempel-event og testoppsett som mal for alle?

# 

# Bare si fra!

# 

# You said:

# Ja, lag ny steg for steg fra oprettelse av brukere med alias zanderzeim@gmail.com adresse, samt videre steg. Husk reelle og detaljerte eksempler for en god testopplevelse

# ChatGPT said:

# Flott! Her kommer en komplett og reell steg-for-steg-veiledning for å opprette testbrukere i Spond basert på e-postalias fra zanderzeim@gmail.com, samt hvordan du knytter dem til undergrupper og tester funksjonalitet i Camino-prosjektet.

# 

# 🧩 Mål for oppsettet

# Du skal simulere ekte deltakere (eks: Sander, Kari, Ole) i Camino Pilotprosjektet.

# 

# Hver deltaker får egen «dagbok»-undergruppe og individuell test-e-post via alias.

# 

# Du skal teste events, poster, polls og tillatelser i en reell brukssituasjon.

# 

# ✅ STEG 1: Lag alias-e-poster for testbrukere

# Aliasene sender alle meldinger til hovedinnboksen (zanderzeim@gmail.com), men Spond ser dem som unike brukere:

# 

# Navn	Alias-e-post	Tilhørighet

# Sander	zanderzeim+sander@gmail.com	Dagbok – Sander

# Kari	zanderzeim+kari@gmail.com	Dagbok – Kari

# Ole	zanderzeim+ole@gmail.com	Dagbok – Ole

# Felles	zanderzeim+felles@gmail.com	Dagbok – Felles

# ✅ STEG 2: Registrer testbrukere i Spond

# Gå til gruppen "Camino Pilotprosjekt" > klikk på Members > Add member.

# 

# Legg inn:

# 

# Navn: F.eks. Kari

# 

# E-post: zanderzeim+kari@gmail.com

# 

# Rolle: Member

# 

# Gjenta for alle testbrukerne.

# 

# 💡 Tips: Bruk gjerne "Add Custom Field" som "Testrolle" for ekstra sporing under testing.

# 

# ✅ STEG 3: Koble brukere til undergrupper (Dagbok-grupper)

# Gå til gruppen Dagbok – Kari → klikk på Members > Add Member

# 

# Søk opp Kari (nå registrert i hovedgruppen)

# 

# Legg Kari til

# 

# Gjenta for alle testdeltakere og deres respektive dagbøker

# 

# ✅ STEG 4: Angi roller og tilganger (ref. Vedlegg 3)

# I hovedgruppen Camino Pilotprosjekt:

# 

# Gå til Settings > Permissions

# 

# Konfigurer følgende:

# 

# Member: ✔️ Create posts (for å kunne skrive dagbokinnlegg)

# 

# Hjelper: Gi "Create polls", "Manage files" hvis test av mer avansert funksjon

# 

# Gruppeansvarlig (deg): Full tilgang

# 

# Du kan også tildele testbrukerne Hjelper-rolle i undergruppene.

# 

# ✅ STEG 5: Legg til eksempelinnhold

# 📝 A. Lag dagbokinnlegg (Posts)

# Gå til f.eks. Dagbok – Kari

# 

# Klikk Post > Skriv:

# 

# "Dag 2: Gikk 22 km i regnet. Sliten, men stolt! Takk til fellesgruppen for motivasjon."

# 

# Legg evt. ved bilde eller emoji

# 

# 📅 B. Lag individuell event

# Gå til Dagbok – Ole

# 

# Klikk Event > “Refleksjonsstund Dag 3”

# 

# Dato: Velg testdato

# 

# Beskrivelse: “Rolig samtale og innlevering av dagbok”

# 

# Varsle kun Ole

# 

# Aktiver "Attendance"

# 

# 🗳️ C. Test avstemning som oppfølging

# I hovedgruppen, test funksjon som dagbokrefleksjon:

# 

# Gå til Polls > Text poll

# Tittel: "Hvordan var energinivået i går?"

# Alternativer:

# 

# Lav

# 

# Ok

# 

# Høy

# 

# Velg at kun testbrukerne skal svare (kan filtreres via grupper).

# 

# ✅ STEG 6: Test varsling og kontroll i Gmail

# Du vil få e-post til zanderzeim@gmail.com med varsel fra:

# 

# zanderzeim+kari@gmail.com (Spond bruker dette som avsender)

# 

# Test hvordan innlegg ser ut

# 

# Svar på invitasjoner (event/poll) direkte fra e-post

# 

# ✅ STEG 7: Ekstra forbedringer og vurderinger

# Funksjon	Forslag

# Task templates	Bruk til å lage “Daglig innsjekk” eller “Dagbokmal”

# Custom fields	Bruk som "Camino-status", “Sosial mestring” eller “Uke 1 fullført”

# Files	Last opp “Camino-guide” eller motivasjonsdokumenter i fellesgruppen

# Roles	Tildel noen testbrukere rollen “Hjelper” for å teste gruppeoppfølging

# 🧪 Testscenarioer å simulere:

# Sander (bruker) logger inn dagbok 3 dager på rad

# 

# Kari (bruker) svarer på poll og markerer seg som sliten

# 

# Ole (bruker) blir invitert til samtaleevent og melder fravær

# 

# Admin (deg) samler refleksjoner i “Dagbok – Felles”

# 

# Du kontrollerer alt i Gmail og evaluerer struktur og flyt

# 

# 📍Neste steg?

# Jeg kan gjerne lage:

# 

# Full testlogg/observasjonsskjema for hvordan du evaluerer test

# 

# Et forslag til struktur for fullskala-rulle ut hvis pilotoppsettet fungerer

# 

# Bare si fra!

# 

# You said:

# Se om jeg kan tildele task templates, hvordeltagere kan knytte seg til og eventuelt skrive privat dagbok som "tag"

# ChatGPT said:

# Flott spørsmål – her er en detaljert gjennomgang av hvordan Task templates i Spond kan brukes i Camino-prosjektet, og hvordan de potensielt kan støtte personlig oppfølging, privat dagbok og tilknytning til individuelle events eller tags:

# 

# ✅ Hva er Task templates i Spond?

# Task templates lar deg lage forhåndsdefinerte oppgaver som kan knyttes til events. Dette kan brukes til f.eks. innsjekk, refleksjon, rapportering, egenvurdering eller dagbokføring.

# 

# 🧩 Kan templates brukes som “dagbok”?

# Ja, indirekte – slik fungerer det:

# Du lager en event (f.eks. “Daglig refleksjon – Dag 3”)

# 

# Du tilknytter en task template med oppgaver som deltakerne skal gjennomføre (f.eks. 3 spørsmål)

# 

# Deltakeren får oppgaver direkte i appen, og svarene er synlige for admin og oppgavegiver, men ikke for andre deltakere

# 

# 🎯 Opplevd som en “privat dagbok” dersom eventet og oppgaven er navngitt og organisert riktig.

# 

# ✍️ Eksempel: Task template som dagbok

# Gå til Group settings > Task templates

# 

# Lag ny template:

# 

# Navn: Dagbokinnlegg – Camino

# 

# Oppgaver:

# 

# “Hva gjorde du i dag?”

# 

# “Hvordan hadde du det?”

# 

# “Noe du vil dele med veileder?”

# 

# Velg “Skriftlig svar”

# 

# Lag en daglig event for hver deltaker (ev. i undergruppen deres)

# 

# Koble task template til eventet

# 

# Bare den deltakeren ser og svarer – svarene kan leses av deg som gruppeleder

# 

# 🏷️ Bruk av Tags som “dagbokstema”

# Spond har ikke “tags” i klassisk forstand, men du kan simulere det:

# 

# Navngi events eller posts som:

# 

# “\[Fysisk] Dag 2 – Energi og form”

# 

# “\[Mental] Dag 3 – Motivasjon”

# 

# “\[Sosial] Dag 4 – Kontakt med gruppa”

# 

# Eller du kan bruke Custom fields på medlemmet for å merke status som:

# 

# “Refleksjonsnivå: Lav/middels/høy”

# 

# “Tema i fokus: Sosial mestring”

# 

# ✅ Oppsummering av hvordan du bruker det i Camino-prosjektet:

# Behov	Spond-funksjon	Notat

# Daglig oppfølging	Events + Task templates	Lag individuelle events med refleksjonsoppgaver

# Privat dagbok	Svar på oppgaver i events	Synlig kun for admin og deltaker

# Tilknytning til tema	Navngivning + Custom fields	Bruk \[Tema] i eventnavn eller lag egne medlemfelt

# Automatisk oppfølging	Repeterende events	Dupliser eventer og gjenbruk oppgaver

# Testscenario	Lag event i “Dagbok – Kari” med template	Kari svarer på dagens dagbok – du evaluerer svar i adminpanelet

# Vil du jeg skal lage et konkret task template og en event-mal som du kan bruke med testbrukerne (Sander, Kari, Ole)? Da får du en kopi du bare kan fylle ut og teste.

# 

# You said:

# Uploaded image

# Vurder brukervennlighet ovenfor qndre diskuterte løsninger, gjennomførbarhet, og evt praktisk steg for steg: 

# -Er det mulig å gi deltager en begrenset tilgang for sitt "event" eller "subkanal"? De må ikke ha innsyn i dagbøker/journaler fra andre deltagere. 

# \- Kan isåfall jeg eller de benytte seg av definerte template, helst individuelle og nye (hvis praktisk gjennomførbart) både for info om turen, dagbøker, og polls/skjema for erfaring/undersøkelser fortløpende. Spesielt polls/oppgaver kunne det vært fordelaktig med type standardiserte spørsmål som kan se progresjon/forbedringer gjennom turen (mulig dette burde være ett eller flere (samme) skjema/polls med daglig repitisjon

# ChatGPT said:

# Takk – med utgangspunkt i rollen du viser i bildet (administratorroller i Spond), og ønsket om individuell tilgang, dagbokføring og repeterbare skjemaer, får du her en grundig vurdering og konkret steg-for-steg gjennomførbarhet basert på funksjonene i Spond:

# 

# ✅ Kan deltaker få begrenset tilgang til egen event eller undergruppe?

# Delvis mulig – via undergrupper og individuelt opprettede events:

# 

# Ønske	Spond-funksjon	Brukervennlighet	Gjennomførbarhet

# Ingen innsyn i andres dagbøker	Ja – bruk én-til-én undergruppe	👍 Høy	👍 Enkel å opprette

# Begrenset tilgang kun til egne events	Ja – event synlig kun for inviterte	👍	👍

# Bruk av templates pr. deltaker	Delvis – må gjentas manuelt	⚠️ Middel	👍

# Bruk av standardiserte polls/undersøkelser	Ja – “Tasks” eller “Polls”	👍 Godt grensesnitt	👍

# Repetisjon daglig	Manuell kopi av event (eller planlegge)	⚠️ Litt merarbeid	👍

# 🛠️ Steg for steg: Individuell tilgang med dagbok, skjema og oppgaver

# 🔒 1. Opprett undergrupper for hver deltaker

# Eksempel:

# 

# “Dagbok – Kari”

# 

# “Dagbok – Ole”

# 

# Disse fungerer som egne rom med kun én deltaker + admin.

# 

# 📅 2. Lag events med begrenset deltakelse

# Opprett event med tittel:

# 

# “Dag 1 – Refleksjon Kari”

# 

# Inviter kun Kari til dette eventet.

# 

# Gå til «Tasks» i eventet og legg til en mal (se neste steg).

# 

# 🧩 3. Lag task templates (engangs eller repeterbar)

# Gå til Gruppeinnstillinger > Task templates

# 

# Eksempelmal:

# Navn: Daglig dagbok

# Spørsmål:

# 

# Hvordan har du hatt det fysisk og psykisk i dag?

# 

# Var det noe spesielt du opplevde?

# 

# Har du forslag til forbedringer i morgen?

# 

# Svar: Tekstfelt (privat mellom deltaker og admin)

# 

# ➡️ Bruk denne mal på alle dagbok-events

# 

# 🔁 4. Dupliser dagbokeventer (for daglig bruk)

# I stedet for å lage nye fra bunnen av hver dag:

# 

# Gå til eksisterende event > klikk "Duplicate event"

# 

# Endre dato og tittel, og behold deltaker og template

# 

# 📊 5. Bruk “Polls” for daglige vurderinger / progresjon

# Eksempel:

# 

# Hvordan har du det i dag? (skala 1–5)

# 

# Hvor mange kilometer gikk du i dag?

# 

# Hvor godt sov du i natt?

# 

# ➡️ Resultater kan vises som trend for administrator

# ➡️ Kan kopieres for hver dag og tilpasses deltaker

# 

# 🧪 6. Reell testoppsett med deg selv (alias-adresse)

# Registrer testbruker “Kari” med zanderzeim+Kari@gmail.com

# 

# Opprett undergruppe “Dagbok – Kari”

# 

# Lag første event med task template og én poll

# 

# Logg inn som “Kari” i annen nettleser og test svar

# 

# Gjenta med ny bruker: zanderzeim+Ole@gmail.com

# 

# 🎛️ 7. Bruk administratorroller for å tildele begrenset ansvar

# Som du viste i bildet:

# 

# Lag rolle “Veileder” med kun:

# 

# Se egne undergrupper

# 

# Lese svar

# 

# Lage eventer innenfor spesifikt prosjekt

# 

# ➡️ Da kan en hjelpeadmin følge opp Kari, mens en annen følger opp Ole.

# 

# ✨ Ekstra forbedringsforslag

# Tiltak	Verdi

# Navngivning	Bruk standard: “Dag X – Dagbok Kari”

# Visualisering	Bruk emojis eller fargevalg i navngivning for bedre oversikt

# Veilederunderskrifter	La “Veileder Kari” kommentere på dagbokinnlegg i eventene

# Avsluttende evaluering	Lag en “Oppsummering Camino” task template med spørreskjema

# Ønsker du at jeg lager ferdige tekster for spørsmål og maler du kan lime inn som test – både for dagbok, polls og evaluering?

# 

# You said:

# Jeg fikk en fantastisk ide som du analysere og vurdere:

# \- Husk å alltid pilotprosjekt for mestring chat som referanse

# \- sjekk og det er tilsvarende systemer/apper for det allerede

# \- muligheten for å utvikle det med deg. Først "lavterskel"/manuell testing av konseptet for en relativt lett/billig POV (proof of value eller proof of concept). Så mulighet for mer etablert løsning/system/app.

# \- konsept er primært ment for helsesektoren (Rehabilitering), krimomsorg, forsikringsselskap, større arbeidsgivere, og andre relevante store

# \- ser også mulighet for dette, kanskje lettere versjon, som kommersiell app/system for alle

# \- Sjekk målgrupper som bør fokuseres på først.Sjekk terskel, måter og muligheter for innpass til en slik løsning hos større aktører

# \- siden det inneholder delvis sensitiv informasjon, fra og med samtykke fra brukeren, hvordan det stilles til at denne informasjonen må deles og genereres da gjennom eksempelvis ChatGPT. Vurder sikkerhet og muligheter for at brukerene kan samtykke til slike opplysninger (evt anonymisert) blir kun brukt til å generere dagboken deres (Se konsept under). Spesielt antar jeg samarbeid med offentlige aktører må alt være på det rene.

# \- Kom med egne forbedringer og forslag på hvordan konseptet kan berikes. Spesielt i forbindelse med rehabiliteringeffekt tuftet på konseptet.

# \- Se på mulighet å koble både personlige og kommersielle bilder/videoer til konseptet for å øke personligjøringen/effekten.

# \- muligheten for å deling av hele eller deler av materiell/konsept fra brukeren, spesielt til obligatoriske oppfølgingsystemer for helsesystem på deltager (eks. Aktivitetsplanlegger til NAV)

# 

# Jeg ønsket i utgangspunktet å arrangere reise for deltagere (med rus og/eller helse problemer), og fikk således en veldig god beskrivelse for hver dag og ettappevis for Camino turen. Deltagere vil daglig på turen føre dagbok, og eventuelle målinger på deres helse/mestringsførelse. Det er denne dataen -Turinfo fra ChatGPT og brukerens egen erfaring- jeg ønsker å "behandle" kombinert i eksempelvis ChatGPT. Slik får deltageren sin egen reise, progresjon, med alle fakta detaljer fra sin reise -både fysisk og mentalt- svart på hvitt. Jeg tror dette vil ha stor effekt på deltager å se/bli påminnet hvor mye man har utviklet og reflektert i løpet av turen -og skal gjøre underverker for personlig vekst, og en påminner/oppmuntring når man trenger det. 

# ChatGPT said:

# Dette er et svært lovende konsept! For å kunne gjøre grundig research og vurdere eksisterende løsninger, målgrupper, innpass i helsesektor/offentlig sektor, datasikkerhet, mulighet for utvikling med ChatGPT og mer, trenger jeg å få avklart noen punkter først:

# 

# Ønsker du at researchen primært fokuserer på Norge, Norden, eller internasjonalt marked?

# 

# Hvilke konkrete funksjoner ser du for deg i den første manuelle testversjonen? (F.eks. dagbok med AI-generert sammendrag, helse/motivasjonsmålinger, deling med veileder/NAV, osv.)

# 

# Skal løsningen kunne brukes både under fysisk aktivitet (som Camino) og hjemme/ved digital rehabilitering?

# 

# Har du allerede aktører eller organisasjoner i tankene du ønsker å teste dette med først?

# 

# Når jeg har dette, kan jeg gjøre grundig research på:

# 

# Eksisterende løsninger og apper

# 

# Vurdering av lavterskel MVP

# 

# Juridiske og sikkerhetsmessige aspekter (f.eks. AI og helseopplysninger)

# 

# Målgrupper og innpass hos større aktører

# 

# Videre utviklingspotensial og kommersiell skalering

# 

# Gleder meg til å hjelpe deg videre!

# 

# You said:

# 1\. Begynner på "hjemmebane" Norge, men Europa og Internasjonalt er meget aktuelt

# 2\. Ja, de som du nevner som umiddelbare. Men bruk kreativiteten for å undersøke ytterligere verdibudskap. (Eksempelvis knytte tale til den, så man kan få det opplest. Enda bedre, som en personlig meditasjon på øret med påminner om sin egen iboende styrke)

# 3\. Jeg ser for meg i første omgang knyttet til fysisk aktivitet (som har beviselig god terapeutisk effekt), samt det vil da være større mulighet/lettere for en kommersialisering til "vanlige" brukere på app. Men jeg tar gjerne imot forslag

# 4\. Ikke forpliktet til men jeg har nettverk innen sosial rehabilitering, NAV, helsevesenet, så det er kanskje letteste vei

# ChatGPT said:

# Flott – jeg setter i gang en grundig vurdering av muligheten for å utvikle og teste dette konseptet som et digitalt oppfølgingsverktøy, med utgangspunkt i Camino-pilotprosjektet og målgrupper i norsk helsevesen, NAV, og rus-/kriminalomsorg. Jeg vil også vurdere eksisterende løsninger og muligheten for manuell test, samt sikkerhetsaspekter ved bruk av AI og personlig data. Du hører fra meg snart med en full rapport og forslag til videre utvikling.

# 

# Research completed in 7m · 16 sources · 124 searches

# AI-Basert Dagbok for Rehabilitering og Mestring

# 

# Rapport: Personlig reisedagbok for rehabilitering – Konseptvurdering

# Introduksjon og bakgrunn

# Camino-konseptet handler om å gi personer i fysisk og mental rehabilitering et verktøy for å føre en personlig dagbok koblet til en reisemetafor. Deltakerne dokumenterer sin egen opplevelse og fremgang, kombinert med faktiske data fra en “reise” de gjennomfører (for eksempel en virtuell tur langs Camino-ruten). Ved hjelp av generativ AI som ChatGPT kan det legges inn rike turbeskrivelser og fakta om stedene de “passerer” på reisen. Målet er at brukeren får en personlig og reflekterende reiseoppsummering som styrker mestringsfølelsen og motivasjonen under rehabiliteringsprosessen. Det følgende er en grundig vurdering av dette konseptet, inkludert en kartlegging av lignende eksisterende løsninger, forslag til testoppsett, identifisering av målgrupper, vurdering av juridiske forhold, videreutviklingsmuligheter og integrasjon av flere medier, samt anbefalte forbedringer.

# 1\. Eksisterende lignende systemer og apper

# Det finnes en rekke verktøy og apper som berører elementer av dette konseptet, om enn ingen som identisk kombinerer reisegamifikasjon, dagbokskriving og generativ AI. Nedenfor oppsummeres relevante eksempler fra forskjellige sektorer:

# Helsesektoren (rehabilitering og mental helse): Journaling/dagbokføring er allerede et velkjent verktøy i terapi og rehabilitering. For eksempel brukes dagbøker i spiseforstyrrelsesbehandling – pasienter skriver ned måltider, tanker og følelser som så gjennomgås med behandleren. Et nylig prosjekt i Sverige digitaliserer dette ved å gå fra papir til en app (iMål) for å gjøre pasientens måltidsdagbok mer interaktiv og nyttig

# vgregion.se

# . Det finnes også dedikerte apper for rehabiliteringsstøtte. Et eksempel er appen A Rehab Diary, som er utviklet nettopp for å støtte brukeren i alle faser av rehabiliteringsreisen

# apps.apple.com

# . Denne appen hjelper pasienten med å loggføre skader og fremgang og fungerer i samspill med terapeut, slik at rehabiliteringen optimaliseres. For mental helse finnes en rekke digitale selvhjelpsdagbøker. Apper som Day One, Journey, Reflectly m.fl. er populære internasjonalt for personlig journaling og refleksjon. Day One-appen utmerker seg med å kunne integrere bilder, videoer, stedsposisjon, værdata og lignende i dagboksnotatene

# thesweetsetup.com

# , noe som viser at elementer av faktadata fra en reise kan flettes inn automatisk i en digital dagbok. Slike verktøy brukes primært av brukeren selv (kommersiell selvhjelp), men prinsippene kan overføres til rehabiliteringsfeltet – nemlig at rike kontekstdata gjør dagboken mer engasjerende. I Norge har Helsedirektoratet og kommunale aktører fokus på mestringsverktøy for pasienter (f.eks. “Frisklivssentraler” tilbyr ofte notatbøker eller digitale skjema for egenregistrering av aktivitet og humør). Foreløpig ser det ut til at mange av disse er manuelle eller fragmenterte løsninger, men tendensen er klar: digital oppfølging og pasientjournalføring i rehabilitering blir stadig vanligere

# vgregion.se

# .

# NAV og arbeidstrening: Innen arbeidsrettede tiltak (f.eks. NAVs oppfølgingsprogrammer for sykmeldte eller arbeidsavklaring) er journaling brukt mer uformelt. Deltakere kan bli anbefalt å føre logg eller dagbok over sine daglige aktiviteter, arbeidstrening og helseopplevelser for å øke selvinnsikten og dokumentere progresjon. Det finnes likevel ingen kjent offisiell NAV-app som kombinerer dagbok og reisegamifikasjon per i dag. NAV har riktignok digitale aktivitetsplaner på nav.no der brukere og veiledere planlegger og følger opp avtaler og aktiviteter, men disse fungerer mest som sjekklistestyring, ikke en personlig refleksjonsdagbok. I praksis benyttes ofte generelle verktøy (notatbøker, Word-dokumenter eller gruppediskusjoner) for at brukerne skal reflektere over hverdagen sin. Her kan det ligge et uutnyttet potensial: et system som Camino-konseptet kan gi NAV-klienter et mer motiverende rammeverk rundt aktivitet (en “reise” mot et mål) og oppmuntring til å skrive om sine utfordringer og mestring. Slik sett vil konseptet være nyskapende i NAV-sammenheng, da det kombinerer arbeidsrettet rehabilitering med egenrefleksjon og psykologisk motivasjon. Vi fant ingen eksakte paralleller via søk, noe som tyder på at konseptet fyller et hull, men også at NAV som offentlig etat vil kreve solid dokumentasjon før de tar i bruk noe slikt.

# Kriminalomsorgen (fengsler og prøveløslatelse): Journalskriving har også vært brukt som et terapeutisk virkemiddel i kriminalomsorgen internasjonalt. Forskning tyder på at strukturert, interaktiv dagbokskriving kan bidra til redusert tilbakefall (recidiv) blant straffedømte med rusproblemer. En randomisert studie publisert i International Journal of Offender Therapy and Comparative Criminology (2012) viste at innsatte som deltok i et interaktivt dagbok-program hadde betydelig lavere tilbakefallsrate (51% gjentatt kriminalitet innen 12 mnd) enn kontrollgruppen (66%)

# pubmed.ncbi.nlm.nih.gov

# . Studien konkluderte med at interaktiv journaling er lovende som en korttids intervensjon for innsatte med rusavhengighet, og at det potensielt kan redusere tilbakefall

# pubmed.ncbi.nlm.nih.gov

# . Dette illustrerer at dagbok/selvrefleksjonsverktøy kan ha stor effekt i rehabilitering også hos denne målgruppen. Per i dag finnes det konseptuelt lignende opplegg, som “Interactive Journaling®” benyttet i noen fengselsprogram i USA, men i Norge er det nokså nytt. Kriminalomsorgen har fokus på utdanning og livsmestring for innsatte, så et Camino-lignende dagbokopplegg kan passe inn f.eks. i overgangsboliger eller programmene for rusmestring i fengsel. Ingen kjent app er spesiallaget for norske forhold her, men metodikken med skriveøvelser og refleksjonsnotater er allerede i bruk manuelt. Et digitalt verktøy med AI-generert narrativ (som gir innsatte en følelse av “reise mot et bedre liv”) kan øke engasjementet. Selvsagt må en slik løsning tilpasses strenge sikkerhetskrav (isolert nett, begrenset tilgang til nettinnhold, etc.) i kriminalomsorgen.

# Forsikringsselskaper: Flere forsikringsselskaper, spesielt innen helse- og livsforsikring, utforsker digital oppfølging for å få kunder raskere tilbake i jobb og bedre helse. Et eksempel internasjonalt er Vitality-programmet (bl.a. i Sør-Afrika/UK/USA) der kunder belønnes for fysisk aktivitet (registrert via app/bærbar enhet) gjennom premier eller rabatter. Disse programmene inkluderer gjerne gamification av trening (poeng, nivåer, utfordringer) og i noen tilfeller refleksjonsoppgaver, men rene dagbokstjenester er ikke utbredt. Likevel er det nærliggende at forsikringsselskaper kan ta i bruk slike konsepter – f.eks. kunne et selskap tilby en “rehab-dagbok” app til kunder som er sykemeldt etter en skade, for å motivere dem i opptreningen og dokumentere fremgang for både bruker og selskap. Vi kjenner ikke til konkrete eksisterende apper fra forsikringsaktører som kombinerer reisedagbøker med AI, så her vil Camino-konseptet være noe nytt. En parallell er likevel trenden med wellness-apper i forsikringsbransjen – ofte plattformer der brukeren logger trening, kosthold og får coaching. Å legge til en personlig fortellingsdimensjon (reisehistorie) i en slik app kan være et differensierende grep kommersielt.

# Kommersiell selvhjelp (nasjonalt og internasjonalt): I forbrukermarkedet florerer det av selvhjelps- og treningsapper som benytter dagbok, AI-coach og gamification. Noen relevante eksempler:

# AI-drevne dagbøker: Tjenester som Mindsera og Rosebud integrerer kunstig intelligens for å gi brukeren veiledning og innsikt mens de skriver dagbok. Mindsera omtales som “det eneste journalverktøyet som reflekterer tilbake” til brukeren – en AI-kopilot for tankene

# mindsera.com

# . Den tilbyr blant annet automatisk følelsesanalyse av det du har skrevet og mulighet til å “snakke med din egen dagbok” via en innebygd chatbot som kjenner innholdet ditt

# mindsera.com

# . Dette gir en smakebit på hvordan AI kan gjøre journaling mer interaktiv og personlig. Rosebud på sin side kombinerer journaling med vaneoppfølging og emosjonell støtte, og fremhever personvern (kryptert lagring) for at brukerne skal føle seg trygge

# rosebud.app

# rosebud.app

# . Disse verktøyene er rettet mot personlig vekst og mental helse, og viser at markedet er klart for løsninger der AI hjelper enkeltpersoner med refleksjon og motivasjon.

# Reise- og treningsdagbøker: Det finnes apper som fokuserer på virtuelle reiser som motivasjon for trening, hvilket ligner Camino-konseptets reiseelement. Et kjent internasjonalt eksempel er The Conqueror Virtual Challenges, hvor brukere registrerer sin fysiske aktivitet (løping, gåing, sykling) og ser progresjonen som en virtuell rute på et kart (f.eks. “gå lengden av England” eller “Ringenes Herre – Reisen til Mordor”). Underveis får man tilsendt virtuelle postkort med interessant informasjon om stedene man (virtuelt) passerer som belønning for fremdriften

# theconqueror.events

# . Hvert postkort inneholder fakta og historikk, og oppmuntrer brukeren til å fortsette mot neste milestein

# theconqueror.events

# . Man kan også få medaljer ved fullført distanse

# theconqueror.events

# . Dette konseptet – å kombinere fysisk aktivitet med storytelling og belønninger – har hatt stor suksess kommersielt (hundretusener av brukere globalt). Det indikerer at reisemetaforen og fakta fra ruten kan øke motivasjonen for å gjennomføre kjedelige treningsmål. Camino-konseptet skiller seg ut ved å knytte dette tettere opp mot personlig refleksjon og rehabilitering, men kan dra veksler på de positive erfaringene herfra.

# Tradisjonelle journaling-apper: Apper som Day One (nevnt over), Journey, Diarium osv. brukes av mange for dagbokskriving generelt. Selv om de ikke er spesifikt for rehabilitering, har de etablert beste praksiser for brukervennlig design, synkronisering og sikkerhet for personlige notater. Day One har f.eks. end-to-end-kryptering av innhold og TouchID/FaceID-lås for å beskytte brukerens private tanker. Slike sikkerhets- og designprinsipper vil være viktige også i Camino-appens utvikling (mer om det under pkt. 5). Det er verdt å merke seg at journaling generelt har veldokumenterte helseeffekter: Personer som skriver jevnlig i dagbok opplever ofte mindre stress, lavere depresjonsnivå og bedre humør

# thesweetsetup.com

# . Over tid kan journaling også endre atferd positivt i relasjon til andre

# thesweetsetup.com

# . Disse funnene underbygger at et konsept som kombinerer journaling med rehab-aktiviteter sannsynligvis vil ha god effekt på brukernes psykiske velvære.

# Sammenfattet finnes det altså mange del-elementer av Camino-konseptet spredt i eksisterende løsninger – fra helsejournaling til gamifisering av treningsøkter og AI-drevet refleksjonsstøtte. Ingen kjent løsning retter seg spesifikt mot norsk offentlig sektor eller kombinerer alle elementene i én pakke. Dette betyr at prosjektet har et innovasjonspotensial, men også at man må hente læring fra beslektede prosjekter for å unngå fallgruver. Eksempelvis viser Conqueror og lignende at faktiske reisedata og historiefortelling kan integreres på en engasjerende måte, og AI-dagbokapper viser at personlig tilbakemelding i journaling er teknisk mulig og ettertraktet. Disse innsiktene bør tas med i videre utvikling.

# 2\. Manuell testing av konseptet (Proof of Value)

# Før man investerer i utvikling av en fullverdig app/system, er det klokt å gjennomføre en Proof of Value – en enkel pilot der man tester konseptet i liten skala med rimelige midler. Her kan man utnytte eksisterende verktøy som allerede er tilgjengelige, slik brukeren foreslår: for eksempel en kombinasjon av Spond (gruppeapp), ChatGPT og manuelle dagbøker. Nedenfor skisseres et mulig lavterskel testoppsett steg for steg:

# Rekruttere pilotdeltakere og definere “reisen”: Plukk ut en liten gruppe deltakere (f.eks. 5–10 personer) i målgruppa – dette kan være pasienter ved et rehabiliteringssenter, brukere i et NAV-tiltak eller en selvhjelpsgruppe for mental helse. Velg et konkret reisemål eller tema for piloten. Et naturlig valg er Camino de Santiago (pilegrimsleden) som metafor, siden konseptet er “basert på Camino-prosjektet”. Definer total distanse eller etappene som skal dekkes i løpet av piloten (f.eks. 100 km virtuell vandring over 4 uker, delt i etapper).

# Etablere en digital samhandlingsplattform – bruk av Spond: Spond er en populær norsk app for gruppeorganisering (ofte brukt i idrettslag etc.), og den kan her fungere som kommunikasjonskanal og dagbok-hub for pilotgruppen. Opprett en hovedgruppe i Spond kalt f.eks. “Camino Pilotprosjekt”. I Spond kan man invitere alle deltakerne (de trenger bare smarttelefon). Man kan opprette undergrupper eller arrangementer for hver deltaker eller for ulike formål:

# Én idé er å ha individuelle undergrupper kalt “Dagbok – \[Navn]” for hver deltaker, slik at deltakerne kan poste sine dagbokinnlegg der. Bare deltakeren og utvalgte administratorer/veiledere vil ha tilgang til akkurat den gruppen, slik at innholdet forblir personlig. (Spond støtter ulike roller som gruppeadministrator, hjelpetrener osv., så man kan gi f.eks. terapeuter eller prosjektledere tilgang som veiledere uten å eksponere alle deltakernes innlegg for hverandre, med mindre man ønsker en felles deling.)

# I tillegg kan man ha en felles gruppe eller feed (f.eks. “Dagbok – Felles” eller et arrangement per uke) der man legger ut generell informasjon, motivasjonsmeldinger og felles oppdateringer om “reisen”. Her kan alle se og eventuelt kommentere, som skaper fellesskapsfølelse (“vi er på reise sammen”).

# Manuell registrering av aktivitetsdata: Avtal med deltakerne hvordan de skal registrere sin fysiske fremdrift. For eksempel kan hver deltaker få utdelt en enkel skrittteller, bruke mobilen sin til å spore kilometer, eller bare rapportere inn hvor langt de har gått/trent hver dag. Dette kan gjøres via Spond (deltakeren kan f.eks. sende en kort melding i sin dagbokgruppe: “Gikk 3 km i dag langs lokalstien, føltes bra”). Alternativt kan de levere dette gjennom et Google-skjema eller en enkel Excel-ark til prosjektleder, men Spond har allerede melding/kommentar-funksjon som kan utnyttes.

# Dagboksskriving og refleksjon: Be deltakerne skrive noen setninger hver dag eller et par ganger i uken om hvordan det går – fysiske følelser (energi, smerte etc.), mentale tanker (motivasjon, humør) og eventuelle opplevelser. Dette er kjernen i dagboken. I pilotfasen kan deltakerne skrive dette manuelt i Spond-gruppen sin (som en vanlig post eller kommentar). Ikke alle er vant til å skrive dagbok, så for å senke terskelen kan man gi dem en kort mal eller noen spørsmål å svare på hver gang, f.eks.: “Hvor gikk du i dag og hvor langt? Hvordan føltes det i kroppen? Hvordan var humøret før og etter turen? Noe du la merke til underveis (fuglesang, vær, tanker som dukket opp)?” Disse stikkordene kan hjelpe dem i gang med skrivingen.

# Bruk av ChatGPT til turbeskrivelser (faktadata): Her kommer det unike innslaget: For å gi dagboken en rik kontekst, vil prosjektteamet bruke ChatGPT (eller annen AI) til å generere “reisebrev” eller turbeskrivelser knyttet til deltakernes fremdrift. Siden dette er en manuell pilot, kan man gjøre det på følgende måte: Prosjektlederen samler inn hvor langt hver deltaker har kommet langs den virtuelle Camino-ruten. Basert på dette bestemmer man hvilket sted eller etappe deltakeren “befinner seg på” i den virtuelle reisen. Deretter kan man spørre ChatGPT om å skrive en kort beskrivelse av denne etappen – inkludert geografi, kultur og kanskje en oppmuntrende tone. For eksempel: “Skriv en inspirerende reisebeskrivelse for en person som går Camino de Santiago og nå har nådd landsbyen Estella. Inkluder litt historie om stedet og beskriv landskapet på veien dit.” ChatGPT vil da generere et avsnitt som om det er hentet fra en turguide eller roman. Teamet bør lese gjennom og evt. korrigere fakta (særlig på norsk kan det hende man må justere språket litt), men generelt er ChatGPT flink til å produsere slike beskrivelser. Disse AI-genererte turbeskrivelsene kan så legges ut i deltakerens dagbok (f.eks. av veileder som en kommentar under deltakerens egen tekst, eller integrert i et sammendrag). For at deltakeren tydelig skal forstå at dette er en del av historien, kan man formatere det annerledes (kanskje kursiv og med overskrift “Reisebrev fra \[Sted]”). Slik får hver dag/uke en personlig fortelling: Deltakerens egne refleksjoner smelter sammen med et levende bilde av omgivelsene de “går gjennom”.

# Motivasjon og tilbakemelding: Under pilotperioden er det viktig å opprettholde motivasjonen. Bruk Sponds funksjonalitet til å sende push-varsler eller meldinger – f.eks. et lite “heiarop” midt i uka (“Halvveis til neste stopp, stå på!”). Man kan også trekke inn ChatGPT her for å generere varierte motiverende meldinger eller quotes. Veiledere/prosjektleder bør også lese deltakernes dagboknotater jevnlig (med samtykke, i pilotgruppen er dette forhåpentligvis forventet) og komme med personlig tilbakemelding: anerkjenn fremgang, empati ved motgang, og kanskje tips videre. Denne menneskelige interaksjonen er viktig selv om konseptet er AI-basert, da det gir trygghet og forsterker mestring. Pilotdeltakere vil nok sette pris på å vite at noen faktisk følger med og heier på dem.

# Oppsummering og personlig reisebok: Ved pilotens slutt (f.eks. etter 4 uker), samles alt innholdet for hver deltaker. Nå kan teamet bruke ChatGPT på nytt for å generere en oppsummering av hele reisen. Dette kan inkludere: total distanse, hvor de “kom fram” (kanskje fullførte de et definert mål), høydepunkter fra dagboken (for eksempel kan man mate inn deltakerens egne mest positive utsagn i løpet av perioden slik at AI-en kan flette det inn). Resultatet kan bli en slags personlig reisehistorie i tekstform. Teamet kan redigere og formatere denne pent – eventuelt legge til bilder (fra nettet, f.eks. bilder av stedene deltakerne “besøkte” virtuelt, eller bilder deltakerne selv har tatt mens de gikk tur i nærmiljøet). Deretter kan man presentere dette til deltakeren som en reisebok/rapport over deres mestringsreise. Dette kan være digitalt (PDF) eller til og med trykket ut som et lite hefte for ekstra effekt. Tanken er at deltakerne skal kunne lese sin egen historie og virkelig se hvor langt de har kommet, både fysisk og mentalt.

# Dette oppsettet krever minimalt med ny teknologi: Spond tar seg av det sosiale og strukturelle, ChatGPT brukes “på siden” av teamet (kanskje via nettgrensesnittet eller API dersom man har litt teknisk kompetanse) for å generere tekstene, og deltakerne trenger bare smarttelefon og vilje til å delta. Fordelen er at man raskt får testet: Hvordan responderer brukerne på konseptet? Synes de det er motiverende å få AI-genererte reisebeskrivelser? Fører dagbokskrivingen til økt refleksjon og mestringsfølelse som håpet? Man kan samle kvalitative tilbakemeldinger gjennom intervjuer eller spørreskjema etterpå. Ulempen med manuell pilot er naturligvis at det er tungvint å skalere – det er mye håndarbeid for teamet hver uke (hente data, be ChatGPT om tekster, poste dem ut, følge opp). Men i en avgrenset periode er dette overkommelig og vil gi uvurderlig innsikt i hva som fungerer og hva som bør justeres før man bruker tid/penger på å utvikle egen programvare. Som et konkret eksempel: La oss si “Kari” er deltaker. Hun er sykmeldt med ryggplager og lav motivasjon. I pilotens første uke går hun totalt 5 km fordelt på flere turer i nabolaget. Hun skriver i dagboken at det var tungt i starten, men at hun nøt frisk luft og følte seg lettere til sinns etter turene. Teamet ser at 5 km tilsvarer at hun (virtuelt) har nådd byen Pamplona på Camino-kartet. De ber ChatGPT lage en kort tekst: “Du har nå ankommet Pamplona – en historisk by kjent for okseløpene under San Fermín-festivalen. På veien hit har du gått gjennom frodige dalfører i Navarra-regionen. Tenk at du allerede har tilbakelagt 5 kilometer! I middelalderen pustet pilegrimer lettet ut når de nådde Pamplona, og det kan du også – du har all grunn til å være stolt av starten din på reisen.” Denne teksten postes i Karis Spond-gruppe. Når hun leser det, får hun et konkret bilde av hva 5 km “betyr” og en følelse av fremdrift i en større sammenheng. Kanskje motiverer det henne til å gå nye 5 km neste uke for å “komme til neste by”. Slik fortsetter det. Underveis ser også Kari at veileder kommenterer: “Bra jobba denne uka, Kari! Du tok grep selv om ryggen verket – imponerende 💪”. Denne blandingen av personlig støtte og narrativ fremstilling av progresjon er kjernen i opplevelsen. Alt i alt vil en slik pilot demonstrere konseptets verdi i praksis. Samtidig kan man avdekke praktiske utfordringer: Synes deltakerne det er vanskelig å skrive? Må vi forenkle AI-tekstene? Hvordan håndtere om noen faller av og ikke “fullfører reisen”? Svarene på dette kan så brukes til å forme neste steg – enten skalerende pilot eller utvikling av en dedikert app.

# 3\. Målgrupper, første-fokus og muligheter vs. barrierer i offentlig sektor

# Konseptet med en AI-assistert reisedagbok for mestring er relativt generisk og kan potensielt hjelpe mange ulike grupper. Det er likevel klokt å identifisere noen primære målgrupper å fokusere på i startfasen, både for å spisse produktet og for å lettere få aksept hos eventuelle offentlige samarbeidspartnere. Her vurderes aktuelle målgrupper og kontekst, samt hvilke utfordringer og muligheter som finnes for å ta konseptet inn i offentlig sektor som NAV og helsevesenet: a) Pasienter i fysisk rehabilitering (somatisk helse): En åpenbar målgruppe er personer som gjennomgår fysisk rehabilitering etter skader, operasjoner eller sykdom. Dette kan være alt fra ortopediske pasienter (kne-, ryggoperasjoner) til hjertepasienter i opptreningsprogram, eller de med kroniske muskel-/skjelettplager som deltar i mestringskurs. Felles for disse er behovet for gradvis opptrening og egenaktivitet over tid, ofte kombinert med at motivasjonen kan svinge. Konseptet kan gi dem struktur (de ser en “vei” de skal gå), jevn oppmuntring (narrativet og AI-tilbakemeldinger) og en måte å uttrykke frustrasjoner og fremskritt på (dagboken). Muligheter: Helsevesenet etterspør ofte måter å øke pasientenes egeninnsats og etterlevelse av treningsprogram på – her kan en engasjerende app være et verktøy i fysioterapeutens verktøykasse. Det passer inn i trenden “digital hjemmeoppfølging”. For eksempel kunne et rehabiliteringssenter kjøre et gruppetilbud med Camino-app som supplement til fysiske møter. Barrierer: Offentlige helseaktører er forsiktige med nye uprøvde verktøy. Man må trolig først demonstrere effekt gjennom pilotstudier eller forskning før sykehus/kommuner tar det inn. I tillegg kreves ofte anbudsprosesser og godkjenning (f.eks. via Helseplattformen eller lignende) for å integrere nye digitale løsninger. Et annet praktisk hinder er at noen pasienter (eldre spesielt) kanskje ikke er komfortable med apper eller skriving – man må sikre at grensesnittet er enkelt og at det finnes alternativer (kanskje kunne de bruke tale til å diktere dagboknotater i stedet for å skrive, se pkt. 6). b) Personer i mental rehabilitering/psykisk helsevern: Dette kan inkludere personer med depresjon, angst, utbrenthet eller rusavhengighet som er i behandling eller oppfølging. Journaling er et etablert hjelpemiddel i psykisk helse (f.eks. som del av kognitiv terapi), og fysisk aktivitet er ofte en del av behandlingsplanen for mild/moderat depresjon. Camino-konseptet kunne gi en meningsfull ramme for disse: de får følge sin indre reise parallelt med en ytre, symbolsk reise. Å skrive om sine tanker og se egen fremgang kan styrke selvinnsikten. Muligheter: Psykisk helsefeltet, inkl. DPS-er og kommunale lavterskeltilbud, har de senere år tatt i bruk flere digitale verktøy (som online terapi, apper for meditasjon etc.). Myndighetene har også fokus på “Recovery”-perspektivet hvor pasientens egen prosess og historie vektlegges. En personlig reisedagbok-app passer godt inn i recovery-tenkning fordi den lar brukeren skape en sammenhengende narrativ om sin bedring. Hvis man kan knytte appen opp mot f.eks. psykologer eller psykiatriske sykepleiere som får (med samtykke) følge med på pasientens dagbok, kan det forbedre behandlingen (terapeuten får mer innsikt i pasientens hverdag og fremgang). Barrierer: Igjen vil spørsmål om personvern og ansvar dukke opp – psykiske lidelser involverer svært sensitiv informasjon. Offentlig psykisk helsevern vil kreve at verktøyet er skikkelig sikret og at bruken er faglig forsvarlig. Det må ikke bli en “behandling” i seg selv utenfor kontroll – man må understreke at appen er et hjelpemiddel og ikke en erstatning for terapeut. Noen behandlere kan være skeptiske til AI generelt. Man må også være obs på at enkelte i denne gruppen kan trigges av visse typer innhold; AI-tekster må derfor genereres med forsiktighet og helst være nøytrale/positive. Opplæring av brukerne i hvordan de skal forholde seg til AI-delen (forstå at teksten om reisestedene er generert og generell, ikke personlig informasjon) kan også behøves for å unngå misforståelser. c) NAV-tiltak for arbeidsrettet rehabilitering: Personer som er på arbeidsavklaringspenger, i yrkesrettet rehabilitering eller andre NAV-program etter sykdom/skade, utgjør en stor gruppe som kunne ha nytte. Disse befinner seg ofte i en situasjon med gradvis opptrapping av aktivitet, enten det er fysisk trening, kurs eller utprøving i jobb. Samtidig er motivasjon og mental helse en kritisk faktor for om de lykkes å komme tilbake i arbeid. En NAV-veileder har begrenset kapasitet, så et digitalt egenaktivitet-verktøy kan supplere godt. Muligheter: Konseptet kan ses på som et verktøy for aktivisering og mestring som NAV ønsker for sine brukere. Det kan potensielt føre til raskere progresjon og at folk føler seg sett/hørt gjennom sin digitale dagbok – noe som kan forhindre at de “forsvinner” passivt i systemet. Offentlig sektor har også insentiver (IA-avtalen etc.) for å ta i bruk innovative løsninger som kan få sykmeldte tilbake i jobb. Dersom man kan vise til suksesshistorier og kanskje kostnadsbesparelser (kortere stønadsløp, mindre behov for hyppige fysiske møter dersom app-oppfølging fungerer), vil NAV-leddet kunne være interessert. Barrierer: NAV er en stor organisasjon med tunge IT-systemer; å få inn en ny app her krever ofte sentral godkjenning. Sikkerhet og personvern er også her et tema – brukerne deler personlige helseopplysninger, så dataene må behandles forsvarlig. Et annet hinder er at NAV-brukere er en svært heterogen gruppe – noen er godt utdannet og digitalt kompetente, andre sliter med lese- og skriveferdigheter eller språkutfordringer. Appen må være intuitiv og kanskje flerspråklig, eller supplert av enkel opplæring/veiledning i bruk. Det kan også være motstand hos noen saksbehandlere som er vant til tradisjonelle metoder; de må overbevises om at dette ikke bare er “nok en app” som gir dem merarbeid, men tvert imot noe som avlaster dem ved at brukeren tar større eierskap til egen fremgang. En startstrategi kan være å fokusere på NAV-tiltak der deltakelsen er frivillig og brukerne er motivert – f.eks. prosjekter gjennom arbeidsmarkedsbedrifter, frisklivsentraler i samarbeid med NAV, osv., fremfor å prøve å tvinge det på alle AAP-mottakere uten videre. d) Kriminalomsorg og rusomsorg: Personer under kriminalomsorgens tiltak (fengsel, prøveløslatelse, rusbehandling i institusjon) er en mulig målgruppe som allerede nevnt. Spesielt de som er i en slags rehabiliteringsmodus – f.eks. de som går i program for å endre kriminell/rus-atferd – kan dra nytte av strukturert selvrefleksjon. Muligheter: Her kan konseptet brukes til å fremme indre motivasjon for endring. En innsatt kunne “gå en virtuell pilgrimsferd” mens han fysisk trener i luftegården eller på tredemølle – en symbolsk reise mot et nytt liv. Dagboken kan hjelpe vedkommende å bearbeide følelser og ansvar for egne valg. Som forskning indikerer, kan journaling bidra til å redusere tilbakefall hos rusavhengige kriminelle

# pubmed.ncbi.nlm.nih.gov

# pubmed.ncbi.nlm.nih.gov

# , så potensialet er stort. Også i rusomsorgen generelt (utenfor fengsel) kunne dette verktøyet passe, f.eks. for pasienter i døgnbehandling eller ettervern som trenger støtte for å holde seg rusfri og fysisk aktiv. Barrierer: Dette er en sektor med svært høye krav til sikkerhet og kontroll. Å gi innsatte tilgang til en app med AI som henter informasjon fra nettet kan være problematisk – mange fengsler tillater kun offline verktøy eller strengt filtrert tilgang. Man måtte eventuelt lage en offline versjon av AI-delen (forhåndslagre tekster om reisesteder lokalt i appen). Det kreves dessuten tillatelse/aksept fra kriminalomsorgen for slike programmer. Ofte kreves det forskningsprosjekter eller NGO-samarbeid for å få inn nye tiltak i fengsler. En annen utfordring er at en del av brukerne her har lav utdanning, lese- og skrivevansker eller konsentrasjonsproblemer, så appen må være ekstra enkel og kanskje støtte bruk av bilder, video og lyd (heller enn mye tekst). Man bør også vurdere faren for misbruk – kan noen f.eks. poste upassende ting eller kommunisere med andre innsatte via appen? For å unngå det kan det være lurt at dagboken her ikke er sosial (ingen innbyrdes kommunikasjon, kun privat mellom bruker og veileder). Tross barrierene, dersom man lykkes vil gevinsten kunne være betydelig i form av bedre rehabilitering og lavere kriminalitet. e) Kommersielt selvhjelpsmarked (friske brukere): Selv om hovedfokuset er rehabilitering, er det verdt å nevne at en enklere variant av konseptet også kan lanseres som en selvhjelpsapp for hvem som helst. For eksempel kan en mosjonist eller en som ønsker bedre mental balanse bruke appen som en motiverende dagbok for å nå sine personlige mål (trening, vektnedgang, mindfulness). Muligheter: Kommersielt kan dette gi inntekter som kan støtte videre utvikling. Dessuten kan bred bruk gi verdifulle data (under samtykke) om hva som funker. Barrierer: Markedet er allerede fullt av apper her, så det kan være vanskelig å skille seg ut utenfor nisjen. Også i forbrukermarkedet er personvern en voksende bekymring – brukerne vil vite at data om deres liv er sikre og ikke misbrukes. Oppsummering av innpass i offentlig sektor: For at en offentlig aktør som NAV eller helsevesenet skal ta inn konseptet, må man trolig bevise verdien (gjennom pilotprosjekter med dokumenterte resultater), sørge for personvern og sikkerhet (jf. neste punkt) og tilpasse språk og profil til offentlig kontekst. Det kan være smart å starte med et begrenset samarbeid – f.eks. med en enkelt kommune, et sykehusavsnitt eller en NAV-fylkesavdeling – for et formelt pilotprosjekt. Hvis det lykkes, kan det danne modell for utvidelse nasjonalt. Muligheten er at offentlig sektor ser dette som et verktøy som både kan forbedre brukernes helse og spare ressurser (færre som dropper ut av tiltak, mer effektive møter fordi man har dagbokdata i forkant etc.). Barrierene koker ned til byråkrati, personvern, digital ekskludering og holdninger blant ansatte – alle håndterbare med riktig strategi, men krever tid og tålmodighet.

# 4\. Juridiske og sikkerhetsmessige hensyn ved bruk av AI (ChatGPT)

# Å bruke ChatGPT eller lignende generativ AI i en applikasjon som håndterer personlige (og potensielt helserelaterte) opplysninger reiser flere viktige juridiske og sikkerhetsmessige problemstillinger. Disse må adresseres grundig for å beskytte brukernes personvern og for å tilfredsstille krav fra offentlige samarbeidspartnere. Nedenfor er en gjennomgang av de sentrale hensynene: a) Personvern, GDPR og samtykke: I henhold til personvernforordningen (GDPR) regnes helseopplysninger og andre personlige refleksjoner som sensitive personopplysninger. Det betyr at behandlingen av disse dataene krever et klart lovlig grunnlag. For en app som dette vil trolig det mest aktuelle grunnlaget være brukers eksplisitte samtykke, eventuelt kombinert med at behandlingen er “nødvendig for å yte en helsetjeneste” hvis en helseaktør står bak (men da under strenge betingelser). Uansett må brukeren informeres svært tydelig om hvordan data brukes. Spesielt viktig: Om man sender dataene til en tredjepartstjeneste som ChatGPT (OpenAI), må brukeren vite det og samtykke til det, siden det innebærer overføring av data ut av appens kontroll. Uten et slikt informert samtykke vil det være ulovlig å dele brukers personlige tekst med OpenAIs systemer. Faktisk advarer dataeksperter sterkt mot å taste inn pasientdata i ChatGPT uten nødvendige personverntiltak

# icthealth.org

# . Det må formidles til både brukere og fagpersoner at alt man skriver til ChatGPT kan bli lagret i skyen på ukjent server – potensielt utenfor Europa

# icthealth.org

# . Datatilsynet i Norge har uttalt generelt om KI-tjenester at det du skriver eller laster opp ofte brukes til å forbedre tjenesten, altså lagres og kan gjenbrukes

# datatilsynet.no

# . Dette er problematisk med sensitive data. Så i praksis: skal man bruke ChatGPT, må man enten (1) deaktivere datalagring/trening hos leverandøren, (2) anonymisere data før sending, og/eller (3) sørge for at brukeren uttrykkelig går med på risikoen. Heldigvis tilbyr OpenAI nå noen løsninger – f.eks. mulighet til å slå av chat-historikk slik at promptene ikke brukes til trening

# icthealth.org

# . Men selv da behandles dataene på servere i utlandet, og europeiske tilsyn (inkl. Italienske) har reagert fordi persondata ble prosessert på servere i USA i strid med GDPR

# icthealth.org

# . For offentlige aktører i Norge vil det sannsynligvis ikke være akseptabelt å sende ukrypterte persondata til USA på denne måten. Et alternativ kan være å bruke OpenAI’s Azure-tjeneste i EU (Microsoft tilbyr hosting av GPT-modeller i europeiske datasentre under streng kontroll). Eventuelt kunne man kjøre en open-source LLM lokalt eller på norsk helsenett for full kontroll (men slike modeller er per i dag mindre kapable enn GPT-4). Uansett løsning må man sannsynligvis gjennomføre en DPIA (Data Protection Impact Assessment) som vurderer risiko for personvernet, og implementere avbøtende tiltak før lansering, særlig hvis offentlig sektor er partner. b) Informert samtykke og brukerkontroll: I tillegg til det regulatoriske samtykket, kommer det et etisk aspekt: brukerne må forstå hva AI-en gjør med deres informasjon og hva dens begrensninger er. For eksempel bør det forklares at “Tekstene som genereres om reisene er laget av en datamodell og er kun ment som motiverende innhold – de kjenner ikke deg personlig, og du må ikke ta dem for profesjonelle råd”. Spesielt sårbare brukere (f.eks. innen mental helse) kan tillegge AI-en autoritet eller tro den har “meninger” om dem. Derfor bør appen ha klare ansvarsfraskrivelser og veiledning. Man bør også gi brukeren kontroll i den forstand at de kan velge vekk AI-delen hvis de ønsker – f.eks. at de kan bruke dagboken uten å få genererte beskrivelser, dersom de er ukomfortable med det. Og selvfølgelig må de kunne trekke samtykke og få dataene sine slettet hvis de ikke vil fortsette. Alt dette følger av GDPRs krav til transparens og brukerkontroll. c) Sikker lagring og tilgangsstyring: Dagbøkene vil inneholde personlige ytringer og helseopplysninger, så lagring må være forsvarlig. For et offentlig samarbeid må man sannsynligvis følge “Norm for informasjonssikkerhet i helse og omsorg” (Normen) eller tilsvarende. Det betyr blant annet:

# Data skal lagres kryptert, både “at rest” (på server/databaser) og “in transit” (overføring).

# Tilgang til data skal begrenses etter need-to-know-prinsippet – kun de med tjenstlig behov (f.eks. brukerens egen terapeut hvis del av opplegget) får se dem, og kun med brukerens samtykke. I mange tilfeller vil dagboken være kun brukerens eget og da må ingen andre ha innsyn.

# Hvis løsningen integreres med offentlige systemer, må man vurdere om dagbokinnholdet blir en del av pasientjournalen (med de formelle krav det innebærer, som innsynsrett, journalforskrift etc.). Kanskje anser man det som en personlig selvhjelpsjournal utenfor journal-systemet, men hvis helsepersonell aktivt bruker det, kan grensen bli flytende.

# Systemarkitekturen må beskytte mot uautorisert inntrenging. Det bør gjennomføres sikkerhetstesting (penetrasjonstester) før man tar det i bruk i stor skala.

# Ved bruk i kriminalomsorg må man også tenke på sikring mot misbruk – f.eks. at en innsatt ikke kan kommunisere ut av fengselet via appen. Dette kan løses ved at appen ikke har åpen meldingsfunksjon med eksterne, og at alt innhold som lastes opp (f.eks. bilder) gjennomgås. For forbrukere generelt er ikke det et tema, men robust moderering av innhold kunne uansett vurderes for å fange opp hvis AI-generert tekst eller brukerens innhold blir upassende/skadelig.

# d) AI-relatert risiko – feil og bias: ChatGPT og andre LLMer kan komme med feilaktig informasjon (hallusinasjoner) eller upassende innhold hvis de trigges feil. I vårt tilfelle er det meste av genereringen ganske velavgrenset (reisefakta, motivasjon), og sannsynligheten for grove feil er kanskje ikke stor – men den er der. Man risikerer for eksempel at ChatGPT genererer en historisk “fakta” om et sted som ikke stemmer, eller en kommentar som kunne misforstås. I verste fall, hvis prompten ikke er designet godt, kunne AI komme med noe som utløser vonde følelser (tenk om en deltaker har mistet et barn, og AI-teksten tilfeldigvis sier noe sårende om “familie” pga. en generisk mal). Derfor bør AI-innholdet kvalitetssikres. I en pilot kan mennesker lese over før det sendes ut (som vi skisserte). I en automatisert app bør man bygge inn noen safeguards: f.eks. blokkere visse temaord, kjøre språkvask for tone (unngå moraliserende eller klinisk språk). Man kan også vurdere å begrense AIens ytringer til relativt nøytral informasjon heller enn personlig tilpasning, slik at risiko for feil reduseres. Hvis AI likevel skal analysere brukerens tekst (f.eks. oppsummere følelsene de uttrykker), må man vite at den kan ta feil – et falskt negativt (AI-en overser at brukeren er suicidale fordi språket deres var subtilt) eller falskt positivt (AI-en tror brukeren er veldig deprimert basert på enkelte ord, selv om det ikke er så alvorlig) kan få konsekvenser hvis man stoler blindt på det. Løsningen er at AI ikke bør få siste ord alene; evt. flagg bør gjennomgås av en fagperson i klinisk setting. I en selvhjelpssetting bør appen aldri gi medisinske råd, kun generelle oppmuntringer. e) Avtaler og ansvarsforhold: Ved samarbeid med offentlige etater må det inngås databehandleravtaler hvis en leverandør håndterer dataene. F.eks. hvis et firma utvikler Camino-appen og leverer den til et sykehus, vil firmaet være databehandler og sykehuset behandlingsansvarlig for pasientdataene. Da må det være kontrakt som spesifiserer hvordan data sikres, hva som skjer ved brudd osv. Hvis appen tilbys direkte til forbrukere, må vilkårene (ToS) dekke lignende punkter – hva data brukes til, og ikke minst at AI-innholdet er uten garanti. Man bør klargjøre at man ikke tar ansvar for handlinger brukeren gjør basert på AI-tekster. Slike juridiske tekster kan virke tørr, men er nødvendige skjerming mot potensielle søksmål (tenk om noen hevder “appens råd gjorde meg deprimert” – man må kunne vise til at det ikke var ment som profesjonelt råd). f) Oppfyllelse av helsekrav: Dersom appen markedsføres som et medisinsk hjelpemiddel (f.eks. for behandling), kan den i verste fall falle inn under kravene til medisinsk utstyr (CE-merking klasse I eller IIa, etc.). Siden denne appen mer er et mestringsverktøy og ikke en diagnostisk eller behandlende algoritme, vil man kanskje unngå den kategoriseringen, men det er verdt å ha i bakhodet. Hvis offentlig sykehus skal bruke det, vil de uansett kreve intern godkjenning via sine e-helsedivisjoner. Sammendrag: For å trygge juridisk og sikkerhetsmessig bruk må man bygge personvern inn fra start. Det innebærer å velge tekniske løsninger som ivaretar data (helst europeiske skytjenester eller lokal drift), innhente nødvendige samtykker og være åpne om hvordan AI fungerer. Man må gi brukeren valgmuligheter og trygghet for at de eier sine data (de kan laste ned dagboken sin, slette den ved ønske etc.). Det er også sannsynlig at man i forbindelse med offentlig bruk må innom etiske komiteer eller personvernombud for vurdering. Den gode nyheten er at slike prosesser nå er vanlige – mange utvikler generativ AI-løsninger, og det jobbes på europeisk nivå med retningslinjer. For eksempel lanseres det varianter som ChatGPT Enterprise hvor bedrifter (eller helseaktører) selv kontrollerer data og OpenAI ikke bruker dem til trening

# teknologiradet.no

# . Slike løsninger kan åpne døren for tryggere bruk. Inntil da må man ha et bevisst forhold til risiko: man kan gjerne bruke ChatGPT i Proof of Value-fasen der man har samtykke fra pilotdeltakerne, men for en produksjonstjeneste må personvernet opp på topp nivå for å få grønt lys fra offentlige partnere.

# 5\. Veien videre: Fra konsept til app/system

# Gitt positive erfaringer fra pilottesting, vil neste steg være å utvikle konseptet til et mer helhetlig system – enten som en selvstendig app eller integrert i eksisterende plattformer. Her må man tenke på to retninger: offentlig bruk (f.eks. en versjon tilpasset NAV/helsevesen) og kommersiell bruk (en app folk kan laste ned selv eller som selges til forsikringsselskap/bedrifter). I det følgende skisseres forslag til videreutvikling, inkludert potensielle navn, kjernefunksjonalitet og teknisk arkitektur. Navneidéer: Et godt navn bør være lett å huske, formidle essensen og fungere på norsk (og gjerne engelsk om man tenker internasjonalt). Siden “Camino” allerede er brukt internt, kan man vurdere å beholde dette eller en variant. Noen muligheter:

# Camino Kompass – antyder vei og retning på reisen.

# Mestringsreisen – norsk navn som sier akkurat hva det er (fokus på mestring gjennom reise).

# LivsLogg eller Livsreise – fokuserer på at det er en logg av livets reise.

# RehabReisen – tydelig for rehabilitering, men kanskje litt tungt.

# WayBetter – et ordspill på “way” (vei) og det å bli bedre. Kunne fungert internasjonalt.

# Journi (ev. “Journey”) – kort og internasjonalt, men mange slike apper finnes (må sjekkes for unikhet).

# Stride eller StrideDiary – “stride” som i skritt fremover.

# MindTrail – kobler mental (mind) og løype (trail).

# Medvind – et positivt norsk ord (å ha medvind på turen).

# Steg for Steg – norsk, konkret, men kan være brukt i andre sammenhenger.

# For offentlig versjon kan navnet gjerne signalisere seriøsitet og norsk språk, mens en kommersiell app kan ha et mer catchy navn. Navnet bør også kunne lages en fin logo av – kanskje et lite pilegrimssymbol, fotspor eller lignende. Kjernefunksjonalitet: Både for offentlig og kommersiell variant vil hovedfunksjonene overlappe. Her er de viktigste modulene funksjonsmessig:

# Personlig dagbok: Et område hvor brukeren kan skrive (eller ta opp tale, se pkt. 6) sine daglige/ukentlige notater. Bør støtte tekst, emoji, muligens bilder. Inndeling etter dato, og man kan bla tilbake i historikken. Gjerne funksjon for å merke “viktige øyeblikk” eller milepæler.

# Virtuell reise/kart: En modul som viser den virtuelle ruten man følger. Dette kan være et kart med en pin som beveger seg når brukeren legger inn distanse/aktivitetsdata. Eller en liste over etapper med prosent fremdrift. For eksempel en side som viser “Du er nå 30% gjennom reisen fra St. Jean Pied de Port til Santiago” med et kartutsnitt. Inkluder gjerne info om neste etappe: “Neste stopp: Burgos, 12 km igjen”. Dette gir klare mål å sikte mot.

# Dataimport for aktiviteter: Mekanismer for å få inn fakta fra brukerens fysiske aktivitet. Ideelt integreres appen med helse- og treningsdata: F.eks. kobling mot Google Fit eller Apple HealthKit for å hente antall skritt, distanse, sykkeløkter etc. Da slipper brukeren å registrere manuelt – appen kan automatisk si “Du gikk 4 532 skritt i dag – dette tilsvarer ca. 3,5 km.” og plotte det inn i reisen. For de som ikke bruker slik teknologi, bør man ha enkel manuell registrering (f.eks. et + tegn hvor de kan legge til “Jeg gikk X km i dag” eller “30 min fysioterapiøvelser”, alt etter hva man vil spore).

# AI-generert narrativ og innsikt: Dette er killer-funksjonen som skiller appen ut. Her vil man integrere en AI-tjeneste (som GPT-4) i bakgrunnen. Det kan fungere slik: Hver gang brukeren logger en viss distanse eller fullfører en etappe, trigges AI til å generere en reisebeskrivelse for denne delen. Teksten flettes så inn i dagboken eller vises i en egen “reisebrev”-seksjon. I tillegg kan AI brukes til andre ting: F.eks. ukentlig oppsummering av brukerens fremgang (“Denne uken gikk du 10 km totalt, til tross for en treg start. Flott innsats!”) – her kan AI oppsummere fakta brukeren har generert i appen. Noen mer avanserte muligheter: AI kan gi forslag til dagbokinnhold (“I dag kan du reflektere over: Hva motiverte deg til å komme deg ut?”) eller til og med foreta en enkel sentimentanalyse av det brukeren skrev (f.eks. på slutten av uka kan appen si: “Vi merker at du har vært mer positiv de siste dagene – bra!”). Slike AI-funksjoner må selvsagt være tydelige og med forbehold, men de kan gi bruker ekstra innsikt. (I Mindsera-appen får man f.eks. frem mest omtalte temaer i dagboken og følelseskurver

# mindsera.com

# mindsera.com

# &nbsp;– noe lignende kan vurderes her, dog i enklere form). For at dette skal fungere teknisk må appen kalle et API til AI-tjenesten med de rette promptene, og håndtere responsen. Det vil kreve litt eksperimentering for å få til bra norsk output. Kanskje jobbe med oversettelser (hvis modellen funker bedre på engelsk, kan man oversette fram og tilbake, men det er ekstra steg).

# Sosial og støtte-komponent: Her må man vurdere nøye balansen mellom privat dagbok og sosial deling. I en ren selvhjelpsapp kan det være interessant med et slags fellesskap – at brukere kan (frivillig) dele milepæler eller motivasjonsposter med andre som også “går på en reise”. En slags Facebook-aktig feed innenfor appen hvor man heier på hverandre. Dette kan bygge fellesskapsfølelse, slik man ser i f.eks. RunKeeper eller Strava der folk deler treningsøkter. Men i en helse-/NAV-kontekst ønsker man kanskje mer lukkede rom: f.eks. at en gruppe deltakere under oppfølging av samme veileder kan se hverandre (slik Spond-piloten la opp til). Teknisk sett kan man lage grupper i appen: En gruppe = et lukket fellesskap der innlegg kan deles og veileder kan poste. Denne funksjonen krever moderering og god tilgangskontroll (en feil her kan lekke data mellom brukere som ikke skal se hverandre, så det må designes nøye). Et alternativ dersom man ikke vil gå full sosial, er å ha en veileder/terapeut-portal. Altså en web-basert løsning der autoriserte veiledere kan logge inn og følge med på sine brukeres progresjon og dagbok (gitt samtykke). Dette er mer aktuelt for offentlig bruk – f.eks. en fysioterapeut kunne se en liste over pasientene sine, hvor langt de har gått, lese noen utdrag av dagboken (eller bare se et stemningsbarometer). En slik portal må følge sikkerhetskrav (helst integrere med Helsenettet for autentisering, f.eks. Feide eller ID-porten login for veiledere).

# Sikkerhets- og personvernfunksjoner: Som del av funksjonaliteten må det bygges inn muligheter som: Innstillinger for personvern (skru av/på at AI får bruke notater for analyse), oversikt for bruker over hva som er delt med hvem (f.eks. “Din NAV-veileder har tilgang til din reiselogg, men ikke dine fritekst dagboksnotater” avhengig av samtykkegrad). Også en export/backup-funksjon (slik at brukeren kan laste ned hele dagboken sin som PDF for å beholde, særlig viktig hvis de slutter i programmet men vil ta med seg minnene). I kommersiell app bør det også være en passord/biometri-lås for å åpne dagboken, så uvedkommende på telefonen ikke leser den – dette er standard i gode dagbok-apper

# thesweetsetup.com

# .

# Teknisk arkitektur: For å realisere ovennevnte funksjoner må man sette sammen en robust arkitektur:

# Klientapplikasjon: Mest sannsynlig en mobilapp (iOS og Android). Kryssplattform rammeverk kan vurderes (f.eks. React Native eller Flutter) for å raskere nå begge plattformer, eller native utvikling for best ytelse. Brukeren skal kunne bruke appen offline for å skrive notater når som helst (de kan sync’e senere), men mye funksjonalitet (som AI) krever internett.

# Backend/server: En skybasert backend som håndterer datalagring, autentisering, integrasjon mot AI og eventuelle tredjepartstjenester (kart, helse-APIer). Denne kan bygges som en klassisk webserver med API (f.eks. en REST/GraphQL API). Database for å lagre brukerprofiler, dagbokposter, progresjon osv. Her må man vurdere valg mhp. sikkerhet: for offentlig bruk kunne man bruke f.eks. Microsoft Azure med datasenter i Nord-Europa (mange offentlige bruker Azure for sky). For sensitiv data bør man ha kryptering på radnivå og separasjon av identifiserbare opplysninger fra innhold hvis mulig (f.eks. psevdonymisering).

# Integrasjoner:

# Integrasjon mot treningsdata (Apple HealthKit/Google Fit): Dette skjer typisk fra klient-appen, som ber om tillatelser til å lese stegteller etc. Mobil-OS-et håndterer mye av sikkerheten her.

# Integrasjon mot kart/tur-data: Man kan bruke en tjeneste som Google Maps API eller OpenStreetMap for å få kart. Kanskje en spesiell database med kjente ruter (Camino, andre pilegrimsløyper, kanskje norske turstier) for å kunne presentere stedsnavn og fakta. Faktabeskrivelsene kan hentes fra Wikipedia via API kombinert med AI for å oppsummere, eller rett og slett genereres helt av AI fra stedsnavn (men da som sagt med verifikasjon). Kanskje bygge opp et internt bibliotek av reisetekster for de mest brukte rutene, slik at AI ikke alltid må gjøre alt fra scratch.

# AI-tjenesten: Egen modul som sender prompt til GPT-4 (eller annen modell) via API. Her bør man implementere caching for kostnadskontroll (ikke generer samme tekst mange ganger), og kanskje få lov av brukeren til å lagre genererte tekster i deres logg (slik at de ikke endres i ettertid).

# Autentisering: Hvis appen skal integreres i helse/NAV, vil man vurdere å bruke BankID/ID-porten for å logge inn, slik at man sikkert vet hvem brukeren er (og kan knytte dem mot f.eks. en pasientjournal eller NAV-saksnummer i systemene). For en frittstående app vil vanlig epost/passord eller telefonnummer SMS-kode suffice, men man bør tilby to-faktor for økt sikkerhet, gitt sensitive data.

# Skalerbarhet: Kommersiell suksess kan bety mange tusen samtidige brukere, så backend bør lages skalerbar (microservices, container orchestration som Kubernetes, etc.). For offentlig pilot med f.eks. 100 brukere er ikke dette en stor faktor, men man planlegger helst med fremtiden i mente.

# Logging og overvåking: Systemet bør logge viktige hendelser (på en personvernvennlig måte) for å kunne feilsøke og oppdage misbruk. F.eks. logge hvis AI-modulen svarer med en error eller uventet innhold, slik at utviklere kan forbedre promptene.

# Teknologivalg: Her er det mange muligheter, men for eksempel: Backend i Node.js/Typescript eller Python (Django/FastAPI) som kaller OpenAI API, en PostgreSQL database for data, og klientapp i Flutter. Bruk gjerne eksisterende pakker for kalender/dato-håndtering, grafvisning av progresjon osv., for å spare tid.

# Tilpasning offentlig vs kommersiell:

# En offentlig versjon av systemet kunne kanskje tilbys som en modul i eksisterende pasientportaler. F.eks. integreres med Helsenorge.no eller NAVs systemer slik at brukeren har ett sted å logge inn. Dette er dog komplisert å få til kort sikt. Alternativt at offentlige instanser inngår lisensavtale med appen og får egen tenant (et eget område) i den. Da kan appen være generisk, men data for f.eks. “Helse Bergen” sine pasienter holdes separat, og man kan brande den med sykehusets logo etc. Offentlig versjon vil kanskje skru av noen sosiale funksjoner (ingen åpent forum) og ha mer streng datakontroll.

# En kommersiell app retter seg rett mot forbruker eller via partnere (forsikring, treningssentre, selvhjelpskurs). Den kan ha litt mer “lekne” funksjoner – som at brukere kan velge ulike reiser (ikke bare Camino; noen vil kanskje gå “Norge på langs” virtuelt, eller en fiktiv reise i en fantasiverden – slike valg kan være attraktivt kommersielt). Man kan også ha premium-funksjoner som abonnement: f.eks. AI-coach samtaler (som Mindsera tilbyr å “chatte med dagboken”

# mindsera.com

# ), flere detaljkart, personlige rapporter generert som PDF-bok med grafikk, osv. Dette kan finansiere gratis basisbruk for noen, eller finansiere at man kan gi gratis bruk til f.eks. enkelte pasientgrupper via sponsor.

# Samlet vil utvikling til et fullverdig system kreve tverrfaglig arbeid: teknologer, designere (for å lage et intuitivt UI), fagfolk (helsepersonell/psykologer for å sikre at konseptet har ønsket terapeutisk effekt) og selvfølgelig sluttbrukere som gir tilbakemelding. En iterativ utviklingsprosess anbefales – starte med en MVP-app med de mest kritiske funksjonene (dagbok, enkel reisesporing, AI-tekstgenerering) og så bygge ut mer funksjonalitet etterhvert. Teknisk bør man hele tiden ha i mente de juridiske kravene fra punkt 4, slik at man ikke utvikler seg inn i et hjørne (f.eks. ved å la være å kryptere fra dag én, noe man angrer på senere).

# 6\. Integrasjon av lyd, tale, meditasjon, bilder og video

# For å øke engasjement og den terapeutiske verdien, bør konseptet utnytte at moderne enheter og programvare kan håndtere multimediale opplevelser. Ulike mennesker responderer på ulike stimuli – noen foretrekker å lytte fremfor å lese, noen motiveres av visuelt materiell, osv. Her er forslag til hvordan diverse personlige innholdselementer kan integreres:

# Lyd (bakgrunnslyd og musikk): Lyd kan brukes subtilt for å forbedre stemningen i appen. For eksempel kunne appen tilby avspilling av beroligende naturlyder som bakteppe mens brukeren leser sin reisebeskrivelse eller skriver i dagboken – f.eks. fuglekvitter når teksten handler om en skogsetappe, bølgeskvulp når de nærmer seg kysten. Dette kan øke innlevelsen. Man kan også la brukeren selv velge musikk/lydspor i bakgrunnen, slik at dagbokskrivingen blir en mindful, rolig stund. Et annet aspekt er lydopptak: dersom brukeren vil kan de legge ved lydklipp i dagboken – kanskje et lydopptak av at de er andpustne men glade på toppen av en bakke de nettopp har besteget, eller lyd fra omgivelsene på en gåtur (vind, elv). Slikt kan gi dagboken ekstra rikdom og kan være terapeutisk ved at brukeren gjenopplever øyeblikket senere når de hører på det.

# Tale (speech) som input og output: Taleintegrasjon kan senke barrierer for mange. For det første kan man implementere en dikteringsfunksjon – altså at brukeren trykker på en mikrofon og snakker, og så transkriberer appen det til tekst i dagboken. Dette er nyttig for de som ikke liker å skrive eller har skrivesperre. Å beskrive følelser muntlig kan føles mer naturlig for noen. Mobiltelefoner har i dag svært gode tale-til-tekst biblioteker (f.eks. Apple Dictation, Google Speech API) som kan integreres. Om man vil gå videre, kan man la brukeren sende talemeldinger i dagboken sin som lagres som lydfil (noe à la WhatsApp, men privat). For det andre kan appen tilby tekst-til-tale for AI-innholdet: tenk at når brukeren får et nytt “reisebrev” fra AI-en, så kan de trykke en avspillingsknapp og få det opplest (kanskje med en behagelig stemme som høres ut som en guide). Dette kan være både praktisk (for de som sliter med å lese mye tekst) og gir en ny dimensjon – nærmest som å høre en lydbok om sin egen reise. Moderne TTS (text-to-speech) har blitt overraskende naturtro, så dette er gjennomførbart. I en terapeutisk kontekst kan dessuten eget stemmeopptak av refleksjoner være verdifullt – f.eks. at brukeren snakker inn en pep-talk til seg selv som de kan spille av senere når motivasjonen daler.

# Meditasjon og avspenning: Det er veldokumentert at meditasjonsøvelser og mindfulness kan hjelpe rehabiliteringspasienter med smertehåndtering, stress og mental balanse. Appen kan integrere korte meditasjons- eller pusteøvelser, kanskje knyttet til reisemetaforen. Eksempel: Etter en slitsom dag (kanskje brukeren skrev om frustrasjon), kan appen foreslå: “Ta en 5-minutters pustepause – hør på denne guidede avspenningen.” Dette kan være i form av lydfiler (for eksempel en innlest meditasjon som guider brukeren gjennom kroppsskanning eller visualiseringsteknikk). Man kan enten lage eget innhold eller integrere med kjente tjenester (noen meditasjonsapper har åpne API eller samarbeidspotensiale). En idé er å lage meditasjoner som følger reisemetaforen, f.eks. “Forestill deg at du går på en sti, kjenn bakken under føttene…” som kan være svært beroligende og i tråd med historien. Slike elementer gjør opplevelsen helhetlig – ikke bare fysisk aktivitet, men også mental trening.

# Bilder og visuelle elementer: Bildebruk kan være på flere måter:

# Automatisk genererte eller forhåndslagrede bilder av reisesteder: Når AI-en beskriver etappe til Pamplona, kunne appen vise et foto av Pamplonas byport eller landskapet rundt. Dette gir en umiddelbar visuell forankring. Bilder kan hentes fra et royalty-fritt bibliotek eller via et integrert API (f.eks. Flickr/Unsplash API med passende søkeord). Man må bare være obs på lisensrettigheter og personvern (helst unngå ansikter i bilder). Et alternativ er å bruke AI-genererte bilder (f.eks. via DALL-E eller Stable Diffusion) for å lage kunstneriske illustrasjoner av etappene.

# Brukerens egne bilder: Appen kan oppmuntre brukeren til å ta bilder under sine faktiske turer/aktiviteter i hverdagen. Dette kan de legge inn i dagboken. For eksempel: “Last opp et bilde fra turen din i dag”. Mange vil synes det er moro å knytte et faktisk minne (solnedgang, utsikt fra åsen, smilet etter trening) til den virtuelle reisen. Over tid får man en samling personlige bilder som gjør dagboken enda mer verdifull som minnebok.

# Motivasjonsbilder og meme-er: Kanskje kan appen servere et “dagens inspirasjon” bilde eller quote en gang i blant – f.eks. et fint naturfoto med et motiverende sitat. Ikke for mye (skal ikke ta fokus fra brukerens egen prosess), men av og til kan visuelle inspirasjoner være en fin boost.

# Visuelle elementer er også viktig for brukergrensesnittet generelt – f.eks. å ha en grafisk fremstilling av fremdrift (en fjellillustrasjon der en figur klatrer oppover for hver fullførte etappe, etc.). Særlig for brukere med kanskje litt lav leseferdighet kan ikoner og bilder guide dem.

# Video: Video kan integreres på flere vis:

# Brukerens videodagbok: Noen vil kanskje uttrykke seg bedre gjennom video enn tekst. Appen kan tillate at man spiller inn en kort video-snutt som en dagboklogg (for egne øyne, eller for å dele med veileder om ønskelig). Å snakke inn i kamera om hvordan uka har vært kan føles mer personlig og gi sterkere mestringsfølelse når de ser tilbake på det: “Se, der var jeg for 2 måneder siden, nå har jeg kommet så mye lenger”. Teknisk kan dette bety mye data, så man kan begrense lengde eller komprimere, men det er overkommelig.

# Veileder-/ekspertvideoer: I en offentlig setting kunne man inkludere noen korte videohilsener fra kjente motivatorer eller fagpersoner. Tenk deg at etter 50 km, dukker det opp en 1-minutts video fra fysioterapeuten som sier “Gratulerer, du er halvveis! Dette har du klart med viljestyrke og innsats – fortsett sånn!”. Dette kan enten lages generisk eller unikt pr deltaker (mer realistisk generisk). Man kan også ha instruksjonsvideoer f.eks. “Slik gjør du tøyeøvelsene riktig” som brukeren kan se i appen ved behov.

# Avspenning/meditasjon video: Noen foretrekker visuell guidet meditasjon – f.eks. en rolig animasjon av pusteøvelser. Dette kan integreres sammen med eller i stedet for kun lyd.

# Interaktivitet med media: For å virkelig dra nytte av multimedia kunne man vurdere små interaktive øvelser: f.eks. bruk av AR (Augmented Reality). Det er mer futuristisk, men man kan forestille seg at gjennom kamerafunksjonen kan brukeren få opp et AR-kompass eller se virtuelle skilt til “neste stopp” overlagt på virkeligheten når de er ute og går. Slik lek med AR kan være motiverende for de teknologivante, men dette er nok langt fram i utviklingsplanen og ikke essensielt.

# Det viktigste er at tilleggsmediene understøtter den terapeutiske effekten, ikke overdøver den. Lyd, bilde, video bør designes for å forsterke opplevelsen av egen mestring og gi ro/innsikt – ikke distrahere eller bli støy. For eksempel viser studier at det å kombinere skriftlig refleksjon med visuell kreativitet kan øke engasjement hos enkelte pasienter

# thesweetsetup.com

# thesweetsetup.com

# &nbsp;(f.eks. scrapbooking, tegning i journal). Appen kunne derfor la brukeren tegne eller lage en collage som en del av dagboken (hvis det lar seg gjøre på mobil). Oppsummert kan integrasjon av lyd, tale, meditasjon, bilder og video gjøre appen til en helhetlig sanselig opplevelse. En bruker kan på kvelden sette seg ned: høre på litt beroligende musikk, se over dagens bilder, lese (eller få opplest) det siste reisebrevet, og skrive eller prate inn sine refleksjoner – alt innen én app. Dette kan bli et høydepunkt i dagen som man ser frem til, snarere enn en plikt. Slik sett øker sannsynligheten for at de fortsetter å bruke det over tid, noe som er avgjørende for effekt.

# 7\. Forbedringsforslag og videre perspektiver

# Basert på alt det foregående vil vi her foreslå noen forbedringer og utvidelser av konseptet, med spesielt fokus på å øke den terapeutiske effekten, sikre langvarig oppfølging, involvere profesjonelle aktører på riktig måte og utnytte innsikt fra brukerens utvikling:

# Større grad av terapeutisk metodikk integrert: For å øke effekten bør konseptet forankres i evidensbaserte terapeutiske prinsipper. Det kan bety å bake inn elementer fra kognitiv atferdsterapi (CBT) eller positiv psykologi. For eksempel kunne dagboken med jevne mellomrom inkludere styrkende spørsmål: “Nevn tre ting du er takknemlig for etter dagens økt” (takknemlighetsdagbok er kjent for å fremme optimisme

# hapday.app

# ). Eller i vanskelige perioder: “Hva ville du sagt til en venn i samme situasjon?” (for å skape selvmedfølelse). Slike spørsmål kan AI-en generere/presentere basert på stemningen i brukerens tidligere notater. Et annet terapeutisk grep er å identifisere negative tankemønstre og jobbe med dem; muligens kan AI analysere teksten og oppdage “katastrofetanker” eller selvkritikk og så foreslå en alternativ vinkling (dette er avansert, men innenfor mulighetene med sentiment- og tone-analyse). Det er viktig at eventuelle slike intervensjoner utformes i samarbeid med psykologer for å være forsvarlige. En konkret idé: Inkludér en modul for målsetting og planlegging, hvor brukeren selv setter seg noen SMART-mål ved start (f.eks. “Om 3 måneder vil jeg kunne gå 5 km uten pause”). Appen kan minne dem på målet, spore progresjon mot det, og feire når det nås. Dette gir retning og mening ut over selve dag-til-dag.

# Langsiktig oppfølging og alumni-fellesskap: Rehabilitering og utvikling er ofte ikke en lineær prosess, og mange trenger støtte også etter at det formelle programmet er over. Appen kan ha en funksjon for langtidsoppfølging: For eksempel etter avsluttet opplegg får brukeren tilbud om å fortsette å bruke appen på egen hånd i “vedlikeholdsmodus”. Kanskje med litt sjeldnere innsjekker, men fortsatt med milepæler. Man kan også tilby å koble brukere som har fullført – som en slags mentorordning (erfaring tilsier at støtte fra noen som har vært gjennom det samme kan være verdifullt). Et alumni-fellesskap kunne eksistere innenfor appen – et sted hvor folk som har “gått hele Camino” (altså fullført sitt program) kan dele tips for å holde seg i aktivitet videre, eller bare dele livshendelser. Dette må modereres og frivillig, men kan bli en ressurs. Fra et systemperspektiv kan man sende push-varsler lenge etter avslutning, f.eks. “Det er 6 måneder siden du fullførte reisen – hvordan går det? Skriv et par ord i dagboken din.” Dette kan trigge vedlikehold av gode vaner, eller fange opp de som sliter igjen og kanskje bør søke ny hjelp.

# Økt involvering av profesjonelle aktører i sanntid: Selv om appen skal fremme egenmestring, er det i mange tilfeller synergier ved å involvere fagfolk underveis. For eksempel kunne man ha periodiske digitale check-ins: hver 14. dag er det et virtuelt møte (chat eller videomøte) med fysioterapeuten/psykologen, der man tar utgangspunkt i dagboken. Appen kunne generere en kort rapport til behandler på forhånd: “Bruker X har logget 20 km, humør stort sett bedre, sliter mest med tiltak på mandager” – basert på data den har. Dette gjør konsultasjonen mer effektiv. Videre kan man integrere med allerede eksisterende tjenester – f.eks. at behandler kan “foreskrive” bruk av appen som del av en behandlingsplan. Da må behandler grensesnittet være godt (jf. veilederportal). Et annet samarbeidspotensial er med frivillige og likepersoner: f.eks. at en tidligere bruker (peer mentor) får rolle som “hjelpetrener” i Spond-termer, som kan lese litt av deltakerens framgang og komme med heiarop eller råd. Dette avlaster profesjonelle og gir en mer sosial støtte.

# Bruk av data og innsikt for tilpasning: Når appen har vært i bruk en stund, vil man samle mye data om brukeradferd og hva som gir resultater. Denne innsikten bør brukes til å forbedre tjenesten kontinuerlig. For eksempel, hvis data viser at “Brukere som setter små delmål hver uke har 30% høyere gjennomføringsrate enn de som bare har et stort sluttmål”, kan man endre appen til å oppfordre alle til å sette delmål. AI kan også her spille en rolle ved å oppdage mønstre: Kanskje den ser at en bruker alltid skriver negative ting på søndager – da kan appen foreslå en ekstra intervensjon på søndagene (kanskje sende en notifikasjon: “Planlegg en hyggelig tur i morgen tidlig, det kan hjelpe på søndagsfølelsen”). Slik personalisering vil gjøre appen mer effektiv for hver enkelt. Det er dog viktig å gjøre dette på en transparent måte så brukeren ikke føler seg overvåket, heller veiledet.

# Gamification utover reisen: Reisen i seg selv er gamification, men man kan legge til flere spill-elementer for langsiktig engasjement. For eksempel belønningssystem: stjerner eller poeng for hver oppføring i dagboken (fokus på prosess, ikke bare resultat), badges for bestemte milepæler (“Skrevet dagbok 7 dager på rad”, “Fullført 100 km” etc.). Kanskje en avatar eller profilfigur som “level up” i takt med mestring (fra Novise Pilegrim til Erfaren Pilegrim!). Slike elementer må balanseres så det ikke overskygger det indre motivasjonsarbeidet, men litt spilleglede kan gi et puff. For de i NAV/helse kan også ekte belønninger vurderes: f.eks. at forsikringsselskapet gir en liten gave eller NAV kjøper en bok til dem som fullfører – men det er sekundært til den indre belønningen de forhåpentlig kjenner.

# Utvidede reisevalg og narrativ bredde: Et forbedringsforslag ut ifra brukerbehov kan være å la brukeren velge sin egen metafor. Ikke alle relaterer til Camino eller pilegrimsvandring. Kanskje noen heller vil “bestige Mount Everest” i løpet av rehab, eller seile jorda rundt, eller reise gjennom verdens hovedsteder. På sikt kunne appen tilby forskjellige temareiser med tilpassede AI-fortellinger. For norsk kontekst kunne man ha “Norge på tvers” etc. Dette kan øke identifikasjonen – f.eks. en ung person i kriminalomsorgen synes kanskje en ekspedisjon til Mars som narrativ er kulere enn en kristen pilegrimsvandring. Fleksibilitet her kan utvide appens appell.

# Kvalitetskontroll og forskning: For forbedring over tid bør man planlegge å gjøre formelle evalueringer. Enten gjennom akademiske forskningsprosjekter (f.eks. randomiserte studier som måler om bruk av appen øker aktivitetsnivået eller bedrer livskvalitet vs. kontrollgruppe), eller løpende brukertilfredshetsmålinger. Brukernes egne forslag må tas med: etter pilotene, samle inn hva de likte og ikke likte. Kanskje opplevde noen AI-tekstene som litt upersonlige – da kunne man forbedre ved å få AI til å inkludere brukerens navn i teksten for å gjøre den mer personlig, osv. En kontinuerlig forbedringssløyfe er viktig, spesielt dersom appen skal inn i offentlig bruk der det stilles krav om å dokumentere effekt.

# Internationalisering og språkutvidelse: På lengre sikt, når konseptet sitter, kan man vurdere å ta det internasjonalt eller til andre språkgrupper (f.eks. samiskspråklige brukere i Norge). Arkitekturen med AI gjør det potensielt lettere å støtte flere språk, da GPT-4 behersker mange språk. Dette kan være en mulighet for kommersiell vekst og også for å nå minoritetsgrupper nasjonalt som ikke er komfortable med norsk.

# Til syvende og sist er kanskje det viktigste forbedringsforlaget å beholde mennesket i sentrum av teknologien. Det vil si: sikre at brukerne føler at dette er deres verktøy, ikke noe som pådyttes dem. Appen bør oppleves som en empatisk og pålitelig “følgesvenn” på reisen, hvor AI og funksjoner er der for å støtte – men menneskelig kontakt (enten det er med seg selv, gjennom egen refleksjon, eller med en veileder) er kjernen. Som en bruker kanskje vil si etter å ha brukt det: “Det var ikke appen i seg selv som gjorde at jeg kom meg gjennom, men den hjalp meg å se min egen fremgang tydeligere og holdt meg motivert når jeg trengte det.” Hvis konseptet kan levere det, vil det virkelig styrke mestringsfølelsen og motivasjonen til de som deltar – i tråd med målsetningen. Kilder:

# My Therapy Journal via The Sweet Setup – forskning om journalingens effekt

# thesweetsetup.com

# International Journal of Offender Therapy – studie om interaktiv dagbok og tilbakefall

# pubmed.ncbi.nlm.nih.gov

# pubmed.ncbi.nlm.nih.gov

# The Sweet Setup – Day One app integrasjon av kontekstdata (bilder, steder, vær)

# thesweetsetup.com

# The Conqueror – virtuelle postkort med fakta underveis i løpende utfordringer

# theconqueror.events

# Mindsera – AI-drevet journal med “chat med dagboken” og følelsesanalyse

# mindsera.com

# Rosebud – interaktiv journalplattform med fokus på sikkerhet og emosjonell støtte

# rosebud.app

# rosebud.app

# Datatilsynet – advarsel om at KI-tjenester kan lagre og gjenbruke det man skriver

# datatilsynet.no

# ICT\&health – personvernråd mot å legge pasientdata inn i ChatGPT (lagres utenfor EU, mulig GDPR-brudd)

# icthealth.org

# icthealth.org

# Innovationsfonds (Sverige) – digitalisering av pasienters matdagbok i spiseforstyrrelsesbehandling

# vgregion.se

# The Sweet Setup – betydning av multimedia i digital journaling

# thesweetsetup.com

# thesweetsetup.com

# &nbsp;(om enn generelt, støtter ideen om rikere journaling).

# 

# 

# 

# 

# 

# 

# Sources

# 

# 

# 

# 

# Ingen fil valgtIngen fil valgt

# ChatGPT can make mistakes. Check important info. See Cookie Preferences.



