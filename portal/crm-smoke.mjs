import fs from 'node:fs';
import vm from 'node:vm';

const crm=fs.readFileSync(new URL('./crm.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./crm.html',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('./app-onboarding.js',import.meta.url),'utf8');

const required=[
  [crm,"from('crm_contacts')",'CRM data source'],
  [crm,"currentLevel==='aal2'",'AAL2 UI gate'],
  [crm,"eq('role_code','project_owner')",'project_owner access gate'],
  [crm,"archived_at:new Date().toISOString()",'archive path'],
  [crm,"source_type:'MANUAL'",'manual-source default'],
  [html,'CRM – Sander','owner workspace label'],
  [html,'Ingen deltaker-/helse-/sikkerhetsdata','privacy separation'],
  [html,'Outlook → CRM holdes bevisst av','Outlook import hold'],
  [nav,"a.href='./crm.html'",'portal CRM navigation'],
  [nav,"g.role_code==='project_owner'",'owner-only navigation']
];
for(const [source,needle,label] of required){if(!source.includes(needle))throw new Error(`Mini CRM smoke missing ${label}: ${needle}`)}
if(/\.from\(['"]crm_contacts['"]\)\.delete\s*\(/.test(crm))throw new Error('Mini CRM must not hard-delete contacts.');
if(crm.includes("functions.invoke('task-command'"))throw new Error('Mini CRM v1 must not create/update shared portal tasks.');
if(/body\s*:\s*.*(email|message)/i.test(crm)&&crm.includes('OUTLOOK_CANDIDATE'))throw new Error('Mini CRM v1 must not ingest Outlook bodies automatically.');
new vm.Script(crm,{filename:'portal-crm.js'});
new vm.Script(nav,{filename:'portal-app-onboarding.js'});
console.log('Mini CRM compiles with owner/AAL2 gates, archive-only records, privacy separation and no automatic Outlook/task bridge.');
