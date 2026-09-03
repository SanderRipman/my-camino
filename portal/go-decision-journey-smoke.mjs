import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const participant=read('./app-participant.js');
const participantNext=read('./app-participant-next.js');
const ops=read('./app-ops.js');
const staffRouting=read('./app-go-decision.js');
const runner=read('./form-runner.js');
const formCommandClient=read('./form-command-client.js');
const build=read('./build-app.mjs');
const workflow=read('../supabase/functions/workflow-command/index.ts');
const formCommand=read('../supabase/functions/form-command/index.ts');
const decisionMigration=read('../supabase/migrations/20260822023000_go_decision_participant_handoff_v1.sql');
const pilotMigration=read('../supabase/migrations/20260822024000_pilot_go_to_ser_ready_v1.sql');
const demoPilotGateMigration=read('../supabase/migrations/20260903201000_pilot_go_demo_lab_exception_v1.sql');

assert(decisionMigration.includes('INDIVIDUAL_GO_REQUIRES_PARTICIPANT_SUMMARY'),'Formal individual decision must require participant-safe communication');
assert(decisionMigration.includes("'participant_agreement_ack'"),'GO must materialise the participant agreement handoff');
assert(decisionMigration.includes("'participant_go_postponed'"),'POSTPONE must materialise a participant-safe next path');
assert(decisionMigration.includes("'participant_no_go_path'"),'NO-GO now must materialise a participant-safe next path');
assert(decisionMigration.includes("'no_go_followup'"),'NO-GO now must create a staff follow-up instead of becoming a dead end');
assert(decisionMigration.includes('PILOT_GO_REQUIRES_PARTICIPANT_AGREEMENT'),'Final Pilot-GO must require participant agreement');
assert(decisionMigration.includes('PILOT_GO_REQUIRES_AGREEMENT_TASKS_CLOSED'),'Final Pilot-GO must require agreement review/ack tasks closed');
assert(decisionMigration.includes('PILOT_GO_REQUIRES_PARTICIPANT_CONSENT'),'Linked participant must have explicit agreement consent before Pilot-GO');
assert(decisionMigration.includes('participant_text')&&decisionMigration.includes('staff_text'),'Participant-safe summary and staff conditions must remain separate data paths');

assert(demoPilotGateMigration.includes("pilot_status = 'DEMO'"),'Synthetic DEMO lab must bypass production-only participant agreement prerequisite gate');
assert(demoPilotGateMigration.includes('PILOT_GO_REQUIRES_PARTICIPANT_AGREEMENT'),'DEMO exception migration must preserve participant agreement gate for non-DEMO pilots');
assert(demoPilotGateMigration.includes('PILOT_GO_REQUIRES_AGREEMENT_TASKS_CLOSED'),'DEMO exception migration must preserve closed agreement-task gate for non-DEMO pilots');
assert(demoPilotGateMigration.includes('PILOT_GO_REQUIRES_PARTICIPANT_CONSENT'),'DEMO exception migration must preserve participant consent gate for non-DEMO pilots');
assert(formCommand.includes("'PILOT_GO_REQUIRES_PARTICIPANT_AGREEMENT'"),'Form command must surface participant-agreement Pilot-GO blocks instead of generic save failure');
assert(formCommand.includes("'PILOT_GO_REQUIRES_AGREEMENT_TASKS_CLOSED'"),'Form command must surface open agreement-task Pilot-GO blocks');
assert(formCommand.includes("'PILOT_GO_REQUIRES_PARTICIPANT_CONSENT'"),'Form command must surface missing consent Pilot-GO blocks');
assert(formCommandClient.includes('Alle aktive deltakere må ha fullført deltakeravtalen'),'Portal must explain the participant-agreement Pilot-GO prerequisite');
assert(formCommandClient.includes("if(returnTask)return{href:returnTaskHref(),label:'Tilbake til oppgaven'}"),'Completed forms must return to originating task when return context exists');
assert(formCommandClient.includes("return{href:'./',label:'Til Oversikt'}"),'Staff form completion fallback must return to Overview');

assert(pilotMigration.includes("'ser_start_ready'"),'Final Pilot-GO must create an explicit SER start handoff');
assert(pilotMigration.includes('ser_start_task_cleanup'),'SER start handoff must close when SER actually starts');

assert(workflow.includes('participantAgreementReady'),'START_SER must independently re-check participant agreement');
assert(workflow.includes("error:'PARTICIPANT_AGREEMENT_REQUIRED'"),'START_SER must fail closed when agreement is incomplete');
assert(workflow.includes('pilotGoApproved'),'START_SER must still require final Pilot-GO');
assert(workflow.includes("'GO_CONDITIONS_OPEN'"),'Conditional GO must still block SER while conditions remain open');

assert(participant.includes("if(stage==='GO')return'VÍA · avklart'"),'Participant UI must translate raw GO into a human phase label');
assert(participant.includes("if(stage==='POSTPONED')return'VÍA · utsatt'"),'Participant UI must not expose raw POSTPONED enum');
assert(participant.includes("if(stage==='NO_GO')return'VÍA · annen vei nå'"),'Participant UI must not expose raw NO_GO enum');
assert(participant.includes("if(stage==='GO'||stage==='GO_WITH_CONDITIONS')return new Set(['participant_agreement'])"),'After individual GO the participant form surface must narrow to agreement');
assert(participant.includes("if(stage==='POSTPONED'||stage==='NO_GO')return new Set()"),'Postponed/NO-GO must not expose unrelated participant forms');

assert(participantNext.includes("stage==='GO'||stage==='GO_WITH_CONDITIONS'"),'Participant next action must branch on raw GO status');
assert(participantNext.includes('participant_agreement'),'GO participant next action must route to agreement, not back to the VÍA roadmap');
assert(participantNext.includes("stage==='POSTPONED'||stage==='NO_GO'"),'Postpone/NO-GO task must remain communication rather than an automatic form gate');

assert(ops.includes("p.stage==='POSTPONED'"),'Staff must be able to reopen a postponed case for a new formal decision');
assert(ops.includes('PARTICIPANT_AGREEMENT_REQUIRED'),'Staff SER gate must explain agreement blocking condition');
assert(ops.includes('Avtale / beredskap'),'Staff GO surface must expose agreement/readiness before SER');
assert(staffRouting.includes("task.workflow_key==='via_agreement_review'"),'Agreement review task must route onward safely');
assert(staffRouting.includes("canContext('edit_via',participant.id"),'Detailed agreement review must follow the existing sensitive VÍA capability rather than generic program status access');
assert(staffRouting.includes('Åpne ansvar / avklar reviewer'),'A staff member without detailed agreement scope must get a safe owner/reviewer path instead of a broken sensitive form link');
assert(staffRouting.includes('i stedet for å utvide sensitiv tilgang som snarvei'),'Agreement review UX must explain the least-privilege boundary');
assert(runner.includes("program_lead:['interest_referral','pilot_go']"),'Program lead must not gain participant_agreement form access as a shortcut');
assert(!runner.includes("program_lead:['interest_referral','participant_agreement'"),'Do not silently widen program lead sensitive agreement access');
assert(staffRouting.includes("task.workflow_key==='ser_start_ready'"),'Pilot-GO handoff task must route to last SER control');
assert(build.includes("app-go-decision.js")&&build.includes("+goDecision+"),'GO decision extension must be part of the production bundle');

assert(!participant.includes('go_no_go_decisions'),'Participant presentation must not read the staff decision table directly');
assert(!participantNext.includes('go_no_go_decisions'),'Participant next action must not read the staff decision table directly');

console.log('GO decision → participant handoff → agreement → Pilot-GO → SER invariants OK');
