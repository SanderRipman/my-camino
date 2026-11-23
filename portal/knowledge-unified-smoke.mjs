import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const paths=[
 'knowledge-registry.js','knowledge.js','form-knowledge-link.js',
 'app-knowledge-catalog.js','onboarding-read-content.js','onboarding-read.js'
];
for(const f of paths)new vm.Script(read('./'+f),{filename:f});
const context={window:{}};
vm.runInNewContext(read('./knowledge-registry.js'),context);
const K=context.window.AIDME_KNOWLEDGE;
assert.ok(K,'Shared portal catalog missing');
const expected=[
 'info_before_via','interest_referral','via_roadmap','individual_go_no_go',
 'participant_agreement','pilot_go','ser_daily','incident','vida_transition_prep',
 'vida_plan','pilot_evaluation'
];
assert.equal(K.formKeys.length,11,'Exactly the 11 active Supabase form types');
assert.deepEqual([...K.formKeys].sort(),expected.sort());
assert.ok(K.topicKeys.length>=10);
for(const key of expected){
 const f=K.getForm(key),topic=K.topicForForm(key);
 assert.ok(f&&f.title&&f.why&&f.who&&f.when&&f.next&&f.repeat);
 assert.ok(f.points.length>=2, key+' should explain real work');
 assert.ok(topic&&topic.points.length>=2, key+' must map to a shared source');
 assert.equal(K.hrefForForm(key),'./knowledge.html?form='+encodeURIComponent(key));
}
assert.equal(K.getForm('__proto__'),null);
assert.equal(K.getTopic('constructor'),null);
assert.equal(K.hrefForForm('http://bad'),null);
const readContext={window:{AIDME_KNOWLEDGE:K}};
vm.runInNewContext(read('./onboarding-read-content.js'),readContext);
const source=readContext.window.AIDME_ONBOARDING_REFERENCE;
const roleKinds=[
 'system_admin','project_owner','program_lead','via_owner','clinical_professional',
 'ser_lead','vida_owner','logistics','observer','evaluator','break_glass'
];
const roleTemplates={
 system_admin:['role_intro','confidentiality_minimum','admin_workspace'],
 project_owner:['role_intro','confidentiality_minimum','safety_boundaries','project_overview'],
 program_lead:['role_intro','confidentiality_minimum','safety_boundaries','program_flow'],
 via_owner:['role_intro','confidentiality_minimum','safety_boundaries','via_workspace'],
 clinical_professional:['role_intro','confidentiality_minimum','safety_boundaries','clinical_boundary'],
 ser_lead:['role_intro','confidentiality_minimum','safety_boundaries','ser_workspace'],
 vida_owner:['role_intro','confidentiality_minimum','safety_boundaries','vida_workspace'],
 logistics:['role_intro','confidentiality_minimum','safety_boundaries','logistics_workspace'],
 observer:['role_intro','confidentiality_minimum','observer_boundary'],
 evaluator:['role_intro','confidentiality_minimum','evaluation_boundary'],
 break_glass:['role_intro','confidentiality_minimum','safety_boundaries','break_glass_boundary']
};
let steps=0;
for(const role of roleKinds){
 for(const template_key of roleTemplates[role]){
  const item=source.resolve({role_code:role,template_key,title_no:template_key});
  assert.ok(item&&item.points.length>=3,role+' '+template_key);
  assert.ok(item.sourceDetails.length>0);
  assert.ok(item.sourceDetails.every(x=>x.url.startsWith('./knowledge.html?topic=')));
  for(const src of item.sourceDetails){
   const topic=new URL(src.url,'https://demo.aidme.no/portal/').searchParams.get('topic');
   assert.ok(K.getTopic(topic),role+' '+template_key+' unknown topic '+topic);
  }
  steps++;
 }
}
const html=read('./knowledge.html');
const onboard=read('./onboarding-read.html');
const runner=read('./form-runner.html');
const root=read('./index.html');
const guide=read('./knowledge.js');
const inline=read('./form-knowledge-link.js');
const dashboard=read('./app-knowledge-catalog.js');
const onboardJs=read('./onboarding-read.js');
const consolidated=[read('./knowledge-registry.js'),read('./onboarding-read-content.js'),onboard,html].join('\n');
assert.doesNotMatch(consolidated,/https?:\/\/[^\s'"]*sharepoint\.com|_layouts\/15\/Doc\.aspx|sourcedoc=/i,'No direct internal SharePoint document links to staff');
assert.match(onboard,/knowledge-registry\.js/);
assert.match(onboard,/Veiledningen ligger i AidMe-portalen/);
assert.match(onboardJs,/aidme:knowledge:return:v1/);
assert.match(html,/no-referrer/);
assert.match(guide,/getAuthenticatorAssuranceLevel/);
assert.match(guide,/currentLevel!=='aal2'/);
assert.match(guide,/system_admin','project_owner/,'Only verified privileged role can preview real form schema');
assert.match(guide,/role_grants/);
assert.match(guide,/form_definitions/);
assert.match(guide,/form_versions/);
assert.match(guide,/\.is\('retired_at',null\)/);
assert.match(guide,/\/portal\/form-runner\.html/,'Known same-origin back destination');
assert.doesNotMatch(guide,/form_submissions|form-command|\.upsert\(|\.insert\(|\.update\(|\.delete\(|\.functions\.invoke\(/,'Preview must not write or invoke decision endpoint');
assert.match(guide,/Fiktivt testeksempel/);
assert.match(inline,/document\.createElement\('details'\)/);
assert.match(inline,/target='_blank'/);
assert.match(inline,/noopener noreferrer/);
assert.doesNotMatch(inline,/form-command|saveThroughCommand|SUBMITTED/);
assert.match(dashboard,/data-knowledge-card-link|knowledgeCardLink/);
assert.match(dashboard,/formDefs/,'Dashboard links align with server-returned form registry');
assert.match(runner,/knowledge-registry\.js/);
assert.match(runner,/form-knowledge-link\.js/);
assert.match(root,/knowledge-registry\.js/);
assert.match(root,/app-knowledge-catalog\.js/);
assert.match(onboardJs,/onboarding-command/);
assert.match(onboardJs,/confirmed:true/);
assert.doesNotMatch(consolidated,/service_role|sb_secret_|BEGIN PRIVATE KEY/);
console.log('UAT 5A PASS:',expected.length,'operative forms,',K.topicKeys.length,'shared topics,',steps,'onboarding role steps, role-gated local preview and no internal SharePoint URL / save bypass');
