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

const photoCss=read('photo-framing-20261101.css');
const routes=read('ruter.html');
const pages=['index','via','ser','vida','deltakere','partnere','ruter','om','kontakt','takk'];
for(const page of pages){
 const html=read(page+'.html');
 ok(html.includes('>Portal</a>'),'Portal label missing: '+page);
 if(page!=='takk'){
  const header=html.split('</header>')[0];
  ok(!/class="nav-link[^"]*" href="via\.html"/.test(header),'Raw VÍA nav link persists: '+page);
  ok(!/class="nav-link[^"]*" href="ser\.html"/.test(header),'Raw SER nav link persists: '+page);
  ok(!/class="nav-link[^"]*" href="vida\.html"/.test(header),'Raw VIDA nav link persists: '+page);
  ok(header.includes('href="index.html#metoden"'),'Method link missing: '+page);
  ok(header.includes('href="ruter.html"'),'Camino link missing: '+page);
 }
}
ok(home.includes('id="metoden"'),'Method section anchor missing');
ok(routes.includes('photo-framing-20261101.css'),'Routes photo fidelity stylesheet missing');
ok(ser.includes('photo-framing-20261101.css'),'SER photo fidelity stylesheet missing');
ok(routes.includes('class="milestone-photo--zero"'),'Zero-km photo container missing');
ok(photoCss.includes('.milestone-photo--zero::before')&&photoCss.includes("zero-km.webp")&&photoCss.includes('filter:blur('),'Zero-km photo surround not blended with original');
ok(photoCss.includes('img[src$="zero-km.webp"]')&&photoCss.includes('object-fit:contain'),'Zero-km face/marker must not be cropped');
ok(photoCss.includes('.humanize-page .human-safety-photo img')&&photoCss.includes('object-fit:cover'),'SER editorial image must fill its panel');
const headerCss=read('refine.css');
ok(headerCss.includes('.site-header .nav-actions .workspace-link{display:inline-flex!important'),'Portal CTA must remain in mobile header');
ok(headerCss.includes('.site-header .mobile-nav .mobile-workspace-link{display:none!important'),'Duplicate mobile Portal must be hidden');
ok(headerCss.includes('.site-header .nav-shell{display:flex;flex-wrap:nowrap'),'Header controls must share one line');

ok(ser.includes('Å kunne stå i ubehag, finne styrke i seg selv'),'SER preferred optional discomfort reflection missing');

console.log('public SER photo + homepage navigation regression smoke: OK');
