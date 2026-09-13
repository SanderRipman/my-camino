import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const js=read('./app-workday-chrome.js');
const css=read('./workday-mobile.css');
const navScroll=read('./app-mobile-nav-scroll.js');

assert(js.includes("WORKDAY_CHROME_VERSION='2026-09-07b'"),'Workday chrome must be versioned for cache busting.');
assert(js.includes("/^Beta:/i")&&js.includes(".demo-note")&&js.includes("workday-dev-ui"),'Non-final beta/demo chrome must be removed or hidden from everyday work views.');
assert(js.includes('retireMobileAttention()')&&!js.includes("bar.id='mobileAttentionBar'"),'Redundant mobile attention strip must stay retired rather than recreated.');
assert(js.includes("data-view=\"settings\"")&&js.includes("label.textContent='Profil'")&&js.includes("href='./#settings'"),'Profile must remain reachable after daily identity controls are removed.');
assert(js.includes('existingProfileItem(nav)')&&js.includes("textContent?.trim()==='Profil'"),'Mobile profile navigation must explicitly prevent duplicate Profile items.');
assert(js.includes('MOBILE_SECONDARY_LABELS')&&js.includes('enforceStableMobilePrimaryNav()'),'Late-rendered secondary tools must not reappear in the mobile primary navigation.');
for(const label of ['Analyse','Skjema & rutiner','Mine dokumenter','Varsler','Slik fungerer det','Rolleintroduksjon','Ansvar / eiere','Operativ dag'])assert(js.includes(label),`Profile tools must retain ${label}.`);
assert(js.includes('selectedOwnerParticipantId')&&js.includes('owners.html?participant='),'Owner shortcut must use an already visible participant context instead of starting a broad participant-list load.');
assert(js.includes('bindProfileToolNavigation')&&js.includes("['#analysis','#forms','#participants'].includes(url.hash)")&&js.includes("history.pushState({aidmeProfileTool:true"),'Same-page profile tools must create a browser history entry before routing directly.');
assert(js.includes('PROFILE_RETURN_KEY')&&js.includes('rememberProfileToolsReturn')&&js.includes('restoreProfileToolsReturn')&&js.includes('scrollToProfileTools'),'Standalone tools must preserve the exact profile tools return context.');
assert(js.includes("window.addEventListener('popstate'")&&js.includes('samePageProfileReturnArmed'),'Browser back from same-page tools must return to the profile tools card instead of exiting the browser context.');
assert(js.includes('showBrandedToolTransition')&&js.includes("loader.style.position='fixed'")&&js.includes("loader.classList.remove('hidden')"),'Standalone profile tools must show the canonical branded transition instead of appearing frozen.');
assert(js.includes("['ownersNav','pilotOpsNav'].includes(item.id)"),'Owners and pilot operations must be specialist tools rather than permanent primary mobile tabs.');
assert(js.includes('profileAccessSummary')&&js.includes('profileToolsSummary')&&js.includes('Tilgang og roller')&&js.includes('Verktøy og snarveier'),'Profile access and tool areas must be separate cards.');
assert(js.includes('profileLogoutSummary')&&js.includes('profile-logout-button')&&js.includes("document.querySelector('#logout')?.click()"),'Profile must expose an explicit mobile logout action without duplicating auth logic.');
assert(js.includes('Mangler data')&&js.includes('overviewDataState')&&js.includes('overviewHasRecentData'),'Overview must show a human missing-data state rather than a broken-looking chart.');
assert(js.includes('beslutningspunkt')&&js.includes('polishNorwegianUiTerms()'),'User-facing gate terminology must be normalized to natural Norwegian.');
assert(js.includes('Neste handling, eier og 72t · 14 · 30 · 90.'),'VIDA workday reminder must remain concise.');
assert(js.includes("document.addEventListener('aidme:portal-rendered'")&&js.includes("document.addEventListener('aidme:navigation-normalized'"),'Workday presentation must refresh after canonical role/navigation state settles.');
assert(!js.includes('new MutationObserver'),'Workday chrome must use explicit render events/finite passes, not a broad persistent observer.');
assert(!/supabase|client\.from|functions\.invoke|fetch\(|XMLHttpRequest|service_role/i.test(js),'Workday chrome must not create a backend or authorization path.');

assert(css.includes('.app-shell .workspace>.topbar{display:none!important}'),'Redundant daily page title/language/role/AAL2 header must be hidden on mobile.');
assert(css.includes('.sidebar .brand{display:none!important}'),'Separate mobile logo chrome must not consume navigation width.');
assert(css.includes("background:url('/vida/assets/AIDME_Logo-original-web.webp') center/contain no-repeat!important"),'Active navigation must use the original-aspect AidMe mark as its indicator.');
assert(css.includes('width:60px!important;height:60px!important')&&css.includes('opacity:.42!important'),'Final active mark must use slightly more visual volume without increasing nav height.');
assert(css.includes('.nav-item .nav-num{display:none!important}'),'Numeric navigation codes must be hidden on mobile.');
assert(css.includes('background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;color:#fff!important'),'Active navigation must not retain the legacy rectangular/gold enclosure.');
assert(!css.includes('inset 3px 0 0 var(--gold)'),'Mobile workday active state must not reproduce the legacy gold crescent.');
assert(css.includes('#mainNav #ownersNav')&&css.includes('#mainNav #pilotOpsNav'),'Owners and pilot operations must be hidden from the primary mobile row.');
assert(css.includes('.nav-count.nav-count-total')&&css.includes('.nav-count.blue'),'Badge colors must survive standalone/snapshot navigation.');
assert(css.includes('.sidebar .nav-item')&&css.includes('display:flex!important')&&css.includes('.nav-badges'),'Navigation labels and badges must share one stable baseline.');
assert(css.includes('#participantDetail .card-head h2')&&css.includes('white-space:nowrap!important')&&css.includes('text-overflow:ellipsis!important'),'Selected participant identity must remain one compact line on mobile.');
assert(css.includes('.role-intro-card .card-head')&&css.includes('grid-template-columns:minmax(0,1fr)!important'),'Rolleintroduksjon action must stay inside its guide card on mobile.');
assert(css.includes('.profile-logout-button')&&css.includes('color:#a42f36'),'Logout must be clearly visible as a destructive profile action.');
assert(css.includes('.overview-data-state')&&css.includes('.overview-no-data #overviewChart'),'Empty overview charts must collapse cleanly and avoid runaway vertical space.');
assert(css.includes('#view-overview>.hero-panel.compact-hero h2')&&css.includes('display:none!important'),'Large repeated phase heading/badge must collapse in everyday mobile work.');
assert(css.includes('#view-overview #homeIntro')&&css.includes('white-space:nowrap!important'),'Phase reminder must remain a compact one-line cue.');
assert(!/display\s*:\s*none[^}]*\.task-list|\.task-list[^}]*display\s*:\s*none/i.test(css),'Workday polish must not hide operational task content.');

assert(navScroll.includes("MOBILE_NAV_SCROLL_VERSION='2026-09-13a'"),'Mobile top-nav drag helper must be the current deterministic version.');
assert(navScroll.includes('touch-action:pan-y!important'),'Clickable mobile nav items must preserve native vertical page scrolling while horizontal drag is handled explicitly.');
assert(navScroll.includes("surface=nav?.closest('.sidebar')||nav"),'The entire mobile top-menu surface must participate in horizontal drag handling.');
assert(navScroll.includes("surface.addEventListener('touchstart'")&&navScroll.includes("surface.addEventListener('touchmove'")&&navScroll.includes("surface.addEventListener('touchend'"),'Top-menu surface must distinguish horizontal drag from tap across clickable and quiet areas.');
assert(navScroll.includes("{passive:false,capture:true}")&&navScroll.includes('nav.scrollLeft=start.left-dx'),'Horizontal drag must use one deterministic scroll path across the entire menu, including clickable items.');
assert(navScroll.includes('event.preventDefault()')&&navScroll.includes('Math.abs(dx)>Math.abs(dy)'),'Default touch behavior may be blocked only after a horizontal gesture is identified, leaving vertical page scrolling native.');
assert(navScroll.includes('suppressClickUntil')&&navScroll.includes('stopImmediatePropagation'),'A completed horizontal drag must suppress the synthetic click instead of activating the touched menu item.');
assert(!navScroll.includes('insideNav:nav.contains(event.target)'),'Swipe behavior must no longer split into separate clickable/non-clickable drag paths.');
assert(!/supabase|client\.from|functions\.invoke|fetch\(|XMLHttpRequest|service_role/i.test(navScroll),'Top-nav swipe fix must remain presentation-only.');

console.log('Mobile workday chrome safety/density invariants OK');
