import fs from 'node:fs';
import vm from 'node:vm';

const core=fs.readFileSync(new URL('./app-core-broken.js',import.meta.url),'utf8');
const redirects=fs.readFileSync(new URL('../_redirects',import.meta.url),'utf8');
const bad="const ordered=[...open].sort((a,b)=>({RED:0,YELLOW:1,GREEN:2}[severity(a)]-({RED:0,YELLOW:1,GREEN:2}[severity(b)])||new Date(a.due_at||'2999')-new Date(b.due_at||'2999'));";
const good="const rank={RED:0,YELLOW:1,GREEN:2};const ordered=[...open].sort((a,b)=>(rank[severity(a)]-rank[severity(b)])||(new Date(a.due_at||'2999')-new Date(b.due_at||'2999')));";

if(!core.includes(bad))throw new Error('Portal core no longer matches the controlled loader repair. Replace the temporary loader architecture before changing this source.');
if(!redirects.includes('/portal/app.js /portal/app-hotfix.js 200!'))throw new Error('Portal hotfix redirect is missing.');
const repaired=core.replace(bad,good);
new vm.Script(repaired,{filename:'portal-core-repaired.js'});
console.log('Portal core compiles after the controlled repair, and the required redirect is present.');
