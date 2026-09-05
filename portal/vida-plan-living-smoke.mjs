import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const html=read('./form-runner.html');
const review=read('./form-review.js');
const vida=read('./form-vida-plan.js');
const command=read('../supabase/functions/form-command/index.ts');
const cases=read('../supabase/functions/case-command/index.ts');
const canonicalOwner=read('../supabase/migrations/20260905184000_canonical_vida_plan_owner_v1.sql');

assert(html.includes('form-vida-plan.js'),'VIDA form context layer must be loaded');
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

console.log('canonical VIDA owner + focused living-plan revision invariants passed');
