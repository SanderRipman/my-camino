import { createClient } from 'npm:@supabase/supabase-js@2'

const CONTACT=['CONTACTED','NOT_CONTACTED','UNREACHABLE','NOT_APPLICABLE']
const NEXT_VIA=['NOT_NOW','CONSIDER_LATER','READY_FOR_NEW_VIA','NOT_APPLICABLE']
function allowedOrigin(origin:string){return ['https://my.aidme.no','https://demo.aidme.no','https://main--mycamino.netlify.app','https://demo-uat--mycamino-demo.netlify.app','http://localhost:8888','http://localhost:3000'].includes(origin)||/^https:\/\/deploy-preview-\d+--mycamino(?:-demo)?\.netlify\.app$/.test(origin)}
function cors(req:Request){const o=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigin(o)?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}}
function claims(t:string){const p=t.split('.')[1];if(!p)return{};const n=p.replace(/-/g,'+').replace(/_/g,'/');try{return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}catch{return{}}}
function rpcError(error:any){const message=String(error?.message??'');if(['ACTIVE_TASKS','OPEN_INCIDENT','OPEN_SOS'].includes(message))return {status:409,body:{error:'ARCHIVE_BLOCKED',blocker:message}};if(message==='FORBIDDEN')return {status:403,body:{error:'FORBIDDEN'}};if(['ALREADY_ACTIVE','ALREADY_ARCHIVED','STALE_STATE'].includes(message))return {status:409,body:{error:message}};if(message==='PARTICIPANT_NOT_FOUND')return {status:404,body:{error:message}};if(message.startsWith('INVALID_'))return {status:400,body:{error:'INVALID_INPUT'}};return {status:500,body:{error:'PARTICIPANT_LIFECYCLE_FAILED'}}}

Deno.serve(async(req:Request)=>{
 const headers=cors(req);if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers})
 try{
  const ah=req.headers.get('Authorization')??'',token=ah.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers})
  const pk=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,sk=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default;if(!pk||!sk)throw new Error('Missing keys')
  const uc=createClient(Deno.env.get('SUPABASE_URL')!,pk,{global:{headers:{Authorization:ah}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,sk,{auth:{persistSession:false}})
  const {data:u,error:ue}=await uc.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers});if((claims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers})
  const b=await req.json(),participantId=String(b?.participantId??'').trim(),action=String(b?.action??'').trim().toUpperCase(),reason=String(b?.reason??'').trim().replace(/\s+/g,' '),contactStatus=String(b?.contactStatus??'').trim().toUpperCase(),nextViaAssessment=String(b?.nextViaAssessment??'').trim().toUpperCase();
  if(!participantId||!['ARCHIVE','RESTORE'].includes(action)||reason.length<8||reason.length>500||!CONTACT.includes(contactStatus)||!NEXT_VIA.includes(nextViaAssessment))return new Response(JSON.stringify({error:'INVALID_INPUT'}),{status:400,headers})
  const {data:participant,error}=await admin.rpc('apply_participant_lifecycle',{p_actor_user_id:u.user.id,p_participant_id:participantId,p_action:action,p_reason:reason,p_contact_status:contactStatus,p_next_via_assessment:nextViaAssessment});
  if(error){const mapped=rpcError(error);return new Response(JSON.stringify(mapped.body),{status:mapped.status,headers})}
  return new Response(JSON.stringify({ok:true,participant}),{status:200,headers})
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'PARTICIPANT_LIFECYCLE_FAILED'}),{status:500,headers})}
})
