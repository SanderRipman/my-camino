// UAT 3Y – source-contract and denial semantics, NOT physical AAL2 or RLS proof.
import fs from 'node:fs';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const fast=read('./form-runner-task-fastpath.js');
const review=read('./form-review.js');
const html=read('./form-runner.html');
new Script(fast,{filename:'form-runner-task-fastpath.js'});
new Script(review,{filename:'form-review.js'});
assert.ok(fast.includes("requestedKey==='via_roadmap'&&q.get('latest')==='1'&&!!requestedParticipant"));
assert.ok(fast.includes("client.from('participants').select('id,organization_id,code_name,stage,active').eq('id',requestedParticipant).eq('active',true).maybeSingle()"));
assert.ok(fast.includes('const ctx=scopedViaReadOnly?{participant:ctxRes?.data||null,pilot:null}:ctxRes?.data'));
assert.ok(fast.includes("g.organization_id===ctx.participant.organization_id"));
assert.ok(fast.includes("g.participant_id===requestedParticipant"));
assert.ok(fast.includes("['via_owner','clinical_professional'].includes(g.role_code)"));
assert.ok(fast.includes("retryFormRead(()=>client.from('role_grants')"));
for(const table of ['form_definitions','form_versions','pilot_participants','participants'])
 assert.ok(fast.includes("retryFormRead(()=>client.from('"+table+"')"),'Missing transient 401 retry: '+table);
assert.ok(fast.includes("document.querySelector('.runner-card')?.classList.add('hidden')"));
assert.ok(fast.includes("document.querySelector('#saveDraft')?.setAttribute('disabled','')"));
assert.ok(fast.includes("document.querySelector('#dynamicForm button[type=\"submit\"]')?.setAttribute('disabled','')"));
assert.ok(fast.includes("client.functions.invoke('case-command'"),'Original non-review staff LIST_CONTEXT path must remain');
assert.ok(!fast.includes("client.from('form_submissions')"),'Reviewer bootstrap must not fetch sensitive payload or bypass existing form review');
assert.ok(!/from\('role_grants'\)\.insert|from\('tasks'\)\.update/.test(fast),'Staff read-only boot cannot transfer tasks or change grants');
assert.ok(review.includes('denyMissingSubmittedReview()'));
assert.ok(review.includes('if(!reviewRows.length){if(denyMissingSubmittedReview())return'));
assert.ok(review.includes('else if(!denyMissingSubmittedReview())setFocusedReview(false)'));
// The read-only route must fail closed if a submission is missing or not RLS-visible.
function simulate(search){
 const title={textContent:'Skjema er låst'},paragraph={textContent:''};
 let called=0,callQ=null;
 const env={URLSearchParams,location:{search},
   document:{querySelector:s=>s==='#blocked'?{querySelector:()=>title}:s==='#blockedText'?paragraph:null},
   blockUnavailableRequestedContext:q=>{called++;callQ=q.toString()}
 };
 const a=review.indexOf('function denyMissingSubmittedReview(){');
 const b=review.indexOf('async function enhanceSubmissionHistory(){',a);
 assert.ok(a>0&&b>a);
 new Script(review.slice(a,b)+'\nthis.deny=denyMissingSubmittedReview;').runInNewContext(env);
 return {denied:env.deny(),called,callQ,title:title.textContent,message:paragraph.textContent};
}
const absent=simulate('?key=via_roadmap&participant=synthetic');
assert.equal(absent.denied,false);
const latest=simulate('?key=via_roadmap&participant=synthetic&latest=1&returnTask=synthetic-task');
assert.equal(latest.denied,true);assert.equal(latest.called,1);
assert.match(latest.message,/Ingen data er endret/);
assert.match(latest.callQ,/returnTask=synthetic-task/);
const requested=simulate('?key=via_roadmap&participant=synthetic&submission=one');
assert.equal(requested.denied,true);
assert.ok(html.indexOf('setTimeout(()=>{')<html.indexOf('cdn.jsdelivr.net/npm/@supabase/supabase-js@2'),'Dependency watchdog must begin before CDN can block the parser');
assert.ok(html.includes('Skjemaet kunne ikke åpnes')&&html.includes("actions.dataset.formRescue='1'"));
assert.ok(html.includes('form-entry-guard.js?v=20260925a'),'Original entry guard must remain');
console.log('UAT3Y scoped staff VÍA form boot, read-only fail-closed, and CDN rescue source checks PASS');
