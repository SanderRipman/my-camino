import fs from 'node:fs';

const src=fs.readFileSync(new URL('./app-nav-badges.js',import.meta.url),'utf8');
const participant=fs.readFileSync(new URL('./app-participant.js',import.meta.url),'utf8');
const build=fs.readFileSync(new URL('./build-app.mjs',import.meta.url),'utf8');
const must=(text,needle,label)=>{if(!text.includes(needle))throw new Error(`${label}: missing ${needle}`)};

must(build,"const navBadgesPath=path.join(dir,'app-nav-badges.js');",'build source');
must(build,"'+navBadges+'",'bundle append');
must(src,"kind==='overview'",'overview distinct total');
must(src,"kind==='participants'",'participant attention semantics');
must(src,"semanticBadgeMarkup('tasks',taskCounts)",'task severity semantics');
must(src,"latestCheckin(participant.id)",'participant latest check-in signal');
must(src,"renderParticipantNavigationBadges",'participant-specific badge renderer');
must(src,"window.aidmeParticipantAttentionSnapshot",'shared participant presentation snapshot');
must(src,"#badgeForms",'form-specific navigation badge');
must(src,"nav-count blue",'blue informational badge');
must(src,"Krever AAL2 / Authenticator",'concrete security tooltip');
must(src,"Samlet oversikt:",'concrete overview tooltip');
must(src,"participantTooltip('Oppgaver'",'task-specific participant tooltip');
must(src,"participantTooltip('Skjema'",'form-specific participant tooltip');
must(participant,"function participantTaskAttention(t)",'participant attention source');
must(participant,"if(t.status==='WAITING')return'BLUE'",'waiting becomes informational blue');
must(participant,"return'YELLOW'",'ordinary open task becomes yellow participant action');
must(participant,"return f?.key==='info_before_via'?'BLUE':'YELLOW'",'supplementary VÍA info is blue');
must(participant,"tone:'RED'",'security gate is red');
must(participant,"window.aidmeParticipantAttentionSnapshot=participantAttentionSnapshot",'presentation snapshot exposure');
must(src,"el.textContent.trim()==='Må nå')el.textContent='Kritisk'",'participant visible red label polish');
must(src,"Kritisk: må håndteres før du kan gå videre",'critical participant tooltip');
must(src,"grid-template-columns:22px minmax(0,1fr) auto",'sidebar text/badge clearance');
must(src,"gap:7px;padding-left:10px;padding-right:10px",'sidebar compact spacing');
must(src,".sidebar .nav-badges{flex:0 0 auto;flex-wrap:nowrap}",'badge no-wrap geometry');
must(src,".nav-count.red{background:#b4433f;color:#fff}",'strong red navigation badge');
must(src,".pill.RED{background:#b4433f;color:#fff}",'strong red participant pill');
must(src,".attention-chip.red{border-color:#a83e3a;background:#b4433f;color:#fff}",'strong red mobile attention chip');
must(participant,"setCard(2,'Neste steg'",'yellow overview metric');
must(participant,"setCard(3,'Info / valgfritt'",'blue overview metric');
for(const forbidden of ['role_grants','client.from(','functions.invoke(','SUPABASE_SECRET_KEYS','service_role']){
  if(src.includes(forbidden))throw new Error(`navigation badge presentation must not create authorization/data path: ${forbidden}`);
}
if(src.includes("$('#badgeTasks').innerHTML=navBadgeMarkup(red,yellow);$('#badgeOverview').innerHTML=navBadgeMarkup(red,yellow);$('#badgeParticipants').innerHTML=navBadgeMarkup(red,yellow);")){
  throw new Error('semantic badge extension must not reproduce the legacy identical-badge assignment');
}
console.log('Semantic navigation badge, critical-copy and sidebar polish invariants passed.');
