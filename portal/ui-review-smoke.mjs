import fs from 'node:fs';

const src=fs.readFileSync(new URL('./ui-review.html',import.meta.url),'utf8');
function assert(ok,msg){if(!ok)throw new Error(msg)}

assert(src.includes("2026-09-11T23:59:59+02:00"),'UI review must remain time-limited.');
assert(!/supabase-js|createClient|client\.from|functions\.invoke|auth\./i.test(src),'UI review must remain backend- and auth-free.');
assert(src.includes('noindex,nofollow'),'UI review must not be indexed.');
for(const role of ['admin','program','ser','vida','via','participant'])assert(src.includes(`${role}:{`)||src.includes(`${role}: {`),`Missing UI-review role: ${role}`);
assert(src.includes("['SER','operational','Operativ dag']"),'SER review must include operational day inside the same shell.');
assert(src.includes('roleUrl(role,key)'),'Role navigation must remain inside the consistent review shell.');
assert(src.includes('Ingen Supabase, ingen innlogging, ingen reelle data'),'Review page must state its data-free boundary.');

console.log('Time-limited data-free UI review invariants OK');
