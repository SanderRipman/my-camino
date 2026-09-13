(()=>{
'use strict';

let lastAt=0,seq=0;
function ensureBadge(){const nav=document.querySelector('.nav-item[data-view="settings"]');if(!nav)return null;let badge=document.querySelector('#badgeProfile');if(!badge){badge=document.createElement('i');badge.id='badgeProfile';badge.className='nav-badges';nav.appendChild(badge)}return badge}
async function refresh(force=false){const badge=ensureBadge();if(!badge||!session?.user?.id)return;const now=Date.now();if(!force&&now-lastAt<4000)return;lastAt=now;const request=++seq;try{const {count,error}=await client.from('notifications').select('id',{count:'exact',head:true}).is('read_at',null);if(request!==seq)return;if(error){badge.replaceChildren();badge.title='Profil';return}const unread=Number(count||0);badge.innerHTML=unread?`<span class="nav-count blue" aria-label="${unread} uleste varsler">${unread}</span>`:'';badge.title=unread?`Profil · ${unread} uleste varsler`:'Profil · ingen uleste varsler'}catch{if(request===seq)badge.replaceChildren()}}
setTimeout(()=>refresh(true),180);
window.addEventListener('pageshow',()=>setTimeout(()=>refresh(true),30));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true)});
document.addEventListener('aidme:portal-rendered',()=>refresh());
})();
