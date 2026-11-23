import test from 'node:test';
import assert from 'node:assert/strict';
import {nextAction} from './next-action-contract.mjs';
const id='e29136cd-b4f7-4984-bd20-cd54c72e4a35';
test('one authorized manual task action; no automatic phase advancement',()=>{
  for(const [role,phase] of [['participant','VIA'],['via_owner','VIA'],['ser_lead','SER'],['vida_owner','VIDA']]){
    const a=nextAction({role,phase,status:'OPEN',authorized:true,taskId:id});
    assert.equal(a.kind,'task');assert.match(a.href,/returnTask=/);
    assert.equal(Object.isFrozen(a),true);
  }
});
test('fail closed for role, scope, status, invalid route input',()=>{
  for(const data of [
    {role:'via_owner',phase:'SER',status:'OPEN',authorized:true,taskId:id},
    {role:'via_owner',phase:'VIA',status:'OPEN',authorized:false,taskId:id},
    {role:'via_owner',phase:'VIA',status:'OPEN',authorized:true,taskId:'javascript:alert(1)'},
    {role:'program_lead',phase:'VIA',status:'OPEN',authorized:true,taskId:id},
    {role:'via_owner',phase:'VIA',status:'DONE',authorized:true,taskId:id},
    {role:'via_owner',phase:'VIA',status:'OPEN',authorized:true},
  ]){const a=nextAction(data);assert.equal(a.kind,'unavailable');assert.equal(a.href,'/portal/');}
});
test('review, blocked and new VIA cycle never issue task or GO links',()=>{
  for(const phase of ['VIA','SER','VIDA']){
    for(const status of ['WAITING_REVIEW','BLOCKED']){
      const a=nextAction({role:'via_owner',phase,status,authorized:true,taskId:id});
      assert.equal(a.kind,'wait');assert.equal(a.href,'/portal/');
    }
  }
  const a=nextAction({role:'vida_owner',phase:'VIDA',status:'DONE',authorized:true,taskId:id});
  assert.equal(a.kind,'info');assert.equal(a.href,'/portal/');assert.match(a.label,/neste VÍA/);
});
