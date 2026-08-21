import { createClient } from 'npm:@supabase/supabase-js@2'

function cors(req:Request){
  const origin=req.headers.get('origin')??''
  const allowed=origin==='https://my.aidme.no'||origin==='http://localhost:8888'||origin==='http://localhost:3000'||/^https:\/\/(?:deploy-preview-\d+--|[a-z0-9-]+--)?mycamino\.netlify\.app$/.test(origin)
  return {
    'Access-Control-Allow-Origin':allowed?origin:'https://my.aidme.no',
    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Content-Type':'application/json',
    'Cache-Control':'no-store',
    'Vary':'Origin'
  }
}
function claims(token:string){
  const part=token.split('.')[1];if(!part)return{} as Record<string,unknown>
  const normalized=part.replace(/-/g,'+').replace(/_/g,'/')
  return JSON.parse(atob(normalized+'='.repeat((4-normalized.length%4)%4))) as Record<string,unknown>
}
function id(v:unknown){const s=String(v??'').trim();return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)?s:null}
function same(a:unknown,b:unknown){return (a??null)===(b??null)}
function safeCode(error:any){
  const message=String(error?.message??'')
  for(const code of ['FORM_VERSION_NOT_ACTIVE','FORM_PAYLOAD_MUST_BE_OBJECT','UNEXPECTED_FORM_FIELD','REQUIRED_CONFIRMATION_MISSING','REQUIRED_SELECTION_MISSING','REQUIRED_ACTION_MISSING','REQUIRED_VALUE_MISSING','INDIVIDUAL_GO_REQUIRES_PARTICIPANT','INVALID_INDIVIDUAL_GO_DECISION','GO_REQUIRES_ALL_GATES_YES','CONDITIONAL_GO_REQUIRES_CORE_FIT_AND_CONDITIONS','PILOT_GO_REQUIRES_PILOT','INVALID_PILOT_GO_DECISION','PILOT_GO_REQUIRES_ALL_GATES_YES','PILOT_CONDITIONAL_GO_REQUIRES_CONDITIONS','PILOT_GO_REQUIRES_ALL_INDIVIDUAL_GATES_CLOSED','PILOT_GO_REQUIRES_NAMED_VIDA_OWNER_FOR_ALL','ACTIVE_PARTICIPANT_AGREEMENT_VERSION_REQUIRED','NAMED_VIDA_OWNER_REQUIRED']){
    if(message.includes(code))return code
  }
  if(error?.code==='42501'||message.toLowerCase().includes('row-level security'))return 'FORBIDDEN'
  return 'FORM_SAVE_FAILED'
}

Deno.serve(async(req:Request)=>{
  const headers=cors(req)
  if(req.method==='OPTIONS')return new Response('ok',{headers})
  if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
  try{
    const authHeader=req.headers.get('Authorization')??'',token=authHeader.replace(/^Bearer\s+/i,'')
    if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
    if(claims(token).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
    const publishable=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default
    if(!publishable)throw new Error('Missing publishable key')
    // Deliberately use the caller's JWT for database writes. Existing RLS, auth.uid(), validation,
    // formal gate and audit triggers therefore remain the hard authorization boundary.
    const userClient=createClient(Deno.env.get('SUPABASE_URL')!,publishable,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false}})
    const {data:userData,error:userError}=await userClient.auth.getUser(token)
    if(userError||!userData.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})

    const body=await req.json(),action=String(body?.action??'SAVE').toUpperCase()
    if(action!=='SAVE')return new Response(JSON.stringify({error:'UNKNOWN_ACTION'}),{status:400,headers})
    const status=String(body?.status??'').toUpperCase()
    if(!['DRAFT','SUBMITTED'].includes(status))return new Response(JSON.stringify({error:'INVALID_STATUS'}),{status:400,headers})
    if(!body?.payload||typeof body.payload!=='object'||Array.isArray(body.payload))return new Response(JSON.stringify({error:'INVALID_PAYLOAD'}),{status:400,headers})
    if(JSON.stringify(body.payload).length>100000)return new Response(JSON.stringify({error:'PAYLOAD_TOO_LARGE'}),{status:413,headers})

    const organizationId=id(body?.organizationId),participantId=body?.participantId?id(body.participantId):null,pilotId=body?.pilotId?id(body.pilotId):null,formVersionId=id(body?.formVersionId),requestedSubmissionId=body?.submissionId?id(body.submissionId):null
    if(!organizationId||!formVersionId||(body?.participantId&&!participantId)||(body?.pilotId&&!pilotId)||(body?.submissionId&&!requestedSubmissionId))return new Response(JSON.stringify({error:'INVALID_CONTEXT'}),{status:400,headers})
    const now=new Date().toISOString()

    let existing:any=null
    if(requestedSubmissionId){
      const {data,error}=await userClient.from('form_submissions').select('id,organization_id,participant_id,pilot_id,form_version_id,submitted_by,status').eq('id',requestedSubmissionId).maybeSingle()
      if(error)return new Response(JSON.stringify({error:safeCode(error)}),{status:403,headers})
      if(!data)return new Response(JSON.stringify({error:'SUBMISSION_NOT_FOUND'}),{status:404,headers})
      existing=data
      if(existing.status!=='DRAFT')return new Response(JSON.stringify({error:'SUBMISSION_IMMUTABLE'}),{status:409,headers})
      if(!same(existing.organization_id,organizationId)||!same(existing.participant_id,participantId)||!same(existing.pilot_id,pilotId)||!same(existing.form_version_id,formVersionId))return new Response(JSON.stringify({error:'CONTEXT_IMMUTABLE'}),{status:409,headers})
    }else{
      // Reuse the caller's own draft in the same immutable context. This avoids accidental duplicate drafts.
      let q=userClient.from('form_submissions').select('id,organization_id,participant_id,pilot_id,form_version_id,submitted_by,status').eq('organization_id',organizationId).eq('form_version_id',formVersionId).eq('submitted_by',userData.user.id).eq('status','DRAFT').order('updated_at',{ascending:false}).limit(1)
      q=participantId?q.eq('participant_id',participantId):q.is('participant_id',null)
      q=pilotId?q.eq('pilot_id',pilotId):q.is('pilot_id',null)
      const {data,error}=await q.maybeSingle()
      if(error)return new Response(JSON.stringify({error:safeCode(error)}),{status:403,headers})
      existing=data??null
    }

    let result:any
    if(existing){
      const patch={status,payload:body.payload,updated_at:now,submitted_at:status==='SUBMITTED'?now:null}
      const {data,error}=await userClient.from('form_submissions').update(patch).eq('id',existing.id).eq('status','DRAFT').select('id,status,updated_at,submitted_at').maybeSingle()
      if(error)return new Response(JSON.stringify({error:safeCode(error)}),{status:safeCode(error)==='FORBIDDEN'?403:409,headers})
      if(!data)return new Response(JSON.stringify({error:'STALE_DRAFT'}),{status:409,headers})
      result=data
    }else{
      const row={organization_id:organizationId,participant_id:participantId,pilot_id:pilotId,form_version_id:formVersionId,submitted_by:userData.user.id,status,payload:body.payload,updated_at:now,submitted_at:status==='SUBMITTED'?now:null}
      const {data,error}=await userClient.from('form_submissions').insert(row).select('id,status,updated_at,submitted_at').single()
      if(error)return new Response(JSON.stringify({error:safeCode(error)}),{status:safeCode(error)==='FORBIDDEN'?403:409,headers})
      result=data
    }
    return new Response(JSON.stringify({ok:true,submission:result}),{status:200,headers})
  }catch(error){console.error(error);return new Response(JSON.stringify({error:'FORM_COMMAND_FAILED'}),{status:500,headers})}
})
