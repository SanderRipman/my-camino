(()=>{
'use strict';

// Focused, read-only staff viewer. Supabase RLS remains the final authority.
const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const params=new URLSearchParams(location.search);
const participantId=params.get('participant')||'';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const main=document.querySelector('.via-view');
const status=document.getElementById('viaStatus');
const security=document.getElementById('viaSecurity');
const review=document.getElementById('viaReview');
let finished=false;
let expired=false;
const returnTask=params.get('returnTask')||'';
const returnView=params.get('returnView')==='overview'?'overview':'tasks';
const backHref=uuid.test(returnTask)?'./?'+new URLSearchParams({returnTask,returnView}):'./#tasks';
for(const id of ['viaBackTop','viaBackBottom'])document.getElementById(id).href=backHref;

function setStatus(message,state='error'){
  if(expired&&state==='ready')return;
  status.textContent=message;status.dataset.state=state;
  if(state!=='loading'){main.setAttribute('aria-busy','false');finished=true;}
}
function deny(reason,securityRequired=false){
  if(expired)return;
  review.hidden=true;
  setStatus(reason,'error');
  if(securityRequired){
    const link=document.createElement('a');
    link.href='./#security';link.textContent='Gå til sikkerhetsbekreftelse';
    security.replaceChildren(link);
  }
}
function allowedGrant(grant,person,pilotIds){
  const now=Date.now();
  if(grant.revoked_at)return false;
  if(grant.valid_from&&Date.parse(grant.valid_from)>now)return false;
  if(grant.valid_until&&Date.parse(grant.valid_until)<=now)return false;
  if(grant.organization_id!==person.organization_id)return false;
  if(!['via_owner','clinical_professional'].includes(grant.role_code))return false;
  if(grant.participant_id&&grant.participant_id!==person.id)return false;
  if(grant.pilot_id&&!pilotIds.includes(grant.pilot_id))return false;
  return true;
}
function withTimeout(promise,ms=6500){
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('TIMEOUT')),ms)})
  ]).finally(()=>clearTimeout(timer));
}
async function query(read){
  let response=await withTimeout(read());
  for(const delay of [450,800]){
    if(response?.status!==401||response?.error?.code!=='PGRST303')break;
    await withTimeout(new Promise(resolve=>setTimeout(resolve,delay)),2000);
    response=await withTimeout(read());
  }
  if(response?.error)throw new Error('UNAVAILABLE');
  return response?.data;
}
function formatDate(date){
  const d=date?new Date(date):null;
  return d&&!Number.isNaN(d.getTime())
    ?new Intl.DateTimeFormat('nb-NO',{dateStyle:'medium',timeStyle:'short'}).format(d):'Ukjent dato';
}
function printable(value){
  if(value==null||value==='')return'Ikke oppgitt';
  if(Array.isArray(value))return value.length?value.map(x=>String(x).replaceAll('_',' ')).join(', '):'Ikke oppgitt';
  if(typeof value==='boolean')return value?'Ja':'Nei';
  if(typeof value==='object'){
    const parts=[];
    if(value.action)parts.push('Handling: '+value.action);
    if(value.support)parts.push('Støtte/eier: '+value.support);
    if(value.deadline)parts.push('Frist: '+value.deadline);
    return parts.length?parts.join(' · '):'Ikke oppgitt';
  }
  return String(value).replaceAll('_',' ');
}
function element(tag,css,text){
  const node=document.createElement(tag);
  if(css)node.className=css;
  if(text!==undefined)node.textContent=String(text);
  return node;
}
function render(person,definition,version,submission){
  const header=element('div','card-head');
  const meta=element('div','');
  meta.append(
    element('p','eyebrow','Fullført · skrivebeskyttet'),
    element('h2','',definition.title_no||'VÍA-veikart'),
    element('p','',person.code_name+' · '+formatDate(submission.submitted_at||submission.updated_at)+' · mal v'+version.version)
  );
  header.append(meta);
  review.append(
    header,
    element('p','privacy-note','Dette er den lagrede innsendte versjonen. Den kan ikke endres her. Formell GO/NO-GO behandles som et eget steg.')
  );
  const sections=version.schema_json?.sections||[];
  for(const section of sections){
    const card=element('section','form-section review-section');
    card.append(element('h3','',section.title||'Del'));
    for(const field of section.fields||[]){
      const item=element('div','via-field');
      item.append(element('strong','',field.label||field.key),element('div','review-value',printable(submission.payload?.[field.key])));
      card.append(item);
    }
    review.append(card);
  }
  review.hidden=false;
  main.setAttribute('aria-busy','false');
  setStatus('Fullført veikart er åpnet i skrivebeskyttet visning.','ready');
}

async function start(){
  if(params.get('key')!=='via_roadmap'||params.get('latest')!=='1'||!uuid.test(participantId)){
    deny('Ugyldig eller manglende oppgave-/skjemakontekst. Ingen data er endret.');
    return;
  }
  if(!window.supabase?.createClient){
    deny('Innloggingsbiblioteket ble ikke lastet. Gå tilbake til oppgaven og prøv igjen.');
    return;
  }
  const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  try{
    const session=await withTimeout(db.auth.getSession(),6500);
    if(!session?.data?.session?.user?.id){
      deny('Innloggingen er ikke lenger aktiv. Logg inn på portalen igjen, og åpne oppgaven på nytt.');
      return;
    }
    const aal=await withTimeout(db.auth.mfa.getAuthenticatorAssuranceLevel(),6500);
    if(aal?.data?.currentLevel!=='aal2'){
      deny('Sensitive VÍA-veikart krever bekreftet AAL2 for denne innloggingen.',true);
      return;
    }
    const person=await query(()=>db.from('participants')
      .select('id,organization_id,code_name,active')
      .eq('id',participantId).eq('active',true).maybeSingle());
    if(!person){deny('Deltakeren kan ikke åpnes med denne kontoens rettigheter.');return;}
    const grants=await query(()=>db.from('role_grants')
      .select('organization_id,role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at')
      .eq('user_id',session.data.session.user.id));
    // Pilot-only staff grants need an actual, RLS-visible active membership.
    const candidates=(grants||[]).filter(g=>g.pilot_id&&g.organization_id===person.organization_id);
    let pilotIds=[];
    if(candidates.length){
      const memberships=await query(()=>db.from('pilot_participants')
        .select('pilot_id,status').eq('participant_id',person.id).eq('status','ACTIVE'));
      pilotIds=(memberships||[]).map(p=>p.pilot_id);
    }
    if(!(grants||[]).some(g=>allowedGrant(g,person,pilotIds))){
      deny('Du har ingen aktiv, kvalifisert VÍA-fagrolle med riktig deltakerscope. Ingen data er endret.');return;
    }
    const definition=await query(()=>db.from('form_definitions')
      .select('id,key,title_no').eq('key','via_roadmap').maybeSingle());
    if(!definition){deny('VÍA-skjemadefinisjonen er ikke tilgjengelig.');return;}
    const versions=await query(()=>db.from('form_versions')
      .select('id,form_definition_id,version,schema_json,published_at,retired_at')
      .eq('form_definition_id',definition.id));
    if(!versions?.length){deny('Ingen lesbar skjemaversjon er tilgjengelig.');return;}
    const versionIds=versions.map(v=>v.id);
    // RLS-protected. No service-role token or direct writes.
    const submission=await query(()=>db.from('form_submissions')
      .select('id,participant_id,form_version_id,status,submitted_at,updated_at,payload')
      .eq('participant_id',person.id).in('form_version_id',versionIds)
      .eq('status','SUBMITTED').order('submitted_at',{ascending:false})
      .limit(1).maybeSingle());
    if(!submission){
      deny('Ingen fullført VÍA-registrering er lesbar med denne kontoens tilgang. Skjemaet åpnes ikke for redigering.');return;
    }
    const version=versions.find(v=>v.id===submission.form_version_id);
    if(!version){deny('Den innsendte skjemaversjonen kunne ikke verifiseres.');return;}
    render(person,definition,version,submission);
  }catch{
    deny('Tilgangen eller registreringen svarte ikke som forventet. Ingen data er endret. Gå tilbake til oppgaven og prøv igjen.');
  }
}
setTimeout(()=>{
  if(!finished){
    expired=true;
    review.hidden=true;
    main.setAttribute('aria-busy','false');
    status.dataset.state='error';
    status.textContent='Åpningen tok for lang tid. Ingen data er endret. Velg Tilbake til oppgaven.';
  }
},15000);
start();
})();
