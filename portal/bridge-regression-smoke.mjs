import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const decision=read('portal/app-go-decision.js');
const ops=read('portal/app-ops.js');
const serVida=read('portal/app-ser-vida-handoff.js');
const newVia=read('portal/app-vida-new-via.js');
const css=read('portal/ux.css');
const caseCommand=read('supabase/functions/case-command/index.ts');
const migration=read('supabase/migrations/20260907082000_legacy_condition_task_reassessment_close_v1.sql');

function ok(condition,message){if(!condition)throw new Error(message)}

ok(decision.includes("task.workflow_key==='go_conditions'||task.task_type==='GO_CONDITION'"),'Canonical and legacy GO-condition tasks must share the formal reassessment bridge');
ok(decision.includes("task.task_type==='VIDA_OWNER_GATE'")&&decision.includes("./owners.html?participant="),'VIDA owner blocker must route to owner assignment');
ok(decision.includes('reviseLatest=1')&&decision.includes('returnTask='),'Condition remediation must preserve immutable reassessment and task return context');
ok(decision.includes("pilotById(task?.pilot_id)||participantPilot(participant.id)")&&decision.includes('pilot?.route_name'),'Task context must fall back to participant pilot/route when legacy task pilot_id is missing');
ok(decision.includes('isGoConditionTask(task)||isVidaOwnerGateTask(task)')&&decision.includes("done.classList.add('hidden')"),'Formal blocker tasks must not expose generic manual completion');

ok(ops.includes('async function workflowErrorCode')&&ops.includes('error?.context')&&ops.includes("response.clone"),'START_SER must recover structured Edge Function errors from non-2xx responses');
ok(ops.includes('SER kan ikke startes: navngitt VIDA-eier mangler')&&ops.includes('SER kan ikke startes: minst ett GO-vilkår er fortsatt åpent'),'START_SER must explain actionable blockers instead of a generic failure');
ok(serVida.includes('async function serVidaWorkflowErrorCode')&&serVida.includes('error?.context'),'SER→VIDA must preserve structured workflow failure reasons');
ok(newVia.includes('async function newViaWorkflowErrorCode')&&newVia.includes('error?.context'),'VIDA→new VÍA must preserve structured workflow failure reasons');

ok(css.includes('width:calc(100vw - 20px)')&&css.includes('overflow-x:hidden'),'Mobile task dialog must stay within viewport');
ok(css.includes('.task-dialog .dialog-shell')&&css.includes('min-width:0;max-width:100%'),'Task dialog children must be shrinkable instead of escaping the modal frame');

ok(caseCommand.includes("action==='SET_VIDA_OWNER'")&&caseCommand.includes(".eq('task_type','VIDA_OWNER_GATE')"),'Saving a VIDA owner must close the corresponding legacy blocker task');
ok(migration.includes("task_type = 'GO_CONDITION'")&&migration.includes('after insert on public.go_no_go_decisions'),'A new formal GO/NO-GO decision must supersede legacy GO-condition tasks');

console.log('participant bridge regression smoke: OK');