import { createClient } from 'npm:@supabase/supabase-js@2'

function allowedOrigin(origin:string){return ['https://my.aidme.no','https://main--mycamino.netlify.app','http://localhost:8888','http://localhost:3000'].includes(origin)||/^https:\/\/deploy-preview-\d+--mycamino\.netlify\.app$/.test(origin)}
function cors(req:Request){const o=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigin(o)?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Vary':'Origin','Cache-Control':'no-store'}}
function decodeClaims(token:string){const p=token.split('.')[1];if(!p)return{};const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}
function text(v:any,max:number){if(v==null)return null;const s=String(v).trim();return s?s.slice(0,max):null}

Deno.serve(async(req:Request)=>{
 const headers=cors(req)
 if(req.method==='OPTIONS')return new Response('ok',{headers})
 if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
 try{
  const authHeader=req.headers.get('Authorization')??'',token=authHeader.replace(/^Bearer\s+/i,'')
  if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  const publishable=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
  if(!publishable||!secret)throw new Error('Missing Supabase keys')
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,publishable,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false}})
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}})
  const {data:userData,error:userError}=await userClient.auth.getUser(token)
  if(userError||!userData.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  if((decodeClaims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
  const now=new Date().toISOString(),{data:grants,error:grantError}=await admin.from('role_grants').select('valid_from,valid_until,revoked_at').eq('user_id',userData.user.id).eq('role_code','system_admin')
  if(grantError)throw grantError
  const authorized=(grants??[]).some((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now))
  if(!authorized)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})

  const body=await req.json(),targetUserId=String(body?.targetUserId??'').trim(),codeName=String(body?.codeName??'').trim(),pilotId=body?.pilotId?String(body.pilotId):null,participantId=body?.participantId?String(body.participantId):null
  if(!targetUserId||(!participantId&&(codeName.length<3||codeName.length>40)))return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})
  const {data:authUser,error:authUserError}=await admin.auth.admin.getUserById(targetUserId)
  if(authUserError||!authUser?.user)return new Response(JSON.stringify({error:'TARGET_USER_NOT_FOUND'}),{status:400,headers})
  const {data:org,error:orgError}=await admin.from('organizations').select('id').eq('name','AidMe VIDA').limit(1).maybeSingle()
  if(orgError||!org)throw orgError??new Error('Organization not found')
  const {data:existingForUser,error:existingError}=await admin.from('participants').select('id,code_name,user_id').eq('user_id',targetUserId).maybeSingle()
  if(existingError)throw existingError

  let participant:any=null,linkedExisting=false
  if(participantId){
   const {data:existingParticipant,error:participantError}=await admin.from('participants').select('id,organization_id,user_id,code_name,stage,active').eq('id',participantId).eq('organization_id',org.id).maybeSingle()
   if(participantError)throw participantError
   if(!existingParticipant)return new Response(JSON.stringify({error:'PARTICIPANT_NOT_FOUND'}),{status:404,headers})
   if(existingForUser&&existingForUser.id!==participantId)return new Response(JSON.stringify({error:'USER_ALREADY_PARTICIPANT',participant:existingForUser}),{status:409,headers})
   if(existingParticipant.user_id&&existingParticipant.user_id!==targetUserId)return new Response(JSON.stringify({error:'PARTICIPANT_ALREADY_LINKED'}),{status:409,headers})
   if(existingParticipant.user_id===targetUserId){participant=existingParticipant;linkedExisting=true}
   else{
    const {data:updated,error:updateError}=await admin.from('participants').update({user_id:targetUserId,active:true,updated_at:now}).eq('id',participantId).select('id,code_name,stage,user_id').single()
    if(updateError)throw updateError
    participant=updated;linkedExisting=true
   }
   const {data:intake,error:intakeError}=await admin.from('intakes').select('contact_name,contact_email,contact_phone,preferred_contact,locale').eq('participant_id',participantId).order('received_at',{ascending:false}).limit(1).maybeSingle()
   if(intakeError)throw intakeError
   const {data:identity,error:identityError}=await admin.from('participant_identity').select('legal_name,email,phone,birth_year,preferred_contact_method').eq('participant_id',participantId).maybeSingle()
   if(identityError)throw identityError
   const preferred=String(identity?.preferred_contact_method??intake?.preferred_contact??'').toUpperCase()
   const identityPayload={participant_id:participantId,legal_name:identity?.legal_name??text(intake?.contact_name,160),email:identity?.email??authUser.user.email??text(intake?.contact_email,320),phone:identity?.phone??text(intake?.contact_phone,40),birth_year:identity?.birth_year??null,preferred_contact_method:['EMAIL','PHONE','SMS'].includes(preferred)?preferred:null,updated_at:now}
   if(identityPayload.legal_name||identityPayload.email||identityPayload.phone||identityPayload.preferred_contact_method){const {error:identityUpsertError}=await admin.from('participant_identity').upsert(identityPayload,{onConflict:'participant_id'});if(identityUpsertError)throw identityUpsertError}
   const {error:intakeUpdateError}=await admin.from('intakes').update({status:'VIA_STARTED',updated_at:now}).eq('participant_id',participantId).eq('status','INVITED')
   if(intakeUpdateError)throw intakeUpdateError
   await admin.from('workflow_events').insert({organization_id:org.id,participant_id:participantId,actor_user_id:userData.user.id,event_type:'PARTICIPANT_ACCOUNT_LINKED',from_stage:'VIA',to_stage:'VIA',source_type:'participant_account',source_id:targetUserId,metadata:{existing_via_journey:true}})
   await admin.from('audit_events').insert({organization_id:org.id,actor_user_id:userData.user.id,action:'PARTICIPANT_ACCOUNT_LINKED',resource_type:'participant',resource_id:participantId,purpose:'via_account_invitation',metadata:{target_user_id:targetUserId}})
  }else{
   if(existingForUser)return new Response(JSON.stringify({error:'USER_ALREADY_PARTICIPANT',participant:existingForUser}),{status:409,headers})
   const {data:created,error}=await admin.from('participants').insert({organization_id:org.id,user_id:targetUserId,code_name:codeName,stage:'VIA',active:true,created_by:userData.user.id}).select('id,code_name,stage,user_id').single()
   if(error)throw error
   participant=created
  }

  if(pilotId){const {data:existingPilotLink,error:pilotLookupError}=await admin.from('pilot_participants').select('pilot_id,participant_id').eq('pilot_id',pilotId).eq('participant_id',participant.id).maybeSingle();if(pilotLookupError)throw pilotLookupError;if(!existingPilotLink){const {error:linkError}=await admin.from('pilot_participants').insert({pilot_id:pilotId,participant_id:participant.id,status:'ACTIVE'});if(linkError)throw linkError}}
  return new Response(JSON.stringify({ok:true,participant,linkedExisting}),{status:200,headers})
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'CREATE_PARTICIPANT_FAILED'}),{status:500,headers})}
})
