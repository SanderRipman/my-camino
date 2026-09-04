(()=>{
'use strict';

function noActivePortalAccess(){
  return !!session&&!isStaff()&&!ownParticipant();
}
function accessStateStyles(){
  if(document.querySelector('#access-state-style'))return;
  const style=document.createElement('style');style.id='access-state-style';
  style.textContent=`
    html.portal-no-active-access #mainNav .nav-item:not([data-view="overview"]):not([data-view="help"]){display:none!important;pointer-events:none!important}
    html.portal-no-active-access #badgeOverview,html.portal-no-active-access #badgeTasks,html.portal-no-active-access #badgeParticipants{display:none!important}
    #accessPending.access-revoked-card{max-width:980px;margin:0 auto}
  `;
  document.head.appendChild(style);
}
function renderNoActiveAccess(){
  if(!noActivePortalAccess())return false;
  accessStateStyles();document.documentElement.classList.add('portal-no-active-access');
  const view=document.querySelector('#view-overview'),pending=document.querySelector('#accessPending');
  if(view&&pending){
    pending.classList.remove('hidden');pending.classList.add('access-revoked-card');
    pending.innerHTML='<p class="eyebrow">Tilgang</p><h2>Tilgangen din er ikke aktiv</h2><p>Du er fortsatt innlogget, men kontoen har ingen aktiv arbeidsrolle eller deltakerreise. Tilgangen kan ha utløpt eller blitt trukket tilbake. Ingen deltaker- eller arbeidsdata åpnes uten ny gyldig tilgang.</p>';
    [...view.children].forEach(child=>child.classList.toggle('hidden',child!==pending));
  }
  const context=document.querySelector('#contextLabel'),title=document.querySelector('#pageTitle');
  if(context)context.textContent='Tilgang';if(title)title.textContent='Tilgang ikke aktiv';
  return true;
}

const accessStateRenderAll=renderAll;
renderAll=function(){
  accessStateRenderAll();
  if(renderNoActiveAccess())return;
  document.documentElement.classList.remove('portal-no-active-access');
};

const accessStateShow=show;
show=function(name){
  if(noActivePortalAccess()&&!['overview','help','security'].includes(name))name='overview';
  accessStateShow(name);
  if(noActivePortalAccess()&&name==='overview')renderNoActiveAccess();
};

setTimeout(renderNoActiveAccess,220);
})();
