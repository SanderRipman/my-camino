import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const chrome=read('./standalone-chrome.js');
assert(chrome.includes('nav.replaceChildren('),'Standalone chrome must replace duplicated static nav at runtime.');
assert(chrome.includes("makeNavItem({href:'./',num:'←',label:'Til portal'})"),'Standalone chrome must route back through the role-aware portal hub.');
assert(chrome.includes("aria-current','page'"),'Standalone chrome must identify the current workspace accessibly.');
assert(!/supabase|role_grants|capabilit/i.test(chrome),'Standalone chrome must remain presentation-only and must not recreate authorization logic.');

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
  assert(html.includes('app-mobile.js'),`${page} must use the common mobile navigation behavior.`);
}

const documents=read('./documents.html');
const documentsCss=read('./documents.css');
assert(documents.includes('class="doc-shell"'),'Documents must retain its intentionally role-neutral personal workspace shell.');
assert(documents.includes('href="./">Til portal</a>'),'Documents must keep a direct return to the role-aware portal hub.');
assert(documentsCss.includes('@media(max-width:720px)'),'Documents must retain its dedicated responsive layout.');

console.log('Standalone portal chrome smoke: OK');
