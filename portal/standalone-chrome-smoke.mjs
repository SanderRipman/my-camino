import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const chrome=read('./standalone-chrome.js');
assert(chrome.includes('nav.replaceChildren('),'Standalone chrome must replace duplicated static nav at runtime.');
assert(chrome.includes("makeNavItem({href:'./',num:'←',label:'Til portal'})"),'Standalone chrome must retain the safe portal return fallback before navigation IA loads.');
assert(chrome.includes("aria-current','page'"),'Standalone chrome must identify the current workspace accessibly.');
assert(!/supabase|role_grants|capabilit/i.test(chrome),'Standalone chrome must remain presentation-only and must not recreate authorization logic.');

const mobile=read('./app-mobile.js');
const navIa=read('./navigation-ia.js');
assert(mobile.includes('navigation-ia.js'),'Shared portal shell must load the navigation IA layer.');
assert(navIa.includes('.sidebar{overflow-y:auto'),'Desktop/laptop sidebar must remain independently scrollable.');
assert(navIa.includes("['analysis','documents','settings']"),'Analysis, document placeholder and settings must be demoted from main navigation.');
for(const id of ['#demoJourneyNav','#notificationsNav','#auditNav','#documentsCenterNav','#onboardingNav'])assert(navIa.includes(id),`Navigation IA must demote ${id} from the main list.`);
assert(navIa.includes("'Mine dokumenter','./documents.html'"),'Profile menu must retain one clear secure document entry.');
assert(navIa.includes("'Demo-reise (LAB)'"),'Authorized demo journey must move to a secondary/profile location.');
assert(navIa.includes("label:'Slik fungerer det'")&&navIa.includes("label:'Hjelp & SOS'"),'Standalone navigation must keep stable guide/help anchors.');
assert(navIa.includes("page==='admin'")&&navIa.includes("label:'Revisjon',sub:true"),'Revision must be contextualized under Administration.');
assert(navIa.includes("'#intakeNav','#ownersNav','tasks','checkin','forms','#pilotOpsNav','#adminLink'"),'Main navigation must preserve the operational journey order.');
assert(!/supabase|role_grants|client\.from|functions\.invoke|fetch\(/i.test(navIa),'Navigation IA must stay presentation-only and must not create a data or authorization path.');
assert(!navIa.includes('MutationObserver'),'Navigation IA must use finite/idempotent passes, not persistent observer loops.');

const sidebarPages=[
  'form-runner.html',
  'intake.html',
  'owners.html',
  'pilot-ops.html',
  'notifications.html',
  'audit.html',
  'sos.html'
];

for(const page of sidebarPages){
  const html=read(`./${page}`);
  assert(html.includes('standalone-chrome.js?v=20260824a'),`${page} must load the shared standalone chrome.`);
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
