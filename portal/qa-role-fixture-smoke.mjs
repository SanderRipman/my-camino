import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const qaFunction=read('../supabase/functions/qa-create-role-pack/index.ts');

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

console.log('Phase-stable synthetic role fixture invariants passed');
