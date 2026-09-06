import fs from 'node:fs';

const src=fs.readFileSync(new URL('./app-nav-badges.js',import.meta.url),'utf8');
const next=fs.readFileSync(new URL('./app-next-nav.js',import.meta.url),'utf8');
const mobile=fs.readFileSync(new URL('./app-mobile.js',import.meta.url),'utf8');
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
must(src,"grid-template-columns:18px minmax(0,1fr) auto",'desktop/sidebar badge geometry');
must(src,".nav-count.red{background:#b4433f;color:#fff}",'strong red navigation badge');
must(src,".pill.RED{background:#b4433f;color:#fff}",'strong red participant pill');
must(participant,"setCard(2,'Neste steg'",'yellow overview metric');
must(participant,"setCard(3,'Info / valgfritt'",'blue overview metric');

must(src,"badgeOverdue(task)?'RED':severity(task)",'overdue tasks become red attention');
must(src,"harmonizeStaffKpis(open,taskCounts)",'KPI and badge semantic alignment');
must(src,"label.textContent='Kritisk / forfalt'",'clear critical/overdue KPI label');
must(src,"metricRed.textContent=String(taskCounts.red)",'red KPI uses same count as red task badge');
must(src,"metricYellow.textContent=String(taskCounts.yellow)",'yellow KPI uses same count as yellow task badge');
must(src,"@media(max-width:780px)",'mobile badge layout');
must(src,"flex-direction:column!important",'mobile badges stack under nav labels');

must(src,"next.src='./app-next-nav.js?v=20260906c'",'post-badge layer loader');
must(next,'Menu-level "Neste" cue is intentionally disabled','Next cue retirement');
must(next,"#mobileAttentionBar{display:none!important}",'redundant attention strip hidden');
must(next,".eq('active',true)",'active participant metric only');
must(next,"'NEW_VIA'",'new VIA grouped into compact VIA count');
if(/SWIPE_|installResponsiveSwipe|app-mobile-swipe/.test(next))throw new Error('main-only layer must not own swipe anymore');

must(mobile,"MOBILE_UX_VERSION='2026-09-06a'",'shared mobile cache bust');
must(mobile,'function installSharedPrimarySwipe()','shared swipe installer');
must(mobile,"nav.querySelectorAll('.nav-item')",'swipe must enumerate every visible nav item, not only data-view');
must(mobile,"item.classList.contains('nav-mobile-secondary')",'secondary items excluded');
must(mobile,"item.classList.contains('nav-ia-demoted')",'demoted items excluded');
must(mobile,".nav-item.active,[aria-current=\"page\"]",'active item works in portal and standalone pages');
must(mobile,'const MIN_X=32','responsive horizontal threshold');
must(mobile,'AXIS_RATIO=1.04','responsive axis threshold');
must(mobile,"input,textarea,select,[contenteditable=",'form controls protected');
must(mobile,"document.querySelector('#taskDialog')?.open",'task dialog protected');
must(mobile,"next.click()",'canonical nav activation');
must(mobile,'suppressClickUntil','post-swipe click suppression');
if(mobile.includes("querySelectorAll('.nav-item[data-view]')"))throw new Error('shared swipe must not skip href-based primary tabs');

must(mobileStyles,'@media(max-width:470px)','narrow-phone layout');
must(mobileStyles,'flex-direction:column!important','narrow nav label/badge stacking');

for(const forbidden of ['role_grants','client.from(','functions.invoke(','SUPABASE_SECRET_KEYS','service_role']){
  if(src.includes(forbidden))throw new Error(`navigation badge presentation must not create authorization/data path: ${forbidden}`);
}
console.log('Semantic badges, aligned KPIs, retired Next cue and shared all-primary-tab swipe invariants passed.');
