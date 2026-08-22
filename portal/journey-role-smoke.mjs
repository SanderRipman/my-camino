import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const journey=read('./USER_JOURNEY.md');
const e2e=read('./END_TO_END_ROLE_JOURNEY.md');
const intakeHtml=read('./intake.html');
const intakeJs=read('./intake.js');
const participantJs=read('./app-participant.js');
const participantNextJs=read('./app-participant-next.js');
const roleMatrix=read('./ROLE_SCOPE_QA_MATRIX.md');
const qaHtml=read('./qa-role-pack.html');
const qaJs=read('./qa-role-pack.js');
const formJs=read('./form-runner.js');
const formCommandClient=read('./form-command-client.js');
const crmJs=read('./crm.js');
const publicN1=read('../public-site/current/n1-ux.js');
const qaFunction=read('../supabase/functions/qa-create-role-pack/index.ts');
const intakeFunction=read('../supabase/functions/intake-command/index.ts');
const adminCreateParticipant=read('../supabase/functions/admin-create-participant/index.ts');
const formCommand=read('../supabase/functions/form-command/index.ts');

// Public N1: exactly three stages; safety is cross-cutting, not stage 4.
assert(publicN1.includes("items[3].remove()"),'N1 must remove the fourth journey-ribbon item');
assert(publicN1.includes('Trygghet følger alle tre steg'),'N1 must present safety as a foundation across all three stages');
assert(journey.includes('Se om dette kan passe for meg'),'Journey doc must use the live N1 participant CTA');
assert(!journey.includes('uforpliktende VÍA-avklaring'),'Stale high-threshold/sales CTA must not return');
assert(journey.includes('Trygghet følger alle tre steg'),'Journey doc must keep safety outside the three-stage count');

// N1 -> N2: one interest, four outcomes, no-write QA and no direct-table fallback.
for(const text of ['Trenger avklaring','Gå videre til VÍA','Anbefal annen vei','Avslutt']){
  assert(intakeHtml.includes(text)||intakeJs.includes(text),`N2 missing outcome: ${text}`)
}
assert(intakeJs.includes("get('n2qa')==='1'"),'N2 must retain explicit synthetic QA mode');
assert(intakeHtml.includes('ingen data lagres'),'N2 must tell the tester that QA data is not persisted');
assert(intakeJs.includes("client.functions.invoke('intake-command'"),'N2 must use the authorized intake command');
assert(!intakeJs.includes("client.from('intakes')"),'N2 must not fall back to direct intake-table access');
assert(intakeFunction.includes("action==='CONVERT_TO_VIA'")&&intakeFunction.includes('manage_intakes'),'Recovered intake-command source must remain version-controlled and authorization-aware');
assert(e2e.includes('intake-command')&&e2e.includes('gjenopprettet'),'End-to-end journey must record the closed intake-command recovery item');

// Participant-first N3: same secure portal, different mental model. Internal staff labels must not leak into the participant journey.
assert(participantJs.includes('ownParticipant()'),'Participant layer must anchor to the authenticated participant journey');
assert(participantJs.includes("return new Set(['info_before_via','via_roadmap'])"),'Pre-decision VÍA participant must see clarification forms, not a premature participant agreement');
assert(participantJs.includes("if(stage==='GO'||stage==='GO_WITH_CONDITIONS')return new Set(['participant_agreement'])"),'Participant agreement must become relevant only after individual GO / conditional GO');
assert(participantJs.includes("if(stage==='POSTPONED'||stage==='NO_GO')return new Set()"),'Postponed/NO-GO paths must not expose unrelated forms');
assert(e2e.includes('| 4. Individuell beslutning')&&e2e.includes('| 5. Før SER'),'End-to-end journey must keep individual decision before agreement/readiness');
assert(participantJs.includes("$('#dayStatus')?.closest('label')")&&participantJs.includes("classList.add('hidden')"),'Participant must not be asked to set internal RAG day status');
assert(participantJs.includes("$('#showAverage')")&&participantJs.includes('analysisParticipants')&&participantJs.includes("classList.add('hidden')"),'Participant analysis must not expose staff/group comparison controls');
for(const text of ['Mine åpne steg','Viktig nå','Min fase','Din neste handling','Dine steg og skjemaer'])assert(participantJs.includes(text),`Participant-first copy missing: ${text}`);
assert(!participantJs.includes("'Kritisk'"),'Participant-first layer must not label own tasks with internal critical wording');
assert(participantJs.includes("if(isStaff())return staffRenderParticipants()"),'Staff participant workspace must remain unchanged by participant-first layer');

// N3 must end in one concrete VÍA participant action, not merely a linked account.
assert(adminCreateParticipant.includes("workflow_key:'participant_via_start'"),'Account linking must create/reuse the participant VÍA start task');
assert(adminCreateParticipant.includes("eq('workflow_key','participant_via_start')")&&adminCreateParticipant.includes("eq('assignee_user_id',targetUserId)"),'VÍA start task must be duplicate-guarded for the linked participant account');
assert(adminCreateParticipant.includes("title:'Din VÍA er klar'"),'The linked participant must receive a safe notification for the first VÍA step');
assert(participantNextJs.includes('participant_via_start')&&participantNextJs.includes('Start mitt VÍA-veikart'),'Participant task dialog must expose the VÍA roadmap as the first action');
assert(participantNextJs.includes('key=via_roadmap'),'Participant VÍA action must route to the participant-facing roadmap, not staff GO/NO-GO');
assert(participantNextJs.includes('Dette er ikke en GO/NO-GO-beslutning'),'Participant copy must separate VÍA clarification from the formal staff decision gate');
assert(participantNextJs.includes("if(isStaff())return"),'Participant next-action layer must not alter staff task-gate behavior');

// Canonical forms must be represented in the portal and holistic journey.
const formKeys=['info_before_via','interest_referral','via_roadmap','individual_go_no_go','participant_agreement','pilot_go','ser_daily','incident','vida_plan','pilot_evaluation'];
for(const key of formKeys){
  assert(formJs.includes(key),`Form runner missing canonical key: ${key}`);
  assert(e2e.includes(key),`End-to-end journey missing canonical key: ${key}`);
}

// Form writes: application path goes through a caller-JWT command while DB RLS/triggers remain authoritative.
assert(formCommandClient.includes("client.functions.invoke('form-command'"),'Form runner must route writes through form-command');
assert(formCommandClient.includes('submissionId:currentDraft?.id'),'Form command client must preserve draft identity');
assert(formCommand.includes("claims(token).aal!=='aal2'"),'Form command must require AAL2');
assert(formCommand.includes("userClient.from('form_submissions')"),'Form command must write with caller JWT so RLS/auth.uid()/audit remain active');
assert(!formCommand.includes('SUPABASE_SECRET_KEYS')&&!formCommand.includes('service_role'),'Form command must not bypass RLS with service credentials');
assert(formCommand.includes('CONTEXT_IMMUTABLE')&&formCommand.includes('SUBMISSION_IMMUTABLE'),'Form command must lock context and completed submissions');
assert(formCommand.includes("eq('submitted_by',userData.user.id)")&&formCommand.includes("eq('status','DRAFT')"),'Form command must reuse only caller-owned drafts');
assert(e2e.includes('form-command')&&e2e.includes('RLS'),'End-to-end journey must document the RLS-preserving form command');

// Role model and negative rights boundaries.
const roles=['system_admin','project_owner','program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics','observer','evaluator','break_glass'];
for(const role of roles)assert(roleMatrix.includes(role),`Role matrix missing ${role}`);
for(const rule of [
  'participant never sees another participant',
  'system_admin does not gain sensitive case content',
  'SER does not gain sensitive VÍA',
  'VIDA does not gain VÍA/incidents',
  'logistics cannot make professional participant decisions',
  'observer/evaluator do not gain individual sensitive data'
]) assert(roleMatrix.includes(rule),`Role matrix missing negative boundary: ${rule}`);

// QA role pack coverage: routine roles are synthetic; system_admin and break_glass are intentionally not duplicated.
const qaKeys=['participant','via_owner','clinical_professional','ser_lead','vida_owner','logistics','program_lead','project_owner','observer','evaluator'];
for(const key of qaKeys){
  assert(qaFunction.includes(`key:'${key}'`),`QA role pack missing ${key}`);
  assert(qaHtml.includes(key==='participant'?'Deltaker':key==='via_owner'?'VÍA-ansvarlig':key==='clinical_professional'?'relevant fagperson':key==='ser_lead'?'SER-/turleder':key==='vida_owner'?'VIDA-eier':key==='logistics'?'logistikk':key==='program_lead'?'programleder':key==='project_owner'?'prosjekteier':key==='observer'?'observatør':'evaluator')||qaJs.includes(key),`QA UI must expose coverage for ${key}`);
}
assert(!qaFunction.includes("key:'system_admin'"),'Routine QA pack must not create another full system_admin');
assert(!qaFunction.includes("key:'break_glass'"),'Routine QA pack must not create break-glass');
assert(qaHtml.includes('Systemadministrator')&&qaHtml.includes('Break-glass'),'QA lab must explain system_admin and break-glass test strategy');

// Mini CRM boundary: relationship workspace, not participant registry.
assert(crmJs.includes('crm_contacts'),'Mini CRM must use crm_contacts');
assert(!crmJs.includes("client.from('participants')"),'Mini CRM must not become a participant registry');
assert(e2e.includes('Mini CRM')&&e2e.includes('parallelt deltakerregister'),'End-to-end journey must document CRM boundary');

console.log('Holistic journey/role QA invariants passed');
