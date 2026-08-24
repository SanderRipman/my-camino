import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const js=fs.readFileSync(path.join(dir,'live-feedback-20260824.js'),'utf8');
const site=fs.readFileSync(path.join(dir,'site.js'),'utf8');
const n1=fs.readFileSync(path.join(dir,'n1-ux.js'),'utf8');
const asset=path.join(dir,'assets','santiago-4-ser.jpg');

function ok(condition,message){if(!condition)throw new Error(message)}

ok(site.includes('live-feedback-20260824.js?v=20260824a'),'LIVE feedback layer is not loaded from site.js');
ok(js.includes("new Set(['aidme.no','www.aidme.no','dev.aidme.no'])"),'Expected demo hosts are missing');
ok(js.includes("event.preventDefault()")&&js.includes('event.stopImmediatePropagation()'),'Demo submit must stop the canonical write path');
ok(js.includes("sessionStorage.setItem('aidme_n1_live_demo_intake','1')"),'Demo marker missing');
ok(js.includes('ingen persondata')&&js.includes('No personal data'),'No-write explanation missing');
ok(!js.includes('fetch(')&&!js.includes('client.from')&&!js.includes('functions.invoke'),'LIVE demo layer must not write to a backend');
ok(js.includes('n1-header-hidden')&&js.includes("window.addEventListener('scroll'"),'Header autohide behavior missing');
ok(n1.includes("ribbon.classList.add('n1-three')")&&n1.includes('if(items[3]) items[3].remove()'),'N1 base must retain the three-stage ribbon transformation');
ok(js.includes("document.querySelector('.n1-safety-foundation')"),'Compact safety copy must target the separate safety foundation');
ok(!js.includes("document.querySelector('.journey-ribbon > div:last-child')"),'LIVE layer must never overwrite the last phase card (VIDA) as safety copy');
ok(js.includes('Trygghet i alle tre steg')&&js.includes('Safety across all three stages'),'Compact bilingual safety line missing');
ok(js.includes('journey-ribbon.n1-three>div'),'Mobile phase cards must remain compact enough for VÍA/SER/VIDA visibility');
ok(js.includes('assets/santiago-4-ser.jpg'),'Santiago 4 SER image is not wired');
ok(js.includes('Å stå i det – og vite når du skal tilpasse.'),'SER mastery/adaptation framing missing');
ok(fs.existsSync(asset)&&fs.statSync(asset).size>5000,'Santiago 4 SER web asset missing or empty');

console.log('live feedback 20260824 smoke: OK');
