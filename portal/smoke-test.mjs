import fs from 'node:fs';
import vm from 'node:vm';

const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const redirects=fs.readFileSync(new URL('../_redirects',import.meta.url),'utf8');
if(redirects.includes('/portal/app.js /portal/app-hotfix.js'))throw new Error('Emergency app redirect must not be present in clean-build mode.');
if(!app.includes("client.functions.invoke('task-command'"))throw new Error('Built app is missing the secure task command path.');
if(!app.includes('Forfalt ·'))throw new Error('Built app is missing overdue-task presentation.');
if(!app.includes('Operational extensions are maintained separately'))throw new Error('Operational extension module was not concatenated.');
if(!app.includes('UX/auth/mobile hardening is maintained separately'))throw new Error('UX hardening extension module was not concatenated.');
if(!app.includes('resetPasswordForEmail'))throw new Error('Built app is missing password recovery.');
if(!app.includes("o.value='7'"))throw new Error('Built app is missing 7-day analysis option.');
if(!app.includes('mobileAttentionBar'))throw new Error('Built app is missing mobile attention summary.');
if(!app.includes('task-crosslinks'))throw new Error('Built app is missing contextual task drill-down.');
if(app.includes('app-core-broken.js?v='))throw new Error('Built app still contains emergency runtime loader logic.');
new vm.Script(app,{filename:'portal-app-built.js'});
console.log('Clean portal bundle compiles with secure task operations, auth recovery, mobile attention and contextual UX.');
