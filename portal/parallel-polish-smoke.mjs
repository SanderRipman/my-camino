import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const fail=message=>{throw new Error(`parallel-polish-smoke: ${message}`)};
const must=(condition,message)=>{if(!condition)fail(message)};
const includes=(text,needle,message)=>must(text.includes(needle),message||`missing ${needle}`);

const density=read('density.css');
const index=read('index.html');
const admin=read('admin.html');
const qaHtml=read('qa-role-pack.html');
const qaJs=read('qa-role-pack.js');

// Desktop density must be opt-in at desktop width and actually loaded by shared portal surfaces.
must(/@media\s*\(min-width:\s*1100px\)/.test(density),'density.css must start at >=1100px');
must(!/@media\s*\([^)]*max-width/i.test(density),'density.css must not introduce a mobile/tablet breakpoint');
includes(index,'./density.css?v=20260903a','portal index must load density.css');
includes(admin,'./density.css?v=20260903a','admin shell must load density.css');

// Workflow status and attention/priority are separate concepts in presentation copy.
includes(index,'<strong>Arbeidsstatus:</strong> Åpen / I gang / Ferdig.','task view must name workflow status explicitly');
includes(index,'<strong>Oppmerksomhet:</strong> Kritisk / Avklar / Normal.','task view must name attention explicitly');
must(!index.includes('<small>rød status</small>')&&!index.includes('<small>gul status</small>'),'severity metrics must not be labelled as workflow status');

// LAB is discoverable only from inside the already gated admin workspace; QA page repeats its own AAL2/system_admin gate in JS.
const adminWorkspaceStart=admin.indexOf('<section id="adminWorkspace" class="hidden">');
const labLink=admin.indexOf('href="./qa-role-pack.html"');
const adminWorkspaceEnd=admin.indexOf('</section>',labLink);
must(adminWorkspaceStart>=0&&labLink>adminWorkspaceStart&&adminWorkspaceEnd>labLink,'LAB link must live inside the gated admin workspace');
includes(admin,'LAB · syntetisk rolle-QA','admin LAB entry must be explicit about synthetic QA');
includes(qaJs,"assurance?.currentLevel==='aal2'",'QA page must require AAL2');
includes(qaJs,"g.role_code==='system_admin'",'QA page must require system_admin');

// Credentials may exist in memory/DOM while shown, but this page must not persist them in browser storage/cookies.
for(const primitive of ['localStorage','sessionStorage','indexedDB','document.cookie']){
  must(!qaJs.includes(primitive),`QA credential code must not use ${primitive}`);
}
includes(qaJs,'let lastAccounts=[];','QA credentials should remain in page memory only');
includes(qaHtml,'passordene kan ikke hentes igjen herfra på en annen laptop','QA copy must explain cross-device non-recoverability');
includes(qaHtml,'Kopiering bruker enhetens utklippstavle','QA copy must disclose clipboard behavior');

// Renewal and recreation must remain visibly distinct without changing backend semantics.
includes(qaHtml,'<b>Opprett ny rollepakke</b>','QA page must explain recreation separately');
includes(qaHtml,'<b>Forny én uke</b>','QA page must explain renewal separately');
includes(qaJs,"body:{action:'extend_week'}",'renew action must remain non-destructive extend_week');
includes(qaJs,"client.functions.invoke('qa-create-role-pack'",'create action must remain the existing create function');

// Deterministic minimum touch-target protection for the dense QA surface.
includes(qaHtml,'.copy-btn{font:inherit;border:1px solid #d9d2c4;background:white;border-radius:999px;padding:8px 12px;min-height:44px','copy controls must keep a 44px minimum target');
includes(qaHtml,'.qa-actions button,.qa-actions a{min-height:44px}','QA action controls must keep a 44px minimum target');

console.log('parallel-polish-smoke: PASS');
