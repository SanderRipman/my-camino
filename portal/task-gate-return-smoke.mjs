import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const app=fs.readFileSync(path.join(dir,'app-return-context.js'),'utf8');
const form=fs.readFileSync(path.join(dir,'form-command-client.js'),'utf8');
const formSer=fs.readFileSync(path.join(dir,'form-ser-operational.js'),'utf8');
const css=fs.readFileSync(path.join(dir,'form-runner.css'),'utf8');
const build=fs.readFileSync(path.join(dir,'build-app.mjs'),'utf8');

function ok(condition,message){if(!condition)throw new Error(message)}

ok(app.includes("u.searchParams.set('returnTask',selectedTaskId)")&&app.includes("u.searchParams.set('returnView','tasks')"),'Task dialog form links must carry return context');
ok(app.includes("openTask(taskId)")&&app.includes("show(view==='tasks'?'tasks':'overview')"),'Portal must resume the originating task after return');
ok(app.includes("sessionStorage.setItem(activeTaskStorageKey,id)")&&app.includes("sessionStorage.getItem(activeTaskStorageKey)"),'Active task must survive a same-tab reload without backend state');
ok(app.includes("addEventListener('close',forgetTask)")&&app.includes("sessionStorage.removeItem(activeTaskStorageKey)"),'Explicit dialog close must clear refresh-resume context');
ok(app.includes("history.replaceState")&&app.includes("delete('returnTask')"),'Return parameters must be cleaned after resuming');
ok(!app.includes('client.')&&!app.includes('.from(')&&!app.includes('functions.invoke')&&!app.includes('fetch('),'Task return context must remain presentation/navigation-only');
ok(formSer.includes("const AUTH_RETURN_KEY='aidme:return-intent:v1'")&&formSer.includes('captureInterruptedFormReturn()'),'Auth interruption must preserve exact form return intent');
ok(formSer.includes('sessionStorage.setItem(AUTH_RETURN_KEY')&&formSer.indexOf('captureInterruptedFormReturn();')<formSer.indexOf("location.replace('./')"),'Interrupted form target must be captured before authentication redirect');
ok(form.includes("client.functions.invoke('form-command'"),'Form save must continue through form-command');
ok(form.includes("returnQuery.get('returnTask')")&&form.includes('Tilbake til oppgaven og se oppdatert status'),'Form runner must expose explicit return to the originating task');
ok(form.includes("return{href:'./',label:'Til Oversikt'}"),'Completed staff forms without return context must go back to Overview');
ok(form.includes('showCompletionState(submission)')&&form.includes('Skjemaet er lagret')&&form.includes('Se fullført'),'Successful submission must enter an explicit completion state');
ok(form.includes('submitted-locked')&&form.includes("querySelectorAll('input,select,textarea,button')"),'Submitted form must be visibly locked against further editing');
ok(css.includes('.form-completion-backdrop')&&css.includes('.form-completion-dialog'),'Completion state must use the standard styled dialog surface');
ok(!form.includes("client.from('form_submissions').insert")&&!form.includes("client.from('form_submissions').update"),'Command client must not add a direct form_submissions write fallback');
ok(!formSer.includes("client.from('form_submissions')")&&!formSer.includes("functions.invoke('form-command'"),'Auth-return preservation must not add a form write path');
ok(build.includes("app-return-context.js")&&build.indexOf("+returnContext+'\\n'")>build.indexOf("+roleHome+'\\n'"),'Return-context layer must be last in deterministic build');

console.log('task gate return-context smoke: OK');
