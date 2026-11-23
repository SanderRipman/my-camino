// Targeted VÍA regression: denial reasons and task-return links remain stable.
// Executes the actual browser scripts under a minimal synthetic DOM. No auth or DB writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Script} from 'node:vm';
const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
const continuity=read('./form-auth-continuity.js');
const guidance=read('./form-role-gate-guidance.js');
const html=read('./form-runner.html');
new Script(continuity,{filename:'form-auth-continuity.js'});
new Script(guidance,{filename:'form-role-gate-guidance.js'});
assert.match(html,/form-auth-continuity\.js\?v=/);
assert.match(html,/form-role-gate-guidance\.js\?v=/);
function authScenario(reason){
  const text={textContent:reason};
  const returnHref='./?returnTask=synthetic-review&returnView=tasks';
  const link={
    href:returnHref,textContent:'Tilbake til oppgaven',
    getAttribute(name){return this[name]},
    setAttribute(name,value){this[name]=value}
  };
  const blocked={
    classList:{contains(name){return name==='hidden'?false:false}},
    querySelector(selector){return selector==='a.primary'?link:null}
  };
  const document={
    querySelector(selector){return selector==='#blocked'?blocked:selector==='#blockedText'?text:null},
    addEventListener(){}
  };
  const context={
    URLSearchParams,document,window:{addEventListener(){}},location:{
      pathname:'/portal/form-runner.html',search:'?key=via_roadmap&returnTask=synthetic-review',
      hash:'',replace(){}
    },
    client:{auth:{onAuthStateChange(){},getSession:async()=>({data:{session:{}}})}},
    sessionStorage:{setItem(){}},
    MutationObserver:class {observe(){}},
    setTimeout(callback){callback();}
  };
  new Script(continuity).runInNewContext(context);
  return {text:text.textContent,href:link.href,label:link.textContent,returnHref};
}
for(const error of [
  'Vi fant ikke en fullført registrering som denne rollen kan lese.',
  'Skjemaet svarte ikke innen fristen.',
  'Valgt skjema eller deltakerkontekst kunne ikke lastes med din tilgang.',
  'Du har ikke en aktiv VÍA-fagrolle for denne deltakeren.'
]){
  const result=authScenario(error);
  assert.equal(result.text,error,'Non-MFA error reason must survive');
  assert.equal(result.href,result.returnHref,'Non-MFA denial must keep exact task return');
  assert.equal(result.label,'Tilbake til oppgaven');
}
const aal1=authScenario('Versjonerte programskjema krever Authenticator og AAL2.');
assert.equal(aal1.href,'./#security','True AAL2 denial should offer security step');
assert.equal(aal1.label,'Velg sikker bekreftelse');
function roleScenario(title,message){
  const heading={textContent:title},explanation={textContent:message};
  let notes=0;
  const blocked={
    classList:{contains(){return false}},
    querySelector(selector){return selector==='h2'?heading:null},
    appendChild(){notes++}
  };
  const document={
    body:{},
    querySelector(selector){return selector==='#blocked'?blocked:selector==='#blockedText'?explanation:null},
    createElement(){return {dataset:{},innerHTML:''}}
  };
  const context={
    URLSearchParams,location:{search:'?key=via_roadmap'},document,
    grants:[{role_code:'via_owner'}],active:()=>true,ownParticipant:()=>null,
    MutationObserver:class{observe(){}},setTimeout(callback){callback()}
  };
  new Script(guidance).runInNewContext(context);
  return {title:heading.textContent,message:explanation.textContent,notes};
}
for(const [title,message] of [
  ['Innsendt skjema er ikke tilgjengelig','Vi fant ikke en fullført registrering som denne rollen kan lese.'],
  ['Skjema er låst','Valgt skjema kunne ikke lastes med din tilgang.'],
  ['Skjema er låst','Skjemaet svarte ikke innen fristen.'],
  ['Denne handlingen er ikke tilgjengelig for rollen din','Authenticator kreves for AAL2.']
]){
  const result=roleScenario(title,message);
  assert.equal(result.title,title,'Unrelated denial must keep truthful heading');
  assert.equal(result.message,message,'Unrelated denial must keep its explanation');
  assert.equal(result.notes,0,'Unrelated denial must not gain a role guidance note');
}
const legitimate=roleScenario('Denne handlingen er ikke tilgjengelig for rollen din','Denne rollen har ikke tilgang til valgt kontekst.');
assert.equal(legitimate.title,'Riktig rolle må overta dette beslutningspunktet');
assert.equal(legitimate.notes,1);
console.log('VÍA form denial recovery / task return / role guidance VM smoke PASS (not physical E2E)');
