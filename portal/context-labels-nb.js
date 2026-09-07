(()=>{
'use strict';

const STAGE_LABELS_NB={
  VIA:'VÍA',
  GO:'VÍA · GO',
  GO_WITH_CONDITIONS:'VÍA · GO med vilkår',
  POSTPONED:'VÍA · utsatt',
  NO_GO:'VÍA · annen vei nå',
  SER:'SER',
  VIDA:'VIDA',
  NEW_VIA:'Ny VÍA'
};
const SCOPE_LABELS_NB={
  participant:'Deltaker',
  participant_staff:'Deltaker + medarbeider',
  staff:'Medarbeider',
  pilot:'Pilot / gruppe'
};

function localizeStageText(text){
  const raw=String(text??'').trim();
  if(STAGE_LABELS_NB[raw])return STAGE_LABELS_NB[raw];
  const marker=' · ';
  const pos=raw.lastIndexOf(marker);
  if(pos<0)return raw;
  const stage=raw.slice(pos+marker.length);
  const label=STAGE_LABELS_NB[stage];
  return label?`${raw.slice(0,pos)}${marker}${label}`:raw;
}
function localizeScopeText(text){const raw=String(text??'').trim();return SCOPE_LABELS_NB[raw]||raw}

function applyContextLabels(root=document){
  const stage=root.querySelector?.('#stage');
  if(stage){const next=localizeStageText(stage.textContent);if(next!==stage.textContent)stage.textContent=next}
  const select=root.querySelector?.('#participantSelect');
  select?.querySelectorAll('option').forEach(option=>{
    const next=localizeStageText(option.textContent);
    if(next!==option.textContent)option.textContent=next;
  });
  const scope=root.querySelector?.('#scopeLabel');
  if(scope){const next=localizeScopeText(scope.textContent);if(next!==scope.textContent)scope.textContent=next}
}

applyContextLabels();
const targets=[document.querySelector('#participantSelect'),document.querySelector('#stage'),document.querySelector('#scopeLabel')].filter(Boolean);
targets.forEach(target=>new MutationObserver(()=>applyContextLabels()).observe(target,{childList:true,subtree:true,characterData:true}));
document.addEventListener('aidme:portal-rendered',()=>applyContextLabels());
})();
