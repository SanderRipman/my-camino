// #243 security contract: an administrator can preview handover blockers,
// never move tasks, duplicate forms, read VÍA payloads, or revoke grants here.
// Static CI guard only; actual AAL2 and cross-org tests remain required.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../supabase/functions/task-command/index.ts',import.meta.url),'utf8');
const b=source.indexOf("if(action==='PREVIEW_STAFF_HANDOVER')");
const e=source.indexOf('// Administrative handoff by participant',b);
assert.ok(b>0&&e>b,'Read-only preflight before existing Mina-specific transfer');
const code=source.slice(b,e);
for(const check of [
 'organizationId','sourceUserId','targetUserId','sourceUserId===targetUserId',
 ".eq('organization_id',orgId).eq('role_code','system_admin')",
 ".is('participant_id',null).is('pilot_id',null)",
 ".eq('organization_id',orgId).eq('assignee_user_id',sourceUserId)",
 "['OPEN','IN_PROGRESS','WAITING']",
 'HANDOVER_BATCH_TOO_LARGE','edit_via','edit_vida','manage_ser_tasks',
 'permissionSet.has','TARGET_MISSING_CURRENT_SCOPED_CAPABILITY',
 'expected_updated_at','roleTransferPerformed:false',
 'taskTransferPerformed:false','oldAccessRevoked:false'
])assert.ok(code.includes(check),'Missing JML security invariant: '+check);
for(const dangerous of [".from('form_submissions')",".from('go_no_go_decisions')",
 '.update(','.insert(','.delete(','.upsert(','.rpc(','.functions.invoke(',
 'payload','description','title','secret'])
 assert.ok(!code.includes(dangerous),'Preflight must never read/write protected data: '+dangerous);
assert.match(source,/if\(decodeClaims\(token\)\.aal!=='aal2'\)/);
assert.match(source,/userClient\.auth\.getUser\(token\)/);
assert.match(source,/if\(action==='REASSIGN_VIA_REVIEW'/);
console.log('JML AAL2 admin-only, no-write, role/scope/capability preview contract: PASS (physical QA pending)');
