import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const html=read('./onboarding.html'),js=read('./onboarding.js'),css=read('./onboarding.css');
const readHtml=read('./onboarding-read.html'),readJs=read('./onboarding-read.js'),content=read('./onboarding-read-content.js');
for(const [name,code] of [['onboarding',js],['reader',readJs],['reference',content]])new vm.Script(code,{filename:name+'.js'});
assert.match(js,/Les og bekreft her/);
assert.match(js,/Les innholdet på nytt/);
assert.match(js,/onboarding-read\.html\?item=/);
assert.doesNotMatch(js,/data-complete|Marker ferdig|function completeItem/,'No click-only completion');
assert.match(js,/location\.hash\.slice\(1\)/,'Return to original row');
assert.match(html,/onboarding\.js\?v=20261123j/,'Cache busted introduction');
assert.match(readHtml,/onboarding-read-content\.js/);
assert.match(readHtml,/onboarding-read\.js/);
assert.match(readHtml,/id="readChecked"/);
assert.match(readHtml,/Tilbake til samme punkt/);
assert.match(readHtml,/Dette er ikke et GO\/NO-GO-skjema/);
assert.match(readJs,/getAuthenticatorAssuranceLevel/);
assert.match(readJs,/currentLevel!=='aal2'/);
assert.match(readJs,/action:'LIST'/);
assert.match(readJs,/\.find\(x=>x\.id===itemId\)/,'Only LIST-authorized item may be opened');
assert.match(readJs,/action:'COMPLETE',itemId:item\.id,confirmed:true/);
assert.match(readJs,/data\?\.item\?\.status!=='DONE'/,'Verify successful server save');
assert.match(readJs,/!\$\('#readChecked'\)\.checked/,'Explicit acknowledgement required');
assert.match(readJs,/onboarding\.html#item-/,'Return to exact source row');
assert.doesNotMatch(readJs,/form-runner\.html\?key=/,'Reading must not create a form draft');
assert.equal(content.includes('sharepoint.com')||content.includes('sourcedoc='),false,'No direct internal SharePoint source URLs');
assert.ok(readHtml.includes('knowledge-registry.js'),'Shared catalog loads for onboarding');
assert.match(readJs,/aidme:knowledge:return:v1/,'Safe same-tab return context for internal reading');
assert.match(css,/\.read-confirm/);
const context={window:{}};
vm.runInNewContext(read('./knowledge-registry.js'),context,{filename:'knowledge-registry.js'});
vm.runInNewContext(content,context,{filename:'onboarding-read-content.js'});
const ref=context.window.AIDME_ONBOARDING_REFERENCE;
assert.ok(ref&&typeof ref.resolve==='function');
const matrix={
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
let total=0;
for(const [role,keys] of Object.entries(matrix)){
 for(const key of keys){
  const v=ref.resolve({template_key:key,role_code:role,title_no:key});
  assert.ok(v,role+' '+key+' missing');
  assert.ok(v.points.length>=3,role+' '+key+' lacks practical instruction');
  assert.ok(v.sourceDetails.length>=1,role+' '+key+' lacks canonically mapped source');
  assert.ok(v.sourceDetails.every(x=>/^\.\/knowledge\.html\?topic=/.test(x.url)),role+' '+key+' must link only into portal');
  total++;
 }
}
assert.equal(ref.resolve({role_code:'unknown',template_key:'role_intro'}),null);
assert.equal(ref.resolve({role_code:'clinical_professional',template_key:'unknown'}),null);
console.log('UAT 4J PASS: role reading syntax, AAL2/scope/return/confirmation and '+total+' role-step source maps, no auto-form or auto-GO.');
