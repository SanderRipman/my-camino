import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const migration=read('../supabase/migrations/20260822014000_via_roadmap_handoff_v1.sql');
const formReview=read('./form-review.js');
const formHtml=read('./form-runner.html');
const viaHandoff=read('./app-via-handoff.js');
const taskContext=read('./app-task-workflow-context.js');
const build=read('./build-app.mjs');

// Completing the canonical VÍA roadmap closes the initial participant account-start task,
// but does not change participant stage or make a formal GO/NO-GO decision.
assert(migration.includes("k = 'via_roadmap'"),'Migration must handle via_roadmap submission');
assert(migration.includes("workflow_key = 'participant_via_start'"),'Roadmap completion must close the initial participant VÍA task');
assert(migration.includes("status = 'DONE'"),'Initial participant VÍA task must be closed as done');
assert(migration.includes("'PARTICIPANT_VIA_ROADMAP_COMPLETED'"),'Roadmap completion must be auditable in workflow events');
assert(migration.includes("'formal_go_no_go', false"),'Roadmap completion must explicitly remain separate from formal GO/NO-GO');
assert(migration.includes("'via_go_review'"),'Existing staff review handoff must remain');
assert(migration.includes("'VÍA – vurder veikart før GO/NO-GO'"),'Staff review wording must preserve decision order');

// Submitted versions are readable without reopening them for editing.
assert(formHtml.includes('form-review.js'),'Canonical form runner must load read-only review behavior');
assert(formReview.includes("row.status==='SUBMITTED'"),'Only completed submissions need the read-only review CTA');
assert(formReview.includes('Se fullført'),'Submission history must expose a clear review action');
assert(formReview.includes('Fullført · skrivebeskyttet'),'Review surface must explain immutability');
assert(formReview.includes('Formell beslutning tas i riktig senere beslutningspunkt'),'Review must not imply that the roadmap itself is the decision');
assert(formReview.includes("params.get('latest')==='1'"),'Staff task deep-link must support opening the latest completed roadmap');
assert(formReview.includes('Du trenger ikke «godkjenne deg selv»'),'Participant must be told that staff owns the later formal decision');

// Workflow metadata must actually be present in the browser task model before handoff routing.
assert(taskContext.includes("select('id,workflow_key,source_type,source_id')"),'Task workflow context must be rehydrated read-only');
assert(taskContext.includes("client.from('tasks')")&&!taskContext.includes('.update(')&&!taskContext.includes('.insert('),'Task context layer must remain read-only');
assert(build.includes("app-task-workflow-context.js")&&build.includes("+taskWorkflowContext+'\\n'"),'Task workflow context must be included in production bundle');

// Staff review task leads to the actual submitted roadmap and then explicitly onward to the
// separate individual decision gate. A later optional new VÍA review routes back to the same
// canonical roadmap rather than a parallel flow.
assert(viaHandoff.includes("task.workflow_key==='via_roadmap_review'")||viaHandoff.includes("task.title==='VÍA – vurder veikart før GO/NO-GO'"),'Initial VÍA review must remain narrowly routed');
assert(viaHandoff.includes("task.workflow_key==='new_via_review'"),'Optional new VÍA staff task must have an explicit handoff');
assert(viaHandoff.includes('key=via_roadmap')&&viaHandoff.includes('latest=1'),'Initial staff review task must deep-link to latest completed roadmap');
assert(viaHandoff.includes('data-via-go-gate')&&viaHandoff.includes('key=individual_go_no_go'),'Staff review must expose the next separate individual GO/NO-GO gate');
assert(viaHandoff.includes('veikartet er ikke selve beslutningen'),'Review-to-decision copy must preserve the decision boundary');
assert(viaHandoff.includes('Åpne nytt VÍA-veikart'),'New VÍA review must route to the canonical roadmap in editable/new context');
assert(viaHandoff.includes('Kontroller ansvar / VIDA-eier'),'Staff must have a direct owner/VIDA check from review');
assert(viaHandoff.includes('ikke et automatisk fjerde steg'),'New VÍA handoff must preserve the three-step concept');
assert(build.includes("app-via-handoff.js")&&build.includes("+viaHandoff+'\\n'"),'VÍA handoff layer must be part of the production app bundle');

console.log('VÍA roadmap, review→decision and new-VÍA handoff invariants passed');
