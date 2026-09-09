import { createClient } from 'npm:@supabase/supabase-js@2'

function allowedOrigin(o:string){return o==='https://demo.aidme.no'||o==='https://demo-uat--mycamino-demo.netlify.app'||o==='https://mycamino-demo.netlify.app'||o==='http://localhost:8888'||o==='http://localhost:3000'||/^https:\/\/deploy-preview-\d+--mycamino-demo\.netlify\.app$/.test(o)||/^https:\/\/[a-z0-9-]+--mycamino-demo\.netlify\.app$/.test(o)}
function cors(req:Request){const o=req.headers.get('origin')??'';return{'Access-Control-Allow-Origin':allowedOrigin(o)?o:'https://demo.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}}
function claims(t:string){const p=t.split('.')[1];if(!p)return{} as any;const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}
function active(g:any){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)}

Deno.serve(async(req:Request)=>{
 const headers=cors(req);if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers});
 try{
  const origin=req.headers.get('origin')??'';if(!allowedOrigin(origin))return new Response(JSON.stringify({error:'UAT_ORIGIN_REQUIRED'}),{status:403,headers});
  const ah=req.headers.get('Authorization')??'',token=ah.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers});if((claims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers});
  const pk=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,sk=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default;if(!pk||!sk)throw new Error('Missing keys');
  const uc=createClient(Deno.env.get('SUPABASE_URL')!,pk,{global:{headers:{Authorization:ah}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,sk,{auth:{persistSession:false}});
  const {data:u,error:ue}=await uc.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers});
  const {data:grants,error:ge}=await admin.from('role_grants').select('organization_id,valid_from,valid_until,revoked_at').eq('user_id',u.user.id).eq('role_code','system_admin');if(ge)throw ge;const adminGrant=(grants??[]).find(active);if(!adminGrant)return new Response(JSON.stringify({error:'SYSTEM_ADMIN_REQUIRED'}),{status:403,headers});const orgId=adminGrant.organization_id;
  const b=await req.json(),action=String(b?.action??'SNAPSHOT').toUpperCase();
  if(action==='ACTIVATE'){
    const reason=String(b?.reason??'').trim();if(reason.length<3||reason.length>240)return new Response(JSON.stringify({error:'REASON_REQUIRED'}),{status:400,headers});
    await admin.from('uat_full_view_windows').update({closed_at:new Date().toISOString()}).eq('user_id',u.user.id).is('closed_at',null).gt('expires_at',new Date().toISOString());
    const expiresAt=new Date(Date.now()+30*60*1000).toISOString();const {data:w,error:we}=await admin.from('uat_full_view_windows').insert({user_id:u.user.id,organization_id:orgId,reason,expires_at:expiresAt}).select('id,expires_at').single();if(we)throw we;
    await admin.from('audit_events').insert({organization_id:orgId,actor_user_id:u.user.id,action:'UAT_FULL_VIEW_ACTIVATED',resource_type:'uat_full_view_window',resource_id:w.id,purpose:'Early-UAT synthetic full-view testing',metadata:{expires_at:expiresAt,origin}});
    return new Response(JSON.stringify({ok:true,window:w}),{headers});
  }
  if(action==='CLOSE'){
    const {data:w}=await admin.from('uat_full_view_windows').select('id').eq('user_id',u.user.id).is('closed_at',null).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();if(w){await admin.from('uat_full_view_windows').update({closed_at:new Date().toISOString()}).eq('id',w.id);await admin.from('audit_events').insert({organization_id:orgId,actor_user_id:u.user.id,action:'UAT_FULL_VIEW_CLOSED',resource_type:'uat_full_view_window',resource_id:w.id,purpose:'Early-UAT synthetic full-view testing',metadata:{origin}})}return new Response(JSON.stringify({ok:true}),{headers});
  }
  const {data:w,error:we}=await admin.from('uat_full_view_windows').select('id,expires_at').eq('user_id',u.user.id).eq('organization_id',orgId).is('closed_at',null).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();if(we)throw we;if(!w)return new Response(JSON.stringify({error:'UAT_WINDOW_REQUIRED'}),{status:403,headers});
  const normalIds=new Set(Array.isArray(b?.normalVisibleParticipantIds)?b.normalVisibleParticipantIds.map((x:any)=>String(x)):[]);
  const [{data:participants,error:pe},{data:pilots,error:pie},{data:pp,error:ppe},{data:tasks,error:te}]=await Promise.all([
   admin.from('participants').select('id,code_name,stage,active,updated_at').eq('organization_id',orgId).order('updated_at',{ascending:false}),
   admin.from('pilots').select('id,name,status,route_name,start_date,end_date').eq('organization_id',orgId).order('start_date',{ascending:false}),
   admin.from('pilot_participants').select('participant_id,pilot_id,status'),
   admin.from('tasks').select('id,participant_id,pilot_id,title,status,due_at,priority,severity,task_type,audience').eq('organization_id',orgId).neq('status','CANCELLED').order('due_at',{ascending:true,nullsFirst:false}).limit(500)
  ]);if(pe||pie||ppe||te)throw pe||pie||ppe||te;
  const pilotIds=new Set((pilots??[]).map((p:any)=>p.id));const scopedPP=(pp??[]).filter((x:any)=>pilotIds.has(x.pilot_id));
  const outParticipants=(participants??[]).map((p:any)=>({...p,normally_hidden:!normalIds.has(String(p.id)),pilot_ids:scopedPP.filter((x:any)=>x.participant_id===p.id&&x.status==='ACTIVE').map((x:any)=>x.pilot_id)}));
  await admin.from('audit_events').insert({organization_id:orgId,actor_user_id:u.user.id,action:'UAT_FULL_VIEW_SNAPSHOT',resource_type:'uat_full_view_window',resource_id:w.id,purpose:'Early-UAT synthetic full-view testing',metadata:{participant_count:outParticipants.length,normally_hidden_count:outParticipants.filter((p:any)=>p.normally_hidden).length,task_count:(tasks??[]).length,origin}});
  return new Response(JSON.stringify({ok:true,expires_at:w.expires_at,participants:outParticipants,pilots:pilots??[],tasks:tasks??[],guardrails:{synthetic_only:true,no_health_data:true,no_contact_data:true,no_documents:true}}),{headers});
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'UAT_OVERVIEW_FAILED'}),{status:500,headers})}
})
