import { createClient } from 'npm:@supabase/supabase-js@2'

function allowedOrigin(origin:string){return ['https://my.aidme.no','https://demo.aidme.no','https://main--mycamino.netlify.app','https://demo-uat--mycamino-demo.netlify.app','http://localhost:8888','http://localhost:3000'].includes(origin)||/^https:\/\/deploy-preview-\d+--mycamino(?:-demo)?\.netlify\.app$/.test(origin)}
function cors(req:Request){const o=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigin(o)?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}}
function claims(t:string){const p=t.split('.')[1];if(!p)return{};const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}
function active(g:any,pid:string,pilot:string|null){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)&&(!g.participant_id||g.participant_id===pid)&&(!g.pilot_id||g.pilot_id===pilot)}

Deno.serve(async(req:Request)=>{
 const headers=cors(req);if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
 try{
  const ah=req.headers.get('Authorization')??'',token=ah.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers});if((claims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
  const pk=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,sk=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default;if(!pk||!sk)throw new Error('Missing keys')
  const uc=createClient(Deno.env.get('SUPABASE_URL')!,pk,{global:{headers:{Authorization:ah}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,sk,{auth:{persistSession:false}})
  const {data:u,error:ue}=await uc.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  const b=await req.json(),participantId=String(b?.participantId??'').trim(),title=String(b?.title??'').trim(),note=String(b?.note??'').trim();if(!participantId||title.length<3||title.length>120||note.length>800)return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})
  let dueAt:string|null=null;if(b?.dueAt){const d=new Date(b.dueAt);if(Number.isNaN(d.getTime()))return new Response(JSON.stringify({error:'INVALID_DUE_DATE'}),{status:400,headers});dueAt=d.toISOString()}
  const {data:p,error:pe}=await admin.from('participants').select('id,organization_id,stage,active').eq('id',participantId).maybeSingle();if(pe||!p||!p.active)return new Response(JSON.stringify({error:'PARTICIPANT_NOT_FOUND'}),{status:404,headers})
  const {data:pp}=await admin.from('pilot_participants').select('pilot_id').eq('participant_id',participantId).eq('status','ACTIVE').order('joined_at',{ascending:false}).limit(1).maybeSingle(),pilotId=pp?.pilot_id??null
  const {data:grants,error:ge}=await admin.from('role_grants').select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',u.user.id).eq('organization_id',p.organization_id);if(ge)throw ge
  const roles=[...new Set((grants??[]).filter((g:any)=>active(g,participantId,pilotId)).map((g:any)=>g.role_code))];if(!roles.length)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})
  const caps=String(p.stage).toUpperCase()==='SER'?['manage_tasks','manage_ser_tasks']:['manage_tasks'];const {data:perms,error:pme}=await admin.from('role_permissions').select('capability').in('role_code',roles).in('capability',caps);if(pme)throw pme;if(!(perms??[]).length)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})
  const now=new Date().toISOString();const {data:task,error:te}=await admin.from('tasks').insert({organization_id:p.organization_id,participant_id:participantId,pilot_id:pilotId,title,description:note||null,status:'OPEN',assignee_user_id:u.user.id,due_at:dueAt,priority:3,severity:'GREEN',task_type:'MANUAL',created_by:u.user.id,audience:'STAFF',workflow_key:null,source_type:'manual_staff_task',source_id:participantId}).select('id,title,status,due_at').single();if(te)throw te
  await admin.from('workflow_events').insert({organization_id:p.organization_id,participant_id:participantId,pilot_id:pilotId,actor_user_id:u.user.id,event_type:'MANUAL_TASK_CREATED',source_type:'task',source_id:task.id,metadata:{self_assigned:true}})
  await admin.from('audit_events').insert({organization_id:p.organization_id,actor_user_id:u.user.id,action:'MANUAL_TASK_CREATED',resource_type:'task',resource_id:task.id,participant_id:participantId,purpose:'staff_followup',metadata:{pilot_id:pilotId}})
  return new Response(JSON.stringify({ok:true,task}),{headers})
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'MANUAL_TASK_FAILED'}),{status:500,headers})}
})
