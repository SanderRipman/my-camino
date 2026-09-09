import { createClient } from 'npm:@supabase/supabase-js@2'

const PROD_INVITE_REDIRECT='https://my.aidme.no/welcome.html'
function isDemoOrigin(origin:string){return origin==='https://demo.aidme.no'||origin==='https://mycamino-demo.netlify.app'||/^https:\/\/[a-z0-9-]+--mycamino-demo\.netlify\.app$/.test(origin)}
function allowedOrigin(origin:string){return ['https://my.aidme.no','https://main--mycamino.netlify.app','https://demo.aidme.no','https://mycamino-demo.netlify.app','http://localhost:8888','http://localhost:3000'].includes(origin)||/^https:\/\/deploy-preview-\d+--mycamino\.netlify\.app$/.test(origin)||/^https:\/\/[a-z0-9-]+--mycamino-demo\.netlify\.app$/.test(origin)}
function inviteRedirect(origin:string){return isDemoOrigin(origin)?`${origin}/portal/welcome.html`:PROD_INVITE_REDIRECT}
function loginUrl(origin:string){return isDemoOrigin(origin)?`${origin}/portal/`:'https://my.aidme.no/'}
function cors(req:Request){const origin=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigin(origin)?origin:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Vary':'Origin','Cache-Control':'no-store'}}
function decodeClaims(token:string){const p=token.split('.')[1];if(!p)return{};const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin')??''
 const headers=cors(req)
 if(req.method==='OPTIONS')return new Response('ok',{headers})
 if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
 try{
  if(!allowedOrigin(origin))return new Response(JSON.stringify({error:'ORIGIN_NOT_ALLOWED'}),{status:403,headers})
  const authHeader=req.headers.get('Authorization')??'',token=authHeader.replace(/^Bearer\s+/i,'')
  if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  const publishable=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
  if(!publishable||!secret)throw new Error('Missing Supabase keys')
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,publishable,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}})
  const {data:userData,error:userError}=await userClient.auth.getUser(token)
  if(userError||!userData.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  if((decodeClaims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
  const now=new Date().toISOString(),{data:grants,error:grantError}=await admin.from('role_grants').select('valid_from,valid_until,revoked_at').eq('user_id',userData.user.id).eq('role_code','system_admin')
  if(grantError)throw grantError
  const authorized=(grants??[]).some((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now))
  if(!authorized)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers})
  const body=await req.json(),email=String(body?.email??'').trim().toLowerCase()
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return new Response(JSON.stringify({error:'INVALID_EMAIL'}),{status:400,headers})
  const redirectTo=inviteRedirect(origin)
  const {data,error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo})
  if(error){
    console.error('invite failed',error.message)
    const message=String(error.message||'').toLowerCase()
    if(message.includes('already')||message.includes('registered')||message.includes('exists'))return new Response(JSON.stringify({error:'USER_ALREADY_EXISTS',loginUrl:loginUrl(origin),redirectTo}),{status:409,headers})
    throw error
  }
  const {error:auditError}=await admin.from('audit_events').insert({actor_user_id:userData.user.id,action:'USER_INVITED',resource_type:'auth_user',resource_id:data.user?.id??email,purpose:'portal_invitation',metadata:{email,redirect_to:redirectTo,origin}})
  if(auditError)console.error('USER_INVITE_AUDIT_FAILED',auditError)
  return new Response(JSON.stringify({ok:true,userId:data.user?.id??null,email,redirectTo,auditLogged:!auditError}),{status:200,headers})
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'INVITE_FAILED'}),{status:500,headers})}
})
