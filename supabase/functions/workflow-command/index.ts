import { createClient } from 'npm:@supabase/supabase-js@2'

function cors(req: Request) {
  const origin=req.headers.get('origin')??''
  const allowed=origin==='https://my.aidme.no'||origin==='http://localhost:8888'||origin==='http://localhost:3000'||/^https:\/\/(?:deploy-preview-\d+--|[a-z0-9-]+--)?mycamino\.netlify\.app$/.test(origin)
  return {'Access-Control-Allow-Origin':allowed?origin:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}
}
function claims(token:string){const p=token.split('.')[1];if(!p)return{} as Record<string,unknown>;const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4))) as Record<string,unknown>}
function activeGrant(g:any,participantId:string|null,pilotId:string|null){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)&&(!g.participant_id||g.participant_id===participantId)&&(!g.pilot_id||g.pilot_id===pilotId)}
async function capability(admin:any,userId:string,orgId:string,participantId:string|null,pilotId:string|null,caps:string[]){
 const {data:grants,error}=await admin.from('role_grants').select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',userId).eq('organization_id',orgId);if(error)throw error
 const roles=[...new Set((grants??[]).filter((g:any)=>activeGrant(g,participantId,pilotId)).map((g:any)=>g.role_code))];if(!roles.length)return false
 const {data:perms,error:pe}=await admin.from('role_permissions').select('capability').in('role_code',roles).in('capability',caps);if(pe)throw pe;return (perms??[]).length>0
}
async function workflowTask(admin:any,row:any){
 let q=admin.from('tasks').select('id').eq('organization_id',row.organization_id).eq('workflow_key',row.workflow_key).in('status',['OPEN','IN_PROGRESS','WAITING']);q=row.participant_id?q.eq('participant_id',row.participant_id):q.is('participant_id',null);q=row.pilot_id?q.eq('pilot_id',row.pilot_id):q.is('pilot_id',null);const {data:existing}=await q.limit(1)
 if((existing??[]).length)return existing[0].id
 const {data,error}=await admin.from('tasks').insert(row).select('id').single();if(error)throw error
 if(row.assignee_user_id)await admin.from('notifications').insert({user_id:row.assignee_user_id,task_id:data.id,kind:'TASK',title:'Ny oppgave',safe_preview:'Du har en ny oppgave i AidMe VIDA.'})
 return data.id
}
async function pickOwner(admin:any,orgId:string,participantId:string,pilotId:string|null,roles:string[]){
 const now=new Date().toISOString();const {data,error}=await admin.from('role_grants').select('user_id,role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at,created_at').eq('organization_id',orgId).in('role_code',roles);if(error)throw error
 const rows=(data??[]).filter((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now)&&(!g.participant_id||g.participant_id===participantId)&&(!g.pilot_id||g.pilot_id===pilotId));rows.sort((a:any,b:any)=>roles.indexOf(a.role_code)-roles.indexOf(b.role_code)||String(b.created_at).localeCompare(String(a.created_at)));return rows[0]?.user_id??null
}
async function pilotGoApproved(admin:any,pilotId:string){const {data,error}=await admin.from('pilot_gate_decisions').select('decision,decision_version,decided_at').eq('pilot_id',pilotId).order('decision_version',{ascending:false}).limit(1).maybeSingle();if(error)throw error;return data?.decision==='GO'}

async function participantAgreementReady(admin:any,participantId:string,userId:string|null){
 const {data:def,error:defError}=await admin.from('form_definitions').select('id').eq('key','participant_agreement').limit(1).maybeSingle();if(defError)throw defError;if(!def?.id)return false
 const {data:versions,error:versionError}=await admin.from('form_versions').select('id').eq('form_definition_id',def.id);if(versionError)throw versionError
 const versionIds=(versions??[]).map((row:any)=>row.id);if(!versionIds.length)return false
 const {count:submitted,error:submissionError}=await admin.from('form_submissions').select('id',{head:true,count:'exact'}).eq('participant_id',participantId).eq('status','SUBMITTED').in('form_version_id',versionIds);if(submissionError)throw submissionError;if((submitted??0)<1)return false
 const {count:pending,error:pendingError}=await admin.from('tasks').select('id',{head:true,count:'exact'}).eq('participant_id',participantId).in('workflow_key',['participant_agreement_ack','participant_agreement_identity','via_agreement_review']).in('status',['OPEN','IN_PROGRESS','WAITING']);if(pendingError)throw pendingError;if((pending??0)>0)return false
 if(userId){
   const now=new Date().toISOString();const {data:consent,error:consentError}=await admin.from('consent_versions').select('id').eq('key','participant_program_agreement').lte('effective_from',now).or(`retired_at.is.null,retired_at.gt.${now}`).order('version',{ascending:false}).limit(1).maybeSingle();if(consentError)throw consentError;if(!consent?.id)return false
   const {count:granted,error:grantError}=await admin.from('consent_events').select('id',{head:true,count:'exact'}).eq('participant_id',participantId).eq('consent_version_id',consent.id).eq('decision','GRANTED');if(grantError)throw grantError;if((granted??0)<1)return false
 }
 return true
}

Deno.serve(async(req:Request)=>{const headers=cors(req);if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers});try{
 const authHeader=req.headers.get('Authorization')??'',token=authHeader.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers});if(claims(token).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
 const publishable=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default;if(!publishable||!secret)throw new Error('Missing keys')
 const userClient=createClient(Deno.env.get('SUPABASE_URL')!,publishable,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}})
 const {data:userData,error:ue}=await userClient.auth.getUser(token);if(ue||!userData.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
 const body=await req.json(),action=String(body?.action??'').toUpperCase(),participantId=String(body?.participantId??'').trim();if(!participantId||!['START_SER','START_VIDA','START_NEW_VIA'].includes(action))return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})
 const {data:p,error:pe}=await admin.from('participants').select('id,organization_id,user_id,stage,active').eq('id',participantId).maybeSingle();if(pe||!p||!p.active)return new Response(JSON.stringify({error:'PARTICIPANT_NOT_FOUND'}),{status:404,headers})
 let pilotId=body?.pilotId?String(body.pilotId):null;if(!pilotId){const {data:pp}=await admin.from('pilot_participants').select('pilot_id').eq('participant_id',participantId).eq('status','ACTIVE').limit(1).maybeSingle();pilotId=pp?.pilot_id??null}
 const oldStage=String(p.stage),now=new Date().toISOString();let newStage:string
 if(action==='START_SER'){
   if(!['GO','GO_WITH_CONDITIONS'].includes(oldStage))return new Response(JSON.stringify({error:'SER_REQUIRES_INDIVIDUAL_GO',stage:oldStage}),{status:409,headers});if(!pilotId)return new Response(JSON.stringify({error:'SER_REQUIRES_PILOT'}),{status:409,headers})
   if(!await capability(admin,userData.user.id,p.organization_id,participantId,pilotId,['manage_program','manage_tasks']))return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})
   if(!await participantAgreementReady(admin,participantId,p.user_id??null))return new Response(JSON.stringify({error:'PARTICIPANT_AGREEMENT_REQUIRED'}),{status:409,headers})
   if(!await pilotGoApproved(admin,pilotId))return new Response(JSON.stringify({error:'PILOT_GO_REQUIRED'}),{status:409,headers})
   const {data:via}=await admin.from('via_assessments').select('vida_owner_user_id,status').eq('participant_id',participantId).order('updated_at',{ascending:false}).limit(1).maybeSingle();if(!via?.vida_owner_user_id)return new Response(JSON.stringify({error:'NAMED_VIDA_OWNER_REQUIRED'}),{status:409,headers})
   if(oldStage==='GO_WITH_CONDITIONS'){const {count}=await admin.from('tasks').select('id',{head:true,count:'exact'}).eq('participant_id',participantId).eq('workflow_key','go_conditions').in('status',['OPEN','IN_PROGRESS','WAITING']);if((count??0)>0)return new Response(JSON.stringify({error:'GO_CONDITIONS_OPEN'}),{status:409,headers})}
   newStage='SER'
 }else if(action==='START_VIDA'){
   if(oldStage!=='SER')return new Response(JSON.stringify({error:'VIDA_REQUIRES_SER',stage:oldStage}),{status:409,headers});if(!await capability(admin,userData.user.id,p.organization_id,participantId,pilotId,['manage_program','manage_tasks','edit_ser']))return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})
   const {data:via}=await admin.from('via_assessments').select('vida_owner_user_id').eq('participant_id',participantId).order('updated_at',{ascending:false}).limit(1).maybeSingle();const vidaOwner=via?.vida_owner_user_id??await pickOwner(admin,p.organization_id,participantId,pilotId,['vida_owner','program_lead']);if(!vidaOwner)return new Response(JSON.stringify({error:'NAMED_VIDA_OWNER_REQUIRED'}),{status:409,headers})
   newStage='VIDA';for(const [key,title,hours,priority,severity] of [['vida_72h','VIDA – 72 timers bro',72,2,'YELLOW'],['vida_14d','VIDA – 14 dagers oppfølging',336,3,'GREEN'],['vida_30d','VIDA – 30 dagers oppfølging',720,3,'GREEN'],['vida_90d','VIDA – 90 dagers oppfølging / ny VÍA',2160,3,'GREEN']] as any[]){await workflowTask(admin,{organization_id:p.organization_id,participant_id:participantId,pilot_id:pilotId,title,description:key==='vida_72h'?'Bekreft første konkrete handling hjemme og neste kontakt.':'Følg opp levende VIDA-plan og neste konkrete handling.',status:'OPEN',assignee_user_id:vidaOwner,due_at:new Date(Date.now()+hours*3600000).toISOString(),priority,severity,task_type:'WORKFLOW',created_by:userData.user.id,audience:'STAFF',workflow_key:key,source_type:'workflow_transition',source_id:participantId})}
   if(p.user_id)await workflowTask(admin,{organization_id:p.organization_id,participant_id:participantId,pilot_id:pilotId,title:'Min VIDA – første handling',description:'Se din første konkrete handling og avtal neste kontakt med VIDA-eier.',status:'OPEN',assignee_user_id:p.user_id,due_at:new Date(Date.now()+72*3600000).toISOString(),priority:3,severity:'GREEN',task_type:'WORKFLOW',created_by:userData.user.id,audience:'PARTICIPANT',workflow_key:'participant_vida_72h',source_type:'workflow_transition',source_id:participantId})
 }else{
   if(oldStage!=='VIDA')return new Response(JSON.stringify({error:'NEW_VIA_REQUIRES_VIDA',stage:oldStage}),{status:409,headers});if(!await capability(admin,userData.user.id,p.organization_id,participantId,pilotId,['manage_program','edit_vida']))return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers});newStage='NEW_VIA';const owner=await pickOwner(admin,p.organization_id,participantId,pilotId,['via_owner','program_lead']);await workflowTask(admin,{organization_id:p.organization_id,participant_id:participantId,pilot_id:pilotId,title:'Ny VÍA – avklar neste retning',description:'Ta med erfaringene fra VIDA og avklar neste retning uten å gjøre ny VÍA automatisk.',status:'OPEN',assignee_user_id:owner,due_at:new Date(Date.now()+7*86400000).toISOString(),priority:3,severity:'GREEN',task_type:'WORKFLOW',created_by:userData.user.id,audience:'STAFF',workflow_key:'new_via_review',source_type:'workflow_transition',source_id:participantId})
 }
 const {data:updated,error:updateError}=await admin.from('participants').update({stage:newStage,updated_at:now}).eq('id',participantId).eq('stage',oldStage).select('id,stage,updated_at').maybeSingle();if(updateError)throw updateError;if(!updated)return new Response(JSON.stringify({error:'STALE_STAGE'}),{status:409,headers})
 await admin.from('workflow_events').insert({organization_id:p.organization_id,participant_id:participantId,pilot_id:pilotId,actor_user_id:userData.user.id,event_type:action,from_stage:oldStage,to_stage:newStage,source_type:'workflow_command',source_id:participantId,metadata:{}})
 return new Response(JSON.stringify({ok:true,participant:updated}),{status:200,headers})
}catch(error){console.error(error);return new Response(JSON.stringify({error:'WORKFLOW_COMMAND_FAILED'}),{status:500,headers})}})
