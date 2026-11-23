// AidMe VIDA – kildebaserte, lesbare rolleråd. Ikke deltakerdata og ikke beslutningsskjema.
// Faglig autoritet: aktiv SharePoint-styring, fagroller v0.3 (UTKAST) og operativ malpakke v0.3.
// Enhver endring i normativt mandat krever faglig godkjenning; disse kortene gir ikke ny myndighet.
(function(){
const base='https://aidme911-my.sharepoint.com/personal/sander_aidme_no';
const sources={
 roles:{label:'Fagroller, ansvar og etiske grenser v0.3 – arbeidsutkast',url:base+'/_layouts/15/Doc.aspx?sourcedoc=%7BE2F458EA-9661-486E-8AC7-FDD659EA76A7%7D&file=Fagroller_ansvar_og_etiske_grenser_v0_3_UTKAST.docx&action=default'},
 journey:{label:'Intern rolle- og brukerreise v0.1 – intern pedagogisk referanse',url:base+'/_layouts/15/Doc.aspx?sourcedoc=%7BE863F7CD-5744-49CD-AF10-899834B99C0B%7D&file=AidMe_VIDA_intern_rolle_og_brukerreise_v0_1_2026-09-04.docx&action=default'},
 mal:{label:'Operativ malpakke VÍA–SER–VIDA v0.3 – aktiv arbeidsreferanse',url:base+'/Documents/Camino/09_Dokumentasjon_og_evaluering/Maler_og_skjema/00_AKTIV_MALPAKKE/Operativ_malpakke_VIA_SER_VIDA_v0_3_A4.pdf'},
 go:{label:'Aktivt skjema 03 – Individuell GO / NO-GO (PDF-referanse)',url:base+'/Documents/Camino/09_Dokumentasjon_og_evaluering/Maler_og_skjema/00_AKTIV_MALPAKKE/Enkeltfiler_PDF/AidMe_VIDA_NO_Skjema_03_Individuell_GO_NO-GO_v0_3_A4.pdf'},
 incident:{label:'Aktivt skjema 07 – Hendelses- og avvikslogg (PDF-referanse)',url:base+'/Documents/Camino/09_Dokumentasjon_og_evaluering/Maler_og_skjema/00_AKTIV_MALPAKKE/Enkeltfiler_PDF/AidMe_VIDA_NO_Skjema_07_Hendelses_og_avvikslogg_v0_3_A4.pdf'},
 vida:{label:'Aktivt skjema 08 – VIDA-handlings-/aktivitetsplan (PDF-referanse)',url:base+'/Documents/Camino/09_Dokumentasjon_og_evaluering/Maler_og_skjema/00_AKTIV_MALPAKKE/Enkeltfiler_PDF/AidMe_VIDA_NO_Skjema_08_VIDA_handlings_og_aktivitetsplan_v0_3_A4.pdf'},
 ser:{label:'Aktivt skjema 06 – Daglig SER-operativlogg (PDF-referanse)',url:base+'/Documents/Camino/09_Dokumentasjon_og_evaluering/Maler_og_skjema/00_AKTIV_MALPAKKE/Enkeltfiler_PDF/AidMe_VIDA_NO_Skjema_06_Daglig_SER-operativlogg_v0_3_A4.pdf'},
 safety:{label:'Bemanning, avbrudd og beslutningsprotokoll v0.1 – arbeidsutkast',url:base+'/_layouts/15/Doc.aspx?sourcedoc=%7B90DCEB41-6AE9-4E21-9F13-7B09F49BE8AC%7D&file=11_Bemanning_avbrudd_og_beslutningsprotokoll_v0_1_UTKAST.docx&action=default'},
 privacy:{label:'Personvern, dataflyt og systemvalg v0.1 – arbeidsutkast',url:base+'/_layouts/15/Doc.aspx?sourcedoc=%7B74804602-5861-4758-AD80-AA0AC05D64EC%7D&file=12_Personvern_dataflyt_og_systemvalg_v0_1_UTKAST.docx&action=default'},
 evaluation:{label:'Aktiv operativ malpakke – Pilotevaluering (del 9)',url:base+'/Documents/Camino/09_Dokumentasjon_og_evaluering/Maler_og_skjema/00_AKTIV_MALPAKKE/Operativ_malpakke_VIA_SER_VIDA_v0_3_A4.pdf'}
};
const role={
 system_admin:{can:'Administrere brukere, roller, omfang og revisjonslogger.',cannot:'Ikke lese sensitive fagopplysninger bare fordi du har teknisk tilgang.',owner:'Teknisk systemeierskap; faglige beslutninger har en annen ansvarslinje.'},
 project_owner:{can:'Eie konsept, avtaler, økonomi, kvalitetssystem og overordnet pilotramme.',cannot:'Ikke fatte individuelle kliniske GO/NO-GO uten riktig fagmandat.',owner:'Programansvarlig og formelt definert faglig beslutningsansvarlig må samordnes.'},
 program_lead:{can:'Koordinere hele før–under–etter-løpet, arbeidsoppgaver og eiere.',cannot:'Ikke overstyre faglige sikkerhetsvurderinger eller lese sensitive VÍA-felt automatisk.',owner:'Sørge for navngitt beslutningslinje og VIDA-eier før SER.'},
 via_owner:{can:'Lede avklaring, ressurser, retning og trygg VÍA-forberedelse.',cannot:'Ikke love SER-plass før individuell vurdering og samlet Pilot-GO.',owner:'Hent faglig vurdering når mandat eller risiko krever det.'},
 clinical_professional:{can:'Bidra med faglig risikovurderingsstøtte, metodeveiledning, kriseplan og debrief innen avklart mandat.',cannot:'Ikke påta deg uavklart behandlingsansvar, automatisk beslutningsmyndighet eller døgnberedskap.',owner:'Formell GO/NO-GO-beslutningsansvarlig skal være uttrykkelig avklart; faglig råd er ikke automatisk GO.'},
 ser_lead:{can:'Lede rute, gruppe, daglige sikkerhetstiltak, enkel metode og operativ eskalering.',cannot:'Ikke drive behandling, diagnostikk eller pålegge privat deling.',owner:'Dagens tur-/SER-leder beslutter umiddelbare sikkerhetstiltak innen avtalt ramme.'},
 vida_owner:{can:'Eie oppfølging etter 72 timer og 14/30/90 dager samt én levende handlingsplan.',cannot:'Ikke overta hele sensitiv VÍA-/SER-historikken uten nødvendig grunnlag.',owner:'En navngitt ansvarlig overtar VIDA før SER avsluttes.'},
 logistics:{can:'Koordinere reise, transport, overnatting, forsikring og alternative avbruddsløsninger.',cannot:'Ikke fatte deltakerfaglige GO/NO-GO eller kliniske beslutninger.',owner:'SER-leder og navngitt beslutningseier ved hendelser; logistikk støtter.'},
 observer:{can:'Observere prosess og melde dokumenterte forbedringsmuligheter innen mandat.',cannot:'Ikke telle som sikkerhetsbemanning uten reell opplært operativ rolle eller automatisk få individuelt helseinnsyn.',owner:'Operativ leder beholder ansvar; observasjon er ikke behandlings- eller sikkerhetsmyndighet.'},
 evaluator:{can:'Vurdere aggregert pilotlæring, gjennomføring og forbedringspunkter.',cannot:'Ikke lese individuelle helseopplysninger som standard.',owner:'Definerte evalueringsformål, dataansvarlige og nødvendige minimumsdata.'},
 break_glass:{can:'Bruke midlertidig nødtilgang kun i dokumentert nødvendig situasjon.',cannot:'Ikke bruke nødtilgang som vanlig rolle, eller videreføre tilgangen etter hendelsen.',owner:'Tidsbegrensning, begrunnelse, logging og særskilt etterkontroll.'}
};
const common={
 role_intro:{
  lead:'Les ansvarsgrensen før du tar oppgaver. En rolle i portalen er aldri et generelt mandat.',
  points:['Du får bare nødvendig innsyn innen den deltakeren, piloten eller organisasjonen rollen faktisk gjelder.','VÍA → SER → VIDA → ny VÍA er én deltakerreise, men faseansvar og fagbeslutninger er ulike.','Ved tvil om kompetanse, omfang eller beslutningsrett: stopp den aktuelle handlingen og kontakt ansvarlig leder.'],
  sources:['roles','journey']
 },
 confidentiality_minimum:{
  lead:'Minimumsregelen gjelder også når du har teknisk lesetilgang.',
  points:['Bruk bare opplysninger som er nødvendige for den aktuelle oppgaven, og aldri kopier deltakerens private refleksjoner inn i generell arbeidslogg.','Skill sikkerhetsnødvendige fakta, faglig vurdering og eventuell helsehjelp. Kliniske journalopplysninger tilhører ansvarlig helsevirksomhets godkjente system når journalplikt gjelder.','Ikke del helseopplysninger eller markedsføringsmateriale uten avklart grunnlag, relevante samtykker og mottakere. Vær varsom med e-post og chat.','Meld mistanke om feiltilgang eller personvernbrudd umiddelbart til personvern-/systemansvarlig.'],
  sources:['privacy','roles']
 },
 safety_boundaries:{
  lead:'Grønn/gul/rød støtter sikkerhetsrespons og tilpasning, ikke diagnostikk.',
  points:['Grønn: normal tilpasning og avtalte innsjekker. Gul: pause, ny vurdering, endring i tempo eller støtte. Rød/akutt: stans utrygg aktivitet, sikre situasjonen og kontakt ansvarlig beredskap og lokal nødtjeneste når nødvendig.','Ved reell hendelse dokumenteres observerbare fakta, tiltak og hvem som ble varslet i eksisterende hendelses-/avvikslogg. En vanlig sliten dag skal ikke automatisk bli et avvik.','Ved ledsaget avbrudd må minimumsbemanning bli igjen med gruppen; ved utilstrekkelig dekning stopper gruppen på trygg base. Observatør/buddy erstatter ikke operativt personale.','Ved tvil: eskaler til navngitt SER-/programansvarlig og avtalt fagperson/helsetjeneste i tråd med hendelses- og kontaktkjeden.'],
  sources:['safety','mal','incident']
 },
 clinical_boundary:{
  lead:'Faglig mandat og beslutningsansvar må være avtalt før konkrete vurderinger.',
  points:['Fagperson kan støtte individuell avklaring og risikovurdering, men har ikke automatisk formell GO/NO-GO-myndighet bare fordi vedkommende har «Relevant fagperson»-rolle.','Den individuelle vurderingen skal bygge på samlet risiko, ressurser, frivillighet, fysisk kapasitet, forsikring, avbruddsplan og navngitt VIDA-eier. Ingen enkelt skår gir automatisk GO.','Akutte eller uavklarte kliniske forhold håndteres i relevante tjenester. Hvis fagpersonen faktisk yter helsehjelp, avklares virksomhetsansvar, journalplikt og eget godkjent system – ikke vanlig portalnotat.','Avklar skriftlig om fagpersonen er tilgjengelig før, under eller etter SER, responstid, krisevei og hvem som eier neste beslutning.'],
  sources:['roles','go','privacy','journey']
 },
 via_workspace:{
  lead:'VÍA er en avklaring og dokumentert overgang, ikke et løfte om SER-deltakelse.',
  points:['Bruk én eksisterende VÍA-veikart- og beredskapsprosess per deltaker; unngå duplikatskjemaer.','Når veikartet er sendt inn, følger faglig vurdering og individuell GO/GO MED VILKÅR/UTSETT/NO-GO NÅ gjennom autorisert beslutningsflyt.','Ingen SER før både minimum VÍA og samlet Pilot-GO er lukket, og VIDA-eier er navngitt.'],
  sources:['mal','go','journey']
 },
 ser_workspace:{
  lead:'Den operative dagen krever korte logger og konkret oppfølging, ikke mer dokumentasjon enn nødvendig.',
  points:['Dagens leder avklarer rute, vær, gruppe, frontanker/bakanker og avtalte møtepunkter.','Grønn/gul/rød og tilpasninger registreres i én daglig operativ SER-logg. En særskilt hendelseslogg brukes ved faktisk avvik.','Pause, transport og hjemreise er ansvarlige tiltak. Ingen tvinges til å dele privat historie.'],
  sources:['ser','incident','safety']
 },
 vida_workspace:{
  lead:'VIDA er én levende plan med navngitt eier, ikke separate planer for hver oppfølging.',
  points:['Bekreft konkret første handling etter hjemkomst innen 72 timer.','Følg opp og juster sammen med deltakeren etter 14/30/90 dager med minst mulig nødvendige opplysninger.','Avklar videre henvisning og støtte ved behov; videreføring kan være ny VÍA, ikke automatisk SER.'],
  sources:['vida','journey']
 },
 evaluation_boundary:{
  lead:'Evaluering skal gjøre piloten tryggere og bedre uten å overføre individuelle fagjournaler.',
  points:['Bruk aggregerte eller tilstrekkelig anonymiserte indikatorer om deltakelse, sikkerhet, prosess og læring.','Individuelle sensitive data skal ikke inngå bare fordi man er evaluator; avklar formål, behandlingsgrunnlag og dataminimering.','Skjemaet Pilotevaluering er en separat arbeidsoppgave, ikke noe som skal fylles ut for å lese denne introduksjonen.'],
  sources:['evaluation','privacy','roles']
 },
 observer_boundary:{
  lead:'Observatørens rolle er avgrenset og skal ikke skape falsk sikkerhetskapasitet.',
  points:['Se etter læringspunkter og meld observasjoner til ansvarlig leder innen avtalt mandat.','Ingen automatisk tilgang til sensitive deltakernotater.','Du teller ikke som operativ sikkerhetsansatt uten reell opplæring, rolle og beslutningslinje.'],
  sources:['roles','safety']
 },
 logistics_workspace:{
  lead:'Praktiske valg støtter forsvarlig gjennomføring, men erstatter ikke faglige beslutninger.',
  points:['Sørg for avklarte transportalternativer, forsikring, overnatting, kontaktkjede og avbruddsplan.','Ved ruteendring eller hjemreise må operativ leder og navngitt beslutningseier involveres.','Mangler bemanning eller sikkerhetsramme: ikke la gruppen fortsette uten beslutning.'],
  sources:['mal','safety','roles']
 },
 program_flow:{
  lead:'En sammenhengende deltakerreise med tydelige eiere i hver fase.',
  points:['Kontroller at hver åpen oppgave har rett ansvarlig og frist.','Koordiner VÍA- og faglig GO uten å overstyre fagansvarlig; ikke forveksle individuell GO og Pilot-GO.','Ingen SER uten navngitt VIDA-eier, forsvarlig bemanning og avbruddsberedskap.'],
  sources:['journey','roles','mal']
 },
 project_overview:{
  lead:'Kvalitets- og rammeansvar er ikke automatisk individuell fagmyndighet.',
  points:['Eie overordnet kvalitet, finansiering, avtaler, forsikring og partnerramme.','Sørge for at bemanning, ansvar og pilot-GO er skriftlig definert.','Klinisk mandat, journalplikt og dataansvar avklares med rette fag- og virksomhetsansvarlige.'],
  sources:['roles','mal','privacy']
 },
 admin_workspace:{
  lead:'Teknisk kontroll skal begrense innsyn og følge minste privilegium.',
  points:['Tildel eller endre roller med konkret omfang, begrunnelse og passende utløp.','Medarbeiderbytte skal bevare historisk audit; ikke kopier ubegrensede rettigheter.','Fagbeslutninger skal ikke følge automatisk med systemadminrollen.'],
  sources:['roles','privacy','journey']
 },
 break_glass_boundary:{
  lead:'Nødtilgang er kun for en faktisk unntakssituasjon.',
  points:['Bruk bare dokumentert nødvendige opplysninger og minimum tidsrom.','Registrer hendelse, hvorfor tilgang var nødvendig og hvem som tok beslutningen.','Tilgangen skal avvikles og etterkontrolleres, aldri brukes som generell arbeidsflate.'],
  sources:['roles','privacy']
 }
};
const roleNotes={
 clinical_professional:'Faglig støtte gjelder kun innen eksplisitt avtalt mandat; det skal ikke oppstå implisitt behandlings- eller døgnberedskap.',
 ser_lead:'Deltakeren kan be om pause, transport eller avbrudd. Dagens turleder eier operative sikkerhetsvalg.',
 via_owner:'Ingen lovnad om SER før både individuell beslutning og samlet Pilot-GO.',
 vida_owner:'Oppfølging hjemme må ha navngitt eier før SER avsluttes.',
 evaluator:'Søk aggregerte data; individuell helseinformasjon er ikke standard.',
 observer:'Observatør er ikke automatisk operativ sikkerhetsressurs.',
 system_admin:'En teknisk rolle er ikke tilstrekkelig grunnlag for faglig innsyn.',
 project_owner:'Ikke overstyr faglige sikkerhetsbeslutninger.',
 program_lead:'Programleder koordinerer, men signerer ikke faglig GO uten mandat.',
 logistics:'Logistikk kan koordinere hjemreise, men ikke fatte kliniske beslutninger.',
 break_glass:'Nødtilgang krever faktisk nødbehov, avgrensing og etterkontroll.'
};
function resolve(item){
 const baseContent=common[item.template_key];
 const roleContent=role[item.role_code];
 if(!baseContent||!roleContent)return null;
 const suffix=item.template_key==='role_intro'
  ?[roleContent.can,roleContent.cannot,roleContent.owner]
  :[roleNotes[item.role_code]||roleContent.owner];
 return {...baseContent,title:item.title_no,roleName:item.role_code,points:[...baseContent.points,...suffix],sourceDetails:baseContent.sources.map(s=>sources[s]).filter(Boolean)};
}
window.AIDME_ONBOARDING_REFERENCE={resolve,sources,role};
})();