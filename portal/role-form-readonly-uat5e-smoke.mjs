import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=f=>readFileSync(new URL(f,import.meta.url),'utf8');
const runner=source('./form-runner.js');
const registry=source('./knowledge-registry.js');
const js={window:{}};
vm.runInNewContext(registry,js);
const forms=js.window.AIDME_KNOWLEDGE.formKeys;
function valueOf(pattern,label){
 const m=runner.match(pattern);
 assert.ok(m,'Missing existing form-runner '+label+' contract');
 return vm.runInNewContext('('+m[1]+')');
}
const roles=valueOf(/const ROLE_KEYS=(\{[\s\S]*?\});/,'ROLE_KEYS');
const participant=valueOf(/const PARTICIPANT_KEYS=(\[[^\n]+\]);/,'PARTICIPANT_KEYS');
const pilot=valueOf(/const PILOT_LEVEL_KEYS=new Set\((\[[^\n]+\])\);/,'PILOT_LEVEL_KEYS');
const required=valueOf(/const PARTICIPANT_REQUIRED_KEYS=new Set\((\[[^\n]+\])\);/,'PARTICIPANT_REQUIRED_KEYS');
const known=new Set(forms);
assert.equal(known.size,11,'Exactly 11 active forms expected in UAT 5A baseline');
for(const [role,keys] of Object.entries(roles)){
 assert.ok(!['system_admin','observer','evaluator','break_glass'].includes(role),role+' must not be treated as form editing role');
 for(const key of keys)assert.ok(known.has(key),role+' maps to unknown form '+key);
}
for(const key of [...participant,...pilot,...required])assert.ok(known.has(key),'Unknown form key '+key);
assert.ok(roles.via_owner.includes('individual_go_no_go'));
assert.ok(roles.clinical_professional.includes('individual_go_no_go'));
assert.ok(!roles.project_owner.includes('individual_go_no_go'));
assert.ok(!roles.program_lead.includes('individual_go_no_go'));
assert.ok(!participant.includes('pilot_go'));
assert.ok(!participant.includes('individual_go_no_go'));
assert.ok(roles.ser_lead.includes('incident'));
assert.ok(roles.vida_owner.includes('vida_plan'));
assert.ok(!roles.system_admin,'No system_admin override in form runner');
const usable=new Set([...Object.values(roles).flat(),...participant]);
const disconnected=[...forms].filter(x=>!usable.has(x));
assert.deepEqual(disconnected,['vida_transition_prep'],'Known UAT 5E gap: unused VIDA transition is not silently declared operational');
assert.ok(required.includes('ser_daily'),'Known UAT 5E modeling gap: SER teamlog is still incorrectly participant-required');
assert.ok(pilot.includes('pilot_go'),'Shared group decision must remain group-scoped');
const data={
 activeFormCount:forms.length,
 uiRoles:Object.fromEntries(Object.entries(roles).map(([r,keys])=>[r,keys.length])),
 explicitParticipantForms:participant,
 knownDisconnected:disconnected,
 needsTeamDailyModel:['ser_daily'],
 proof:'static UI contracts only. NOT Supabase RLS, effective authorization, or authenticated negative test'
};
console.log('UAT 5E READ-ONLY ADVISORY PASS: '+JSON.stringify(data));
