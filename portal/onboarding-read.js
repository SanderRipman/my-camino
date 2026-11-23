const client=supabase.createClient('https://ibloovohuhrceivrvhvn.supabase.co','sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv');
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const params=new URLSearchParams(location.search),itemId=params.get('item')||'';
let item=null;
const back='./onboarding.html#item-'+encodeURIComponent(itemId);
$('#backIntro').href=back;$('#doneBack').href=back;
function problem(title,message){
 $('#readMessage').classList.remove('hidden');$('#readMessage').innerHTML='<h2>'+esc(title)+'</h2><p>'+esc(message)+'</p>';
 $('#readCard').classList.add('hidden');
}
function render(data){
 const v=window.AIDME_ONBOARDING_REFERENCE?.resolve(item);
 if(!v){problem('Innholdet mangler','Dette rollepunktet har ennå ikke et faglig godkjent lesekort. Det kan ikke bekreftes ferdig. Meld fra til administrator.');return}
 $('#readTitle').textContent=item.title_no;
 $('#readRole').textContent='Relevant informasjon for rollen din – '+(item.role_code||'')+'. Bare aktive, tildelte rollepunkt kan åpnes.';
 $('#readLead').textContent=v.lead;
 $('#readPoints').innerHTML=v.points.map(s=>'<li>'+esc(s)+'</li>').join('');
 const src=v.sourceDetails;
 $('#sourceLinks').innerHTML=src.map(s=>'<a class="context-link" target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.label)+' ↗</a>').join('');
 $('#readCard').classList.remove('hidden');
 if(item.status==='DONE'){
  $('#readConfirm').classList.add('hidden');$('#alreadyDone').classList.remove('hidden');
 }else{
  $('#readConfirm').classList.remove('hidden');$('#alreadyDone').classList.add('hidden');
 }
}
async function init(){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)){
  problem('Ugyldig lenke','Åpne et konkret introduksjonspunkt fra din rolleintroduksjon.');return;
 }
 const {data:{session}}=await client.auth.getSession();
 if(!session){location.replace('./');return}
 const {data:aal,error:ae}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
 if(ae||aal?.currentLevel!=='aal2'){
  $('#aalPill').textContent='AAL2 kreves';
  problem('Bekreft tofaktor','Gå tilbake til portalen og bekreft Authenticator før du leser rolleintroduksjonen.');return;
 }
 $('#aalPill').textContent='AAL2 · bekreftet';$('#aalPill').classList.add('secure');
 const {data,error}=await client.functions.invoke('onboarding-command',{body:{action:'LIST'}});
 if(error||!data?.ok){problem('Kunne ikke kontrollere tilgangen','Prøv igjen fra din rolleintroduksjon.');return}
 item=(data.items||[]).find(x=>x.id===itemId);
 if(!item){problem('Ingen tilgang til dette punktet','Punktet tilhører ikke en aktiv rolle som er tildelt denne innloggede kontoen.');return}
 render(data);
}
$('#readChecked').addEventListener('change',()=>{$('#readSubmit').disabled=!$('#readChecked').checked});
$('#readConfirm').addEventListener('submit',async e=>{
 e.preventDefault();
 if(!item||item.status==='DONE'||!$('#readChecked').checked)return;
 const btn=$('#readSubmit');btn.disabled=true;$('#saveStatus').textContent='Lagrer din bekreftelse …';
 try{
  const {data,error}=await client.functions.invoke('onboarding-command',{body:{action:'COMPLETE',itemId:item.id,confirmed:true}});
  if(error||!data?.ok||data?.item?.id!==item.id||data?.item?.status!=='DONE'){
   $('#saveStatus').textContent='Bekreftelsen ble ikke lagret. Prøv igjen fra rolleintroduksjonen.';return;
  }
  location.assign(back);
 }catch{ $('#saveStatus').textContent='Kunne ikke bekrefte lagring. Ingen ny bekreftelse er forutsatt.'}
 finally{btn.disabled=!$('#readChecked').checked}
});
init();