import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = new Set(['https://my.aidme.no','https://main--mycamino.netlify.app','http://localhost:8888','http://localhost:3000'])
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
    const {data:adminGrants,error:adminError}=await admin.from('role_grants').select('id,valid_from,valid_until,revoked_at').eq('user_id',userData.user.id).eq('role_code','system_admin')
    if(adminError)throw adminError
    const authorized=(adminGrants??[]).some((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now))
    if(!authorized)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})

    const body=await req.json()
    const grantId=String(body?.grantId??'')
    const reason=String(body?.reason??'').trim()
    if(!grantId||!reason)return new Response(JSON.stringify({error:'GRANT_ID_AND_REASON_REQUIRED'}),{status:400,headers})

    const {data:grant,error:grantError}=await admin.from('role_grants').select('id,user_id,role_code,revoked_at').eq('id',grantId).maybeSingle()
    if(grantError||!grant)return new Response(JSON.stringify({error:'GRANT_NOT_FOUND'}),{status:404,headers})
    if(grant.revoked_at)return new Response(JSON.stringify({ok:true,alreadyRevoked:true,grantId}),{status:200,headers})
    if(grant.role_code==='system_admin'&&grant.user_id===userData.user.id){
      const {count,error:countError}=await admin.from('role_grants').select('id',{count:'exact',head:true}).eq('role_code','system_admin').is('revoked_at',null)
      if(countError)throw countError
      if((count??0)<=1)return new Response(JSON.stringify({error:'CANNOT_REVOKE_LAST_SYSTEM_ADMIN'}),{status:409,headers})
    }

    const {data,error}=await admin.from('role_grants').update({revoked_at:now,reason:`${grant.role_code}: revoked – ${reason}`}).eq('id',grantId).select('id,role_code,revoked_at').single()
    if(error)throw error
    return new Response(JSON.stringify({ok:true,grant:data}),{status:200,headers})
  }catch(error){console.error(error);return new Response(JSON.stringify({error:'REVOKE_FAILED'}),{status:500,headers})}
})
