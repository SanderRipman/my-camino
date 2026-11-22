import { createClient } from 'npm:@supabase/supabase-js@2'

function cors(req: Request) {
  const origin=req.headers.get('origin')??''
  const allowed=origin==='https://my.aidme.no'||origin==='https://demo.aidme.no'||origin==='http://localhost:8888'||origin==='http://localhost:3000'||/^https:\/\/(?:deploy-preview-\d+--|[a-z0-9-]+--)?mycamino(?:-demo)?\.netlify\.app$/.test(origin)
  return {'Access-Control-Allow-Origin':allowed?origin:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}
}
function decodeClaims(token:string){const part=token.split('.')[1];if(!part)return{} as Record<string,unknown>;const normalized=part.replace(/-/g,'+').replace(/_/g,'/');const padded=normalized+'='.repeat((4-normalized.length%4)%4);return JSON.parse(atob(padded)) as Record<string,unknown>}
const transitions:Record<string,Set<string>>={OPEN:new Set(['IN_PROGRESS','WAITING','DONE']),IN_PROGRESS:new Set(['WAITING','DONE']),WAITING:new Set(['IN_PROGRESS','DONE'])}
function serOperational(task:any){return ['SER_DAILY','SER','SOS','INCIDENT','INCIDENT_FOLLOWUP'].includes(String(task.task_type||''))||String(task.workflow_key||'').startsWith('ser_')||String(task.workflow_key||'').startsWith('SER_')||String(task.workflow_key||'').startsWith('sos:')}

function activeReviewGrant(g:any,task:any,now:string){
 return !g.revoked_at
   &&(!g.valid_from||g.valid_from<=now)
   &&(!g.valid_until||g.valid_until>now)
   &&(!g.participant_id||g.participant_id===task.participant_id)
   &&(!g.pilot_id||g.pilot_id===task.pilot_id)
}
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
Deno.serve(async(req:Request)=>{
 const headers=cors(req)
 if(req.method==='OPTIONS')return new Response('ok',{headers})
 if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
 try{
  const authHeader=req.headers.get('Authorization')??'',token=authHeader.replace(/^Bearer\s+/i,'')
  if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  if(decodeClaims(token).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})

  const publishable=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default
  const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
  if(!publishable||!secret)throw new Error('Missing Supabase function keys')
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,publishable,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false}})
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}})
  const {data:userData,error:userError}=await userClient.auth.getUser(token)
  if(userError||!userData.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})

  const body=await req.json().catch(()=>({}))
  const action=String(body?.action??'STATUS').trim().toUpperCase()
  let taskId=String(body?.taskId??'').trim()
  const requestedParticipantId=String(body?.participantId??'').trim()
  // UAT3X / #243: READ-ONLY generic joiner/mover/leaver preflight.
  // Reuse this inventory in a future audited, per-task CAS transfer. This endpoint
  // intentionally does not grant roles, transfer tasks, revoke access or read forms.
  if(action==='PREVIEW_STAFF_HANDOVER'){
    const orgId=String(body?.organizationId??''),sourceUserId=String(body?.sourceUserId??''),targetUserId=String(body?.targetUserId??'');
    if(!uuidPattern.test(orgId)||!uuidPattern.test(sourceUserId)||!uuidPattern.test(targetUserId)||sourceUserId===targetUserId)
      return new Response(JSON.stringify({error:'INVALID_HANDOVER_CONTEXT'}),{status:400,headers});
    const now=new Date().toISOString();
    // Only an unscoped, current administrator OF THIS organization can inspect its
    // task inventory; program leads do not gain a back door into sensitive VÍA data.
    const {data:admins,error:ae}=await admin.from('role_grants')
      .select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at')
      .eq('user_id',userData.user.id).eq('organization_id',orgId).eq('role_code','system_admin')
      .is('participant_id',null).is('pilot_id',null);
    if(ae)throw ae;
    if(!(admins??[]).some((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now)))
      return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers});
    const {data:sourceStaff,error:se}=await admin.from('staff_profiles')
      .select('user_id').eq('user_id',sourceUserId).maybeSingle();
    const {data:targetStaff,error:te}=await admin.from('staff_profiles')
      .select('user_id,active').eq('user_id',targetUserId).maybeSingle();
    if(se||te)throw se||te;
    if(!sourceStaff||!targetStaff?.active)
      return new Response(JSON.stringify({error:'INVALID_HANDOVER_STAFF'}),{status:409,headers});
    // Fail closed on oversized batches: never silently truncate or claim total PASS.
    const {data:openTasks,error:oe}=await admin.from('tasks')
      .select('id,organization_id,participant_id,pilot_id,workflow_key,task_type,status,assignee_user_id,due_at,updated_at')
      .eq('organization_id',orgId).eq('assignee_user_id',sourceUserId)
      .in('status',['OPEN','IN_PROGRESS','WAITING']).order('created_at',{ascending:true}).limit(101);
    if(oe)throw oe;
    if((openTasks??[]).length>100)
      return new Response(JSON.stringify({error:'HANDOVER_BATCH_TOO_LARGE',limit:100}),{status:409,headers});
    const {data:grants,error:ge}=await admin.from('role_grants')
      .select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at')
      .eq('organization_id',orgId).eq('user_id',targetUserId);
    if(ge)throw ge;
    const valid=(grants??[]).filter((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now));
    const codes=[...new Set(valid.map((g:any)=>String(g.role_code)))];
    const {data:permissions,error:pe}=codes.length
      ?await admin.from('role_permissions').select('role_code,capability').in('role_code',codes)
      :{data:[],error:null};
    if(pe)throw pe;
    const permissionSet=new Set((permissions??[]).map((p:any)=>p.role_code+':'+p.capability));
    const items=(openTasks??[]).map((task:any)=>{
      // Require task-specific competence. Generic manage_tasks cannot substitute for
      // edit_via, nor can organization scope replace participant/pilot scope.
      const workflow=String(task.workflow_key||'');
      const required=workflow==='via_go_review'||workflow==='via_roadmap_review'
        ?'edit_via'
        :workflow.startsWith('vida_')||task.task_type==='VIDA_OWNER_GATE'
          ?'edit_vida'
          :serOperational(task)?'manage_ser_tasks':'manage_tasks';
      const eligible=valid.some((g:any)=>permissionSet.has(g.role_code+':'+required)
        &&(!g.participant_id||g.participant_id===task.participant_id)
        &&(!g.pilot_id||g.pilot_id===task.pilot_id));
      return {id:task.id,participant_id:task.participant_id,pilot_id:task.pilot_id,
        workflow_key:workflow,status:task.status,due_at:task.due_at,
        expected_updated_at:task.updated_at,required_capability:required,
        eligible,blocker:eligible?null:'TARGET_MISSING_CURRENT_SCOPED_CAPABILITY'};
    });
    return new Response(JSON.stringify({ok:true,readOnly:true,organizationId:orgId,
      sourceUserId,targetUserId,taskCount:items.length,eligibleCount:items.filter(t=>t.eligible).length,
      blockedCount:items.filter(t=>!t.eligible).length,tasks:items,
      roleTransferPerformed:false,taskTransferPerformed:false,oldAccessRevoked:false
    }),{status:200,headers});
  }
  // Administrative handoff by participant is narrow: it only resolves one OPEN VÍA review,
  // requires a current, unscoped administrator grant in the same organization, and never
  // exposes the participant's submitted form to the administrator.
  if(action==='REASSIGN_VIA_REVIEW'&&!taskId){
    if(!uuidPattern.test(requestedParticipantId))
      return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})
    const {data:adminGrants,error:age}=await admin.from('role_grants')
      .select('role_code,organization_id,participant_id,pilot_id,valid_from,valid_until,revoked_at')
      .eq('user_id',userData.user.id).eq('role_code','system_admin')
      .is('participant_id',null).is('pilot_id',null)
    if(age)throw age
    const now=new Date().toISOString()
    const currentAdminGrants=(adminGrants??[]).filter((g:any)=>
      !g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now))
    if(!currentAdminGrants.length)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})
    const {data:participant,error:pe}=await admin.from('participants')
      .select('id,organization_id').eq('id',requestedParticipantId).maybeSingle()
    if(pe)throw pe
    if(!participant)return new Response(JSON.stringify({error:'PARTICIPANT_NOT_FOUND'}),{status:404,headers})
    if(!currentAdminGrants.some((g:any)=>g.organization_id===participant.organization_id))
      return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})
    const {data:reviewTasks,error:re}=await admin.from('tasks')
      .select('id').eq('organization_id',participant.organization_id)
      .eq('participant_id',participant.id).eq('workflow_key','via_go_review')
      .eq('audience','STAFF').eq('status','OPEN').limit(2)
    if(re)throw re
    if((reviewTasks??[]).length!==1)
      return new Response(JSON.stringify({error:'EXPECTED_ONE_OPEN_VIA_REVIEW',count:(reviewTasks??[]).length}),{status:409,headers})
    taskId=reviewTasks[0].id
  }
  if(!taskId)return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})

  const {data:task,error:taskError}=await admin.from('tasks').select('id,organization_id,participant_id,pilot_id,status,assignee_user_id,title,description,severity,priority,task_type,workflow_key,audience,updated_at').eq('id',taskId).maybeSingle()
  if(taskError||!task)return new Response(JSON.stringify({error:'TASK_NOT_FOUND'}),{status:404,headers})

 if(action==='REASSIGN_VIA_REVIEW'){
   const targetUserId=String(body?.targetUserId??'').trim(),reason=String(body?.reason??'').trim();
   if(!uuidPattern.test(taskId)||!uuidPattern.test(targetUserId)||reason.length<12||reason.length>200)
     return new Response(JSON.stringify({error:'INVALID_REVIEW_REASSIGNMENT_INPUT'}),{status:400,headers});
   if(!task||task.workflow_key!=='via_go_review'||task.audience!=='STAFF'||task.status!=='OPEN'||!task.participant_id)
     return new Response(JSON.stringify({error:'NOT_OPEN_VIA_REVIEW'}),{status:409,headers});
   const now=new Date().toISOString();
   const {data:callerGrants,error:ce}=await admin.from('role_grants')
     .select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at')
     .eq('organization_id',task.organization_id).eq('user_id',userData.user.id);
   if(ce)throw ce;
   const callerRoles=[...new Set((callerGrants??[]).filter((g:any)=>activeReviewGrant(g,task,now)).map((g:any)=>g.role_code))];
   if(!callerRoles.length)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers});
   const {data:callerPermissions,error:cpe}=await admin.from('role_permissions')
     .select('role_code').in('role_code',callerRoles).eq('capability','manage_tasks');
   if(cpe)throw cpe;
   // A system administrator may route a review, but cannot read the VÍA answers
   // or act as its clinical reviewer. All existing task status/GO gates remain separate.
   const unscopedAdmin=(callerGrants??[]).some((g:any)=>
     g.role_code==='system_admin'&&!g.participant_id&&!g.pilot_id&&activeReviewGrant(g,task,now))
   if(!(callerPermissions??[]).length&&!unscopedAdmin)
     return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers});
   const {data:targetGrants,error:tge}=await admin.from('role_grants')
     .select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at')
     .eq('organization_id',task.organization_id).eq('user_id',targetUserId)
     .in('role_code',['via_owner','clinical_professional']);
   if(tge)throw tge;
   const targetRoles=[...new Set((targetGrants??[]).filter((g:any)=>activeReviewGrant(g,task,now)).map((g:any)=>g.role_code))];
   if(!targetRoles.length)return new Response(JSON.stringify({error:'TARGET_MISSING_SCOPED_VIA_ROLE'}),{status:409,headers});
   const {data:targetPermissions,error:tpe}=await admin.from('role_permissions')
     .select('role_code').in('role_code',targetRoles).eq('capability','edit_via');
   if(tpe)throw tpe;
   if(!(targetPermissions??[]).length)return new Response(JSON.stringify({error:'TARGET_MISSING_EDIT_VIA'}),{status:409,headers});
   const {data:targetStaff,error:tse}=await admin.from('staff_profiles')
     .select('user_id').eq('user_id',targetUserId).eq('active',true).maybeSingle();
   if(tse)throw tse;
   if(!targetStaff)return new Response(JSON.stringify({error:'TARGET_NOT_ACTIVE_STAFF'}),{status:409,headers});
   if(task.assignee_user_id===targetUserId)
     return new Response(JSON.stringify({ok:true,unchanged:true,task:{id:task.id,status:task.status,assignee_user_id:targetUserId}}),{status:200,headers});
   // Intent is committed before the privileged assignment. If a later write fails,
   // the attempt is still reconstructible without leaking participant answers.
   const {error:ie}=await admin.from('workflow_events').insert({
      organization_id:task.organization_id,participant_id:task.participant_id,pilot_id:task.pilot_id,
      actor_user_id:userData.user.id,event_type:'VIA_REVIEW_REASSIGNMENT_REQUESTED',
      source_type:'task',source_id:task.id,
      metadata:{previous_assignee_user_id:task.assignee_user_id,target_user_id:targetUserId,reason}
   });
   if(ie)throw ie;
   let update=admin.from('tasks')
     .update({assignee_user_id:targetUserId,updated_at:now})
     .eq('id',task.id).eq('status','OPEN').eq('updated_at',task.updated_at);
   update=task.assignee_user_id?update.eq('assignee_user_id',task.assignee_user_id):update.is('assignee_user_id',null);
   const {data:updated,error:ue}=await update
     .select('id,status,assignee_user_id,updated_at').maybeSingle();
   if(ue)throw ue;
   if(!updated)return new Response(JSON.stringify({error:'STALE_TASK_REASSIGNMENT'}),{status:409,headers});
   const {error:ae}=await admin.from('workflow_events').insert({
      organization_id:task.organization_id,participant_id:task.participant_id,pilot_id:task.pilot_id,
      actor_user_id:userData.user.id,event_type:'VIA_REVIEW_REASSIGNED',
      source_type:'task',source_id:task.id,
      metadata:{previous_assignee_user_id:task.assignee_user_id,target_user_id:targetUserId,reason}
   });
   if(ae)return new Response(JSON.stringify({error:'AUDIT_FINISH_FAILED',intentRecorded:true,assignmentChanged:true,taskId:task.id}),{status:500,headers});
   return new Response(JSON.stringify({ok:true,task:updated}),{status:200,headers});
 }

  let authorized=task.assignee_user_id===userData.user.id
  if(!authorized){
    const now=new Date().toISOString()
    const {data:grants,error:grantsError}=await admin.from('role_grants').select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',userData.user.id).eq('organization_id',task.organization_id)
    if(grantsError)throw grantsError
    const roleCodes=[...new Set((grants??[]).filter((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now)&&(!g.participant_id||g.participant_id===task.participant_id)&&(!g.pilot_id||g.pilot_id===task.pilot_id)).map((g:any)=>g.role_code))]
    if(roleCodes.length){
      const caps=['manage_tasks',...(serOperational(task)?['manage_ser_tasks']:[])]
      const {data:perms,error:permsError}=await admin.from('role_permissions').select('capability').in('role_code',roleCodes).in('capability',caps)
      if(permsError)throw permsError
      authorized=(perms??[]).length>0
    }
  }
  if(!authorized)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})

  if(action==='CONTEXT'){
    const {data:history,error:historyError}=await admin.from('workflow_events').select('actor_user_id,event_type,metadata,occurred_at').eq('source_type','task').eq('source_id',task.id).in('event_type',['TASK_STATUS_CHANGED','TASK_DECISION_NOTE']).order('occurred_at',{ascending:false}).limit(8)
    if(historyError)throw historyError
    return new Response(JSON.stringify({ok:true,task:{id:task.id,title:task.title,description:task.description,severity:task.severity,status:task.status},history:history??[]}),{status:200,headers})
  }

  if(action!=='STATUS')return new Response(JSON.stringify({error:'INVALID_ACTION'}),{status:400,headers})
  const nextStatus=String(body?.status??'').trim().toUpperCase()
  if(!['IN_PROGRESS','WAITING','DONE'].includes(nextStatus))return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})
  const note=String(body?.note??'').trim().replace(/\s+/g,' ').slice(0,800)
  if(String(task.severity)==='RED'&&['WAITING','DONE'].includes(nextStatus)&&note.length<3)return new Response(JSON.stringify({error:'DECISION_NOTE_REQUIRED'}),{status:400,headers})

  if(String(task.status)===nextStatus){
    if(note.length>=3){
      await admin.from('workflow_events').insert({organization_id:task.organization_id,participant_id:task.participant_id,pilot_id:task.pilot_id,actor_user_id:userData.user.id,event_type:'TASK_DECISION_NOTE',source_type:'task',source_id:task.id,metadata:{status:task.status,decision_note:note}})
    }
    return new Response(JSON.stringify({ok:true,unchanged:true,task:{id:task.id,status:task.status,updated_at:task.updated_at}}),{status:200,headers})
  }
  if(!transitions[String(task.status)]?.has(nextStatus))return new Response(JSON.stringify({error:'INVALID_TRANSITION',from:task.status,to:nextStatus}),{status:409,headers})

  const now=new Date().toISOString()
  const {data:updated,error:updateError}=await admin.from('tasks').update({status:nextStatus,updated_at:now}).eq('id',task.id).eq('status',task.status).select('id,status,updated_at').maybeSingle()
  if(updateError)throw updateError
  if(!updated)return new Response(JSON.stringify({error:'STALE_TASK'}),{status:409,headers})

  await admin.from('workflow_events').insert({organization_id:task.organization_id,participant_id:task.participant_id,pilot_id:task.pilot_id,actor_user_id:userData.user.id,event_type:'TASK_STATUS_CHANGED',source_type:'task',source_id:task.id,metadata:{from_status:task.status,to_status:nextStatus,decision_note:note||null}})
  return new Response(JSON.stringify({ok:true,task:updated}),{status:200,headers})
 }catch(error){
  console.error(error)
  return new Response(JSON.stringify({error:'TASK_COMMAND_FAILED'}),{status:500,headers})
 }
})
