import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const js=read('./inbox.js');
const html=read('./inbox.html');

assert(js.includes("client.storage.from('personal-documents')"),'Inbox must use the AAL2-protected personal-documents bucket.');
assert(js.includes("category:'OTHER'")&&!js.includes("category:'INBOX'"),'Inbox metadata must use an allowed canonical document category.');
assert(js.includes("sensitivity:'NORMAL'")&&!js.includes("sensitivity:'INTERNAL'"),'Inbox metadata must use the current compatible sensitivity value.');
assert(js.includes('owner_user_id:session.user.id'),'Document metadata must remain bound to the signed-in owner.');
assert(js.includes('const path=`${session.user.id}/'),'Storage paths must remain namespaced under the signed-in owner UUID.');
assert(js.includes("if(!aal2)")&&js.includes('Filåpning og opplasting krever AAL2'),'Private file open/upload must remain explicitly AAL2-gated in the UI.');
assert(js.includes(".from('notifications').update({read_at:new Date().toISOString()})"),'Notification read-state must update only through the caller-RLS table path.');
assert(html.includes('<strong>Early-UAT:</strong>')&&html.includes('Direkte deling til andre brukere åpnes først'),'User-to-user sharing must stay explicitly HOLD in demo.');
assert(!/service_role|secret[_-]?key/i.test(js),'Inbox client must never contain a service/secret key.');

console.log('Demo inbox schema/owner-boundary invariants: PASS');
