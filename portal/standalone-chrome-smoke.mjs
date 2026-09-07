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
assert(mobile.includes("MOBILE_UX_VERSION='2026-09-06b'"),'Shared portal shell must cache-bust the final transition layer.');
assert(mobile.includes("WORKDAY_CHROME_VERSION='2026-09-06a'")&&mobile.includes('app-workday-chrome.js')&&mobile.includes('workday-mobile.css'),'Shared portal shell must load the current workday chrome layer.');
assert(mobile.includes("NAVIGATION_IA_VERSION='2026-09-06b'"),'Shared portal shell must load the final navigation IA layer.');
assert(mobile.includes('BRANDED_LOADER_MIN_MS=1250')&&mobile.includes('Ve.</span><span>Sé.</span><span>Vive.'),'Portal loading must present the canonical motto sequentially with a short minimum brand moment.');
assert(mobile.includes('wrapSubsequentPortalLoads()')&&mobile.includes('installBrandedLoader()'),'Branded loading must apply to both the initial and subsequent portal loads without changing auth/data logic.');
assert(mobile.includes('navigation-ia.js'),'Shared portal shell must load the navigation IA layer.');
assert(mobile.includes('userScrollSeen')&&mobile.includes('movingUp')&&mobile.includes('movingDown'),'Mobile navigation must distinguish restored scroll state from deliberate user scrolling.');
assert(mobile.includes("window.addEventListener('pageshow'")&&mobile.includes("document.addEventListener('visibilitychange'"),'Mobile navigation must reveal safely after page/auth restoration.');
assert(mobile.includes('activeIsOverview')&&mobile.includes("activeIsOverview(active)?0")&&mobile.includes('nav.scrollTo'),'Oversikt must be the hard left/start anchor while other active items remain recoverable.');
assert(mobile.includes("'aidme:navigation-snapshot:v5'")&&mobile.includes('removeItem(key)'),'Legacy v5 navigation snapshot must be discarded after final ordering.');
assert(mobile.includes("document.addEventListener('aidme:navigation-normalized'"),'Mobile navigation must recenter only after the normalized menu exists.');
assert(mobile.includes('installSharedPrimarySwipe')&&mobile.includes("nav.querySelectorAll('.nav-item')"),'Shared swipe must follow every visible primary nav item, including href-based standalone destinations.');
assert(!mobile.includes("querySelectorAll('.nav-item[data-view]')"),'Shared swipe must not skip primary links without data-view.');
assert(mobile.includes('prefetchVisibleStandalone')&&mobile.includes("nav.querySelectorAll('a.nav-item[href]')"),'Visible standalone primary destinations should be prefetched without changing navigation semantics.');
assert(!/supabase|role_grants|client\.from|functions\.invoke|fetch\(/i.test(mobile),'Mobile shell polish must stay presentation-only and must not create a data or authorization path.');
assert(mobileCss.includes('.sidebar .brand>div{display:none!important}')&&mobileCss.includes('max-width:none!important'),'Base mobile navigation must free width from redundant brand text and use the available viewport.');
assert(mobileCss.includes('scroll-snap-type:x proximity')&&mobileCss.includes('scrollbar-width:none'),'Horizontal navigation must remain deliberate and touch-friendly.');
assert(mobileCss.includes('.demo-lens-control')&&mobileCss.includes('.preview-strip')&&mobileCss.includes('.form-section'),'Mobile polish must compact secondary chrome and long forms without removing them.');
assert(!/display\s*:\s*none[^}]*\.form-section|\.form-section[^}]*display\s*:\s*none/i.test(mobileCss),'Mobile form sections must remain visible.');

assert(navIa.includes("NAV_IA_VERSION='2026-09-06b'"),'Navigation IA must be cache-busted after final transition work.');
assert(navIa.includes('.sidebar{overflow-y:auto'),'Desktop/laptop sidebar must remain independently scrollable.');
assert(navIa.includes("['analysis','documents']"),'Analysis and document placeholder must remain demoted from primary navigation.');
assert(navIa.includes("const forms=mainNode(nav,'forms');setMobileSecondary(forms,true)"),'Skjema & rutiner must be secondary rather than permanent primary mobile navigation.');
assert(navIa.includes('MOBILE_SECONDARY_LABELS')&&navIa.includes('markSecondaryByLabel(nav)'),'Secondary tools injected late must still be excluded from primary mobile navigation.');
assert(navIa.includes("const primaryOrder=['overview','participants','tasks','checkin','#intakeNav','#ownersNav','#pilotOpsNav','#guideNav','#sosNav','settings']"),'Primary order must prioritize Oversikt, Deltakere, Oppgaver and Innsjekk before Interesse/VÍA.');
assert(navIa.includes("NAV_SNAPSHOT_KEY='aidme:navigation-snapshot:v6'")&&navIa.includes('overviewFirst(dedupeItems(items))')&&navIa.includes('standaloneFromSnapshot(nav,meta)'),'Standalone workspaces must restore the final deduplicated role-aware snapshot with Oversikt first.');
assert(navIa.includes('snapshotBadges(el)')&&navIa.includes('appendBadges(el,badges)'),'Role-aware standalone continuity must preserve visible navigation badge state.');
assert(navIa.includes("document.addEventListener('aidme:portal-rendered'")&&navIa.includes("'aidme:navigation-normalized'"),'Navigation must normalize again after canonical portal data and role state settle.');
assert(navIa.includes('SECONDARY_DIRECT_VIEWS')&&navIa.includes('applyHashView(nav)'),'Secondary tools must remain directly reachable without becoming permanent primary navigation.');
assert(!/supabase|role_grants|client\.from|functions\.invoke|fetch\(/i.test(navIa),'Navigation IA must stay presentation-only and must not create a data or authorization path.');
assert(!navIa.includes('MutationObserver'),'Navigation IA must use explicit render events/finite passes, not persistent observer loops.');

const sidebarPages=['form-runner.html','intake.html','pilot-ops.html','notifications.html','audit.html','sos.html'];
for(const page of sidebarPages){
  const html=read(`./${page}`);
  assert(html.includes('standalone-chrome.js'),`${page} must load the shared standalone chrome.`);
  assert(html.includes('app-mobile.js'),`${page} must use the common mobile/navigation shell.`);
}

const ownersHtml=read('./owners.html');
const ownersJs=read('./owners.js');
assert(ownersHtml.includes('Administrativt verktøy · ansvar'),'Owners must identify itself as a secondary tool.');
assert(ownersHtml.includes('href="./admin.html"')&&ownersHtml.includes('href="./"'),'Owners must provide simple returns to admin and portal.');
assert(!ownersHtml.includes('standalone-chrome.js')&&!ownersHtml.includes('app-mobile.js'),'Owners must not carry the legacy standalone/mobile navigation stack.');
assert(ownersJs.includes('initPromise')&&ownersJs.includes('if(initPromise)return initPromise'),'Owner initialization must be single-flight.');
assert(ownersJs.includes('contextSeq')&&ownersJs.includes('seq!==contextSeq'),'Owner context updates must ignore stale concurrent responses.');
assert(ownersJs.includes("['SIGNED_IN','MFA_CHALLENGE_VERIFIED']")&&!ownersJs.includes("'TOKEN_REFRESHED'")&&!ownersJs.includes("'USER_UPDATED'"),'Owner auth handling must react to explicit sign-in/MFA events without routine token-refresh reinitialization.');
assert(ownersJs.includes("event==='SIGNED_OUT'")&&ownersJs.includes('location.replace'),'Owner workspace must fail closed on sign-out.');
assert(ownersHtml.includes('id="ownerLoading"')&&ownersHtml.includes('id="retryOwner"'),'Owner workspace must show loading/retry instead of a blank screen.');

const guide=read('./guide.html');
assert(guide.includes('app-mobile.js?v=20260906b'),'Program guide must load the cache-busted common mobile/navigation shell.');
const onboarding=read('./onboarding.html');
assert(onboarding.includes('app-mobile.js')&&onboarding.includes('simple-sidebar sidebar'),'Role introduction must participate in the shared role-aware mobile navigation shell.');

const admin=read('./admin.html');
assert(admin.includes('app-mobile.js')&&admin.includes('href="./owners.html"'),'Administration must expose the secondary owner-management tool.');

const documents=read('./documents.html');
const documentsCss=read('./documents.css');
assert(documents.includes('class="doc-shell"'),'Documents must retain its intentionally role-neutral personal workspace shell.');
assert(documents.includes('href="./">Til portal</a>'),'Documents must keep a direct return to the role-aware portal hub.');
assert(documentsCss.includes('@media(max-width:720px)'),'Documents must retain its dedicated responsive layout.');

console.log('Standalone/navigation IA, final snapshot, prefetch, shared swipe and lightweight owner-tool smoke: OK');
