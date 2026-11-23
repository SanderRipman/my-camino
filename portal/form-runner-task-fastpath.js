(()=>{
'use strict';

const q=new URLSearchParams(location.search),requestedParticipant=q.get('participant'),requestedPilot=q.get('pilot'),requestedKey=q.get('key');
if(!requestedKey||(!requestedParticipant&&!requestedPilot))return;
// A submitted VÍA review is a read-only RLS read, not a staff ownership/assignment command.
// The previous LIST_CONTEXT path unnecessarily loaded eligible staff and assessments
// before the reviewer could see an already submitted form.
const scopedViaReadOnly=requestedKey==='via_roadmap'&&q.get('latest')==='1'&&!!requestedParticipant;
const shortRetry=ms=>new Promise(resolve=>setTimeout(resolve,Math.min(ms,350)));

const marker=document.createElement('section');
marker.id='taskFastLoading';
marker.className='panel-card';
marker.textContent=requestedParticipant?'Laster valgt deltaker og skjema…':'Laster valgt pilot og skjema…';
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
function showSecurityStep(){
  marker?.classList.add('hidden');
  const blocked=document.querySelector('#blocked'),text=document.querySelector('#blockedText'),link=blocked?.querySelector('a.primary');
  document.querySelector('#runner')?.classList.add('hidden');
  if(blocked)blocked.classList.remove('hidden');
  if(text)text.textContent='Versjonerte programskjema krever at denne innloggingen er bekreftet med Authenticator.';
  if(link){link.href='./#security';link.textContent='Bekreft Authenticator og fortsett'}
}
async function bounded(promise,ms=10000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('FORM_TASK_BOOTSTRAP_TIMEOUT')),ms)})])}finally{clearTimeout(timer)}}

async function bootstrap(){
  try{
    const sessionRes=await bounded(client.auth.getSession(),8000);
    session=sessionRes?.data?.session||null;if(!session){location.replace('./');return}
    const aal=await bounded(client.auth.mfa.getAuthenticatorAssuranceLevel(),8000);
    const aal2=aal.data?.currentLevel==='aal2';
    $('#securityPill').textContent=aal2?'AAL2 · bekreftet':'AAL1 · utilstrekkelig';$('#securityPill').classList.toggle('secure',aal2);$('#securityPill').classList.toggle('attention',!aal2);
    if(!aal2){showSecurityStep();return}

    const uid=session.user.id;
    const gRes=await bounded(retryFormRead(()=>client.from('role_grants').select('id,organization_id,role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',uid),shortRetry),8000);
    if(gRes.error){showFailure('Tilgangskonteksten kunne ikke kontrolleres. Ingen data er endret. Gå tilbake og prøv igjen.');return}
    const preflightGrants=gRes.data||[];

    if(!preflightGrants.some(active)){
      marker?.classList.add('hidden');
      if(!initPromise)await init();
      return;
    }

    const seq=++initSeq;initPromise=null;grants=preflightGrants;

    if(!requestedParticipant&&requestedPilot){
      const [dRes,vRes,pilotRes,ppRes]=await bounded(Promise.all([
        client.from('form_definitions').select('id,key,title_no,scope').order('created_at'),
        client.from('form_versions').select('id,form_definition_id,version,schema_json,published_at,retired_at').order('version',{ascending:false}),
        client.from('pilots').select('id,organization_id,name,status,route_name,start_date,end_date').order('start_date',{ascending:false}),
        client.from('pilot_participants').select('pilot_id,participant_id,status')
      ]),12000);if(seq!==initSeq)return;
      definitions=dRes.data||[];versions=vRes.data||[];pilots=pilotRes.data||[];pilotParticipants=ppRes.data||[];participants=[];
      if(dRes.error||vRes.error||pilotRes.error||ppRes.error||!pilots.some(p=>p.id===requestedPilot)){
        showFailure('Valgt pilotskjema eller pilotkontekst kunne ikke lastes. Ingen data er endret. Gå tilbake til portalen og prøv igjen.');return;
      }
      $('#runner').classList.remove('hidden');$('#blocked').classList.add('hidden');
      fillParticipants();fillPilots();fillForms();if(!applyQuery()){marker?.classList.add('hidden');return}
      await bounded(chooseForm(),12000);if(seq!==initSeq)return;
      marker?.classList.add('hidden');
      return;
    }

    const [dRes,vRes,pilotRes,ppRes,ctxRes]=await bounded(Promise.all([
      retryFormRead(()=>client.from('form_definitions').select('id,key,title_no,scope').order('created_at'),shortRetry),
      retryFormRead(()=>client.from('form_versions').select('id,form_definition_id,version,schema_json,published_at,retired_at').order('version',{ascending:false}),shortRetry),
      retryFormRead(()=>client.from('pilots').select('id,organization_id,name,status,route_name,start_date,end_date').order('start_date',{ascending:false}),shortRetry),
      retryFormRead(()=>client.from('pilot_participants').select('pilot_id,participant_id,status'),shortRetry),
      scopedViaReadOnly
        ?retryFormRead(()=>client.from('participants').select('id,organization_id,code_name,stage,active').eq('id',requestedParticipant).eq('active',true).maybeSingle(),shortRetry)
        :client.functions.invoke('case-command',{body:{action:'LIST_CONTEXT',participantId:requestedParticipant}})
    ]),11000);if(seq!==initSeq)return;

    definitions=dRes.data||[];versions=vRes.data||[];pilots=pilotRes.data||[];pilotParticipants=ppRes.data||[];
    const ctx=scopedViaReadOnly?{participant:ctxRes?.data||null,pilot:null}:ctxRes?.data;
    if(dRes.error||vRes.error||pilotRes.error||ppRes.error||ctxRes?.error||ctx?.error||!ctx?.participant){showFailure('Valgt skjema eller deltakerkontekst kunne ikke lastes med din tilgang. Ingen data er endret. Gå tilbake til oppgaven og prøv igjen.');return}
    // The participant is resolved by the caller's own Supabase RLS; never fabricate
    // it from the URL or a privileged service client. Require the competent role too.
    if(scopedViaReadOnly&&!grants.some(g=>active(g)
      &&g.organization_id===ctx.participant.organization_id
      &&(!g.participant_id||g.participant_id===requestedParticipant)
      &&(!g.pilot_id||pilotParticipants.some(pp=>pp.participant_id===requestedParticipant&&pp.pilot_id===g.pilot_id&&pp.status==='ACTIVE'))
      &&['via_owner','clinical_professional'].includes(g.role_code))){
      showFailure('Du har ikke en aktiv VÍA-fagrolle for denne deltakeren. Ingen data er endret.');return;
    }
    const org=scopedViaReadOnly?ctx.participant.organization_id:(grants.find(active)?.organization_id||pilots.find(p=>p.id===ctx.pilot?.id)?.organization_id||null);
    participants=[{id:ctx.participant.id,organization_id:org,code_name:ctx.participant.code_name,stage:ctx.participant.stage,user_id:null,active:true}];
    if(ctx.pilot?.id&&!pilotParticipants.some(x=>x.participant_id===requestedParticipant&&x.pilot_id===ctx.pilot.id&&x.status==='ACTIVE'))pilotParticipants.push({pilot_id:ctx.pilot.id,participant_id:requestedParticipant,status:'ACTIVE'});

    // Never expose form-edit actions for a submitted VÍA review, even while the
    // read-only history panel is still loading through the caller's RLS.
    if(scopedViaReadOnly){
      document.querySelector('.runner-card')?.classList.add('hidden');
      document.querySelector('#saveDraft')?.setAttribute('disabled','');
      document.querySelector('#dynamicForm button[type="submit"]')?.setAttribute('disabled','');
    }
    $('#runner').classList.remove('hidden');$('#blocked').classList.add('hidden');
    fillParticipants();fillPilots();fillForms();if(!applyQuery()){marker?.classList.add('hidden');return}
    syncPilotFromParticipant();await bounded(chooseForm(),12000);if(seq!==initSeq)return;
    marker?.classList.add('hidden');
  }catch(error){
    showFailure('Skjemaet svarte ikke innen fristen. Ingen data er endret. Gå tilbake til portalen og prøv igjen.');
  }
}

bootstrap();
})();