import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const optionLabels=read('./form-option-labels-nb.js');
const contextLabels=read('./context-labels-nb.js');
const copyPolish=read('./form-copy-polish-nb.js');
const formHtml=read('./form-runner.html');
const ownersHtml=read('./owners.html');

assert(optionLabels.includes("GO_WITH_CONDITIONS:'GO med vilkår'")&&optionLabels.includes("POSTPONE:'Utsett'")&&optionLabels.includes("NO_GO_NOW:'NO-GO nå'"),'Norwegian UI must translate stable GO decision enums');
assert(optionLabels.includes('option.textContent!==label'),'Option label observer must be idempotent and must not self-trigger indefinitely on mobile browsers');
assert(contextLabels.includes("NEW_VIA:'Ny VÍA'")&&contextLabels.includes("GO_WITH_CONDITIONS:'VÍA · GO med vilkår'")&&contextLabels.includes("POSTPONED:'VÍA · utsatt'"),'Participant context must not expose raw stage enums in Norwegian UI');
assert(contextLabels.includes("participant_staff:'Deltaker + medarbeider'")&&contextLabels.includes("staff:'Medarbeider'")&&contextLabels.includes("pilot:'Pilot / gruppe'"),'Norwegian UI must translate raw form scope labels');
assert(contextLabels.includes('if(next!==option.textContent)')&&contextLabels.includes('if(next!==stage.textContent)')&&contextLabels.includes('if(next!==scope.textContent)'),'Stage/scope observers must only mutate visible text when it actually changes');
assert(!contextLabels.includes('client.')&&!contextLabels.includes('.from(')&&!contextLabels.includes('functions.invoke'),'Stage/scope localization must remain presentation-only');
assert(formHtml.includes('context-labels-nb.js?v=20260906a'),'Canonical form runner must load stage context localization');
assert(ownersHtml.includes('context-labels-nb.js?v=20260906a'),'Owner workspace must use the same stage context localization');
assert(formHtml.includes('form-option-labels-nb.js?v=20260906b'),'Form runner must load the mobile-safe decision-label revision');

assert(copyPolish.includes('Min VÍA-intensjon'),'VÍA sentence must be presented as a clearer working intention in Norwegian UI');
assert(copyPolish.includes('Ikke et motto eller prestasjonsmål.'),'VÍA intention help must explain that it is not a motto or performance target');
assert(copyPolish.includes('videre til VIDA som konkret handling hjemme'),'VÍA intention copy must preserve the VÍA→SER→VIDA red thread');
assert(!copyPolish.includes('client.')&&!copyPolish.includes('.from(')&&!copyPolish.includes('functions.invoke'),'Copy polish must not create a data or authorization path');
assert(formHtml.includes('form-copy-polish-nb.js?v=20260906a'),'Canonical form runner must load the presentation-only VÍA intention copy polish');

console.log('Norwegian form/stage/scope/copy runtime language invariants OK');
