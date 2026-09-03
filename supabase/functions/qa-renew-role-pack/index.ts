import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins=new Set(['https://my.aidme.no','https://main--mycamino.netlify.app','http://localhost:8888','http://localhost:3000'])
const QA_REASON='SYNTHETIC_QA_ROLE_PACK'
const WEEK_MS=7*24*60*60*1000

function headers(req:Request){const o=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigins.has(o)?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}}
function claims(token:string){try{const p=token.split('.')[1];const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}catch{return{}}}
function isActive(g:any,nowIso:string){return !g.revoked_at&&(!g.valid_from||g.valid_from<=nowIso)&&(!g.valid_until||g.valid_until>nowIso)}

Deno.serve(async(req:Request)=>{
 const h=headers(req);if(req.method==='OPTIONS')return new Response('ok',{headers:h});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers:h})
 try{
  const auth=req.headers.get('Authorization')??'';const token=auth.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers:h})
  if((claims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers:h})
  const pub=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default;const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,pub,{global:{headers:{Authorization:auth}},auth:{persistSession:false}})
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}})
  const {data:u,error:ue}=await userClient.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers:h})
  const now=new Date(),nowIso=now.toISOString()
  const {data:ownGrants,error:ge}=await admin.from('role_grants').select('role_code,valid_from,valid_until,revoked_at').eq('user_id',u.user.id);if(ge)throw ge
  if(!(ownGrants??[]).some((g:any)=>isActive(g,nowIso)&&g.role_code==='system_admin'))return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers:h})

  const body=await req.json().catch(()=>({})) as any
  const action=String(body.action||'preview')
  const {data:qa,error:qe}=await admin.from('role_grants').select('id,organization_id,valid_until,revoked_at').eq('reason',QA_REASON).is('revoked_at',null);if(qe)throw qe
  const rows=qa??[]
  const currentTimes=rows.map((g:any)=>g.valid_until?new Date(g.valid_until).getTime():0).filter(Number.isFinite)
  const currentExpiryMs=currentTimes.length?Math.max(...currentTimes):0
  const currentExpiry=currentExpiryMs?new Date(currentExpiryMs).toISOString():null
  if(action==='preview')return new Response(JSON.stringify({ok:true,hasPack:rows.length>0,grantCount:rows.length,expiresAt:currentExpiry,remainingHours:currentExpiryMs?(currentExpiryMs-now.getTime())/3600000:null}),{headers:h})
  if(!rows.length)return new Response(JSON.stringify({error:'NO_ROLE_PACK'}),{status:404,headers:h})

  let targetMs:number
  if(action==='ensure_week')targetMs=Math.max(currentExpiryMs||0,now.getTime()+WEEK_MS)
  else if(action==='extend_week')targetMs=Math.max(currentExpiryMs,now.getTime())+WEEK_MS
  else return new Response(JSON.stringify({error:'INVALID_ACTION'}),{status:400,headers:h})
  const expiresAt=new Date(targetMs).toISOString()
  const ids=rows.map((g:any)=>g.id)
  const {data:updated,error:updateError}=await admin.from('role_grants').update({valid_until:expiresAt}).in('id',ids).select('id');if(updateError)throw updateError
  const organizationId=(rows as any[]).find(g=>g.organization_id)?.organization_id??null
  await admin.from('audit_events').insert({organization_id:organizationId,actor_user_id:u.user.id,action:'QA_ROLE_PACK_RENEWED',resource_type:'qa_role_pack',purpose:'Extend synthetic QA access without rotating credentials or test fixtures',metadata:{mode:action,previous_expires_at:currentExpiry,new_expires_at:expiresAt,grants_updated:(updated??[]).length,preserved_credentials:true,preserved_test_data:true}})
  return new Response(JSON.stringify({ok:true,mode:action,expiresAt,grantsUpdated:(updated??[]).length,preservedCredentials:true,preservedTestData:true}),{headers:h})
 }catch(e){console.error(e);return new Response(JSON.stringify({error:'QA_ROLE_PACK_RENEW_FAILED'}),{status:500,headers:h})}
})
