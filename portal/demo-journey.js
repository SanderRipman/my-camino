const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
let session=null,submitting=false,created=false;
async function boot(){
  const {data:{session:s}}=await client.auth.getSession();
  session=s;
  if(!session){location.replace('./');return}
  const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aal.data?.currentLevel!=='aal2'){
    $('#message').textContent='Bekreft Authenticator i portalen før du starter en demo-reise.';
    $('#demoForm button').disabled=true;
  }
}
$('#demoForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if(submitting||created)return;
  const button=$('#demoForm button[type="submit"]');
  submitting=true;button.disabled=true;
  $('#message').textContent='Lagrer fiktiv interesse for Mina Test…';
  try{
    const {data,error}=await client.functions.invoke('demo-create-interest',{body:{scenario:$('#scenario').value}});
    if(error||data?.error){
      const code=data?.error||error?.context?.status||'UNKNOWN';
      const messages={
        MFA_REQUIRED:'Bekreft Authenticator (AAL2) og prøv igjen.',
        FORBIDDEN:'Denne kontoen mangler mottaks-/administratorrettigheter på organisasjonsnivå.',
        ORIGIN_NOT_ALLOWED:'Testmiljøet er ikke godkjent som kilde.',
        UNAUTHORIZED:'Logg inn på nytt og bekreft AAL2.'
      };
      $('#message').textContent=messages[code]||'Kunne ikke lagre testinteressen (kode: '+String(code).slice(0,60)+'). Meld dette som et UAT-avvik.';
      button.disabled=false;
      return;
    }
    const id=String(data?.intake?.id||'');
    if(!/^[0-9a-f-]{36}$/i.test(id)){
      $('#message').textContent='Interessen ble behandlet, men kvitteringen mangler saks-ID. Ikke send på nytt før mottaket er kontrollert.';
      return;
    }
    created=true;
    const link=document.createElement('a');
    link.href='./intake.html?intake='+encodeURIComponent(id);
    link.textContent='Åpne Mina Test i mottak →';
    $('#message').textContent='Mina Test er lagret som en syntetisk interesse. Ingen e-post er sendt. ';
    $('#message').appendChild(link);
    button.textContent='Fiktiv interesse lagret';
  }catch{
    $('#message').textContent='Nettverksfeil. Kontroller mottaket før du eventuelt prøver igjen.';
    button.disabled=false;
  }finally{submitting=false}
});
boot().catch(()=>{$('#message').textContent='Demo-laboratoriet kunne ikke startes.'});
