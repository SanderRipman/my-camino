import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const chrome=read('./standalone-chrome.js');
assert(chrome.includes("CHROME_VERSION='2026-09-05b'"),'Standalone chrome must be versioned.');
assert(!chrome.includes('nav.replaceChildren('),'Standalone chrome must not collapse the role-aware menu before navigation IA restores it.');
assert(chrome.includes("aria-current','page'"),'Standalone chrome must identify the current workspace accessibly.');
assert(!/supabase|role_grants|capabilit/i.test(chrome),'Standalone chrome must remain presentation-only and must not recreate authorization logic.');

const mobile=read('./app-mobile.js');
const mobileCss=read('./mobile.css');
const navIa=read('./navigation-ia.js');
assert(mobile.includes("MOBILE_UX_VERSION='2026-09-05e'"),'Shared portal shell must cache-bust the final mobile IA layer.');
assert(mobile.includes("WORKDAY_CHROME_VERSION='2026-09-05e'")&&mobile.includes('app-workday-chrome.js')&&mobile.includes('workday-mobile.css'),'Shared portal shell must load the current workday chrome layer.');
assert(mobile.includes("NAVIGATION_IA_VERSION='2026-09-05e'"),'Shared portal shell must cache-bust the current navigation IA layer.');
assert(mobile.includes('navigation-ia.js'),'Shared portal shell must load the navigation IA layer.');
assert(mobile.includes('userScrollSeen')&&mobile.includes('movingUp')&&mobile.includes('movingDown'),'Mobile navigation must distinguish restored scroll state from deliberate user scrolling.');
assert(mobile.includes("window.addEventListener('pageshow'")&&mobile.includes("document.addEventListener('visibilitychange'"),'Mobile navigation must reveal safely after page/auth restoration.');
assert(mobile.includes('activeIsOverview')&&mobile.includes("activeIsOverview(active)?0")&&mobile.includes('nav.scrollTo'),'Oversikt must be the hard left/start anchor while other active items remain recoverable.');
assert(mobile.includes("'aidme:navigation-snapshot:v1','aidme:navigation-snapshot:v2','aidme:navigation-snapshot:v3'")&&mobile.includes('removeItem(key)'),'Legacy navigation snapshots must be discarded instead of contaminating the final role menu.');
assert(mobile.includes("document.addEventListener('aidme:navigation-normalized'"),'Mobile navigation must recenter only after the normalized menu exists.');
assert(!/supabase|role_grants|client\.from|functions\.invoke|fetch\(/i.test(mobile),'Mobile shell polish must stay presentation-only and must not create a data or authorization path.');
assert(mobileCss.includes('.sidebar .brand>div{display:none!important}')&&mobileCss.includes('max-width:none!important'),'Base mobile navigation must free width from redundant brand text and use the available viewport.');
assert(mobileCss.includes('scroll-snap-type:x proximity')&&mobileCss.includes('scrollbar-width:none'),'Horizontal navigation must remain deliberate and touch-friendly.');
assert(mobileCss.includes('.demo-lens-control')&&mobileCss.includes('.preview-strip')&&mobileCss.includes('.form-section'),'Mobile polish must compact secondary chrome and long forms without removing them.');
assert(!/display\s*:\s*none[^}]*\.form-section|\.form-section[^}]*display\s*:\s*none/i.test(mobileCss),'Mobile form sections must remain visible.');

assert(navIa.includes('.sidebar{overflow-y:auto'),'Desktop/laptop sidebar must remain independently scrollable.');
assert(navIa.includes("['analysis','documents']"),'Analysis and document placeholder must remain demoted from primary navigation.');
assert(navIa.includes("const forms=mainNode(nav,'forms');setMobileSecondary(forms,true)"),'Skjema & rutiner must be secondary rather than permanent primary mobile navigation.');
assert(navIa.includes("['#adminLink','#crmNav']")&&navIa.includes('nav-mobile-secondary'),'Admin/CRM must not crowd the everyday mobile primary row.');
for(const id of ['#demoJourneyNav','#notificationsNav','#auditNav','#documentsCenterNav','#onboardingNav'])assert(navIa.includes(id),`Navigation IA must demote ${id} from the main list.`);
assert(navIa.includes("'Mine dokumenter','./documents.html'"),'Profile menu must retain one clear secure document entry.');
assert(navIa.includes("'Demo-reise (LAB)'"),'Authorized demo journey must move to a secondary/profile location.');
assert(navIa.includes("onboarding:{num:'00',label:'Slik fungerer det'}"),'Rolleintroduksjon must be nested under Slik fungerer det rather than become a separate primary destination.');
assert(navIa.includes("const primaryOrder=['overview','participants','#intakeNav','#ownersNav','tasks','checkin','#pilotOpsNav','#guideNav','#sosNav','settings']"),'Primary mobile journey must put work first and keep Oversikt first.');
assert(!navIa.includes("primaryOrder=['analysis'"),'Secondary analysis must never become the left anchor.');
assert(navIa.includes("NAV_SNAPSHOT_KEY='aidme:navigation-snapshot:v4'")&&navIa.includes('overviewFirst(dedupeItems(items))')&&navIa.includes('standaloneFromSnapshot(nav,meta)'),'Standalone workspaces must restore a deduplicated role-aware snapshot with Oversikt first.');
assert(navIa.includes('snapshotBadges(el)')&&navIa.includes('appendBadges(el,badges)'),'Role-aware standalone continuity must preserve visible navigation badge state.');
assert(navIa.includes("document.addEventListener('aidme:portal-rendered'")&&navIa.includes("'aidme:navigation-normalized'"),'Navigation must normalize again after canonical portal data and role state settle.');
assert(navIa.includes('SECONDARY_DIRECT_VIEWS')&&navIa.includes('applyHashView(nav)'),'Secondary tools must remain directly reachable without becoming permanent primary navigation.');
assert(!/supabase|role_grants|client\.from|functions\.invoke|fetch\(/i.test(navIa),'Navigation IA must stay presentation-only and must not create a data or authorization path.');
assert(!navIa.includes('MutationObserver'),'Navigation IA must use explicit render events/finite passes, not persistent observer loops.');

const sidebarPages=['form-runner.html','intake.html','owners.html','pilot-ops.html','notifications.html','audit.html','sos.html'];
for(const page of sidebarPages){
  const html=read(`./${page}`);
  assert(html.includes('standalone-chrome.js'),`${page} must load the shared standalone chrome.`);
  assert(html.includes('app-mobile.js'),`${page} must use the common mobile/navigation shell.`);
}

const guide=read('./guide.html');
assert(guide.includes('app-mobile.js'),'Program guide must load the common mobile/navigation shell.');
assert(guide.includes('Slik fungerer det')&&guide.includes('Hjelp & SOS')&&guide.includes('Åpne rolleintroduksjon'),'Program guide must own the role-introduction entry point.');
const onboarding=read('./onboarding.html');
assert(onboarding.includes('app-mobile.js')&&onboarding.includes('simple-sidebar sidebar'),'Role introduction must participate in the shared role-aware mobile navigation shell.');
assert(!onboarding.includes('class="active" href="./onboarding.html"'),'Role introduction must not advertise itself as a separate primary top-nav destination.');

const admin=read('./admin.html');
assert(admin.includes('app-mobile.js'),'Administration must load the common navigation shell.');

const documents=read('./documents.html');
const documentsCss=read('./documents.css');
assert(documents.includes('class="doc-shell"'),'Documents must retain its intentionally role-neutral personal workspace shell.');
assert(documents.includes('href="./">Til portal</a>'),'Documents must keep a direct return to the role-aware portal hub.');
assert(documentsCss.includes('@media(max-width:720px)'),'Documents must retain its dedicated responsive layout.');

console.log('Standalone/navigation IA smoke: OK');
