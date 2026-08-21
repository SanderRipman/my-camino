import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const journey=read('./USER_JOURNEY.md');
const e2e=read('./END_TO_END_ROLE_JOURNEY.md');
const intakeHtml=read('./intake.html');
const intakeJs=read('./intake.js');
const roleMatrix=read('./ROLE_SCOPE_QA_MATRIX.md');
const qaHtml=read('./qa-role-pack.html');
const qaJs=read('./qa-role-pack.js');
const formJs=read('./form-runner.js');
const crmJs=read('./crm.js');
const publicN1=read('../public-site/current/n1-ux.js');
const qaFunction=read('../supabase/functions/qa-create-role-pack/index.ts');

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
assert(e2e.includes('intake-command')&&e2e.includes('ikke funnet'),'Recoverability gap for intake-command must stay visible until closed');

// Canonical forms must be represented in the portal and holistic journey.
const formKeys=['info_before_via','interest_referral','via_roadmap','individual_go_no_go','participant_agreement','pilot_go','ser_daily','incident','vida_plan','pilot_evaluation'];
for(const key of formKeys){
  assert(formJs.includes(key),`Form runner missing canonical key: ${key}`);
  assert(e2e.includes(key),`End-to-end journey missing canonical key: ${key}`);
}

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

// Form write surface is intentionally visible as a real-data gate until backend policy is verified.
assert(formJs.includes("client.from('form_submissions')"),'Form write-surface changed; re-review the documented P0/P1 gate');
assert(e2e.includes('form_submissions')&&e2e.includes('autoriserte serverkommandoer'),'Direct form write must remain explicitly tracked as a security review item');

console.log('Holistic journey/role QA invariants passed');
