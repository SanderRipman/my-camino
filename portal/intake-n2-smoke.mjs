import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(dir,'intake.html'),'utf8');
const js=fs.readFileSync(path.join(dir,'intake.js'),'utf8');
const css=fs.readFileSync(path.join(dir,'intake-n2.css'),'utf8');
const requireText=(label,haystack,needle)=>{if(!haystack.includes(needle))throw new Error(`${label}: missing ${needle}`)};

requireText('N2 heading',html,'Mottak og første avklaring');
requireText('interest is not approval',html,'Interesse er ikke godkjenning');
requireText('qa no write banner',html,'Syretest · ingen data lagres');
requireText('account later',html,'konto senere');
requireText('N2 css',html,'intake-n2.css');
requireText('qa opt-in',js,"get('n2qa')==='1'");
requireText('authorized command only',js,"client.functions.invoke('intake-command'");
requireText('list only open intake states',js,"statuses:['NEW','TRIAGE']");
requireText('clarification outcome',js,'Trenger avklaring');
requireText('alternative path outcome',js,'Anbefal annen vei');
requireText('close outcome',js,'Avslutt');
requireText('via outcome',js,'Gå videre til VÍA');
requireText('convert command',js,"cmd('CONVERT_TO_VIA'");
requireText('terminal confirmation',js,'window.confirm');
requireText('no-write qa copy',js,'Ingen data ble lagret');
requireText('fail closed backend copy',js,'Ingen direkte databasevei brukes som reserve');
requireText('N2 to N3 handoff keeps participant context',js,"participantId:String(participant?.id||'')");
requireText('mobile target',css,'min-height:48px');
requireText('reduced motion',css,'prefers-reduced-motion');

for(const forbidden of ["client.from('intakes')",'client.from("intakes")',"client.from('participants')",'client.from("participants")']){
  if(js.includes(forbidden))throw new Error(`Direct DB write/read path forbidden in N2 intake UX: ${forbidden}`);
}
for(const forbidden of ["email:String(intake?.contact_email",'email:String(intake?.contact_email',"email:String(intake?.contact_email||'')"]){
  if(js.includes(forbidden))throw new Error('N2→N3 handoff must not put contact email in URL/query parameters.');
}
if(!js.includes("if(QA_MODE)"))throw new Error('N2 QA mode must be explicit and opt-in');
// Regression: a live MutationObserver must not trigger itself endlessly via idempotent copy writes.
const showcase=fs.readFileSync(path.join(dir,'intake-demo-showcase.js'),'utf8');
let pendingMutations=0,observerCallback=null,totalWrites=0;
function trackedNode(field,initial){
  let current=initial;
  return {
    get [field](){return current;},
    set [field](next){current=next;totalWrites++;pendingMutations++;}
  };
}
const header=trackedNode('textContent','Tidligere overskrift');
const blockedText=trackedNode('textContent','VÍA-triage');
const bodyText=trackedNode('nodeValue','Aktiv triage');
const root={};
const previewDocument={
  title:'',
  querySelector(selector){return selector==='.workspace'?root:selector==='.topbar h1'?header:selector==='#blocked p'?blockedText:null;},
  querySelectorAll(selector){return selector==='#workspace,#blocked'?[root]:[];},
  createTreeWalker(){let yielded=false;return{currentNode:null,nextNode(){if(yielded)return false;yielded=true;this.currentNode=bodyText;return true}}}
};
class TrackedObserver{
  constructor(callback){observerCallback=callback;}
  observe(_root,options){if(!options.childList||!options.characterData)throw Error('UAT copy observer must track DOM text changes');}
}
vm.runInNewContext(showcase,{
  location:{hostname:'demo.aidme.no',search:'?n2qa=1'},
  document:previewDocument,
  MutationObserver:TrackedObserver,
  NodeFilter:{SHOW_TEXT:4},
  URLSearchParams,
  setTimeout:()=>0
},{timeout:1000});
if(!observerCallback)throw Error('UAT copy observer was not installed');
for(let i=0;i<10&&pendingMutations>0;i++){
  pendingMutations=0;observerCallback([]);
  if(totalWrites>3)throw Error('N2 demo copy MutationObserver is retriggering itself');
}
if(pendingMutations||totalWrites!==3)throw Error('N2 demo observer did not settle after initial text updates ('+totalWrites+' writes)');
console.log('N2 demo MutationObserver idempotence runtime regression PASS');

console.log('N2 intake / first-avklaring invariants OK, including PII-safe N2→N3 handoff URL.');
