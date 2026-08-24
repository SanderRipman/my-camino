import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const js=fs.readFileSync(path.join(dir,'live-feedback-20260824.js'),'utf8');
const site=fs.readFileSync(path.join(dir,'site.js'),'utf8');
const asset=path.join(dir,'assets','santiago-4-ser.jpg');

function ok(condition,message){if(!condition)throw new Error(message)}

ok(site.includes('live-feedback-20260824.js?v=20260824a'),'LIVE feedback layer is not loaded from site.js');
ok(js.includes("new Set(['aidme.no','www.aidme.no','dev.aidme.no'])"),'Expected demo hosts are missing');
ok(js.includes("event.preventDefault()")&&js.includes('event.stopImmediatePropagation()'),'Demo submit must stop the canonical write path');
ok(js.includes("sessionStorage.setItem('aidme_n1_live_demo_intake','1')"),'Demo marker missing');
ok(js.includes('ingen persondata')&&js.includes('No personal data'),'No-write explanation missing');
ok(!js.includes('fetch(')&&!js.includes('client.from')&&!js.includes('functions.invoke'),'LIVE demo layer must not write to a backend');
ok(js.includes('n1-header-hidden')&&js.includes("window.addEventListener('scroll'"),'Header autohide behavior missing');
ok(js.includes('i alle tre steg · frivillig · tilpasset'),'Compact safety line missing');
ok(js.includes('assets/santiago-4-ser.jpg'),'Santiago 4 SER image is not wired');
ok(js.includes('Å stå i det – og vite når du skal tilpasse.'),'SER mastery/adaptation framing missing');
ok(fs.existsSync(asset)&&fs.statSync(asset).size>5000,'Santiago 4 SER web asset missing or empty');

console.log('live feedback 20260824 smoke: OK');
