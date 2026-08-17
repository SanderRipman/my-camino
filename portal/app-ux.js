(()=>{
'use strict';

const UX_VERSION='2026-08-17a';

function addUxStyles(){
  if(document.querySelector('link[data-aidme-ux]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';link.href=`./ux.css?v=${UX_VERSION}`;link.dataset.aidmeUx='1';
  document.head.appendChild(link);
}

function setAuthMessage(text,type='info'){
  const el=document.querySelector('#authMessage');if(!el)return;
  el.textContent=text;el.classList.remove('auth-error','auth-success','auth-info');
  el.classList.add(type==='error'?'auth-error':type==='success'?'auth-success':'auth-info');
  if(type==='error'){el.setAttribute('role','alert');el.setAttribute('aria-live','assertive');}
}

function installAuthFeedback(){
  const msg=document.querySelector('#authMessage');if(!msg)return;
  const classify=()=>{
    const t=(msg.textContent||'').toLowerCase();
    msg.classList.remove('auth-error','auth-success','auth-info');
    if(!t)return;
    if(t.includes('ikke godkjent')||t.includes('kunne ikke')||t.includes('feil')){msg.classList.add('auth-error');msg.setAttribute('role','alert');msg.setAttribute('aria-live','assertive');}
    else if(t.includes('sjekk e-posten')||t.includes('sendt')||t.includes('endret'))msg.classList.add('auth-success');
    else msg.classList.add('auth-info');
  };
  new MutationObserver(classify).observe(msg,{childList:true,characterData:true,subtree:true});classify();
}

function ensureRecoveryDialog(){
  if(document.querySelector('#passwordRecoveryDialog'))return document.querySelector('#passwordRecoveryDialog');
  const dialog=document.createElement('dialog');dialog.id='passwordRecoveryDialog';dialog.className='task-dialog recovery-dialog';
  dialog.innerHTML=`<div class="dialog-shell"><div class="dialog-head"><div><p class="eyebrow">Kontogjenoppretting</p><h2>Velg nytt passord</h2><p>Bruk minst 12 tegn. Begge feltene må være like.</p></div></div><form id="passwordRecoveryForm"><label><span>Nytt passord</span><input id="recoveryPassword" type="password" minlength="12" autocomplete="new-password" required></label><label><span>Gjenta nytt passord</span><input id="recoveryPassword2" type="password" minlength="12" autocomplete="new-password" required></label><div class="dialog-actions"><button class="primary" type="submit">Lagre nytt passord</button></div><p id="passwordRecoveryMessage" class="message" aria-live="polite"></p></form></div>`;
  document.body.appendChild(dialog);
  dialog.querySelector('#passwordRecoveryForm').addEventListener('submit',async e=>{
    e.preventDefault();const a=dialog.querySelector('#recoveryPassword').value,b=dialog.querySelector('#recoveryPassword2').value,m=dialog.querySelector('#passwordRecoveryMessage');
    if(a!==b){m.textContent='Passordene er ikke like.';return}if(a.length<12){m.textContent='Bruk minst 12 tegn.';return}
    m.textContent='Lagrer…';const {error}=await client.auth.updateUser({password:a});
    if(error){m.textContent='Passordet kunne ikke endres. Be om en ny lenke og prøv igjen.';return}
    m.textContent='Passordet er endret. Du kan fortsette til portalen.';setTimeout(()=>{dialog.close();location.replace('/portal/')},900);
  });
  return dialog;
}

function installRecoveryControls(){
  const form=document.querySelector('#loginForm');if(!form||document.querySelector('#forgotPasswordButton'))return;
  const row=document.createElement('div');row.className='auth-help-row';
  row.innerHTML=`<button id="forgotPasswordButton" class="auth-link" type="button">Glemt passord?</button><button id="forgotUsernameButton" class="auth-link" type="button">Glemt e-post?</button>`;
  form.appendChild(row);
  const note=document.createElement('div');note.id='usernameHelp';note.className='auth-inline-help hidden';note.textContent='AidMe bruker e-postadressen du ble invitert med som brukernavn. Hvis du ikke husker hvilken adresse som ble brukt, kontakt din AidMe-/programkontakt.';form.appendChild(note);
  row.querySelector('#forgotUsernameButton').addEventListener('click',()=>note.classList.toggle('hidden'));
  row.querySelector('#forgotPasswordButton').addEventListener('click',async()=>{
    const email=(document.querySelector('#email')?.value||'').trim().toLowerCase();
    if(!email){setAuthMessage('Skriv inn e-postadressen din først, og velg deretter «Glemt passord?».','error');document.querySelector('#email')?.focus();return}
    setAuthMessage('Sender lenke for nytt passord…','info');
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/portal/`});
    if(error){setAuthMessage('Kunne ikke sende lenken akkurat nå. Prøv igjen om litt.','error');return}
    // Enumeration-safe wording: same message regardless of whether the address exists.
    setAuthMessage('Hvis e-postadressen er registrert, får du en lenke for å velge nytt passord.','success');
  });
  client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){const d=ensureRecoveryDialog();if(!d.open)d.showModal()}});
}

function ensureSevenDayOption(){
  const select=document.querySelector('#analysisPeriod');if(!select||select.querySelector('option[value="7"]'))return;
  const o=document.createElement('option');o.value='7';o.textContent='7 dager';select.insertBefore(o,select.firstChild);
}

function formatChartDate(dateString){
  const d=new Date(`${dateString}T12:00:00`);return new Intl.DateTimeFormat('nb-NO',{day:'2-digit',month:'2-digit'}).format(d);
}

function installChartReadout(canvas){
  if(!canvas||canvas.dataset.readoutInstalled)return;canvas.dataset.readoutInstalled='1';
  let readout=canvas.parentElement?.querySelector('.chart-readout');if(!readout){readout=document.createElement('div');readout.className='chart-readout';readout.textContent='Trykk eller pek på et punkt for eksakt dato og verdi.';canvas.insertAdjacentElement('afterend',readout)}
  const handle=evt=>{
    const points=canvas.__aidmeChartPoints||[];if(!points.length)return;
    const rect=canvas.getBoundingClientRect();const touch=evt.touches?.[0];const cx=(touch?.clientX??evt.clientX)-rect.left,cy=(touch?.clientY??evt.clientY)-rect.top;
    let best=null,dist=Infinity;for(const p of points){const d=(p.x-cx)**2+(p.y-cy)**2;if(d<dist){dist=d;best=p}}
    if(best&&Math.sqrt(dist)<34)readout.textContent=`${best.label} · ${formatChartDate(best.date)} · ${Number(best.value).toFixed(1).replace('.0','')}/10`;
  };
  canvas.addEventListener('pointermove',handle);canvas.addEventListener('pointerdown',handle);canvas.addEventListener('touchstart',handle,{passive:true});
}

function installImprovedCharts(){
  // Override the original canvas renderer while preserving the existing series/data model.
  drawChart=function(canvas,series){
    if(!canvas)return;const rect=canvas.getBoundingClientRect();if(rect.width<40){setTimeout(()=>drawChart(canvas,series),80);return}
    const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)),cssW=Math.max(280,rect.width),cssH=Math.max(260,parseInt(canvas.getAttribute('height'))||300);
    canvas.width=Math.round(cssW*dpr);canvas.height=Math.round(cssH*dpr);const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
    const pad={l:38,r:14,t:18,b:42},cw=cssW-pad.l-pad.r,ch=cssH-pad.t-pad.b;
    ctx.strokeStyle='#d8d7d0';ctx.fillStyle='#66737b';ctx.font='11px system-ui';ctx.lineWidth=1;
    for(let yv=0;yv<=10;yv+=2){const py=pad.t+ch*(1-yv/10);ctx.beginPath();ctx.moveTo(pad.l,py);ctx.lineTo(cssW-pad.r,py);ctx.stroke();ctx.fillText(String(yv),8,py+4)}
    const allDates=[...new Set(series.flatMap(s=>s.values.map(v=>v.date)))].sort();
    if(!allDates.length){ctx.fillText('Ingen målinger i valgt periode.',pad.l,pad.t+30);canvas.__aidmeChartPoints=[];installChartReadout(canvas);return}
    const x=d=>pad.l+(allDates.length===1?cw/2:cw*allDates.indexOf(d)/(allDates.length-1)),y=v=>pad.t+ch*(1-Number(v)/10),points=[];
    series.forEach((s,i)=>{ctx.strokeStyle=s.color||CHART_COLORS[i%CHART_COLORS.length];ctx.lineWidth=s.dashed?2:2.5;ctx.setLineDash(s.dashed?[6,5]:[]);ctx.beginPath();s.values.forEach((v,j)=>{const px=x(v.date),py=y(v.value);if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)});ctx.stroke();ctx.setLineDash([]);s.values.forEach(v=>{const px=x(v.date),py=y(v.value);ctx.fillStyle=s.color||CHART_COLORS[i%CHART_COLORS.length];ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fill();points.push({x:px,y:py,date:v.date,value:v.value,label:s.label})})});
    const days=Number(document.querySelector('#analysisPeriod')?.value||30),maxTicks=days<=14?14:days<=30?8:7,step=Math.max(1,Math.ceil(allDates.length/maxTicks));ctx.fillStyle='#66737b';ctx.font='10px system-ui';
    allDates.forEach((d,i)=>{if(i%step!==0&&i!==allDates.length-1)return;const px=x(d);ctx.save();ctx.translate(px,cssH-10);ctx.rotate(allDates.length>10?-0.45:0);ctx.fillText(formatChartDate(d),allDates.length>10?-22:-12,0);ctx.restore()});
    canvas.__aidmeChartPoints=points;installChartReadout(canvas);
  };
  const redraw=()=>{if(document.querySelector('#view-analysis')?.classList.contains('active'))renderAnalysis();if(document.querySelector('#view-overview')?.classList.contains('active'))renderOverviewChart()};
  let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(redraw,120)});
}

function taskAttention(t){const open=['OPEN','IN_PROGRESS','WAITING'].includes(t.status),overdue=open&&t.due_at&&new Date(t.due_at)<new Date();return overdue||severity(t)==='RED'?'RED':severity(t)==='YELLOW'?'YELLOW':'GREEN'}
function updateMobileAttention(){
  let bar=document.querySelector('#mobileAttentionBar');if(!bar){bar=document.createElement('div');bar.id='mobileAttentionBar';bar.className='mobile-attention-bar';document.querySelector('.preview-strip')?.insertAdjacentElement('afterend',bar)}if(!bar)return;
  const open=(tasks||[]).filter(t=>['OPEN','IN_PROGRESS','WAITING'].includes(t.status)),red=open.filter(t=>taskAttention(t)==='RED').length,yellow=open.filter(t=>taskAttention(t)==='YELLOW').length;
  bar.innerHTML=`<button type="button" data-attention="RED" class="attention-chip red"><b>${red}</b> kritisk/forfalt</button><button type="button" data-attention="YELLOW" class="attention-chip yellow"><b>${yellow}</b> trenger avklaring</button><button type="button" data-attention="ALL" class="attention-chip neutral"><b>${open.length}</b> åpne</button>`;
  bar.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>openTaskFocus(b.dataset.attention)));
}

function openTaskFocus(focus='ALL'){
  taskFilter='OPEN';show('tasks');renderTaskLists();
  const heading=document.querySelector('#tasksHeading');if(heading)heading.textContent=focus==='RED'?'Kritiske / forfalte oppgaver':focus==='YELLOW'?'Oppgaver som trenger avklaring':'Tildelte oppgaver';
  document.querySelectorAll('#taskList .task-row').forEach(row=>{const t=tasks.find(x=>x.id===row.dataset.taskId);if(!t)return;const att=taskAttention(t);row.classList.toggle('ux-filter-hidden',focus!=='ALL'&&att!==focus)});
}

function makeCardInteractive(el,label,handler){if(!el||el.dataset.uxInteractive)return;el.dataset.uxInteractive='1';el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',label);el.addEventListener('click',handler);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handler()}})}
function installDrilldowns(){
  makeCardInteractive(document.querySelector('#metricOpen')?.closest('.metric'),'Åpne alle oppgaver',()=>openTaskFocus('ALL'));
  makeCardInteractive(document.querySelector('#metricRed')?.closest('.metric'),'Åpne kritiske og forfalte oppgaver',()=>openTaskFocus('RED'));
  makeCardInteractive(document.querySelector('#metricYellow')?.closest('.metric'),'Åpne oppgaver som trenger avklaring',()=>openTaskFocus('YELLOW'));
  makeCardInteractive(document.querySelector('#metricParticipants')?.closest('.metric'),'Åpne aktive deltakere',()=>show('participants'));
}

function logicalGateFor(p){
  if(!p)return null;
  if(['VIA','READY_FOR_GO','INTEREST'].includes(p.stage))return{label:'Åpne individuell GO / NO-GO',href:`./form-runner.html?key=individual_go_no_go&participant=${encodeURIComponent(p.id)}`,hint:'GO / NO-GO må avklares før SER-plass kan bekreftes.'};
  if(['GO','GO_WITH_CONDITIONS'].includes(p.stage))return{label:'Kontroller Pilot-GO',href:`./form-runner.html?key=pilot_go&participant=${encodeURIComponent(p.id)}`,hint:'Pilot-GO og navngitt VIDA-eier må være lukket før SER starter.'};
  if(p.stage==='SER')return{label:'Åpne SER-arbeidsflate',href:'./pilot-ops.html',hint:'Operativ dag, rute, gruppe og sikkerhet håndteres i SER-arbeidsflaten.'};
  if(p.stage==='VIDA')return{label:'Åpne VIDA-plan',href:`./form-runner.html?key=vida_plan&participant=${encodeURIComponent(p.id)}`,hint:'VIDA er én levende plan med navngitt eier og neste konkrete handling.'};
  return null;
}

function enhanceTaskDialog(id){
  const body=document.querySelector('#taskDialogBody');if(!body||body.querySelector('.task-crosslinks'))return;const t=tasks.find(x=>x.id===id),p=participantById(t?.participant_id),pilot=pilotById(t?.pilot_id),gate=logicalGateFor(p);if(!t)return;
  const box=document.createElement('div');box.className='task-crosslinks';
  box.innerHTML=`<p class="eyebrow">Snarveier og neste logiske steg</p><div class="crosslink-grid">${p?`<button type="button" data-cross="participant">Deltaker · ${escapeHtml(p.code_name)}</button><a href="./owners.html?participant=${encodeURIComponent(p.id)}">Ansvar / eiere</a>`:''}${pilot?`<a href="./pilot-ops.html?pilot=${encodeURIComponent(pilot.id)}">Gruppe / pilot · ${escapeHtml(pilot.name)}</a>`:''}${gate?`<a class="gate-link" href="${gate.href}">${escapeHtml(gate.label)}</a>`:''}</div>${gate?`<p class="gate-hint">${escapeHtml(gate.hint)}</p>`:''}<p class="privacy-note">Felter som krever formell beslutning endres via riktig gate/skjema – ikke ved å omgå prosessen i oppgavekortet.</p>`;
  body.appendChild(box);box.querySelector('[data-cross="participant"]')?.addEventListener('click',()=>{selectedParticipantId=p.id;document.querySelector('#taskDialog')?.close();show('participants');renderParticipants()});
}

function installTaskDialogEnhancement(){
  const original=openTask;openTask=function(id){original(id);enhanceTaskDialog(id)};
}

function installUxRefresh(){
  const original=renderAll;renderAll=function(){original();updateMobileAttention();installDrilldowns();ensureSevenDayOption()};
  // If data is already on screen when this extension loads.
  setTimeout(()=>{updateMobileAttention();installDrilldowns();ensureSevenDayOption()},100);
}

addUxStyles();installAuthFeedback();installRecoveryControls();ensureRecoveryDialog();ensureSevenDayOption();installImprovedCharts();installTaskDialogEnhancement();installUxRefresh();
})();
