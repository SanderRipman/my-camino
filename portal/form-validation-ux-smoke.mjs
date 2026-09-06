import fs from 'node:fs';
function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}
const html=read('./form-runner.html');
const ux=read('./form-validation-ux.js');
assert(html.includes('form-validation-ux.js'),'Form runner must load validation UX layer');
assert(ux.includes("addEventListener('invalid'")&&ux.includes('validation-error'),'Required-field failures must be visibly marked');
assert(ux.includes('Dette feltet må fylles ut før skjemaet kan fullføres.'),'Missing required fields need direct Norwegian helper text');
assert(ux.includes('Fyll ut feltene markert med rødt før du fullfører skjemaet.'),'Form-level validation message must explain why submission is blocked');
assert(!ux.includes('supabase')&&!ux.includes('client.from('),'Validation UX must not write backend data');
console.log('Required-field validation UX invariants OK');
