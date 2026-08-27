import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins=new Set(['https://my.aidme.no','https://main--mycamino.netlify.app','http://localhost:8888','http://localhost:3000']);
function headers(req:Request){const o=req.headers.get('origin')??'';return {'Access-Control-Allow-Origin':allowedOrigins.has(o)?o:'https://my.aidme.no','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}}
function claims(token:string){try{const p=token.split('.')[1];const n=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(n+'='.repeat((4-n.length%4)%4)))}catch{return{}}}
function makePassword(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return [...bytes].map(b=>alphabet[b%alphabet.length]).join('')}

Deno.serve(async(req:Request)=>{
 const h=headers(req);if(req.method==='OPTIONS')return new Response('ok',{headers:h});if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers:h});
 try{
  const auth=req.headers.get('Authorization')??'';const token=auth.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers:h});
  if((claims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers:h});
  const pub=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default;const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default;
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,pub,{global:{headers:{Authorization:auth}},auth:{persistSession:false}});
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}});
  const {data:u,error:ue}=await userClient.auth.getUser(token);if(ue||!u.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers:h});
  const now=new Date();const nowIso=now.toISOString();
  const {data:grants,error:ge}=await admin.from('role_grants').select('role_code,valid_from,valid_until,revoked_at').eq('user_id',u.user.id);if(ge)throw ge;
  const active=(grants??[]).filter((g:any)=>!g.revoked_at&&(!g.valid_from||g.valid_from<=nowIso)&&(!g.valid_until||g.valid_until>nowIso)).map((g:any)=>g.role_code);
  if(!active.includes('system_admin'))return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers:h});
  const {data:org,error:oe}=await admin.from('organizations').select('id').eq('name','AidMe VIDA').limit(1).maybeSingle();if(oe||!org)throw oe??new Error('ORG_NOT_FOUND');
  const {data:pilot,error:pe}=await admin.from('pilots').select('id').eq('organization_id',org.id).eq('status','DEMO').limit(1).maybeSingle();if(pe||!pilot)throw pe??new Error('DEMO_PILOT_NOT_FOUND');

  async function ensureQaParticipant(code:string,stage:'VIA'|'VIDA'){
   const {data:existing,error:se}=await admin.from('participants').select('id,code_name,user_id,stage').eq('organization_id',org.id).eq('code_name',code).maybeSingle();if(se)throw se;
   if(existing){
    const {data:updated,error:ue}=await admin.from('participants').update({stage,active:true,updated_at:nowIso}).eq('id',existing.id).select('id,code_name,user_id,stage').single();if(ue||!updated)throw ue??new Error('QA_FIXTURE_UPDATE_FAILED');
    return updated;
   }
   const {data:created,error:ce}=await admin.from('participants').insert({organization_id:org.id,code_name:code,stage,active:true,created_by:u.user.id}).select('id,code_name,user_id,stage').single();if(ce||!created)throw ce??new Error('QA_FIXTURE_CREATE_FAILED');
   return created;
  }
  const qaVia=await ensureQaParticipant('QA-ROLE-VIA-01','VIA');
  const qaVida=await ensureQaParticipant('QA-ROLE-VIDA-01','VIDA');
  const byCode:any={'QA-ROLE-VIA-01':qaVia,'QA-ROLE-VIDA-01':qaVida};

  const specs=[
   {key:'participant',email:'qa-participant@example.invalid',name:'QA Deltaker',role:null,participant:'QA-ROLE-VIA-01',pilot:null,title:'Deltaker'},
   {key:'via_owner',email:'qa-via@example.invalid',name:'QA VÍA',role:'via_owner',participant:'QA-ROLE-VIA-01',pilot:null,title:'VÍA-ansvarlig'},
   {key:'clinical_professional',email:'qa-fag@example.invalid',name:'QA Fagperson',role:'clinical_professional',participant:'QA-ROLE-VIA-01',pilot:null,title:'Relevant fagperson'},
   {key:'ser_lead',email:'qa-ser@example.invalid',name:'QA SER',role:'ser_lead',participant:null,pilot:pilot.id,title:'SER-/turleder'},
   {key:'vida_owner',email:'qa-vida@example.invalid',name:'QA VIDA',role:'vida_owner',participant:'QA-ROLE-VIDA-01',pilot:null,title:'VIDA-eier'},
   {key:'logistics',email:'qa-logistics@example.invalid',name:'QA Logistikk',role:'logistics',participant:null,pilot:pilot.id,title:'Logistikk / beredskap'},
   {key:'program_lead',email:'qa-program@example.invalid',name:'QA Programleder',role:'program_lead',participant:null,pilot:pilot.id,title:'Programleder'},
   {key:'project_owner',email:'qa-project@example.invalid',name:'QA Prosjekteier',role:'project_owner',participant:null,pilot:null,title:'Prosjekteier'},
   {key:'observer',email:'qa-observer@example.invalid',name:'QA Observatør',role:'observer',participant:null,pilot:pilot.id,title:'Observatør'},
   {key:'evaluator',email:'qa-evaluator@example.invalid',name:'QA Evaluator',role:'evaluator',participant:null,pilot:pilot.id,title:'Evaluator'}
  ];
  const {data:list,error:le}=await admin.auth.admin.listUsers({page:1,perPage:1000});if(le)throw le;const existing=new Map((list.users??[]).map((x:any)=>[String(x.email).toLowerCase(),x]));
  const expires=new Date(now.getTime()+36*60*60*1000).toISOString();const result:any[]=[];
  for(const s of specs){
   const password=makePassword();let user:any=existing.get(s.email.toLowerCase());
   if(user){const {data:upd,error}=await admin.auth.admin.updateUserById(user.id,{password,email_confirm:true,user_metadata:{qa_role_pack:true,qa_key:s.key}});if(error)throw error;user=upd.user}
   else {const {data:cre,error}=await admin.auth.admin.createUser({email:s.email,password,email_confirm:true,user_metadata:{qa_role_pack:true,qa_key:s.key}});if(error)throw error;user=cre.user;existing.set(s.email.toLowerCase(),user)}
   const {error:pre}=await admin.from('profiles').upsert({user_id:user.id,display_name:s.name,locale:'nb',active:true},{onConflict:'user_id'});if(pre)throw pre;
   if(s.role){
    const {error:sp}=await admin.from('staff_profiles').upsert({user_id:user.id,full_name:s.name,job_title:s.title,work_email:s.email,organization_id:org.id,active:true},{onConflict:'user_id'});if(sp)throw sp;
    const {error:rv}=await admin.from('role_grants').update({revoked_at:nowIso}).eq('user_id',user.id).eq('reason','SYNTHETIC_QA_ROLE_PACK').is('revoked_at',null);if(rv)throw rv;
    const {error:ri}=await admin.from('role_grants').insert({organization_id:org.id,user_id:user.id,role_code:s.role,participant_id:s.participant?byCode[s.participant].id:null,pilot_id:s.pilot,reason:'SYNTHETIC_QA_ROLE_PACK',valid_from:nowIso,valid_until:expires,granted_by:u.user.id});if(ri)throw ri;
   } else {
    const p=byCode[s.participant];if(p.user_id&&p.user_id!==user.id)throw new Error('QA_PARTICIPANT_ALREADY_MAPPED');
    const {error:pu}=await admin.from('participants').update({user_id:user.id,updated_at:nowIso}).eq('id',p.id);if(pu)throw pu;
   }
   result.push({key:s.key,label:s.title,email:s.email,password,expiresAt:s.role?expires:null,scope:s.participant?`participant:${s.participant}`:s.pilot?'pilot:DEMO':'organization:AidMe VIDA'});
  }
  await admin.from('audit_events').insert({organization_id:org.id,actor_user_id:u.user.id,action:'QA_ROLE_PACK_CREATED',resource_type:'qa_role_pack',purpose:'Synthetic role/scope E2E QA',metadata:{roles:specs.map(s=>s.key),fixtures:['QA-ROLE-VIA-01','QA-ROLE-VIDA-01'],expires_at:expires}});
  return new Response(JSON.stringify({ok:true,synthetic:true,warning:'DEMO-NOT-REAL-DATA',expiresAt:expires,accounts:result}),{status:201,headers:h});
 }catch(e){console.error(e);return new Response(JSON.stringify({error:'QA_ROLE_PACK_FAILED'}),{status:500,headers:h})}
})
