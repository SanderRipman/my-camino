// UAT 3X: static fail-closed guard for future VÍA review routing.
// This is a source contract test, NOT physical AAL2/RLS or deployed-DB proof.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const sql=fs.readFileSync(new URL('../supabase/migrations/20261123001000_via_review_seven_calendar_days_safe_routing.sql',import.meta.url),'utf8');
assert.match(sql,/CREATE OR REPLACE FUNCTION aidme_private\.form_submission_workflow\(\)/);
assert.match(sql,/UAT3X baseline changed; review manually, do not overwrite/);
const begin=sql.indexOf("if k = 'via_roadmap' then",sql.indexOf("if new.participant_id is not null and k in"));
const fallback=sql.indexOf('\n    else\n',begin);
const end=sql.indexOf('\n    end if;',fallback);
assert.ok(begin>0 && fallback>begin && end>fallback, 'VÍA branch with preserved other-form fallback');
const via=sql.slice(begin,fallback),other=sql.slice(fallback,end);
for(const clause of ["'via_owner','clinical_professional'","rp.capability = 'edit_via'","sp.active = true","rg.organization_id = new.organization_id","rg.revoked_at is null","rg.valid_until","rg.participant_id = new.participant_id","rg.pilot_id = new.pilot_id"])
 assert.ok(via.includes(clause),'Missing restricted VÍA review routing: '+clause);
assert.ok(!via.includes("'program_lead'"),'Program lead must never be fallback for sensitive VÍA review');
assert.ok(other.includes("array['via_owner','program_lead']"),'Existing non-roadmap routing must remain unchanged');
assert.match(sql,/case when k = 'via_roadmap'\s+then coalesce\(new\.submitted_at, now\(\)\) \+ interval '7 days'\s+else now\(\) \+ interval '1 day'/);
assert.match(sql,/perform aidme_private\.enqueue_workflow_task\(/); // Existing deduplicating helper stays in use.
console.log('UAT3X scoped VÍA review / 7-day SQL source-contract smoke: PASS (no DB deployed)');
