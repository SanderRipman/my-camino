import fs from 'node:fs';

const src=fs.readFileSync(new URL('./app-demo-lens.js',import.meta.url),'utf8');
const build=fs.readFileSync(new URL('./build-app.mjs',import.meta.url),'utf8');
const built=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');

function must(ok,msg){if(!ok)throw new Error(msg)}
function contains(text,msg){must(src.includes(text),msg)}

for(const label of ['Superbruker (demo)','Linjeleder (demo)','Deltaker (demo)'])contains(label,`Missing visible demo role label: ${label}`);
contains("hasRole('system_admin')",'Demo role switch must be limited to system_admin');
contains('localStorage.setItem(DEMO_LENS_KEY','Demo lens should be a local presentation preference');
contains('Visning ≠ tilgang','Must state that view does not equal access');
contains('Bruk LAB for ekte syntetisk deltaker-RLS','Participant preview must route physical access proof to LAB');
contains('./qa-role-pack.html','LAB link missing');
contains('Ingen ekstra deltakerdata hentes','Participant demo must remain data-minimised');

must(!src.includes('client.from('),'Demo lens must not query Supabase directly');
must(!src.includes('client.functions.invoke'),'Demo lens must not invoke backend functions');
must(!src.includes('accessGrants='),'Demo lens must not mutate grants');
must(!src.includes('isStaff='),'Demo lens must not replace staff authorization helper');
must(!src.includes('hasRole='),'Demo lens must not replace role authorization helper');
must(!src.includes('role_code='),'Demo lens must not write role codes');

must(build.includes("const demoLensPath=path.join(dir,'app-demo-lens.js')"),'Build must include demo lens source');
must(build.includes("'+demoLens+'"),'Build must concatenate demo lens');
must(built.includes('DEMO_LENS_KEY')&&built.includes('Superbruker (demo)'),'Built app must contain demo lens');

console.log('Demo role lens smoke: PASS');
