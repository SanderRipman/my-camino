(()=>{
'use strict';

function renderPilotEvaluationEntry(){
  document.querySelector('#pilotEvaluationEntry')?.remove();
  if(!hasRole('project_owner'))return;
  const target=document.querySelector('#view-overview');if(!target)return;
  const visible=(pilots||[]).filter(p=>p?.id);
  if(!visible.length)return;
  const box=document.createElement('article');box.id='pilotEvaluationEntry';box.className='panel-card';box.style.marginTop='14px';
  const links=visible.map(p=>`<a class="gate-link" href="./form-runner.html?key=pilot_evaluation&pilot=${encodeURIComponent(p.id)}"><strong>${escapeHtml(p.name||'Pilot')}</strong><small>${escapeHtml([p.route_name,p.status].filter(Boolean).join(' · '))}</small></a>`).join('');
  box.innerHTML=`<div class="card-head"><div><p class="eyebrow">Aggregert læring</p><h3>Pilotevaluering</h3></div><span class="pill">Prosjektnivå</span></div><p>Samle sikkerhet/avvik, deltakererfaring, ressursbruk og metodelæring på pilotnivå. Dette er programforbedring – ikke en ny deltakerport, individuell vurdering eller forutsetning for ny VÍA.</p><div class="crosslink-grid">${links}</div><p class="privacy-note">Bruk aggregert språk. Observatør/evaluator har aggregert lesetilgang som standard; denne skriveinngangen følger dagens <code>manage_program</code>-gate.</p>`;
  target.appendChild(box);
}

const pilotEvaluationRenderAll=renderAll;
renderAll=function(){pilotEvaluationRenderAll();setTimeout(renderPilotEvaluationEntry,0)};
setTimeout(renderPilotEvaluationEntry,220);

})();
