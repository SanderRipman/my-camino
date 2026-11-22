import fs from 'node:fs';
import vm from 'node:vm';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const qaFunction=read('../supabase/functions/qa-create-role-pack/index.ts');
const cleanupFunction=read('../supabase/functions/qa-cleanup-role-pack/index.ts');

assert(qaFunction.includes("ensureQaParticipant('QA-ROLE-VIA-01','VIA')"),'QA role pack must reset a dedicated VÍA fixture to VIA');
assert(qaFunction.includes("ensureQaParticipant('QA-ROLE-VIDA-01','VIDA')"),'QA role pack must reset a dedicated VIDA fixture to VIDA');
assert(qaFunction.includes("organization_id:org.id,code_name:code,stage,active:true"),'QA fixtures must be explicitly scoped to the AidMe VIDA organization');
assert(qaFunction.includes("participant:'QA-ROLE-VIA-01'"),'Participant/VÍA role QA must use the stable VÍA fixture');
assert(qaFunction.includes("participant:'QA-ROLE-VIDA-01'"),'VIDA role QA must use the stable VIDA fixture');
assert(!qaFunction.includes("participant:'DEMO-VIA-01'"),'Mutable DEMO-VIA-01 must never be a physical role-QA participant anchor');
assert(!qaFunction.includes("participant:'DEMO-VIDA-03'"),'Mutable DEMO-VIDA-03 must never be a physical role-QA participant anchor');
assert(qaFunction.includes("reason:'SYNTHETIC_QA_ROLE_PACK'"),'Synthetic grants must remain explicitly tagged for cleanup/audit');
assert(qaFunction.includes("claims(token) as any).aal!=='aal2'"),'QA fixture creation must remain behind AAL2');
assert(qaFunction.includes("active.includes('system_admin')"),'QA fixture creation must remain behind system_admin');
assert(qaFunction.includes("workflow_key','participant_via_start'"),'QA participant must reuse the canonical VÍA start workflow instead of a QA-only task type');
assert(qaFunction.includes("title:'Min VÍA – start her'")&&qaFunction.includes("audience:'PARTICIPANT'"),'QA participant must receive the same safe first VÍA task shape as a real linked participant');
assert(qaFunction.includes("title:'Din VÍA er klar'")&&qaFunction.includes("safe_preview:'Du har et nytt steg i AidMe VIDA.'"),'QA participant start must also exercise the safe notification surface');
assert(qaFunction.includes('participant_start_task_id'),'QA audit evidence must record the canonical participant start task id');

for(const source of [qaFunction,cleanupFunction]){
  assert(source.includes("eq('reason','SYNTHETIC_QA_ROLE_PACK')"),'QA lifecycle hygiene must be restricted to explicitly synthetic role-pack grants');
  assert(source.includes("from('role_onboarding_items').update({status:'WAIVED'"),'Inactive synthetic QA onboarding must be preserved as WAIVED history rather than left actionable');
  assert(source.includes("in('status',['OPEN','IN_PROGRESS'])"),'Only unfinished synthetic onboarding may be auto-waived');
  assert(!source.includes("from('role_onboarding_items').delete("),'QA lifecycle hygiene must never delete onboarding history');
}
assert(qaFunction.includes('waived_onboarding_count:waivedOnboarding'),'QA renewal audit must record how many stale onboarding items were waived');
assert(cleanupFunction.includes('waived_onboarding_count:waivedOnboarding'),'QA cleanup audit must record how many stale onboarding items were waived');

console.log('Phase-stable synthetic role fixture and onboarding-hygiene invariants passed');

const adminGrant=read('../supabase/functions/admin-grant-role/index.ts');
const scopeFnStart=adminGrant.indexOf('function hasActiveScopeConflict(');
const scopeFnEnd=adminGrant.indexOf('\n}',scopeFnStart)+2;
assert(scopeFnStart>=0&&scopeFnEnd>scopeFnStart,'Admin grants must be scope-aware');
const hasActiveScopeConflict=vm.runInNewContext('('+adminGrant.slice(scopeFnStart,scopeFnEnd)+')');
const now='2026-11-22T20:00:00Z',future='2026-12-07T20:00:00Z',past='2026-11-20T20:00:00Z';
const grant=(participant_id,pilot_id,extra={})=>({participant_id,pilot_id,valid_until:future,revoked_at:null,...extra});
const scenarios=[
  {rows:[grant('QA-ROLE-VIA-01',null)],participant:'MINA',pilot:null,expected:false,name:'A separate scoped VÍA QA role can be added for Mina'},
  {rows:[grant('MINA',null)],participant:'MINA',pilot:null,expected:true,name:'Exact duplicate Mina grant blocked'},
  {rows:[grant(null,null)],participant:'MINA',pilot:null,expected:true,name:'Existing global grant cannot be duplicated'},
  {rows:[grant('QA-ROLE-VIA-01',null)],participant:null,pilot:null,expected:true,name:'New broad role over existing scoped role blocked'},
  {rows:[grant('MINA','PILOT-1')],participant:'MINA',pilot:'PILOT-2',expected:false,name:'Distinct pilot-scoped roles allowed'},
  {rows:[grant('MINA',null)],participant:'MINA',pilot:'PILOT-2',expected:true,name:'Participant-wide grant covers an underlying pilot'},
  {rows:[grant('MINA',null,{valid_until:past})],participant:'MINA',pilot:null,expected:false,name:'Expired role does not block renewal'},
  {rows:[grant('MINA',null,{revoked_at:past})],participant:'MINA',pilot:null,expected:false,name:'Revoked role does not block renewal'}
];
for(const x of scenarios)assert(hasActiveScopeConflict(x.rows,x.participant,x.pilot,now)===x.expected,x.name);
assert(adminGrant.includes("error:'PARTICIPANT_SCOPE_INVALID'")&&adminGrant.includes("error:'PILOT_SCOPE_INVALID'"),'Foreign participant/pilot scopes must be rejected');
assert(adminGrant.includes("error:'SYSTEM_ADMIN_MUST_BE_UNSCOPED'"),'System-admin scope must not be narrowed/misrepresented');
assert(adminGrant.includes("error:'INVALID_EXPIRY'"),'Expired and invalid new grants must fail closed');
assert(!adminGrant.includes("select('id').eq('organization_id',org.id).eq('user_id',targetUserId).eq('role_code',roleCode)"),'Original global dedupe must be removed');
console.log('UAT 3P scope-aware grant and negative privilege tests passed');
