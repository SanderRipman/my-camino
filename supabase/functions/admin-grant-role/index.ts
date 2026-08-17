import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = new Set(['https://my.aidme.no','https://main--mycamino.netlify.app','http://localhost:8888','http://localhost:3000'])
const allowedRoles = new Set(['system_admin','project_owner','program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics','observer','evaluator','break_glass'])
function cors(req: Request){const o=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigins.has(o)?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Vary':'Origin'}}
function decodeClaims(token:string){const p=token.split('.')[1];if(!p)return{};const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}

Deno.serve(async(req:Request)=>{
  const headers=cors(req)
  if(req.method==='OPTIONS')return new Response('ok',{headers})
  if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
  try{
    const authHeader=req.headers.get('Authorization')??''
    const token=authHeader.replace(/^Bearer\s+/i,'')
    if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
    const publishable=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default
    const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
    const userClient=createClient(Deno.env.get('SUPABASE_URL')!,publishable,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false}})
    const admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}})
    const {data:userData,error:userError}=await userClient.auth.getUser(token)
    if(userError||!userData.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
    if((decodeClaims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
    const now=new Date().toISOString()
    const {data:adminGrants,error:adminError}=await admin.from('role_grants').select('id,role_code,valid_from,valid_until,revoked_at').eq('user_id',userData.user.id).eq('role_code','system_admin')
    if(adminError)throw adminError
    const authorized=(adminGrants??[]).some((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now))
    if(!authorized)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})

    const body=await req.json()
    const targetUserId=String(body?.targetUserId??'')
    const roleCode=String(body?.roleCode??'')
    const participantId=body?.participantId?String(body.participantId):null
    const pilotId=body?.pilotId?String(body.pilotId):null
    const reason=body?.reason?String(body.reason).trim():null
    const validUntil=body?.validUntil?new Date(body.validUntil).toISOString():null
    if(!targetUserId||!allowedRoles.has(roleCode))return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})
    if(roleCode==='break_glass'&&(!reason||!validUntil))return new Response(JSON.stringify({error:'BREAK_GLASS_REQUIRES_REASON_AND_EXPIRY'}),{status:400,headers})

    const {data:org,error:orgError}=await admin.from('organizations').select('id').eq('name','AidMe VIDA').limit(1).maybeSingle()
    if(orgError||!org)throw orgError??new Error('Organization not found')
    const {data:existing}=await admin.from('role_grants').select('id').eq('organization_id',org.id).eq('user_id',targetUserId).eq('role_code',roleCode).is('revoked_at',null).limit(1)
    if((existing??[]).length)return new Response(JSON.stringify({error:'ACTIVE_GRANT_EXISTS'}),{status:409,headers})

    const {data,error}=await admin.from('role_grants').insert({organization_id:org.id,user_id:targetUserId,role_code:roleCode,participant_id:participantId,pilot_id:pilotId,reason,valid_until:validUntil,granted_by:userData.user.id}).select('id,role_code,participant_id,pilot_id,valid_until').single()
    if(error)throw error
    return new Response(JSON.stringify({ok:true,grant:data}),{status:200,headers})
  }catch(error){console.error(error);return new Response(JSON.stringify({error:'GRANT_FAILED'}),{status:500,headers})}
})
