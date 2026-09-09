import { createClient } from 'npm:@supabase/supabase-js@2'

const ALLOW_HEADERS='authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage'
function allowedOrigin(o:string){return o==='https://demo.aidme.no'||o==='https://demo-uat--mycamino-demo.netlify.app'||o==='https://mycamino-demo.netlify.app'||o==='http://localhost:8888'||o==='http://localhost:3000'||/^https:\/\/deploy-preview-\d+--mycamino-demo\.netlify\.app$/.test(o)||/^https:\/\/[a-z0-9-]+--mycamino-demo\.netlify\.app$/.test(o)}
function cors(req:Request){const o=req.headers.get('origin')??'';return{'Access-Control-Allow-Origin':allowedOrigin(o)?o:'https://demo.aidme.no','Access-Control-Allow-Headers':ALLOW_HEADERS,'Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}}
function claims(t:string){const p=t.split('.')[1];if(!p)return{} as any;const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}
function active(g:any){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)}
function syntheticName(v:any){return /^(?:DEMO-|QA-|SELFTEST-|Deltaker Demo)/i.test(String(v??''))}
function phaseOfStage(v:any){const s=String(v??'').toUpperCase();if(['VIA','INTEREST','READY_FOR_GO','GO','GO_WITH_CONDITIONS','POSTPONED','NO_GO'].includes(s))return'VÍA';if(s==='SER')return'SER';if(s==='VIDA')return'VIDA';if(s==='NEW_VIA')return'ny VÍA';return null}
function key(t:any){return String(t?.workflow_key??'').toLowerCase()}
function type(t:any){return String(t?.task_type??'').toUpperCase()}
function title(t:any){return String(t?.title??'').toLowerCase()}
function taskPhase(t:any,participantPhase:Map<string,string>){const k=key(t),ty=type(t),x=title(t);if(k.startsWith('intake_triage:')||['via_first_contact','individual_go','go_conditions','pilot_go','qa_project_program_gate'].includes(k)||['VIA_REVIEW','GO_CONDITION','VIDA_OWNER_GATE'].includes(ty)||/interesse|vía|go.no.go|pilot.go|vida.eier/.test(x))return'VÍA';if(k.startsWith('ser_')||['SER_ADAPTATION','INCIDENT_FOLLOWUP'].includes(ty)||/etappe|videre vandring|ser /.test(x))return'SER';if((k.startsWith('vida_')&&!k.includes('new_via'))||ty==='VIDA_FOLLOWUP'||/72t|72 timer|14 dag|30 dag|90 dag/.test(x))return'VIDA';if(['new_via','new_via_review'].includes(k)||ty==='VIA_NEXT'||/ny vía|neste retning/.test(x))return'ny VÍA';return participantPhase.get(String(t?.participant_id??''))??null}
function clarification(t:any){const k=key(t),ty=type(t),x=title(t);if(String(t?.status).toUpperCase()==='WAITING')return true;if(k.startsWith('intake_triage:')||['via_first_contact','individual_go','go_conditions','pilot_go','qa_project_program_gate','ser_daily','ser_incident','vida_72h','new_via','new_via_review'].includes(k))return true;if(['VIA_REVIEW','GO_CONDITION','VIDA_OWNER_GATE','SER_ADAPTATION','INCIDENT_FOLLOWUP','VIDA_FOLLOWUP','VIA_NEXT'].includes(ty))return true;return /avklar|vurder|triage|vilkår|vida.eier|neste retning|handling mangler/.test(x)}

Deno.serve(async(req:Request)=>{
 const headers=cors(req);if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers});
 try{
  const origin=req.headers.get('origin')??'';if(!allowedOrigin(origin))return new Response(JSON.stringify({error:'UAT_ORIGIN_REQUIRED'}),{status:403,headers});
  const ah=req.headers.get('Authorization')??'',token=ah.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers});if((claims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers});
  const pk=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default,sk=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default;if(!pk||!sk)throw new Error('Missing keys');
  const uc=createClient(Deno.env.get('SUPABASE_URL')!,pk,{global:{headers:{Authorization:ah}},auth:{persistSession:false}}),admin=createClient(Deno.env.get('SUPABASE_URL')!,sk,{auth:{persistSession:false}});
  const {data:u,error:ue}=await uc.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers});
  const {data:grants,error:ge}=await admin.from('role_grants').select('organization_id,role_code,valid_from,valid_until,revoked_at').eq('user_id',u.user.id);if(ge)throw ge;const activeGrants=(grants??[]).filter(active);if(!activeGrants.length)return new Response(JSON.stringify({error:'STAFF_ROLE_REQUIRED'}),{status:403,headers});
  const orgId=activeGrants[0].organization_id;if(activeGrants.some((g:any)=>g.organization_id!==orgId))return new Response(JSON.stringify({error:'AMBIGUOUS_ORGANIZATION'}),{status:409,headers});
  const [{data:participants,error:pe},{data:intakes,error:ie},{data:tasks,error:te}]=await Promise.all([
   admin.from('participants').select('id,code_name,stage').eq('organization_id',orgId),
   admin.from('intakes').select('id').eq('organization_id',orgId).eq('source','demo_uat_p2'),
   admin.from('tasks').select('id,participant_id,pilot_id,title,status,severity,task_type,workflow_key,source_type,source_id').eq('organization_id',orgId).in('status',['OPEN','IN_PROGRESS','WAITING']).limit(1000)
  ]);if(pe||ie||te)throw pe||ie||te;
  const safeParticipants=(participants??[]).filter((p:any)=>syntheticName(p.code_name));const participantIds=new Set(safeParticipants.map((p:any)=>String(p.id))),p2IntakeIds=new Set((intakes??[]).map((x:any)=>String(x.id)));
  const participantPhase=new Map<string,string>();const phaseCounts:any={'VÍA':0,'SER':0,'VIDA':0,'ny VÍA':0};for(const p of safeParticipants){const ph=phaseOfStage(p.stage);if(ph){participantPhase.set(String(p.id),ph);phaseCounts[ph]++}}
  const safeTasks=(tasks??[]).filter((t:any)=>participantIds.has(String(t.participant_id??''))||(t.source_type==='intake'&&p2IntakeIds.has(String(t.source_id??'')))||['qa_role_pack','DEMO_STRESS_PACK','demo'].includes(String(t.source_type??'')));
  const clarifications:any={'VÍA':0,'SER':0,'VIDA':0,'ny VÍA':0};for(const t of safeTasks){if(!clarification(t))continue;const ph=taskPhase(t,participantPhase);if(ph&&ph in clarifications)clarifications[ph]++}
  const total=Object.values(clarifications).reduce((a:any,b:any)=>Number(a)+Number(b),0);
  await admin.from('audit_events').insert({organization_id:orgId,actor_user_id:u.user.id,action:'UAT_CONTINUITY_SNAPSHOT',resource_type:'uat_continuity',resource_id:null,purpose:'Early-UAT aggregate continuity across VÍA/SER/VIDA',metadata:{origin,role_codes:[...new Set(activeGrants.map((g:any)=>g.role_code))],phase_counts:phaseCounts,clarification_total:total}});
  return new Response(JSON.stringify({ok:true,phase_counts:phaseCounts,clarifications_by_phase:clarifications,clarification_total:total,guardrails:{synthetic_only:true,aggregate_only:true,no_identity:true,no_health_data:true,no_contact_data:true,no_documents:true}}),{status:200,headers});
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'UAT_CONTINUITY_FAILED'}),{status:500,headers})}
})
