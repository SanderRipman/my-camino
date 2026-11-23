import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
const catalog=read('./knowledge-registry.js'),viewer=read('./knowledge.js');

class El{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.hidden=false;this.attrs={};this.dataset={};this.textContent='';this.innerHTML='';this.href='';this.listeners={};this.classSet=new Set();this.classList={add:x=>this.classSet.add(x),remove:x=>this.classSet.delete(x),contains:x=>this.classSet.has(x)};}
 appendChild(c){this.children.push(c);return c}
 replaceChildren(...items){this.children=[...items]}
 setAttribute(k,v){this.attrs[k]=v}
 getAttribute(k){return k==='href'?this.href:this.attrs[k]||null}
 addEventListener(k,cb){this.listeners[k]=cb}
}
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
async function run({aal='aal2',logged=true,query='?topic=safety',nav=null}={}){
 const nodes=new Map(),doc={querySelector(sel){if(!nodes.has(sel))nodes.set(sel,new El());return nodes.get(sel)},createElement(tag){return new El(tag)}};
 const calls=[];
 const client={
  auth:{getSession:async()=>({data:{session:logged?{user:{id:'only-user'}}:null}}),mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:aal}})}},
  from(table){calls.push(table);throw Error('Private table should never be requested for topic help')}
 };
 const context={
  window:{},document:doc,supabase:{createClient:()=>client},
  location:{origin:'https://demo.aidme.no',pathname:'/portal/knowledge.html',search:query},
  sessionStorage:{getItem:()=>nav?JSON.stringify({path:nav,at:Date.now()}):null},
  URL,URLSearchParams,Date,console
 };
 vm.runInNewContext(catalog,context);
 vm.runInNewContext(viewer,context);
 await pause();await pause();
 return{nodes,doc,calls};
}
let r=await run({logged:false});
assert.match(r.nodes.get('#knowledgeError').innerHTML,/Innlogging kreves/);
assert.ok(!r.nodes.has('#knowledgeCard')||!r.nodes.get('#knowledgeCard').classList.contains('active'));
assert.deepEqual(r.calls,[]);
r=await run({aal:'aal1'});
assert.match(r.nodes.get('#knowledgeError').innerHTML,/Bekreft tofaktor/);
assert.deepEqual(r.calls,[]);
r=await run({aal:'aal2',nav:'https://evil.invalid/steal'});
assert.equal(r.nodes.get('#knowledgeBack').href,'./');
assert.ok(r.nodes.get('#knowledgeCard').classSet.has('hidden')===false);
assert.ok(r.nodes.get('#knowledgePoints').children.length>=2);
assert.deepEqual(r.calls,[]);
r=await run({aal:'aal2',nav:'/portal/onboarding-read.html?item=abc'});
assert.equal(r.nodes.get('#knowledgeBack').href,'/portal/onboarding-read.html?item=abc');
r=await run({aal:'aal2',query:'?topic=__proto__'});
assert.match(r.nodes.get('#knowledgeError').innerHTML,/Ukjent innhold/);
assert.deepEqual(r.calls,[]);
console.log('UAT 5A runtime PASS: unauth/AAL1 denied, AAL2 topic help works without data access, malicious return blocked and exact onboarding return retained.');
