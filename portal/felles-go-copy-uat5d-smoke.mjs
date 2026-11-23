import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const get=name=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
const registry=get('knowledge-registry.js');
const know=get('knowledge.js');
const optionCode=get('form-option-labels-nb.js');
const onboard=get('onboarding-read-content.js');
const qna=get('form-qna-guidance.js');
const catalog=get('app-knowledge-catalog.js');
for(const [name,code] of Object.entries({registry,know,optionCode,onboard,qna,catalog}))new vm.Script(code,{filename:name+'.js'});
const context={window:{}};
vm.runInNewContext(registry,context);
const K=context.window.AIDME_KNOWLEDGE;
assert.equal(K.formKeys.length,11);
assert.match(K.getForm('pilot_go').title,/Felles-GO/);
assert.match(K.getForm('pilot_evaluation').title,/Felles evaluering/);
assert.match(K.getForm('individual_go_no_go').next,/Felles-GO/);
assert.equal(K.getForm('felles_go'),null,'Never rename persisted form key');
assert.equal(K.getForm('pilot_go').key,'pilot_go','Preserve stable backend ID');
assert.doesNotMatch(onboard,/Pilot-GO/,'Employee source text should say Felles-GO');
assert.doesNotMatch(qna,/Pilot-GO/,'Form Q&A should say Felles-GO');
assert.match(qna,/ikke en avstemning blant deltakerne/);
assert.match(catalog,/key==='pilot_go'/,'Only named key gets title rewrite');
assert.match(catalog,/key==='pilot_evaluation'/);
const map=know.match(/const PREVIEW_OPTION_NB=Object.freeze\([^\n]+\);\nconst previewOptionNb=[^\n]+;/)?.[0];
assert.ok(map,'Preview must share a simple localized display-only label mapping');
for(const [code,label] of Object.entries({
 GO:'GO',GO_WITH_CONDITIONS:'GO med vilkår',POSTPONE:'Utsett',NO_GO_NOW:'NO-GO nå',
 YES:'Ja',NO:'Nei',UNKNOWN:'Ikke avklart'
})){
 const display=vm.runInNewContext(map+'\npreviewOptionNb('+JSON.stringify(code)+')');
 assert.equal(display,label,code+' translated without changing stored value');
}
assert.match(know,/opt\.value=String\(v\);opt\.textContent=previewOptionNb\(v\)/,'Raw schema option stored intact');
assert.doesNotMatch(know,/\.insert\(|\.upsert\(|\.update\(/,'No save path in preview');
const opts=[
 {value:'pilot_go-def-id',textContent:'Pilot-GO / operativ styring'},
 {value:'pilot_evaluation-def-id',textContent:'Pilotevaluering'}
];
const formTitle={textContent:'Pilot-GO / operativ styring'};
const select={options:opts};
const decisionOptions=[
 {value:'GO',textContent:'GO'},
 {value:'GO_WITH_CONDITIONS',textContent:'GO_WITH_CONDITIONS'},
 {value:'POSTPONE',textContent:'POSTPONE'},
 {value:'NO_GO_NOW',textContent:'NO_GO_NOW'}
];
const formSections={querySelectorAll:()=>decisionOptions};
const fakeDoc={
 querySelector(sel){return {'#formSelect':select,'#formTitle':formTitle,'#formSections':formSections}[sel]||null},
 querySelectorAll(sel){return sel==='select option'?decisionOptions:[]},
 addEventListener(){}
};
vm.runInNewContext(optionCode,{document:fakeDoc,MutationObserver:class{observe(){}}});
assert.equal(formTitle.textContent,'Felles-GO / operativ styring');
assert.equal(opts[0].textContent,'Felles-GO / operativ styring');
assert.equal(opts[1].textContent,'Felles evaluering');
assert.equal(opts[0].value,'pilot_go-def-id');
assert.deepEqual(decisionOptions.map(x=>x.textContent),['GO','GO med vilkår','Utsett','NO-GO nå']);
assert.deepEqual(decisionOptions.map(x=>x.value),['GO','GO_WITH_CONDITIONS','POSTPONE','NO_GO_NOW']);
console.log('UAT 5D PASS: 11 unchanged keys, Felles-GO public copy, 7 NB preview labels, no altered code values/save paths');
