import fs from 'node:fs';

const src=fs.readFileSync(new URL('./live-feedback-20260824.js',import.meta.url),'utf8');
const ok=(value,message)=>{if(!value)throw new Error(message)};

ok(src.includes("attributeFilter:['disabled']"),'Demo form observer must only watch disabled-state recovery');
ok(!src.includes("observer.observe(form,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','hidden']})"),'Legacy self-triggering contact observer must stay removed');
ok(src.includes("if(note.innerHTML!==html)note.innerHTML=html"),'Demo note writes must be idempotent');
ok(src.includes("if(el.disabled)el.disabled=false"),'Demo form enable writes must be idempotent');
ok(src.includes("mailto:sander@aidme.no?subject=AidMe%20VIDA%20-%20partnerdialog"),'Partner CTA must use canonical AidMe mailbox while no partner web intake exists');
ok(!src.includes('sanderseim@gmail.com')&&!src.includes('sander.seim@gmail.com')&&!src.includes('zanderzeim@gmail.com'),'Public contact layer must not route to personal Gmail');
ok(src.includes("participant?.querySelector('a.btn')?.remove()"),'Redundant participant jump button must stay removed on contact page');
ok(src.includes('Trygghet i alle tre steg</strong> · avklaring · erfaring · integrasjon'),'Three-part safety follow-up copy missing');
ok(src.includes("bi('Fra Aimy til AidMe.','From Aimy to AidMe.')"),'Aimy→AidMe story heading missing');
ok(src.includes("bi('Én sammenhengende vei videre.','One connected way forward.')"),'Compact mobile journey heading missing');

console.log('contact-mobile-stability-smoke: PASS');
