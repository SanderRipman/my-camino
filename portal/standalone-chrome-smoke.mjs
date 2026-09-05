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
assert(mobile.includes("MOBILE_UX_VERSION='2026-09-05c'"),'Shared portal shell must cache-bust the current mobile polish layer.');
assert(mobile.includes("WORKDAY_CHROME_VERSION='2026-09-05d'")&&mobile.includes('app-workday-chrome.js')&&mobile.includes('workday-mobile.css'),'Shared portal shell must load the current workday chrome layer.');
assert(mobile.includes("NAVIGATION_IA_VERSION='2026-09-05c'"),'Shared portal shell must cache-bust the current navigation IA layer.');
assert(mobile.includes('navigation-ia.js'),'Shared portal shell must load the navigation IA layer.');
assert(mobile.includes('userScrollSeen')&&mobile.includes('movingUp')&&mobile.includes('movingDown'),'Mobile navigation must distinguish restored scroll state from deliberate user scrolling.');
assert(mobile.includes("window.addEventListener('pageshow'")&&mobile.includes("document.addEventListener('visibilitychange'"),'Mobile navigation must reveal safely after page/auth restoration.');
assert(mobile.includes('centerActive')&&mobile.includes('nav.scrollTo'),'Active horizontal navigation item must be recoverable without changing routing.');
assert(mobile.includes("'aidme:navigation-snapshot:v1','aidme:navigation-snapshot:v2'")&&mobile.includes('removeItem(key)'),'Legacy navigation snapshots must be discarded instead of contaminating the current role menu.');
assert(mobile.includes("document.addEventListener('aidme:navigation-normalized'"),'Mobile navigation must recenter only after the normalized menu exists.');
assert(!/supabase|role_grants|client\.from|functions\.invoke|fetch\(/i.test(mobile),'Mobile shell polish must stay presentation-only and must not create a data or authorization path.');
assert(mobileCss.includes('.sidebar .brand>div{display:none!important}')&&mobileCss.includes('max-width:none!important'),'Base mobile navigation must free width from redundant brand text and use the available viewport.');
assert(mobileCss.includes('scroll-snap-type:x proximity')&&mobileCss.includes('scrollbar-width:none'),'Horizontal navigation must remain deliberate and touch-friendly.');
assert(mobileCss.includes('.demo-lens-control')&&mobileCss.includes('.preview-strip')&&mobileCss.includes('.form-section'),'Mobile polish must compact secondary chrome and long forms without removing them.');
assert(!/display\s*:\s*none[^}]*\.form-section|\.form-section[^}]*display\s*:\s*none/i.test(mobileCss),'Mobile form sections must remain visible.');

assert(navIa.includes('.sidebar{overflow-y:auto'),'Desktop/laptop sidebar must remain independently scrollable.');
assert(navIa.includes("['analysis','documents','settings']"),'Analysis, document placeholder and settings must be demoted from main navigation.');
for(const id of ['#demoJourneyNav','#notificationsNav','#auditNav','#documentsCenterNav','#onboardingNav'])assert(navIa.includes(id),`Navigation IA must demote ${id} from the main list.`);
assert(navIa.includes("'Mine dokumenter','./documents.html'"),'Profile menu must retain one clear secure document entry.');
assert(navIa.includes("'Demo-reise (LAB)'"),'Authorized demo journey must move to a secondary/profile location.');
assert(navIa.includes("label:'Slik fungerer det'")&&navIa.includes("label:'Hjelp & SOS'"),'Standalone navigation must keep stable guide/help anchors.');
assert(navIa.includes("'#intakeNav','#ownersNav','tasks','checkin','forms','#pilotOpsNav','#adminLink'"),'Main navigation must preserve the operational journey order.');
assert(navIa.includes("NAV_SNAPSHOT_KEY='aidme:navigation-snapshot:v3'")&&navIa.includes('persistMainSnapshot(nav)')&&navIa.includes('standaloneFromSnapshot(nav,meta)'),'All standalone workspaces must restore the current role-aware main navigation from a fresh same-origin session snapshot.');
assert(navIa.includes('snapshotBadges(el)')&&navIa.includes('appendBadges(el,badges)'),'Role-aware standalone continuity must preserve visible navigation badge state.');
assert(navIa.includes("document.addEventListener('aidme:portal-rendered'")&&navIa.includes("'aidme:navigation-normalized'"),'Navigation must normalize again after canonical portal data and role state settle.');
assert(navIa.includes("view?`./#${view}`:null")&&navIa.includes('applyHashView(nav)'),'Return links must restore the requested portal view without creating a new authorization path.');
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
assert(guide.includes('Slik fungerer det')&&guide.includes('Hjelp & SOS'),'Program guide must retain stable guide/help anchors before enhancement.');

const admin=read('./admin.html');
assert(admin.includes('app-mobile.js'),'Administration must load the common navigation shell.');

const documents=read('./documents.html');
const documentsCss=read('./documents.css');
assert(documents.includes('class="doc-shell"'),'Documents must retain its intentionally role-neutral personal workspace shell.');
assert(documents.includes('href="./">Til portal</a>'),'Documents must keep a direct return to the role-aware portal hub.');
assert(documentsCss.includes('@media(max-width:720px)'),'Documents must retain its dedicated responsive layout.');

console.log('Standalone/navigation IA smoke: OK');
