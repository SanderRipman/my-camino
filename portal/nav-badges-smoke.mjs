import fs from 'node:fs';

const src=fs.readFileSync(new URL('./app-nav-badges.js',import.meta.url),'utf8');
const next=fs.readFileSync(new URL('./app-next-nav.js',import.meta.url),'utf8');
const swipe=fs.readFileSync(new URL('./app-mobile-swipe.js',import.meta.url),'utf8');
const participant=fs.readFileSync(new URL('./app-participant.js',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const mobileStyles=fs.readFileSync(new URL('./workday-mobile.css',import.meta.url),'utf8');
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
must(styles,".nav-item b{font-weight:650;white-space:nowrap}",'long sidebar labels remain single-line');
must(src,"grid-template-columns:18px minmax(0,1fr) auto",'long-label participant badge clearance');
must(src,"gap:4px;padding-left:8px;padding-right:8px",'sidebar compact spacing and left shift');
must(src,".sidebar .nav-badges{flex:0 0 auto;flex-wrap:nowrap;justify-self:end}",'badge fixed end-column geometry');
must(src,".nav-count.red{background:#b4433f;color:#fff}",'strong red navigation badge');
must(src,".pill.RED{background:#b4433f;color:#fff}",'strong red participant pill');
must(src,".attention-chip.red{border-color:#a83e3a;background:#b4433f;color:#fff}",'strong red mobile attention chip');
must(participant,"setCard(2,'Neste steg'",'yellow overview metric');
must(participant,"setCard(3,'Info / valgfritt'",'blue overview metric');

// Exactly one subtle next-work-surface cue may appear. It never auto-navigates,
// never overrides an open task card, and respects reduced-motion preferences.
must(src,"next.src='./app-next-nav.js?v=20260906a'",'next-step presentation layer loader');
must(next,"if(document.querySelector('#taskDialog')?.open)return''",'open task card owns the next action');
must(next,"return'tasks'",'open staff/participant task target');
must(next,"return'forms'",'participant form next target');
must(next,"target===active",'do not mark the already active work surface');
must(next,"cue.textContent='Neste'",'clear Norwegian next-step label');
must(next,"prefers-reduced-motion:reduce",'reduced motion support');
must(next,"swipe.src='./app-mobile-swipe.js?v=20260906a'",'guarded mobile swipe loader');
for(const forbidden of ['location.href','location.assign','location.replace','client.from(','functions.invoke(','role_grants','service_role']){
  if(next.includes(forbidden))throw new Error(`next-step cue must remain presentation-only and non-navigating: ${forbidden}`);
}

// Swipe is deliberately conservative: one-finger horizontal intent only, outside controls/dialogs,
// away from OS edge gestures, no preventDefault, and only adjacent visible primary tabs.
must(swipe,"const MIN_X=72",'meaningful horizontal swipe threshold');
must(swipe,"const AXIS_RATIO=1.45",'horizontal intent must dominate vertical movement');
must(swipe,"const EDGE_GUARD=28",'OS/browser edge gestures must be left alone');
must(swipe,"input,textarea,select,button,a,label",'interactive controls must not become swipe surfaces');
must(swipe,"document.querySelector('#taskDialog')?.open",'open task dialog must own touch interaction');
must(swipe,"event.touches.length!==1",'only one-finger swipe supported');
must(swipe,"getComputedStyle(item).display!=='none'",'swipe target must be a visible primary item');
must(swipe,"const nextIndex=dx<0?index+1:index-1",'swipe must move only to adjacent visible tab');
must(swipe,"next.click()",'swipe reuses canonical nav click behavior');
if(swipe.includes('preventDefault'))throw new Error('mobile swipe must not prevent native vertical/browser gestures');
for(const forbidden of ['client.from(','functions.invoke(','role_grants','service_role','fetch('])if(swipe.includes(forbidden))throw new Error(`mobile swipe must stay presentation-only: ${forbidden}`);

// On narrow phones badges sit below the label instead of consuming horizontal label space.
must(mobileStyles,'@media(max-width:470px)','narrow-phone layout');
must(mobileStyles,'flex-direction:column!important','narrow nav label/badge stacking');
must(mobileStyles,'.sidebar .nav-badges{margin-left:0!important;min-height:18px!important;justify-content:center!important}','badges centered below label on narrow phones');

for(const forbidden of ['role_grants','client.from(','functions.invoke(','SUPABASE_SECRET_KEYS','service_role']){
  if(src.includes(forbidden))throw new Error(`navigation badge presentation must not create authorization/data path: ${forbidden}`);
}
if(src.includes("$('#badgeTasks').innerHTML=navBadgeMarkup(red,yellow);$('#badgeOverview').innerHTML=navBadgeMarkup(red,yellow);$('#badgeParticipants').innerHTML=navBadgeMarkup(red,yellow);")){
  throw new Error('semantic badge extension must not reproduce the legacy identical-badge assignment');
}
console.log('Semantic badges, next-step cue, guarded swipe and narrow mobile navigation invariants passed.');
