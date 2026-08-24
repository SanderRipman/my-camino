import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const app=fs.readFileSync(path.join(dir,'app-return-context.js'),'utf8');
const form=fs.readFileSync(path.join(dir,'form-command-client.js'),'utf8');
const build=fs.readFileSync(path.join(dir,'build-app.mjs'),'utf8');

function ok(condition,message){if(!condition)throw new Error(message)}

ok(app.includes("u.searchParams.set('returnTask',selectedTaskId)")&&app.includes("u.searchParams.set('returnView','tasks')"),'Task dialog form links must carry return context');
ok(app.includes("openTask(taskId)")&&app.includes("show(view==='tasks'?'tasks':'overview')"),'Portal must resume the originating task after return');
ok(app.includes("history.replaceState")&&app.includes("delete('returnTask')"),'Return parameters must be cleaned after resuming');
ok(!app.includes('client.')&&!app.includes('.from(')&&!app.includes('functions.invoke')&&!app.includes('fetch('),'Task return context must remain presentation/navigation-only');
ok(form.includes("client.functions.invoke('form-command'"),'Form save must continue through form-command');
ok(form.includes("returnQuery.get('returnTask')")&&form.includes('Tilbake til oppgaven og se oppdatert status'),'Form runner must expose explicit return to the originating task');
ok(!form.includes("client.from('form_submissions').insert")&&!form.includes("client.from('form_submissions').update"),'Command client must not add a direct form_submissions write fallback');
ok(build.includes("app-return-context.js")&&build.indexOf("+returnContext+'\\n'")>build.indexOf("+roleHome+'\\n'"),'Return-context layer must be last in deterministic build');

console.log('task gate return-context smoke: OK');
