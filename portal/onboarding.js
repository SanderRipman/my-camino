const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s);
const roleNames={system_admin:'Systemadministrator',project_owner:'Prosjekteier',program_lead:'Programleder',via_owner:'VÍA-ansvarlig',clinical_professional:'Relevant fagperson',ser_lead:'SER-/turleder',vida_owner:'VIDA-eier',logistics:'Logistikk / beredskap',observer:'Observatør',evaluator:'Evaluator',break_glass:'Break-glass'};
let items=[];

function esc(v=''){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function showMessage(title,text){const m=$('#message');m.classList.remove('hidden');m.innerHTML=`<h3>${esc(title)}</h3><p>${esc(text)}</p>`}
function statusLabel(s){return s==='DONE'?'Ferdig':s==='IN_PROGRESS'?'I gang':s==='WAIVED'?'Frafalt':'Ikke startet'}
function itemMarkup(x){
 const done=x.status==='DONE',href='./onboarding-read.html?item='+encodeURIComponent(x.id);
 return `<article id="item-${esc(x.id)}" class="onboarding-item ${done?'done':''}" data-item="${esc(x.id)}">
 <div class="item-state"><span class="state-dot"></span><small>${statusLabel(x.status)}</small></div>
 <div class="item-copy"><h3>${esc(x.title_no)}</h3><p>${esc(x.description_no||'')}</p>
 <a class="context-link" href="${esc(href)}">${done?'Les innholdet på nytt':'Les og bekreft her'} →</a></div>
 <div class="item-action">${done?'<span class="done-pill">✓ Ferdig</span>':'<span class="pending-pill">Må leses og bekreftes</span>'}</div>
 </article>`;
}
function render(){const grouped=new Map();for(const x of items){if(!grouped.has(x.role_code))grouped.set(x.role_code,[]);grouped.get(x.role_code).push(x)}let html='';for(const [role,rows] of grouped){html+=`<section class="role-group"><div class="role-head"><div><p class="eyebrow">Rolle</p><h2>${esc(roleNames[role]||role)}</h2></div><span>${rows.filter(x=>x.status==='DONE').length}/${rows.length}</span></div>${rows.map(itemMarkup).join('')}</section>`}$('#onboardingList').innerHTML=html||'<article class="panel-card"><h3>Ingen onboarding-steg er tildelt</h3><p>Nye rolle- eller scope-tildelinger oppretter introduksjonen automatisk. Deltakerløpet bruker egne eksisterende VÍA/SER/VIDA-skjema.</p></article>';const done=items.filter(x=>x.status==='DONE').length,total=items.length;$('#doneCount').textContent=done;$('#totalCount').textContent=total;$('#progressBar').style.width=`${total?Math.round(done/total*100):0}%`;$('#summaryText').textContent=total?(done===total?'Alle tildelte introduksjonssteg er ferdige.':'Les og bekreft ansvarspunktene som gjelder din rolle. Eksisterende skjema og tidligere bekreftelser gjenbrukes.'):'Ingen åpne introduksjonssteg.';const id=location.hash.slice(1);if(/^item-[0-9a-f-]{36}$/i.test(id)){requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'center',behavior:'instant'}))}}
async function init(){const {data:{session}}=await client.auth.getSession();if(!session){location.replace('./');return}const {data:aal,error:ae}=await client.auth.mfa.getAuthenticatorAssuranceLevel();if(ae||aal?.currentLevel!=='aal2'){showMessage('Tofaktor kreves','Rolleintroduksjon for medarbeidere åpnes etter AAL2. Gå tilbake til portalen og bekreft Authenticator.');$('#aalPill').textContent='AAL1 · må bekreftes';return}$('#aalPill').textContent='AAL2 · bekreftet';$('#aalPill').classList.add('secure');const {data,error}=await client.functions.invoke('onboarding-command',{body:{action:'LIST'}});if(error||data?.error){showMessage('Kunne ikke hente introduksjonen','Prøv igjen fra portalen.');return}items=data.items||[];render()}
init();