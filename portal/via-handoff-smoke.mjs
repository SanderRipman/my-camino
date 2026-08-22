import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const migration=read('../supabase/migrations/20260822014000_via_roadmap_handoff_v1.sql');
const formReview=read('./form-review.js');
const formHtml=read('./form-runner.html');
const viaHandoff=read('./app-via-handoff.js');
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
assert(formReview.includes('Formell beslutning tas i riktig senere gate'),'Review must not imply that the roadmap itself is the decision');
assert(formReview.includes("params.get('latest')==='1'"),'Staff task deep-link must support opening the latest completed roadmap');
assert(formReview.includes('Du trenger ikke «godkjenne deg selv»'),'Participant must be told that staff owns the later formal decision');

// Staff review task leads to the actual submitted roadmap before the decision gate.
assert(viaHandoff.includes("task.title!=='VÍA – vurder veikart før GO/NO-GO'"),'Handoff must be limited to the VÍA roadmap review task');
assert(viaHandoff.includes('key=via_roadmap')&&viaHandoff.includes('latest=1'),'Staff review task must deep-link to latest completed roadmap');
assert(viaHandoff.includes('Kontroller ansvar / VIDA-eier'),'Staff must have a direct owner/VIDA check from review');
assert(viaHandoff.includes('Avklar mangler før du åpner den separate GO/NO-GO-gaten'),'Review must happen before formal decision');
assert(build.includes("app-via-handoff.js")&&build.includes("+viaHandoff+'\\n'"),'VÍA handoff layer must be part of the production app bundle');

console.log('VÍA roadmap handoff invariants passed');
