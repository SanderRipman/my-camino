import { createClient } from 'npm:@supabase/supabase-js@2'

function allowedOrigin(origin:string){return ['https://my.aidme.no','https://demo.aidme.no','https://main--mycamino.netlify.app','https://demo-uat--mycamino-demo.netlify.app','http://localhost:8888','http://localhost:3000'].includes(origin)||/^https:\/\/deploy-preview-\d+--mycamino(?:-demo)?\.netlify\.app$/.test(origin)}
function cors(req:Request){const o=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigin(o)?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}}
function decodeClaims(token:string){const p=token.split('.')[1];if(!p)return{};const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}

Deno.serve(async(req:Request)=>{
 const headers=cors(req);if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
 try{
  const ah=req.headers.get('Authorization')??'',token=ah.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  const pk=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,sk=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default;if(!pk||!sk)throw new Error('Missing keys')
  const uc=createClient(Deno.env.get('SUPABASE_URL')!,pk,{global:{headers:{Authorization:ah}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,sk,{auth:{persistSession:false}})
  const {data:u,error:ue}=await uc.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  if((decodeClaims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
  const now=new Date().toISOString(),{data:adminGrants,error:age}=await admin.from('role_grants').select('valid_from,valid_until,revoked_at').eq('user_id',u.user.id).eq('role_code','system_admin');if(age)throw age
  if(!(adminGrants??[]).some((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now)))return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})

  const b=await req.json(),grantId=String(b?.grantId??'').trim(),reason=String(b?.reason??'').trim(),participantId=b?.participantId?String(b.participantId):null,pilotId=b?.pilotId?String(b.pilotId):null
  let validUntil:string|null=null;if(b?.validUntil){const d=new Date(b.validUntil);if(Number.isNaN(d.getTime())||d<=new Date())return new Response(JSON.stringify({error:'INVALID_EXPIRY'}),{status:400,headers});validUntil=d.toISOString()}
  if(!grantId||reason.length<3)return new Response(JSON.stringify({error:'GRANT_ID_AND_REASON_REQUIRED'}),{status:400,headers})
  const {data:g,error:ge}=await admin.from('role_grants').select('id,user_id,organization_id,role_code,participant_id,pilot_id,valid_until,revoked_at').eq('id',grantId).maybeSingle();if(ge||!g)return new Response(JSON.stringify({error:'GRANT_NOT_FOUND'}),{status:404,headers});if(g.revoked_at)return new Response(JSON.stringify({error:'GRANT_REVOKED'}),{status:409,headers})
  if(g.role_code==='system_admin'&&(participantId||pilotId))return new Response(JSON.stringify({error:'SYSTEM_ADMIN_MUST_BE_UNSCOPED'}),{status:400,headers})
  if(g.role_code==='break_glass'&&!validUntil)return new Response(JSON.stringify({error:'BREAK_GLASS_REQUIRES_EXPIRY'}),{status:400,headers})
  if(participantId){const {data:p}=await admin.from('participants').select('id').eq('id',participantId).eq('organization_id',g.organization_id).maybeSingle();if(!p)return new Response(JSON.stringify({error:'PARTICIPANT_SCOPE_INVALID'}),{status:400,headers})}
  if(pilotId){const {data:p}=await admin.from('pilots').select('id').eq('id',pilotId).eq('organization_id',g.organization_id).maybeSingle();if(!p)return new Response(JSON.stringify({error:'PILOT_SCOPE_INVALID'}),{status:400,headers})}
  const patch={participant_id:participantId,pilot_id:pilotId,valid_until:validUntil,reason:`${g.role_code}: updated – ${reason}`}
  const {data:updated,error:up}=await admin.from('role_grants').update(patch).eq('id',grantId).is('revoked_at',null).select('id,role_code,participant_id,pilot_id,valid_until').maybeSingle();if(up)throw up;if(!updated)return new Response(JSON.stringify({error:'STALE_GRANT'}),{status:409,headers})
  const {error:auditError}=await admin.from('audit_events').insert({organization_id:g.organization_id,actor_user_id:u.user.id,action:'ROLE_UPDATED',resource_type:'role_grant',resource_id:g.id,participant_id:participantId,purpose:'Role access administration',metadata:{role_code:g.role_code,target_user_id:g.user_id,previous:{participant_id:g.participant_id,pilot_id:g.pilot_id,valid_until:g.valid_until},next:{participant_id:participantId,pilot_id:pilotId,valid_until:validUntil},reason}})
  return new Response(JSON.stringify({ok:true,grant:updated,auditLogged:!auditError}),{headers})
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'UPDATE_ROLE_FAILED'}),{status:500,headers})}
})
