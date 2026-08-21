import fs from 'node:fs';

const js=fs.readFileSync(new URL('./app-context.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./context-drilldown.css',import.meta.url),'utf8');
const build=fs.readFileSync(new URL('./build-app.mjs',import.meta.url),'utf8');
const bundle=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');

function expect(label,condition){if(!condition)throw new Error(`Context drilldown invariant failed: ${label}`)}

for(const token of ['participant','assignee','pilot','route','stage','deadline'])expect(`resolver kind ${token}`,js.includes(`kind==='${token}'`));
for(const token of ['view_participant_core','view_case_status','view_ser','view_operational_min','manage_tasks','manage_ser_tasks'])expect(`capability ${token}`,js.includes(token));
expect('participant own-resource handling',js.includes('ownsContextParticipant'));
expect('scope-aware grants',js.includes('grant.participant_id')&&js.includes('grant.pilot_id'));
expect('locked state',js.includes("state:'locked'"));
expect('safe human next step',js.includes('Hjelp og kontakt')&&js.includes('Se ansvar / eiere'));
expect('formal gate hardening',js.includes('hardenGateLink')&&js.includes('decide_go'));
expect('no direct database mutation',!js.includes("client.from(")&&!js.includes('functions.invoke'));
expect('mobile action sheet',css.includes('@media(max-width:650px)')&&css.includes('.context-action-dialog'));
expect('touch target',css.includes('min-height:48px'));
expect('build includes resolver last',build.includes("const contextPath=path.join(dir,'app-context.js')")&&build.lastIndexOf("'+context+'")>build.lastIndexOf("'+mobile+'"));
expect('built bundle contains resolver',bundle.includes('resolveContextAction')&&bundle.includes('contextActionDialog'));

console.log('Context drilldown smoke: OK');
