import { createClient } from 'npm:@supabase/supabase-js@2'

function cors(req:Request){
 const o=req.headers.get('origin')??'',ok=o==='https://my.aidme.no'||o==='http://localhost:8888'||o==='http://localhost:3000'||/^https:\/\/(?:deploy-preview-\d+--|[a-z0-9-]+--)?mycamino\.netlify\.app$/.test(o)
 return{'Access-Control-Allow-Origin':ok?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}
}
function claims(t:string){const p=t.split('.')[1];if(!p)return{} as Record<string,unknown>;const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4))) as Record<string,unknown>}
async function canManage(admin:any,userId:string,orgId:string){
 const now=new Date().toISOString()
 const {data:g,error}=await admin.from('role_grants').select('role_code,valid_from,valid_until,revoked_at,participant_id,pilot_id').eq('user_id',userId).eq('organization_id',orgId);if(error)throw error
 const roles=[...new Set((g??[]).filter((x:any)=>!x.revoked_at&&!x.participant_id&&!x.pilot_id&&(!x.valid_from||x.valid_from<=now)&&(!x.valid_until||x.valid_until>now)).map((x:any)=>x.role_code))]
 if(!roles.length)return false
 const {count,error:pe}=await admin.from('role_permissions').select('role_code',{head:true,count:'exact'}).in('role_code',roles).eq('capability','manage_intakes');if(pe)throw pe
 return(count??0)>0
}
function text(v:unknown,max:number){return String(v??'').trim().replace(/\s+/g,' ').slice(0,max)}

Deno.serve(async(req:Request)=>{
 const headers=cors(req)
 if(req.method==='OPTIONS')return new Response('ok',{headers})
 if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
 try{
  const ah=req.headers.get('Authorization')??'',token=ah.replace(/^Bearer\s+/i,'')
  if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  if(claims(token).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
  const pk=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,sk=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
  if(!pk||!sk)throw new Error('Missing keys')
  const uc=createClient(Deno.env.get('SUPABASE_URL')!,pk,{global:{headers:{Authorization:ah}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,sk,{auth:{persistSession:false}})
  const {data:u,error:ue}=await uc.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  const body=await req.json(),action=String(body?.action??'').toUpperCase()
  const {data:org,error:oe}=await admin.from('organizations').select('id').eq('name','AidMe VIDA').limit(1).maybeSingle();if(oe||!org)throw oe??new Error('Organization missing')
  if(!await canManage(admin,u.user.id,org.id))return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})

  if(action==='LIST'){
   const statuses=Array.isArray(body?.statuses)?body.statuses.map((x:any)=>String(x)):['NEW','TRIAGE']
   const {data,error}=await admin.from('intakes').select('id,status,source,contact_name,contact_email,contact_phone,interest_type,preferred_contact,locale,interest_text,privacy_notice_version,received_at,triage_owner,triage_summary,participant_id').eq('organization_id',org.id).in('status',statuses).order('received_at',{ascending:false}).limit(Math.min(100,Math.max(1,Number(body?.limit)||30)))
   if(error)throw error
   return new Response(JSON.stringify({ok:true,intakes:data??[]}),{headers})
  }

  const intakeId=String(body?.intakeId??'').trim()
  if(!intakeId)return new Response(JSON.stringify({error:'INTAKE_ID_REQUIRED'}),{status:400,headers})
  const {data:intake,error:ie}=await admin.from('intakes').select('*').eq('id',intakeId).eq('organization_id',org.id).maybeSingle();if(ie||!intake)return new Response(JSON.stringify({error:'INTAKE_NOT_FOUND'}),{status:404,headers})

  if(action==='TRIAGE'){
   const status=String(body?.status??'TRIAGE').toUpperCase();if(!['TRIAGE','REFERRED','CLOSED'].includes(status))return new Response(JSON.stringify({error:'INVALID_TRIAGE_STATUS'}),{status:400,headers})
   const summary=body?.summary?String(body.summary).trim():null
   const {data,error}=await admin.from('intakes').update({status,triage_owner:u.user.id,triage_summary:summary,updated_at:new Date().toISOString()}).eq('id',intakeId).select('id,status,triage_owner,triage_summary').single();if(error)throw error
   if(status==='REFERRED'||status==='CLOSED')await admin.from('tasks').update({status:'DONE',updated_at:new Date().toISOString()}).eq('source_type','intake').eq('source_id',intakeId).in('status',['OPEN','IN_PROGRESS','WAITING'])
   await admin.from('workflow_events').insert({organization_id:org.id,actor_user_id:u.user.id,event_type:'INTAKE_TRIAGED',source_type:'intake',source_id:intakeId,metadata:{status}})
   return new Response(JSON.stringify({ok:true,intake:data}),{headers})
  }

  if(action==='CONFIRM_REFERRAL'){
   if(String(intake.interest_type||'').toUpperCase()!=='REFERRAL')return new Response(JSON.stringify({error:'NOT_A_REFERRAL'}),{status:409,headers})
   // This is a staff attestation that the person wants direct contact, not the participant's formal programme consent.
   // Accept the legacy consentConfirmed flag temporarily so an older portal client cannot break during rollout.
   const contactWillingnessConfirmed=body?.contactWillingnessConfirmed===true||body?.consentConfirmed===true
   if(!contactWillingnessConfirmed)return new Response(JSON.stringify({error:'PARTICIPANT_CONTACT_WILLINGNESS_REQUIRED'}),{status:400,headers})
   const participant=body?.participant||{},name=text(participant.name,120),email=text(participant.email,254).toLowerCase(),phone=text(participant.phone,40),preferred=String(participant.preferredContact||'EMAIL').toUpperCase()
   if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['EMAIL','PHONE'].includes(preferred)||(preferred==='PHONE'&&!phone))return new Response(JSON.stringify({error:'INVALID_PARTICIPANT_CONTACT'}),{status:400,headers})
   const now=new Date().toISOString()
   const {data:newIntake,error:createError}=await admin.from('intakes').insert({organization_id:org.id,source:'REFERRAL_CONFIRMED',status:'NEW',contact_name:name,contact_email:email,contact_phone:phone||null,interest_type:'PARTICIPANT',preferred_contact:preferred,locale:intake.locale||'nb',interest_text:`Direkte kontakt etter henvisning ${intake.id}`,privacy_notice_version:'staff-referral-confirmed-v0.1-2026-08-22'}).select('id,status,source,contact_name,contact_email,contact_phone,interest_type,preferred_contact,locale,interest_text,received_at').single()
   if(createError)throw createError
   const existingSummary=text(intake.triage_summary,800),summary=[existingSummary,`Direkte deltakerkontakt bekreftet og opprettet som ny interesse ${newIntake.id}.`].filter(Boolean).join(' ')
   const {error:closeError}=await admin.from('intakes').update({status:'CLOSED',triage_owner:u.user.id,triage_summary:summary,updated_at:now}).eq('id',intakeId);if(closeError)throw closeError
   await admin.from('tasks').update({status:'DONE',updated_at:now}).eq('source_type','intake').eq('source_id',intakeId).in('status',['OPEN','IN_PROGRESS','WAITING'])
   await admin.from('workflow_events').insert({organization_id:org.id,actor_user_id:u.user.id,event_type:'REFERRAL_CONFIRMED_TO_PARTICIPANT_INTEREST',source_type:'intake',source_id:intakeId,metadata:{participant_intake_id:newIntake.id,contact_willingness_attested_by_staff:true,formal_participant_consent_recorded:false}})
   return new Response(JSON.stringify({ok:true,intake:newIntake}),{status:201,headers})
  }

  if(action==='CONVERT_TO_VIA'){
   if(String(intake.interest_type||'PARTICIPANT').toUpperCase()==='REFERRAL')return new Response(JSON.stringify({error:'REFERRAL_REQUIRES_PARTICIPANT_CONFIRMATION'}),{status:409,headers})
   if(intake.participant_id)return new Response(JSON.stringify({ok:true,participantId:intake.participant_id,alreadyConverted:true}),{headers})
   const codeName=String(body?.codeName??'').trim();if(!/^[A-Za-zÆØÅæøå0-9][A-Za-zÆØÅæøå0-9 _-]{2,39}$/.test(codeName))return new Response(JSON.stringify({error:'INVALID_CODE_NAME'}),{status:400,headers})
   const targetUserId=body?.targetUserId?String(body.targetUserId):null
   if(targetUserId){const {data:authUser}=await admin.auth.admin.getUserById(targetUserId);if(!authUser?.user)return new Response(JSON.stringify({error:'TARGET_USER_NOT_FOUND'}),{status:400,headers})}
   const {data:p,error:pe}=await admin.from('participants').insert({organization_id:org.id,user_id:targetUserId,code_name:codeName,stage:'VIA',active:true,created_by:u.user.id}).select('id,code_name,stage,user_id').single();if(pe)throw pe
   await admin.from('intakes').update({participant_id:p.id,status:targetUserId?'VIA_STARTED':'INVITED',triage_owner:u.user.id,updated_at:new Date().toISOString()}).eq('id',intakeId)
   await admin.from('tasks').update({status:'DONE',updated_at:new Date().toISOString()}).eq('source_type','intake').eq('source_id',intakeId).in('status',['OPEN','IN_PROGRESS','WAITING'])
   const {data:owner}=await admin.from('role_grants').select('user_id,role_code,created_at').eq('organization_id',org.id).in('role_code',['via_owner','program_lead']).is('revoked_at',null).order('created_at',{ascending:false}).limit(1).maybeSingle()
   if(owner?.user_id){const {data:t,error:te}=await admin.from('tasks').insert({organization_id:org.id,participant_id:p.id,title:'VÍA – første avklaring etter interesse',description:'Ta kontakt, bekreft frivillighet og avklar riktig neste steg i VÍA.',status:'OPEN',assignee_user_id:owner.user_id,due_at:new Date(Date.now()+86400000).toISOString(),priority:2,severity:'YELLOW',task_type:'WORKFLOW',created_by:u.user.id,audience:'STAFF',workflow_key:'via_first_contact',source_type:'intake',source_id:intakeId}).select('id').single();if(!te&&t)await admin.from('notifications').insert({user_id:owner.user_id,task_id:t.id,kind:'TASK',title:'Ny oppgave',safe_preview:'Du har en ny oppgave i AidMe VIDA.'})}
   if(targetUserId){const {data:t}=await admin.from('tasks').insert({organization_id:org.id,participant_id:p.id,title:'Min VÍA – start her',description:'Les kort informasjon og fullfør første steg når du er klar.',status:'OPEN',assignee_user_id:targetUserId,due_at:new Date(Date.now()+3*86400000).toISOString(),priority:3,severity:'GREEN',task_type:'WORKFLOW',created_by:u.user.id,audience:'PARTICIPANT',workflow_key:'participant_via_start',source_type:'intake',source_id:intakeId}).select('id').single();if(t)await admin.from('notifications').insert({user_id:targetUserId,task_id:t.id,kind:'TASK',title:'Nytt steg',safe_preview:'Du har et nytt steg i AidMe VIDA.'})}
   await admin.from('workflow_events').insert({organization_id:org.id,participant_id:p.id,actor_user_id:u.user.id,event_type:'INTAKE_CONVERTED_TO_VIA',from_stage:'INTEREST',to_stage:'VIA',source_type:'intake',source_id:intakeId,metadata:{account_linked:!!targetUserId}})
   return new Response(JSON.stringify({ok:true,participant:p}),{headers})
  }
  return new Response(JSON.stringify({error:'UNKNOWN_ACTION'}),{status:400,headers})
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'INTAKE_COMMAND_FAILED'}),{status:500,headers})}
})
