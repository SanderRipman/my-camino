// Deterministic source-and-render smoke tests for demo card UX.
// The fixtures below are synthetic; no network, database, or authentication is used.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const code=fs.readFileSync(new URL('./app-demo-showcase-overlay.js', import.meta.url),'utf8');
const between=(begin,end)=>{
 const start=code.indexOf(begin),stop=code.indexOf(end,start+begin.length);
 assert.ok(start>=0 && stop>start,'Cannot locate active source: '+begin);
 return code.slice(start,stop);
};
const taskSrc=between('function taskDialog(', 'function ensureInterest(');
const interestSrc=between('function interest(', 'async function metrics(');
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function renderTask(severity,status='IN_PROGRESS'){
 const body={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null};
 const dialog={open:false,showModal(){this.open=true;}};
 const nodes={
  '#taskDialog':dialog,
  '#taskDialogEyebrow':{textContent:''},
  '#taskDialogTitle':{textContent:''},
  '#taskDialogBody':body,
  '#taskStart':{classList:{add(){}}},
  '#taskDone':{classList:{add(){}}}
 };
 const ctx={
  document:{querySelector:selector=>nodes[selector]??null},
  map:()=>new Map([['p1',{code_name:'DEMO-STRESS-SER',stage:'SER'}]]),
  taskPhase:()=> 'SER',
  tone:()=>severity,
  N:{'DEMO-STRESS-SER':'Sofia Demo'},
  own:()=> 'SER-/turleder',
  st:state=>({OPEN:'Åpen',IN_PROGRESS:'I gang',WAITING:'Venter',DONE:'Ferdig'})[state]??state,
  pl:x=>x,
  esc:escapeHTML
 };
 const fn=vm.runInNewContext(taskSrc+';taskDialog',ctx);
 fn({id:'synthetic-task-1',participant_id:'p1',title:'RØD øvelse · vurder videre vandring',severity,status}, {participants:[]});
 assert.equal(dialog.open,true,'Task detail must open');
 return {html:body.innerHTML,heading:nodes['#taskDialogTitle'].textContent};
}
const critical=renderTask('RED');
assert.match(critical.html,/Grunnlag for vurderingen/);
assert.match(critical.html,/ikke en konkret årsak/);
assert.match(critical.html,/SER-\/turleder/);
assert.match(critical.html,/sikkerhetsprosedyre/);
assert.doesNotMatch(critical.html,/data-do-status="DONE"/,'Critical task must not offer immediate completion in this UAT view');
assert.match(critical.html,/ikke en serverbasert rettighetskontroll/,'Do not misrepresent client-side guard as authorization');
const ordinary=renderTask('GREEN');
assert.match(ordinary.html,/data-do-status="DONE"/,'Ordinary demo task still has a completion action');

function renderInterest(){
 const d={open:false,innerHTML:'',querySelector:()=>({onclick:null}),querySelectorAll:()=>[],showModal(){this.open=true;},close(){this.open=false;}};
 const ctx={
  ensureInterest:()=>d,
  I:[['Amalie Demo','Har mistet arbeidsretning og ønsker en avklaring.','Avklar ønsket endring hjemme'],['Nora Demo','Ønsker jobbretning.','VÍA-samtale']],
  esc:escapeHTML
 };
 const fn=vm.runInNewContext(interestSrc+';interest',ctx);
 fn(0);
 assert.equal(d.open,true);
 return d.innerHTML;
}
const html=renderInterest();
assert.match(html,/Innsendt notat · syntetisk eksempel/,'Submitted demo note must be labeled and visible');
assert.match(html,/Har mistet arbeidsretning/);
assert.match(html,/Foreslått neste handling/);
assert.match(html,/<b>Amalie Demo<\/b><small>Syntetisk interesse<\/small>/,'Name and category must use distinct blocks');
assert.match(html,/Faktiske interessenotater må hentes fra autorisert inntak/,'Do not confuse synthetic sample with real intake note');
assert.match(html,/data-do-back/,'Provide predictable task-return control');
console.log('Demo card UX: PASS (synthetic source/render tests only; authenticated browser QA remains open)');
