import fs from 'node:fs';

const html=fs.readFileSync(new URL('./form-runner.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('./form-qna-guidance.js',import.meta.url),'utf8');

function ok(condition,message){if(!condition)throw new Error(message)}

ok(html.includes('id="formQnaGuidance"'),'Q&A host missing from form runner');
ok(html.includes('./form-qna-guidance.js?v=20260824a'),'Q&A guidance script missing from form runner');
for(const key of ['participant_agreement','pilot_go','ser_daily','vida_plan','pilot_evaluation'])ok(js.includes(`${key}:`),`Missing Q&A guidance for ${key}`);
ok(js.includes('GO betyr at VÍA-vurderingen kan gå videre'),'Participant agreement must explain that individual GO is not SER start');
ok(js.includes('Pilot-GO er en egen samlet operativ gate'),'Pilot-GO must remain a separate gate');
ok(js.includes('Deltakeren bruker sin separate Innsjekk'),'SER participant/staff split must remain explicit');
ok(js.includes('VIDA er én levende plan'),'VIDA must remain one living plan');
ok(js.includes('aggregert læring'),'Evaluation must remain aggregate-first');
ok(!js.includes('supabase')&&!js.includes('client.from')&&!js.includes('functions.invoke'),'Presentation-only guidance must not add backend/data writes');
ok(!js.includes('role_grants')&&!js.includes('canContext('),'Presentation-only guidance must not change role/scope logic');
console.log('form-qna-guidance smoke: OK');
