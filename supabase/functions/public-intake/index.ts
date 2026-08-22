import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = new Set([
  'https://www.aidme.no',
  'https://aidme.no',
  'https://aidme-public-preview.netlify.app',
  'https://dev.aidme.no',
  'http://localhost:8888',
  'http://localhost:3000'
])
const interestTypes = new Set(['PARTICIPANT','REFERRAL','PARTNER','FINANCIER','PROFESSIONAL','OTHER'])
const contactMethods = new Set(['EMAIL','PHONE'])
const referralRoles = new Set(['NAV','EMPLOYER','PROFESSIONAL','FAMILY_FRIEND','OTHER',''])
const contextPattern = /^[a-z0-9_-]{0,48}$/i
const encoder = new TextEncoder()

function headers(req:Request){
  const origin=req.headers.get('origin')??''
  return {
    'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:'https://www.aidme.no',
    'Access-Control-Allow-Headers':'content-type, x-client-info',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Content-Type':'application/json',
    'Cache-Control':'no-store',
    'Vary':'Origin'
  }
}
function reply(req:Request,status:number,payload:Record<string,unknown>){return new Response(JSON.stringify(payload),{status,headers:headers(req)})}
function firstIp(req:Request){return(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'').trim()}
async function sha256(v:string){const d=await crypto.subtle.digest('SHA-256',encoder.encode(v));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function verifyTurnstile(token:string,ip:string,secret:string){
  const form=new FormData();form.set('secret',secret);form.set('response',token);if(ip)form.set('remoteip',ip)
  const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form})
  if(!res.ok)return false
  const json=await res.json();return json?.success===true
}
function safeText(v:unknown,max:number){return String(v??'').trim().replace(/\s+/g,' ').slice(0,max)}
function readiness(){
  const enabled=Deno.env.get('PUBLIC_INTAKE_ENABLED')==='true'
  const turnstileSecret=Deno.env.get('TURNSTILE_SECRET_KEY')??''
  const turnstileSiteKey=Deno.env.get('TURNSTILE_SITE_KEY')??''
  const rateSalt=Deno.env.get('INTAKE_RATE_SALT')??''
  return {enabled,turnstileSecret,turnstileSiteKey,rateSalt,ready:enabled&&!!turnstileSecret&&!!turnstileSiteKey&&!!rateSalt}
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:headers(req)})
  const gate=readiness()
  if(req.method==='GET'){
    return reply(req,200,{ok:true,enabled:gate.ready,turnstileSiteKey:gate.ready?gate.turnstileSiteKey:null,privacyNoticeVersion:'aidme-public-interest-v0.2-2026-08-22'})
  }
  if(req.method!=='POST')return reply(req,405,{error:'METHOD_NOT_ALLOWED'})
  if(!gate.ready)return reply(req,503,{error:'INTAKE_NOT_ENABLED'})

  try{
    const origin=req.headers.get('origin')??''
    if(!allowedOrigins.has(origin))return reply(req,403,{error:'ORIGIN_NOT_ALLOWED'})

    const body=await req.json()
    const name=safeText(body?.name,120)
    const email=safeText(body?.email,254).toLowerCase()
    const phone=safeText(body?.phone,40)
    const interestType=safeText(body?.interestType,32).toUpperCase()
    const preferredContact=safeText(body?.preferredContact||'EMAIL',16).toUpperCase()
    const privacyVersion=safeText(body?.privacyNoticeVersion,80)
    const locale=safeText(body?.locale||'nb',8).toLowerCase()
    const turnstileToken=safeText(body?.turnstileToken,4096)
    const sourceContext=safeText(body?.sourceContext,48).toLowerCase()
    const referralRole=safeText(body?.referralRole,32).toUpperCase()
    const organizationName=safeText(body?.organizationName,120)
    const honeypot=safeText(body?.website,160)

    if(honeypot)return reply(req,400,{error:'INVALID_INPUT'})
    if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!interestTypes.has(interestType)||!contactMethods.has(preferredContact)||!privacyVersion||!turnstileToken)return reply(req,400,{error:'INVALID_INPUT'})
    if(preferredContact==='PHONE'&&!phone)return reply(req,400,{error:'PHONE_REQUIRED'})
    if(!contextPattern.test(sourceContext)||!referralRoles.has(referralRole))return reply(req,400,{error:'INVALID_CONTEXT'})
    if(interestType==='REFERRAL'&&!referralRole)return reply(req,400,{error:'REFERRAL_ROLE_REQUIRED'})

    const ip=firstIp(req)
    if(!await verifyTurnstile(turnstileToken,ip,gate.turnstileSecret))return reply(req,403,{error:'CAPTCHA_FAILED'})

    const fingerprint=await sha256(`${gate.rateSalt}:${ip||email}`)
    const now=new Date(),hourStart=new Date(now);hourStart.setUTCMinutes(0,0,0)
    const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
    if(!secret)throw new Error('Missing Supabase secret key')
    const admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}})

    await admin.from('intake_rate_limits').delete().lt('window_start',new Date(Date.now()-48*3600000).toISOString())
    const {data:rateRow,error:rateReadError}=await admin.from('intake_rate_limits').select('request_count').eq('fingerprint_hash',fingerprint).eq('window_start',hourStart.toISOString()).maybeSingle()
    if(rateReadError)throw rateReadError
    if((rateRow?.request_count??0)>=5)return reply(req,429,{error:'RATE_LIMITED'})
    const {error:rateWriteError}=await admin.from('intake_rate_limits').upsert({fingerprint_hash:fingerprint,window_start:hourStart.toISOString(),request_count:(rateRow?.request_count??0)+1,updated_at:now.toISOString()},{onConflict:'fingerprint_hash,window_start'})
    if(rateWriteError)throw rateWriteError

    const {data:org,error:orgError}=await admin.from('organizations').select('id').eq('name','AidMe VIDA').limit(1).maybeSingle()
    if(orgError||!org)throw orgError??new Error('Organization not found')

    const contextParts:string[]=[]
    if(sourceContext)contextParts.push(`Kildekontekst: ${sourceContext}`)
    if(interestType==='REFERRAL')contextParts.push(`Henviserrolle: ${referralRole}`)
    if(organizationName)contextParts.push(`Virksomhet: ${organizationName}`)
    const interestText=contextParts.length?contextParts.join(' · '):null

    const {data:intake,error:intakeError}=await admin.from('intakes').insert({
      organization_id:org.id,
      source:'PUBLIC_WEB',
      status:'NEW',
      contact_name:name,
      contact_email:email,
      contact_phone:phone||null,
      interest_type:interestType,
      preferred_contact:preferredContact,
      locale,
      interest_text:interestText,
      privacy_notice_version:privacyVersion
    }).select('id,received_at').single()
    if(intakeError)throw intakeError
    return reply(req,201,{ok:true,reference:intake.id})
  }catch(error){
    console.error(error)
    return reply(req,500,{error:'INTAKE_FAILED'})
  }
})
