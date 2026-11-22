import { createClient } from 'npm:@supabase/supabase-js@2'

function cors(req: Request) {
  const origin=req.headers.get('origin')??''
  const allowed=origin==='https://my.aidme.no'||origin==='https://demo.aidme.no'||origin==='http://localhost:8888'||origin==='http://localhost:3000'||/^https:\/\/(?:deploy-preview-\d+--|[a-z0-9-]+--)?mycamino(?:-demo)?\.netlify\.app$/.test(origin)
  return {'Access-Control-Allow-Origin':allowed?origin:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}
}
function decodeClaims(token:string){const part=token.split('.')[1];if(!part)return{} as Record<string,unknown>;const normalized=part.replace(/-/g,'+').replace(/_/g,'/');const padded=normalized+'='.repeat((4-normalized.length%4)%4);return JSON.parse(atob(padded)) as Record<string,unknown>}
const transitions:Record<string,Set<string>>={OPEN:new Set(['IN_PROGRESS','WAITING','DONE']),IN_PROGRESS:new Set(['WAITING','DONE']),WAITING:new Set(['IN_PROGRESS','DONE'])}
function serOperational(task:any){return ['SER_DAILY','SER','SOS','INCIDENT','INCIDENT_FOLLOWUP'].includes(String(task.task_type||''))||String(task.workflow_key||'').startsWith('ser_')||String(task.workflow_key||'').startsWith('SER_')||String(task.workflow_key||'').startsWith('sos:')}

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
  const taskId=String(body?.taskId??'').trim()
  if(!taskId)return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})

  const {data:task,error:taskError}=await admin.from('tasks').select('id,organization_id,participant_id,pilot_id,status,assignee_user_id,title,description,severity,priority,task_type,workflow_key,updated_at').eq('id',taskId).maybeSingle()
  if(taskError||!task)return new Response(JSON.stringify({error:'TASK_NOT_FOUND'}),{status:404,headers})

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
