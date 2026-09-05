import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const js=read('./app-workday-chrome.js');
const css=read('./workday-mobile.css');

assert(js.includes("WORKDAY_CHROME_VERSION='2026-09-05g'"),'Workday chrome must be versioned for cache busting.');
assert(js.includes("/^Beta:/i")&&js.includes(".demo-note")&&js.includes("workday-dev-ui"),'Non-final beta/demo chrome must be removed or hidden from everyday work views.');
assert(js.includes('ensureMobileAttention()')&&js.includes("bar.id='mobileAttentionBar'")&&js.includes("typeof updateMobileAttention==='function'"),'Mobile task-status summary must have a stable host independent of removed beta chrome.');
assert(js.includes("data-view=\"settings\"")&&js.includes("label.textContent='Profil'")&&js.includes("href='./#settings'"),'Profile must remain reachable after daily identity controls are removed.');
assert(js.includes('existingProfileItem(nav)')&&js.includes("textContent?.trim()==='Profil'"),'Mobile profile navigation must explicitly prevent duplicate Profile items.');
assert(js.includes('MOBILE_SECONDARY_LABELS')&&js.includes('enforceStableMobilePrimaryNav()'),'Late-rendered secondary tools must not reappear in the mobile primary navigation.');
for(const label of ['Analyse','Skjema & rutiner','Mine dokumenter','Varsler','Slik fungerer det','Rolleintroduksjon'])assert(js.includes(label),`Profile tools must retain ${label}.`);
assert(js.includes('profileAccessSummary')&&js.includes('profileToolsSummary')&&js.includes('Tilgang og roller')&&js.includes('Verktøy og snarveier'),'Profile access and tool areas must be separate cards.');
assert(js.includes('profileLogoutSummary')&&js.includes('profile-logout-button')&&js.includes("document.querySelector('#logout')?.click()"),'Profile must expose an explicit mobile logout action without duplicating auth logic.');
assert(js.includes('Mangler data')&&js.includes('overviewDataState')&&js.includes('overviewHasRecentData'),'Overview must show a human missing-data state rather than a broken-looking chart.');
assert(js.includes('beslutningspunkt')&&js.includes('polishNorwegianUiTerms()'),'User-facing gate terminology must be normalized to natural Norwegian.');
assert(js.includes('Neste handling, eier og 72t · 14 · 30 · 90.'),'VIDA workday reminder must remain concise.');
assert(js.includes("document.addEventListener('aidme:portal-rendered'")&&js.includes("document.addEventListener('aidme:navigation-normalized'"),'Workday presentation must refresh after canonical role/navigation state settles.');
assert(!/supabase|client\.from|functions\.invoke|fetch\(|XMLHttpRequest|service_role/i.test(js),'Workday chrome must not create a backend or authorization path.');

assert(css.includes('.app-shell .workspace>.topbar{display:none!important}'),'Redundant daily page title/language/role/AAL2 header must be hidden on mobile.');
assert(css.includes('.sidebar .brand{display:none!important}'),'Separate mobile logo chrome must not consume navigation width.');
assert(css.includes("background:url('/vida/assets/AIDME_Logo-original-web.webp') center/contain no-repeat!important"),'Active navigation must use the original-aspect AidMe mark as its indicator.');
assert(css.includes('width:60px!important;height:60px!important')&&css.includes('opacity:.42!important'),'Final active mark must use slightly more visual volume without increasing nav height.');
assert(css.includes('.nav-item .nav-num{display:none!important}'),'Numeric navigation codes must be hidden on mobile.');
assert(css.includes('background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;color:#fff!important'),'Active navigation must not retain the legacy rectangular/gold enclosure.');
assert(!css.includes('inset 3px 0 0 var(--gold)'),'Mobile workday active state must not reproduce the legacy gold crescent.');
assert(css.includes('#mainNav .nav-item[data-view="analysis"]')&&css.includes('#mainNav #auditNav')&&css.includes('#mainNav #onboardingNav'),'Secondary tools must be hard-hidden from the mobile primary row even after late renders.');
assert(css.includes('.sidebar .nav-item')&&css.includes('display:flex!important')&&css.includes('.nav-badges'),'Navigation labels and badges must share one stable baseline.');
assert(css.includes('.role-intro-card .card-head')&&css.includes('grid-template-columns:minmax(0,1fr)!important'),'Rolleintroduksjon action must stay inside its guide card on mobile.');
assert(css.includes('.profile-logout-button')&&css.includes('color:#a42f36'),'Logout must be clearly visible as a destructive profile action.');
assert(css.includes('.overview-data-state')&&css.includes('.overview-no-data #overviewChart'),'Empty overview charts must collapse cleanly and avoid runaway vertical space.');
assert(css.includes('#view-overview>.hero-panel.compact-hero h2')&&css.includes('display:none!important'),'Large repeated phase heading/badge must collapse in everyday mobile work.');
assert(css.includes('#view-overview #homeIntro')&&css.includes('white-space:nowrap!important'),'Phase reminder must remain a compact one-line cue.');
assert(!/display\s*:\s*none[^}]*\.task-list|\.task-list[^}]*display\s*:\s*none/i.test(css),'Workday polish must not hide operational task content.');

console.log('Mobile workday chrome safety/density invariants OK');
