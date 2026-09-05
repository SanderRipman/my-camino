import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const js=read('./app-workday-chrome.js');
const css=read('./workday-mobile.css');

assert(js.includes("WORKDAY_CHROME_VERSION='2026-09-05b'"),'Workday chrome must be versioned for cache busting.');
assert(js.includes("/^Beta:/i")&&js.includes(".demo-note")&&js.includes("workday-dev-ui"),'Non-final beta/demo chrome must be removed or hidden from everyday work views.');
assert(js.includes("data-view=\"settings\"")&&js.includes("textContent='Profil'")&&js.includes("href='./#settings'"),'Profile must remain reachable after daily identity controls are removed.');
assert(js.includes('Tilgang og roller')&&js.includes('safeActiveRoles()'),'Profile must expose active role context instead of repeating it in every work header.');
assert(js.includes('Retning, ressurser, trygghet og neste gate.')&&js.includes('Neste handling, eier og 72t · 14 · 30 · 90.'),'VÍA/VIDA workday reminders must be concise.');
assert(!/supabase|client\.from|functions\.invoke|fetch\(|XMLHttpRequest|service_role/i.test(js),'Workday chrome must not create a backend or authorization path.');

assert(css.includes('.app-shell .workspace>.topbar{display:none!important}'),'Redundant daily page title/language/role/AAL2 header must be hidden on mobile.');
assert(css.includes('.sidebar .brand{display:none!important}'),'Separate mobile logo chrome must not consume navigation width.');
assert(css.includes("background-image:url('/vida/assets/AIDME_Logo-original-web.webp')")&&css.includes('background-size:auto 78px!important'),'Active navigation must use the original-aspect AidMe mark as its branded indicator.');
assert(css.includes('.nav-item[aria-current="page"]::before')&&css.includes('opacity:.16!important'),'The AidMe active mark must be faded and work for main and standalone navigation.');
assert(css.includes('box-shadow:inset 0 0 0 1px rgba(255,255,255,.11)!important'),'Active state must retain a quiet non-color-only enclosure without the old gold crescent.');
assert(!css.includes('inset 3px 0 0 var(--gold)'),'Mobile workday active state must not reproduce the legacy gold crescent.');
assert(css.includes('.sidebar .nav-item')&&css.includes('display:flex!important')&&css.includes('.nav-badges'),'Navigation labels and badges must share one stable baseline.');
assert(css.includes('#view-overview>.hero-panel.compact-hero h2')&&css.includes('display:none!important'),'Large repeated phase heading/badge must collapse in everyday mobile work.');
assert(css.includes('#view-overview #homeIntro')&&css.includes('white-space:nowrap!important'),'Phase reminder must remain a compact one-line cue.');
assert(!/display\s*:\s*none[^}]*\.task-list|\.task-list[^}]*display\s*:\s*none/i.test(css),'Workday polish must not hide operational task content.');

console.log('Mobile workday chrome safety/density invariants OK');
