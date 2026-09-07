(()=>{
'use strict';

const q=new URLSearchParams(location.search),requestedParticipant=q.get('participant'),requestedKey=q.get('key');
if(!requestedParticipant||!requestedKey)return;

const marker=document.createElement('section');
marker.id='taskFastLoading';
marker.className='panel-card';
marker.textContent='Laster valgt deltaker og skjema…';
const workspace=document.querySelector('.workspace');
workspace?.insertBefore(marker,document.querySelector('#blocked'));

function showFailure(message){
  marker?.classList.add('hidden');
  const blocked=document.querySelector('#blocked'),text=document.querySelector('#blockedText');
  document.querySelector('#runner')?.classList.add('hidden');
  if(blocked)blocked.classList.remove('hidden');
  if(text)text.textContent=message;
  const link=blocked?.querySelector('a.primary');
  if(link){link.href=requestedContextReturnHref(q);link.textContent=q.get('returnTask')?'Tilbake til oppgaven':'Tilbake til portalen'}
}
async function bounded(promise,ms=10000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('FORM_TASK_BOOTSTRAP_TIMEOUT')),ms)})])}finally{clearTimeout(timer)}}

async function bootstrap(){
  try{
    // First determine whether this is a staff task route. Participant routes must stay on
    // the ordinary caller-RLS bootstrap; LIST_CONTEXT is intentionally a staff/capability path.
    // Do not invalidate the broad init until we know the signed-in user actually has staff grants.
    const sessionRes=await bounded(client.auth.getSession(),8000);
    session=sessionRes?.data?.session||null;if(!session){location.replace('./');return}
    const aal=await bounded(client.auth.mfa.getAuthenticatorAssuranceLevel(),8000);
    const aal2=aal.data?.currentLevel==='aal2';
    $('#securityPill').textContent=aal2?'AAL2 · bekreftet':'AAL1 · utilstrekkelig';$('#securityPill').classList.toggle('secure',aal2);$('#securityPill').classList.toggle('attention',!aal2);
    if(!aal2){showFailure('Versjonerte programskjema krever at denne innloggingen er bekreftet med Authenticator.');return}

    const uid=session.user.id;
    const gRes=await bounded(client.from('role_grants').select('id,organization_id,role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',uid),8000);
    if(gRes.error){showFailure('Tilgangskonteksten kunne ikke kontrolleres. Ingen data er endret. Gå tilbake og prøv igjen.');return}
    const preflightGrants=gRes.data||[];

    if(!preflightGrants.some(active)){
      // Real participant accounts are already constrained by RLS to their own participant,
      // allowed form definitions/versions and own submissions. Let the standard bootstrap finish.
      marker?.classList.add('hidden');
      if(!initPromise)await init();
      return;
    }

    // Staff task routes benefit from exact server-side context and must not wait on broad participant lists.
    const seq=++initSeq;initPromise=null;grants=preflightGrants;
    const [dRes,vRes,pilotRes,ppRes,ctxRes]=await bounded(Promise.all([
      client.from('form_definitions').select('id,key,title_no,scope').order('created_at'),
      client.from('form_versions').select('id,form_definition_id,version,schema_json,published_at,retired_at').order('version',{ascending:false}),
      client.from('pilots').select('id,organization_id,name,status,route_name,start_date,end_date').order('start_date',{ascending:false}),
      client.from('pilot_participants').select('pilot_id,participant_id,status'),
      client.functions.invoke('case-command',{body:{action:'LIST_CONTEXT',participantId:requestedParticipant}})
    ]),12000);if(seq!==initSeq)return;

    definitions=dRes.data||[];versions=vRes.data||[];pilots=pilotRes.data||[];pilotParticipants=ppRes.data||[];
    const ctx=ctxRes?.data;
    if(dRes.error||vRes.error||pilotRes.error||ppRes.error||ctxRes?.error||ctx?.error||!ctx?.participant){showFailure('Valgt skjema eller deltakerkontekst kunne ikke lastes. Ingen data er endret. Gå tilbake til oppgaven og prøv igjen.');return}
    const org=grants.find(active)?.organization_id||pilots.find(p=>p.id===ctx.pilot?.id)?.organization_id||null;
    participants=[{id:ctx.participant.id,organization_id:org,code_name:ctx.participant.code_name,stage:ctx.participant.stage,user_id:null,active:true}];
    if(ctx.pilot?.id&&!pilotParticipants.some(x=>x.participant_id===requestedParticipant&&x.pilot_id===ctx.pilot.id&&x.status==='ACTIVE'))pilotParticipants.push({pilot_id:ctx.pilot.id,participant_id:requestedParticipant,status:'ACTIVE'});

    $('#runner').classList.remove('hidden');$('#blocked').classList.add('hidden');
    fillParticipants();fillPilots();fillForms();if(!applyQuery()){marker?.classList.add('hidden');return}
    syncPilotFromParticipant();await bounded(chooseForm(),12000);if(seq!==initSeq)return;
    marker?.classList.add('hidden');
  }catch(error){
    showFailure('Skjemaet svarte ikke innen fristen. Ingen data er endret. Gå tilbake til oppgaven og prøv igjen.');
  }
}

bootstrap();
})();