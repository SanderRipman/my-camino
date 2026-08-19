(()=>{
'use strict';
const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const onboardingClient=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});

function addNav(nav){if(!nav||document.querySelector('#onboardingNav'))return null;const a=document.createElement('a');a.id='onboardingNav';a.className='nav-item';a.href='./onboarding.html';a.innerHTML='<span class="nav-num">ONB</span><b>Rolleintro</b><i id="badgeOnboarding" class="nav-badges"></i>';nav.appendChild(a);return a}
function addCrmNav(nav){if(!nav||document.querySelector('#crmNav'))return null;const a=document.createElement('a');a.id='crmNav';a.className='nav-item';a.href='./crm.html';a.innerHTML='<span class="nav-num">CRM</span><b>Mini CRM</b>';nav.appendChild(a);return a}
function addMenu(menu){if(!menu||document.querySelector('#userOnboardingLink'))return;const a=document.createElement('a');a.id='userOnboardingLink';a.href='./onboarding.html';a.textContent='Rolleintroduksjon';a.style.cssText='display:block;padding:10px 11px;border-radius:10px;color:inherit;text-decoration:none';menu.insertBefore(a,menu.firstElementChild)}

async function install(){try{const {data:{session}}=await onboardingClient.auth.getSession();if(!session)return;const {data:grants,error:ge}=await onboardingClient.from('role_grants').select('id,role_code,revoked_at,valid_from,valid_until').eq('user_id',session.user.id);if(ge)return;const now=new Date(),active=(grants||[]).filter(g=>!g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now));if(!active.length)return;const mainNav=document.querySelector('#mainNav');const nav=addNav(mainNav);if(active.some(g=>g.role_code==='project_owner'))addCrmNav(mainNav);addMenu(document.querySelector('#userMenu'));const {count,error}=await onboardingClient.from('role_onboarding_items').select('id',{head:true,count:'exact'}).eq('user_id',session.user.id).neq('status','DONE');if(error)return;const n=count||0;if(nav&&n){const badge=nav.querySelector('#badgeOnboarding');badge.innerHTML=`<span class="nav-count yellow">${Math.min(n,99)}</span>`;nav.setAttribute('aria-label',`${n} uferdige rolleintroduksjonssteg`)}}
catch(e){console.warn('[AidMe VIDA onboarding/CRM nav]',e)}}
setTimeout(install,80);
})();