import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectTasksRead } from './audit-tasks-read-policy.mjs';
const live = `((assignee_user_id = ( SELECT auth.uid() AS uid)) OR ((participant_id IS NOT NULL) AND (audience = ANY (ARRAY['PARTICIPANT'::text, 'BOTH'::text])) AND aidme_private.is_own_participant(participant_id)) OR aidme_private.has_capability(organization_id, participant_id, pilot_id, 'manage_tasks'::text) OR (aidme_private.has_capability(organization_id, participant_id, pilot_id, 'manage_ser_tasks'::text)))`;
test('2026-11-23 live policy flags independent assignee and generic manage_tasks arms', () => {
 const findings=inspectTasksRead(live);
 assert.equal(findings.length,2);
 assert.match(findings[0],/ASSIGNEE_OR_ARM/);
 assert.match(findings[1],/MANAGE_TASKS_OR_ARM/);
});
test('missing policy input fails closed',()=>assert.throws(()=>inspectTasksRead(''),/Missing/));
test('participant self-only expression does not trigger staff findings',()=>assert.deepEqual(inspectTasksRead('aidme_private.is_own_participant(participant_id)'),[]));
