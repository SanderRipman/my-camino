import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(dir,'intake.html'),'utf8');
const js=fs.readFileSync(path.join(dir,'intake.js'),'utf8');
const css=fs.readFileSync(path.join(dir,'intake-n2.css'),'utf8');
const requireText=(label,haystack,needle)=>{if(!haystack.includes(needle))throw new Error(`${label}: missing ${needle}`)};

requireText('N2 heading',html,'Mottak og triage');
requireText('interest is not approval',html,'Interesse er ikke godkjenning');
requireText('qa no write banner',html,'Syretest · ingen data lagres');
requireText('account later',html,'konto senere');
requireText('N2 css',html,'intake-n2.css');
requireText('qa opt-in',js,"get('n2qa')==='1'");
requireText('authorized command only',js,"client.functions.invoke('intake-command'");
requireText('list only open intake states',js,"statuses:['NEW','TRIAGE']");
requireText('clarification outcome',js,'Trenger avklaring');
requireText('alternative path outcome',js,'Anbefal annen vei');
requireText('close outcome',js,'Avslutt');
requireText('via outcome',js,'Gå videre til VÍA');
requireText('convert command',js,"cmd('CONVERT_TO_VIA'");
requireText('terminal confirmation',js,'window.confirm');
requireText('no-write qa copy',js,'Ingen data ble lagret');
requireText('fail closed backend copy',js,'Ingen direkte databasevei brukes som reserve');
requireText('N2 to N3 handoff keeps participant context',js,"participantId:String(participant?.id||'')");
requireText('mobile target',css,'min-height:48px');
requireText('reduced motion',css,'prefers-reduced-motion');

for(const forbidden of ["client.from('intakes')",'client.from("intakes")',"client.from('participants')",'client.from("participants")']){
  if(js.includes(forbidden))throw new Error(`Direct DB write/read path forbidden in N2 intake UX: ${forbidden}`);
}
for(const forbidden of ["email:String(intake?.contact_email",'email:String(intake?.contact_email',"email:String(intake?.contact_email||'')"]){
  if(js.includes(forbidden))throw new Error('N2→N3 handoff must not put contact email in URL/query parameters.');
}
if(!js.includes("if(QA_MODE)"))throw new Error('N2 QA mode must be explicit and opt-in');
console.log('N2 intake triage invariants OK, including PII-safe N2→N3 handoff URL.');
