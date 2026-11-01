import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const home=read('index.html'),ser=read('ser.html'),humanize=read('humanize-20261002.css'),preview=read('message-preview.css');
const ok=(assertion,message)=>{if(!assertion)throw new Error(message)};
for(const [label,href] of [['VÍA','via.html'],['SER','ser.html'],['VIDA','vida.html']]){
  const step=new RegExp('<a class="preview-step" href="'+href.replace('.','\\.')+'"[^>]*>[^]*?<h3>'+label+'</h3>[^]*?</a>');
  ok(step.test(home),'Missing semantic card link: '+label);
  ok(fs.existsSync(path.join(dir,href)),'Missing destination page: '+href);
}
ok((home.match(/<a class="preview-step" href="/g)||[]).length===3,'Expected exactly three linked stage cards');
ok(preview.includes('a.preview-step:focus-visible'),'Keyboard focus style missing from homepage cards');
ok(ser.includes('src="assets/santiago-4-ser.jpg"'),'Approved seated pilgrim photo not visible in SER editorial section');
ok(!humanize.includes('.human-safety-photo img{display:none}'),'SER seated pilgrim image hidden by CSS');
ok(humanize.includes('.human-safety-photo img{position:absolute;inset:0;display:block'),'SER seated pilgrim image visibility missing');
ok(!humanize.includes('.humanize-page .image-strip{display:none!important}'),'SER gallery inadvertently hidden');
ok(humanize.includes('.humanize-page .image-strip{display:grid!important'),'SER gallery not restored');
for(const f of ['assets/santiago-4-ser.jpg','assets/social-meal.webp','assets/journal.webp','assets/santiago-team.webp']){
  ok(fs.existsSync(path.join(dir,f)),'SER approved image asset missing: '+f);
}
console.log('public SER photo + homepage navigation regression smoke: OK');
