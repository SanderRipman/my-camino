(()=>{
'use strict';

const viaHandoffOpenTask=openTask;
openTask=function(id){
  viaHandoffOpenTask(id);
  if(!isStaff())return;
  const task=tasks.find(x=>x.id===id),participant=participantById(task?.participant_id);
  if(!task||!participant||task.title!=='VÍA – vurder veikart før GO/NO-GO')return;
  const body=document.querySelector('#taskDialogBody');if(!body||body.querySelector('[data-via-review-link]'))return;
  const box=document.createElement('div');
  box.dataset.viaReviewLink='1';
  box.className='task-crosslinks via-review-handoff';
  box.innerHTML=`<p class="eyebrow">Før beslutningsgaten</p><h3>Les det fullførte VÍA-veikartet</h3><p>Gå gjennom deltakerens egne ord, beredskap og VIDA-bro. Avklar mangler før du åpner den separate GO/NO-GO-gaten.</p><div class="crosslink-grid"><a class="primary" href="./form-runner.html?key=via_roadmap&participant=${encodeURIComponent(participant.id)}&latest=1">Åpne siste fullførte veikart</a><a class="ghost" href="./owners.html?participant=${encodeURIComponent(participant.id)}">Kontroller ansvar / VIDA-eier</a></div>`;
  body.appendChild(box);
};

})();
