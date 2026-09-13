import { createClient } from 'npm:@supabase/supabase-js@2'

const REQUEST_CAPS=['view_ser','view_operational_min','edit_ser']
const OPERATIONAL_CAPS=['view_operational_min','view_ser','edit_ser','edit_logistics']
function allowedOrigin(origin:string){return ['https://my.aidme.no','https://demo.aidme.no','https://main--mycamino.netlify.app','https://demo-uat--mycamino-demo.netlify.app','http://localhost:8888','http://localhost:3000'].includes(origin)||/^https:\/\/deploy-preview-\d+--mycamino(?:-demo)?\.netlify\.app$/.test(origin)}
function cors(req:Request){const o=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigin(o)?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}}
function claims(token:string){const p=token.split('.')[1];if(!p)return{};const n=p.replace(/-/g,'+').replace(/_/g,'/');try{return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}catch{return{}}}
function currentGrant(g:any,pilotId:string){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)&&!g.participant_id&&(!g.pilot_id||String(g.pilot_id)===pilotId)}

Deno.serve(async(req:Request)=>{
 const headers=cors(req);if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
 try{
  const ah=req.headers.get('Authorization')??'',token=ah.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  const pk=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,sk=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default;if(!pk||!sk)throw new Error('Missing keys')
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,pk,{global:{headers:{Authorization:ah}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,sk,{auth:{persistSession:false}})
  const {data:u,error:ue}=await userClient.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers});if((claims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
  const body=await req.json(),pilotId=String(body?.pilotId??'').trim();if(!pilotId)return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})
  const {data:pilot,error:pilotError}=await admin.from('pilots').select('id,organization_id').eq('id',pilotId).maybeSingle();if(pilotError||!pilot)return new Response(JSON.stringify({error:'PILOT_NOT_FOUND'}),{status:404,headers})

  const {data:requestGrants,error:grantError}=await admin.from('role_grants').select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',u.user.id).eq('organization_id',pilot.organization_id);if(grantError)throw grantError
  const requestRoles=[...new Set((requestGrants??[]).filter((g:any)=>currentGrant(g,pilotId)).map((g:any)=>String(g.role_code)))];if(!requestRoles.length)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})
  const {data:requestPerms,error:requestPermError}=await admin.from('role_permissions').select('role_code,capability').in('role_code',requestRoles).in('capability',REQUEST_CAPS);if(requestPermError)throw requestPermError
  if(!(requestPerms??[]).some((p:any)=>REQUEST_CAPS.includes(String(p.capability))))return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})

  const {data:profiles,error:profileError}=await admin.from('staff_profiles').select('user_id,full_name,job_title').eq('organization_id',pilot.organization_id).eq('active',true);if(profileError)throw profileError
  const ids=(profiles??[]).map((p:any)=>p.user_id).filter(Boolean);if(!ids.length)return new Response(JSON.stringify({staff:[]}),{status:200,headers})
  const {data:candidateGrants,error:candidateGrantError}=await admin.from('role_grants').select('user_id,role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('organization_id',pilot.organization_id).in('user_id',ids);if(candidateGrantError)throw candidateGrantError
  const validCandidateGrants=(candidateGrants??[]).filter((g:any)=>currentGrant(g,pilotId));const candidateRoles=[...new Set(validCandidateGrants.map((g:any)=>String(g.role_code)))];if(!candidateRoles.length)return new Response(JSON.stringify({staff:[]}),{status:200,headers})
  const {data:perms,error:permError}=await admin.from('role_permissions').select('role_code,capability').in('role_code',candidateRoles).in('capability',['respond_sos',...OPERATIONAL_CAPS]);if(permError)throw permError
  const byRole=new Map<string,Set<string>>();for(const row of perms??[]){const role=String((row as any).role_code),cap=String((row as any).capability);if(!byRole.has(role))byRole.set(role,new Set());byRole.get(role)!.add(cap)}
  const eligibleUsers=new Set<string>();for(const g of validCandidateGrants){const caps=byRole.get(String((g as any).role_code));if(caps?.has('respond_sos')&&OPERATIONAL_CAPS.some(cap=>caps.has(cap)))eligibleUsers.add(String((g as any).user_id))}
  const staff=(profiles??[]).filter((p:any)=>eligibleUsers.has(String(p.user_id))).map((p:any)=>({user_id:p.user_id,full_name:p.full_name,job_title:p.job_title})).sort((a:any,b:any)=>String(a.full_name??a.user_id).localeCompare(String(b.full_name??b.user_id),'nb'))
  return new Response(JSON.stringify({staff}),{status:200,headers})
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'SER_STAFF_DIRECTORY_FAILED'}),{status:500,headers})}
})
