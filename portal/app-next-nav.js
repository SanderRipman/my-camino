(()=>{
'use strict';

const OPEN_STATUSES=new Set(['OPEN','IN_PROGRESS','WAITING']);
let lastCue='';

function cueTarget(){
  if(document.querySelector('#taskDialog')?.open)return'';
  try{
    if(!isStaff()){
      const snap=typeof window.aidmeParticipantAttentionSnapshot==='function'?window.aidmeParticipantAttentionSnapshot():null;
      if(!snap)return'';
      if((snap.tasks||[]).some(item=>item.tone==='RED'||item.tone==='YELLOW'))return'tasks';
      if((snap.forms||[]).some(item=>item.tone==='YELLOW'))return'forms';
      return'';
    }
    if((tasks||[]).some(task=>OPEN_STATUSES.has(task.status)))return'tasks';
  }catch{}
  return'';
}

function clearCue(){
  document.querySelectorAll('#mainNav .nav-item.next-nav-cue').forEach(nav=>nav.classList.remove('next-nav-cue'));
  document.querySelectorAll('#mainNav .nav-next-cue').forEach(el=>el.remove());
  lastCue='';
}

function applyNextCue(){
  const target=cueTarget();
  const active=document.querySelector('#mainNav .nav-item.active')?.dataset.view||'';
  const nav=target?document.querySelector(`#mainNav .nav-item[data-view="${CSS.escape(target)}"]`):null;
  if(!target||target===active||!nav||nav.classList.contains('demo-lens-hidden')){clearCue();return}
  if(lastCue===target&&nav.classList.contains('next-nav-cue')&&nav.querySelector('.nav-next-cue'))return;
  clearCue();
  nav.classList.add('next-nav-cue');
  const cue=document.createElement('span');
  cue.className='nav-next-cue';
  cue.textContent='Neste';
  cue.setAttribute('aria-hidden','true');
  nav.appendChild(cue);
  nav.title=nav.title?`${nav.title} · Anbefalt neste arbeidsflate`:'Anbefalt neste arbeidsflate';
  lastCue=target;
}

const style=document.createElement('style');
style.id='next-nav-cue-style';
style.textContent=`
  #mainNav .nav-item.next-nav-cue{outline:2px solid rgba(200,164,93,.55);outline-offset:-2px}
  #mainNav .nav-next-cue{justify-self:end;border:1px solid rgba(200,164,93,.55);border-radius:999px;padding:2px 6px;background:rgba(200,164,93,.13);font-size:9px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;animation:aidme-next-cue-in .35s ease-out 1}
  @keyframes aidme-next-cue-in{from{opacity:.25;transform:translateY(2px)}to{opacity:1;transform:none}}
  @media(prefers-reduced-motion:reduce){#mainNav .nav-next-cue{animation:none}}
`;
document.head.appendChild(style);

const nextCueShow=show;
show=function(name){nextCueShow(name);setTimeout(applyNextCue,0)};
const nextCueRenderTaskLists=renderTaskLists;
renderTaskLists=function(){nextCueRenderTaskLists();setTimeout(applyNextCue,0)};
document.querySelector('#taskDialog')?.addEventListener('close',()=>setTimeout(applyNextCue,0));
window.addEventListener('pageshow',()=>setTimeout(applyNextCue,30));
setTimeout(applyNextCue,240);
})();
