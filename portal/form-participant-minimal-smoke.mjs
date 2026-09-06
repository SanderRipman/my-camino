import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const src=read('./form-participant-minimal.js');
const html=read('./form-runner.html');

assert(src.includes("staff=isStaff()"),'Participant simplification must use the existing staff-role predicate');
assert(src.includes("document.body.classList.toggle('participant-form-minimal',!staff)"),'Participant-only presentation must not affect staff form controls');
assert(src.includes("select.options.length<=1"),'Form selector may only disappear when participant has at most one available form');
assert(src.includes('.runner-controls>label:nth-of-type(1)')&&src.includes('.runner-controls>label:nth-of-type(2)'),'Participant-only chrome must hide redundant own-participant and pilot selectors');
assert(src.includes('.runner-controls>.form-version{display:none}'),'Technical template version must not dominate participant form UI');
assert(!src.includes('client.')&&!src.includes('.from(')&&!src.includes('functions.invoke'),'Participant chrome simplification must be presentation-only');
assert(html.includes('form-participant-minimal.js?v=20260906a'),'Canonical form runner must load participant-only minimal chrome');

console.log('Participant-only minimal form chrome invariants OK');
