import { createClient } from 'npm:@supabase/supabase-js@2'

// This function is for authenticated, fully synthetic UAT only.
// Production intake stays separate, fail-closed, and unchanged.
const DEMO_SOURCE='demo_uat_n1'
const DEMO_NAME='Mina Test'
const DEMO_EMAIL='mina.test@example.invalid'
const allowedOrigins=new Set([
  'https://demo.aidme.no',
  'https://my.aidme.no',
  'https://main--mycamino.netlify.app',
  'http://localhost:8888',
  'http://localhost:3000'
])
const scenarios=new Set([
  'Har kapasitet, men har mistet retning og motivasjon mot arbeid eller utdanning.',
  'Har stått lenge utenfor aktivitet og ønsker struktur, fellesskap og et konkret neste steg.',
  'Har kommet gjennom en krevende livsfase og ønsker å avklare retning før ny aktivitet.',
  'Ønsker en trygg VÍA-avklaring før eventuell SER-deltakelse.'
])

function headers(req:Request){
  const origin=req.headers.get('origin')??''
  return {
    'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:'https://my.aidme.no',
    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Content-Type':'application/json',
    'Cache-Control':'no-store',
    'Vary':'Origin'
  }
}
function reply(headers:Record<string,string>,status:number,body:unknown){
  return new Response(JSON.stringify(body),{status,headers})
}
function claims(token:string):Record<string,unknown>{
  try{
    const p=token.split('.')[1]
    if(!p)return {}
    const n=p.replace(/-/g,'+').replace(/_/g,'/')
    return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))
  }catch{return {}}
}

Deno.serve(async(req:Request)=>{
  const h=headers(req)
  if(req.method==='OPTIONS')return new Response('ok',{headers:h})
  if(req.method!=='POST')return reply(h,405,{error:'METHOD_NOT_ALLOWED'})
  const origin=req.headers.get('origin')??''
  if(!allowedOrigins.has(origin))return reply(h,403,{error:'ORIGIN_NOT_ALLOWED'})
  try{
    const auth=req.headers.get('Authorization')??''
    const token=auth.replace(/^Bearer\s+/i,'')
    if(!token)return reply(h,401,{error:'UNAUTHORIZED'})
    if(claims(token).aal!=='aal2')return reply(h,403,{error:'MFA_REQUIRED'})

    const pub=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default
    const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
    if(!pub||!secret)throw new Error('Missing Supabase keys')
    const url=Deno.env.get('SUPABASE_URL')!
    const userClient=createClient(url,pub,{global:{headers:{Authorization:auth}},auth:{persistSession:false}})
    const admin=createClient(url,secret,{auth:{persistSession:false}})
    const {data:userData,error:userError}=await userClient.auth.getUser(token)
    if(userError||!userData.user)return reply(h,401,{error:'UNAUTHORIZED'})

    const {data:org,error:orgError}=await admin.from('organizations').select('id').eq('name','AidMe VIDA').limit(1).maybeSingle()
    if(orgError||!org)throw orgError??new Error('Organization missing')
    const now=new Date().toISOString()
    const {data:grants,error:grantError}=await admin.from('role_grants')
      .select('role_code,valid_from,valid_until,revoked_at,participant_id,pilot_id')
      .eq('user_id',userData.user.id).eq('organization_id',org.id)
    if(grantError)throw grantError
    // Participant- or pilot-scoped grants never authorize organization-wide intake creation.
    const activeRoles=[...new Set((grants??[])
      .filter((g:any)=>!g.revoked_at&&!g.participant_id&&!g.pilot_id&&
        (!g.valid_from||g.valid_from<=now)&&(!g.valid_until||g.valid_until>now))
      .map((g:any)=>g.role_code))]
    const {data:perms,error:permsError}=activeRoles.length
      ?await admin.from('role_permissions').select('role_code').in('role_code',activeRoles).eq('capability','manage_intakes')
      :{data:[],error:null}
    if(permsError)throw permsError
    if(!activeRoles.includes('system_admin')&&!(perms??[]).length)return reply(h,403,{error:'FORBIDDEN'})

    // Never accept a user-supplied name, email, free text or health data in this lab.
    const body=await req.json().catch(()=>({}))
    const requested=String(body?.scenario??'')
    const scenario=scenarios.has(requested)?requested:[...scenarios][0]
    const row={
      organization_id:org.id,
      source:DEMO_SOURCE,
      status:'NEW',
      contact_name:DEMO_NAME,
      contact_email:DEMO_EMAIL,
      interest_text:scenario,
      interest_type:'PARTICIPANT',
      preferred_contact:'EMAIL',
      locale:'nb',
      privacy_notice_version:'DEMO-NOT-REAL-DATA'
    }
    const {data,error}=await admin.from('intakes')
      .insert(row).select('id,status,received_at').single()
    if(error)throw error
    return reply(h,201,{ok:true,intake:data,demo:true,label:DEMO_NAME})
  }catch(error){
    console.error('DEMO_CREATE_FAILED',error)
    return reply(h,500,{error:'DEMO_CREATE_FAILED'})
  }
})
