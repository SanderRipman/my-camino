import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const html=read('./form-runner.html');
const review=read('./form-review.js');
const vida=read('./form-vida-plan.js');
const revisionUi=read('./vida-plan-revision-ui.js');
const reviewCss=read('./form-review.css');
const command=read('../supabase/functions/form-command/index.ts');
const cases=read('../supabase/functions/case-command/index.ts');
const canonicalOwner=read('../supabase/migrations/20260905184000_canonical_vida_plan_owner_v1.sql');
const revisionTaskDedupe=read('../supabase/migrations/20260906133500_vida_plan_revision_task_dedupe_v1.sql');

assert(html.includes('form-vida-plan.js'),'VIDA form context layer must be loaded');
assert(html.includes('vida-plan-revision-ui.js?v=20260906a'),'VIDA revision semantics layer must be loaded');
assert(!html.includes('<strong>Beta:</strong>'),'Production form runner must not show the old beta banner');
assert(vida.includes("action:'GET_VIDA_OWNER'"),'VIDA plan must request canonical owner context');
assert(vida.includes('input.readOnly=true'),'Canonical VIDA owner must not remain free text');
assert(vida.includes('Forhåndsdefinert fra Ansvar / eiere'),'Owner field must explain where responsibility is managed');
assert(cases.includes("'GET_VIDA_OWNER'"),'Case command must expose narrow canonical VIDA owner context');
assert(cases.includes("['edit_vida','manage_program','edit_via']"),'VIDA owner context must be available to the responsible role without granting VÍA case access');
assert(cases.includes('ownParticipant'),'Own participant may see their assigned VIDA owner, not the full eligible staff list');
assert(canonicalOwner.includes('canonicalize_vida_plan_owner'),'Database must canonicalize VIDA owner before payload validation');
assert(canonicalOwner.includes("rg.role_code = 'vida_owner'"),'Canonical owner must still hold an active VIDA-owner role');
assert(canonicalOwner.includes("'{vida_owner}'")&&canonicalOwner.includes('to_jsonb(owner_name)'),'Persisted owner label must come from canonical staff responsibility');
assert(command.includes("userClient.from('form_submissions')"),'Form writes must still use caller JWT / RLS');
assert(!command.includes('SUPABASE_SECRET_KEYS'),'Form command must not bypass RLS with service credentials');
assert(review.includes('submission-review-focused'),'Completed review must hide the blank editable form in focused mode');
assert(review.includes('Oppdater levende plan'),'Completed VIDA plan must expose an explicit update action');
assert(review.includes('samme levende VIDA-plan')||review.includes('samme levende planen'),'VIDA revisions must remain one logical plan');
assert(review.includes('Planens historikk'),'History must be secondary and labeled as plan history');
assert(review.includes("currentDef?.key==='vida_plan'&&!currentDraft"),'Existing completed VIDA plan must open directly instead of showing a blank new form');
assert(review.includes('currentDraft=null')&&review.includes('restorePayload(payload'),'Updating the plan must create a new immutable revision from the last saved payload');
assert(revisionUi.includes("currentDef?.key!=='vida_plan'"),'Plan revision presentation must be VIDA-only');
assert(revisionUi.includes('Planversjon'),'VIDA header must distinguish plan revision from template revision');
assert(revisionUi.includes('Gjeldende · Plan v'),'Latest VIDA revision must be visibly marked current');
assert(revisionUi.includes('Skjemamal v'),'Technical template provenance must remain available without masquerading as plan revision');
assert(revisionUi.includes("q.get('returnTask')")&&revisionUi.includes('stopImmediatePropagation')&&revisionUi.includes('location.assign(href)'),'Task-origin VIDA review close must return to the originating task context');
assert(!/\.(insert|update|upsert|delete)\s*\(/.test(revisionUi),'Revision presentation helper must remain read-only');
assert(reviewCss.includes('#closeSubmissionReview')&&reviewCss.includes('@media(max-width:420px)'),'Mobile review close action must remain contained');
for(const key of ['vida_72h','vida_14d','vida_30d','vida_90d']){
  assert(revisionTaskDedupe.includes(`t.workflow_key = '${key}'`),`VIDA revision task guard must cover ${key}`);
}
assert(revisionTaskDedupe.includes('A future explicit new VÍA')||revisionTaskDedupe.includes('future explicit new VÍA'),'Later VIDA revisions must not infer a new milestone cycle');
assert(!revisionTaskDedupe.includes("and t.status in ('OPEN','IN_PROGRESS','WAITING')"),'VIDA milestone guard must include historical DONE/CANCELLED tasks');

console.log('canonical VIDA owner + focused living-plan revision invariants passed');
