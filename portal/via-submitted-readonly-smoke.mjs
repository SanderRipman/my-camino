// Synthetic execution of the independent submitted VÍA viewer and early redirect.
// This is source/runtime simulation, NOT an authenticated browser or live RLS test.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const html=read('./via-submitted-readonly.html');
const source=read('./via-submitted-readonly.js');
const runner=read('./form-runner.html');
new Script(source,{filename:'via-submitted-readonly.js'});
assert.match(html,/noindex,nofollow/);
assert.match(html,/via-submitted-readonly\.js\?v=/);
assert.match(html,/Tilbake til oppgaven/);
assert.match(runner,/location\.replace\('\.\/via-submitted-readonly\.html'\+location\.search\)/);
assert.ok(runner.indexOf("location.replace('./via-submitted-readonly.html'")<runner.indexOf('cdn.jsdelivr.net'));
assert.doesNotMatch(source,/\.insert\(|\.update\(|\.upsert\(|\.delete\(|functions\.invoke\(/);
assert.match(source,/getAuthenticatorAssuranceLevel/);
assert.match(source,/currentLevel!=='aal2'/);
assert.match(source,/allowedGrant/);
assert.match(source,/form_submissions/);
assert.match(source,/eq\('status','SUBMITTED'\)/);
assert.match(source,/query\(\(\)=>db\.from\('role_grants'\)/);
assert.match(source,/version\.schema_json\?\.sections/);
assert.match(source,/setTimeout\(\(\)=>\{/);
const id='29caf6ad-e7a4-4dbd-82bc-138d28300396';
const task='e29136cd-b4f7-4984-bd20-cd54c72e4a35';
const formVersion='80706bd4-aaac-4564-9852-4c688c78a54a';
const originSearch='?key=via_roadmap&participant='+id+'&latest=1&returnTask='+task+'&returnView=tasks';
const redirectStart=runner.indexOf('/* Targeted staff submitted VÍA review');
const redirectEnd=runner.indexOf('</script>',redirectStart);
const redirectScript=runner.slice(runner.lastIndexOf('<script>',redirectStart)+'<script>'.length,redirectEnd);
for(const [query,expected] of [
  [originSearch,true],
  ['?key=via_roadmap&participant='+id+'&latest=1',false],
  ['?key=individual_go_no_go&participant='+id+'&latest=1&returnTask='+task,false],
  ['?key=via_roadmap&participant='+id+'&returnTask='+task,false]
]){
  let target=null;
  new Script(redirectScript).runInNewContext({URLSearchParams,location:{search:query,replace:v=>{target=v}}});
  assert.equal(Boolean(target),expected,'Redirect only explicit staff submitted review');
  if(target)assert.equal(target,'./via-submitted-readonly.html'+originSearch);
}
function node(){
  return {
    className:'',textContent:'',hidden:false,href:'',dataset:{},children:[],
    append(...children){this.children.push(...children)},
    replaceChildren(...children){this.children=children},
    setAttribute(name,value){this[name]=value}
  };
}
async function scenario({aal2=true,grant=true,submitted=true,visible=true}={}){
  const elements=Object.fromEntries(['viaStatus','viaSecurity','viaReview','viaBackTop','viaBackBottom'].map(x=>[x,node()]));
  elements.viaStatus.dataset.state='loading';
  const main=node(), reads=[], records={
    participants:visible?[{id,organization_id:'org',code_name:'Mina-UAT-01',active:true}]:[],
    role_grants:grant?[{user_id:'synthetic-staff',organization_id:'org',role_code:'via_owner',participant_id:id,pilot_id:null,valid_from:null,valid_until:null,revoked_at:null}]:[],
    form_definitions:[{id:'definition',key:'via_roadmap',title_no:'VÍA-veikart'}],
    form_versions:[{id:formVersion,form_definition_id:'definition',version:2,schema_json:{sections:[{title:'Retning',fields:[{key:'direction',label:'Min retning'}]}]}}],
    form_submissions:submitted?[{id:'submission',participant_id:id,form_version_id:formVersion,status:'SUBMITTED',submitted_at:'2026-11-22T16:16:10Z',payload:{direction:'Syntetisk svar'}}]:[]
  };
  const client={
    auth:{
      getSession:async()=>({data:{session:{user:{id:'synthetic-staff'}}}}),
      mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:aal2?'aal2':'aal1'}})}
    },
    from(table){
      reads.push(table);
      let rows=(records[table]||[]).slice();
      const q={
        select(){return this},
        eq(k,v){rows=rows.filter(row=>row[k]===v);return this},
        in(k,vals){rows=rows.filter(row=>vals.includes(row[k]));return this},
        order(){return this},
        limit(n){rows=rows.slice(0,n);return this},
        maybeSingle(){return Promise.resolve({status:200,data:rows[0]||null,error:null})},
        then(resolve,reject){return Promise.resolve({status:200,data:rows,error:null}).then(resolve,reject)}
      };
      return q;
    }
  };
  const document={
    querySelector(sel){return sel==='.via-view'?main:null},
    getElementById(name){return elements[name]},
    createElement(){return node()}
  };
  const env={
    location:{search:originSearch},document,window:{supabase:{createClient:()=>client}},
    URLSearchParams,Date,Promise,Intl,Math,
    setTimeout(){return 1},clearTimeout(){},
  };
  new Script(source).runInNewContext(env);
  for(let i=0;i<100&&elements.viaStatus.dataset.state==='loading';i++){
    await new Promise(resolve=>setImmediate(resolve));
  }
  return {elements,main,reads};
}
let r=await scenario();
assert.equal(r.elements.viaStatus.dataset.state,'ready');
assert.equal(r.elements.viaReview.hidden,false);
assert.equal(r.main['aria-busy'],'false');
assert.match(JSON.stringify(r.elements.viaReview),/Syntetisk svar/);
assert.equal(r.elements.viaBackBottom.href,'./?returnTask='+task+'&returnView=tasks');
assert.deepEqual(r.reads,['participants','role_grants','form_definitions','form_versions','form_submissions']);
r=await scenario({aal2:false});
assert.equal(r.elements.viaStatus.dataset.state,'error');
assert.equal(r.elements.viaReview.hidden,true);
assert.deepEqual(r.reads,[]);
assert.equal(r.elements.viaSecurity.children[0].href,'./#security');
r=await scenario({grant:false});
assert.equal(r.elements.viaStatus.dataset.state,'error');
assert.match(r.elements.viaStatus.textContent,/VÍA-fagrolle/);
assert.ok(!r.reads.includes('form_submissions'),'No payload query without a competent active scoped grant');
r=await scenario({submitted:false});
assert.equal(r.elements.viaStatus.dataset.state,'error');
assert.match(r.elements.viaStatus.textContent,/Ingen fullført VÍA/);
assert.equal(r.elements.viaReview.hidden,true);
r=await scenario({visible:false});
assert.equal(r.elements.viaStatus.dataset.state,'error');
assert.ok(!r.reads.includes('form_submissions'));
console.log('VÍA isolated read-only viewer: redirect, mock positive, AAL1, missing role/scope/submitted, no writes PASS; physical AAL2 still required');
