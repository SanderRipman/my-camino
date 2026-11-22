import fs from 'node:fs';
import {Script} from 'node:vm';
const root=new URL('./',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const html=read('index.html'),report=read('measurement-comparison-preview.html'),guide=read('uat-start-20261102.html'),js=read('analysis-hub-uat.js'),css=read('analysis-hub-uat.css');
const ok=(p,m)=>{if(!p)throw new Error(m)};
for(const mode of ['aidme','sources','report']){ok(html.includes('data-analysis-mode="'+mode+'"'),'Tab missing: '+mode);ok(html.includes('data-mode-panel="'+mode+'"'),'Panel missing: '+mode)}
ok(html.includes('id="analysisHubAidme"'),'Existing AidMe controls must remain');
ok(html.includes('id="analysisChart"'),'Existing aggregate and role-based chart must remain');
ok(html.includes('id="analysisTriangulation"'),'Existing 3-source comparison must remain');
ok(html.includes('id="analysisEmbeddedFrame"'),'Sandbox frame missing');
ok(html.includes('src="./measurement-comparison-preview.html?embedded=1"'),'Embedded version must be same source as report');
ok(html.includes('sandbox="allow-scripts allow-modals"'),'Iframe needs opaque origin and no same-origin permissions');
ok(!html.includes('sandbox="allow-scripts allow-same-origin"'),'Must not grant same-origin to sandbox');
ok(html.includes('uat-start-20261102.html'),'Guided physical UAT link missing');
ok(html.includes('measurement-comparison-preview.html" target="_blank"'),'Full report link missing');
ok(report.includes("new URLSearchParams(location.search).get('embedded')==='1'"),'Embedded report mode missing');
ok(report.includes("window.parent.postMessage({type:'aidme:synthetic-report-height',height:h},'*')"),'Size-only isolated message missing');
ok(js.includes("event.source!==frame.contentWindow"),'Message source must be verified');
ok(js.includes('Math.min(8500,payload.height)'),'Frame height must be bounded');
ok(js.includes('panel.hidden=(name!==mode)'),'Tabs must visibly change panels');
ok(js.includes("dispatchEvent(new Event('resize'))"),'Native charts must redraw after tab switch');
ok(css.includes('analysis-hub-tabs'),'Responsive navigation CSS missing');
for(const x of ['Deltakerens første oppgave','VÍA-eierens avklaring','SER – deltaker','VIDA – navngitt','Avvist tilgang','Rapport'])ok(guide.includes(x),'Missing test step: '+x);
ok(guide.includes('Kun syntetisk test'),'Test gate missing');
ok(!/(?:fetch\s*\(|localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|supabase\.)/.test(guide),'Guide must never access storage or APIs');
ok(!/(?:fetch\s*\(|localStorage|sessionStorage|XMLHttpRequest|supabase\.)/.test(js),'Presentation script must not touch auth/data');
new Script(js,{filename:'analysis-hub-uat.js'});
for(const [name,source] of [['report',report],['guide',guide]]){const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)];ok(scripts.length===1,'Expected a single '+name+' script');new Script(scripts[0][1],{filename:name+'.js'})}

const participantJs=read('app-participant.js');
for(const invariant of [
 "if(name==='analysis'&&!isStaff())",
 "analysisNav.classList.add('hidden')",
 "analysisView.classList.remove('active')",
 "analysisView.classList.add('hidden')",
 "chart.classList.add('hidden')",
 "syntheticFrame.setAttribute('src','about:blank')",
 "if(!isStaff()){\n    analysisSelected.clear()"
])ok(participantJs.includes(invariant),'P0 participant analysis isolation missing: '+invariant);
const gateStart=participantJs.indexOf('const staffRenderAnalysis=renderAnalysis;');
const gateEnd=participantJs.indexOf('\nfunction adaptParticipantChrome()',gateStart);
ok(gateStart>0&&gateEnd>gateStart,'Privacy wrappers must exist before rendering participant chrome');
let activeStaff=false,rendered=0,shown=null,cleared=0,overview=0;
const selected=new Set(['OTHER_PARTICIPANT']);
const stubCanvas={width:200,height:100,getContext:()=>({clearRect:()=>{cleared++}})};
const ctx={
 renderAnalysis:()=>{rendered++},renderOverviewChart:()=>{overview++},
 show:(v)=>{shown=v},isStaff:()=>activeStaff,analysisSelected:selected,
 $:(selector)=>({'#analysisChart':stubCanvas,'#overviewChart':stubCanvas,
 '#analysisParticipants':{replaceChildren:()=>{}},'#overviewLegend':{replaceChildren:()=>{}}})[selector]||null
};
new Script(participantJs.slice(gateStart,gateEnd),{filename:'privacy-gates.js'}).runInNewContext(ctx);
ctx.renderAnalysis();ctx.renderOverviewChart();ctx.show('analysis');
ok(rendered===0&&overview===0&&shown==='overview'&&selected.size===0&&cleared===2,
 'Participant must never render any individual/group series or enter analysis');
activeStaff=true;ctx.renderAnalysis();ctx.renderOverviewChart();ctx.show('analysis');
ok(rendered===1&&overview===1&&shown==='analysis','Staff analysis functionality must remain available');
console.log('Analysis integrated navigation + sandbox + synthetic UAT smoke: PASS');
