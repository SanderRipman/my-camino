import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const layer=read('./app-ser-vida.js');
const build=read('./build-app.mjs');
const participant=read('./app-participant.js');
const participantNext=read('./app-participant-next.js');
const formRunner=read('./form-runner.js');
const participantStageBoundary=read('../supabase/migrations/20260824010500_participant_form_stage_boundary_v1.sql');

assert(build.includes("app-ser-vida.js")&&build.includes("'+serVida+'"),'SER/VIDA layer must be included in deterministic portal build');
assert(layer.includes("phase==='SER'")&&layer.includes("phase==='VIDA'"),'Layer must handle SER and VIDA explicitly');
assert(layer.includes('Første SER-dag')||layer.includes('første dag'),'SER day-zero must be a first-class participant state');
assert(layer.includes('Pause, kortere etappe, transport')||layer.includes('pause, kortere etappe, transport'),'SER must preserve legitimate adaptation language');
assert(layer.includes('Én levende plan')&&layer.includes('samme VIDA-plan'),'VIDA must be framed as one living plan, not duplicate plans');
assert(layer.includes('VIDA · etter SER')&&layer.includes('første 72 timene er broen fra avsluttet SER og hjemover'),'VIDA must begin at the formal end of SER and treat the first 72 hours as the bridge home, not require physical arrival home first');
assert(layer.includes("primaryView:participantMode?'checkin':null"),'Participant SER card must route to the dedicated check-in view');
assert(layer.includes("participantMode?null:`./form-runner.html?key=ser_daily"),'Staff SER card must keep the canonical operational ser_daily log');
assert(layer.includes('Deltakerens egen korte innsjekk er et separat spor'),'Staff SER copy must distinguish participant self-report from the operational log');
assert(layer.includes('vida_plan'),'VIDA participant action must keep the canonical living-plan form');
assert(layer.includes('vida_72h')&&layer.includes('vida_14d')&&layer.includes('vida_30d')&&layer.includes('vida_90d'),'VIDA must surface the canonical 72h/14d/30d/90d follow-up rhythm');
assert(layer.includes('oppfølgingstidspunkter for den samme planen')&&layer.includes('ikke fire nye planer'),'VIDA milestones must be explicitly framed as follow-up of one plan');
assert(!layer.includes('client.from(')&&!layer.includes('functions.invoke('),'SER/VIDA presentation layer must not add backend writes or bypass commands');
assert(participant.includes("if(s==='SER')return new Set()"),'Participant SER form library must not expose staff ser_daily');
assert(participant.includes("new Set(['vida_plan'])"),'Participant VIDA form scope must remain limited to vida_plan');
assert(participantNext.includes("view:'checkin'")&&!participantNext.includes('key=ser_daily'),'Participant SER task routing must use check-in view instead of staff ser_daily');
assert(participantNext.includes('key=vida_plan'),'Participant VIDA task routing must remain present');
assert(formRunner.includes("stage==='POSTPONED'||stage==='NO_GO'||stage==='SER'"),'Direct form runner UI must deny participant form access during SER');
assert(!participantStageBoundary.includes("fd.key='ser_daily'"),'RLS participant form helper must deny direct ser_daily writes');
assert(participantStageBoundary.includes("fd.key='vida_plan' and upper(p.stage::text)='VIDA'"),'Participant VIDA plan write must remain behind formal VIDA activation rather than silently crossing the SER boundary');

console.log('SER participant/staff boundary, formal SER→VIDA bridge and VIDA living-plan invariants OK');
