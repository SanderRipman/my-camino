import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins=new Set(['https://my.aidme.no','https://main--mycamino.netlify.app','http://localhost:8888','http://localhost:3000'])
const metricColumns=new Set(['agency','belonging','direction'])
const allowedDays=new Set([14,30,60,90,3650])
const MIN_GROUP_SIZE=3

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
function claims(token:string){
  try{
    const payload=token.split('.')[1]
    const normalized=payload.replace(/-/g,'+').replace(/_/g,'/')
    return JSON.parse(atob(normalized+'='.repeat((4-normalized.length%4)%4)))
  }catch{return{}}
}
function activeGrant(g:any,nowIso:string){
  return !g.revoked_at&&(!g.valid_from||g.valid_from<=nowIso)&&(!g.valid_until||g.valid_until>nowIso)
}

Deno.serve(async(req:Request)=>{
  const h=headers(req)
  if(req.method==='OPTIONS')return new Response('ok',{headers:h})
  if(req.method!=='POST')return new Response(JSON.stringify({error:'METHOD_NOT_ALLOWED'}),{status:405,headers:h})
  try{
    const auth=req.headers.get('Authorization')??''
    const token=auth.replace(/^Bearer\s+/i,'')
    if(!token)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers:h})
    if((claims(token) as any).aal!=='aal2')return new Response(JSON.stringify({error:'MFA_REQUIRED'}),{status:403,headers:h})

    const pub=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default
    const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default
    const userClient=createClient(Deno.env.get('SUPABASE_URL')!,pub,{global:{headers:{Authorization:auth}},auth:{persistSession:false}})
    const admin=createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false}})
    const {data:userData,error:userError}=await userClient.auth.getUser(token)
    if(userError||!userData.user)return new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401,headers:h})

    const body=await req.json().catch(()=>({})) as any
    const metric=metricColumns.has(String(body.metric))?String(body.metric):'agency'
    const days=allowedDays.has(Number(body.days))?Number(body.days):30
    const requestedPilotId=body.pilotId?String(body.pilotId):null
    const nowIso=new Date().toISOString()

    const {data:allGrants,error:grantError}=await admin.from('role_grants')
      .select('role_code,pilot_id,organization_id,valid_from,valid_until,revoked_at')
      .eq('user_id',userData.user.id)
    if(grantError)throw grantError
    const grants=(allGrants??[]).filter(g=>activeGrant(g,nowIso))
    const roles=[...new Set(grants.map(g=>g.role_code))]
    if(!roles.length)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers:h})

    const {data:permissions,error:permissionError}=await admin.from('role_permissions')
      .select('role_code,capability')
      .in('role_code',roles)
      .eq('capability','view_aggregated')
    if(permissionError)throw permissionError
    const aggregateRoles=new Set((permissions??[]).map(p=>p.role_code))
    const aggregateGrants=grants.filter(g=>aggregateRoles.has(g.role_code)&&g.pilot_id)
    const allowedPilotIds=[...new Set(aggregateGrants.map(g=>g.pilot_id).filter(Boolean))] as string[]
    if(!allowedPilotIds.length)return new Response(JSON.stringify({error:'FORBIDDEN'}),{status:403,headers:h})
    if(requestedPilotId&&!allowedPilotIds.includes(requestedPilotId))return new Response(JSON.stringify({error:'OUT_OF_SCOPE'}),{status:403,headers:h})

    const {data:pilotRows,error:pilotError}=await admin.from('pilots')
      .select('id,name,route_name,status')
      .in('id',allowedPilotIds)
      .order('start_date',{ascending:false})
    if(pilotError)throw pilotError
    const pilots=pilotRows??[]
    const selectedPilot=pilots.find(p=>p.id===requestedPilotId)??pilots[0]
    if(!selectedPilot)return new Response(JSON.stringify({error:'NO_SCOPED_PILOT'}),{status:404,headers:h})

    const {data:pilotLinks,error:linkError}=await admin.from('pilot_participants')
      .select('participant_id')
      .eq('pilot_id',selectedPilot.id)
    if(linkError)throw linkError
    const participantIds=[...new Set((pilotLinks??[]).map(x=>x.participant_id).filter(Boolean))] as string[]
    if(!participantIds.length){
      return new Response(JSON.stringify({ok:true,aggregated:true,metric,days,minGroupSize:MIN_GROUP_SIZE,pilots,pilot:selectedPilot,cohortSize:0,points:[],suppressedDates:0}),{headers:h})
    }

    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-days)
    const cutoffDate=cutoff.toISOString().slice(0,10)
    const select=`checkin_date,participant_id,${metric}`
    const {data:rows,error:checkinError}=await admin.from('ser_checkins')
      .select(select)
      .in('participant_id',participantIds)
      .gte('checkin_date',cutoffDate)
      .order('checkin_date',{ascending:true})
    if(checkinError)throw checkinError

    const byDate=new Map<string,{values:number[],participants:Set<string>}>()
    for(const row of rows??[]){
      const value=Number((row as any)[metric])
      if(!Number.isFinite(value))continue
      const date=String((row as any).checkin_date)
      if(!byDate.has(date))byDate.set(date,{values:[],participants:new Set<string>()})
      const bucket=byDate.get(date)!
      bucket.values.push(value)
      bucket.participants.add(String((row as any).participant_id))
    }
    const points:any[]=[]
    let suppressedDates=0
    for(const [date,bucket] of [...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
      const n=bucket.participants.size
      if(n<MIN_GROUP_SIZE){suppressedDates++;continue}
      const value=bucket.values.reduce((sum,v)=>sum+v,0)/bucket.values.length
      points.push({date,value:Math.round(value*100)/100,n})
    }

    await admin.from('audit_events').insert({
      organization_id:aggregateGrants.find(g=>g.pilot_id===selectedPilot.id)?.organization_id??null,
      actor_user_id:userData.user.id,
      action:'AGGREGATED_ANALYSIS_VIEWED',
      resource_type:'pilot',
      resource_id:selectedPilot.id,
      purpose:'Aggregate program learning',
      metadata:{metric,days,min_group_size:MIN_GROUP_SIZE,points_returned:points.length,suppressed_dates:suppressedDates}
    })

    return new Response(JSON.stringify({
      ok:true,aggregated:true,metric,days,minGroupSize:MIN_GROUP_SIZE,
      pilots,pilot:selectedPilot,cohortSize:participantIds.length,points,suppressedDates
    }),{headers:h})
  }catch(error){
    console.error(error)
    return new Response(JSON.stringify({error:'AGGREGATE_ANALYSIS_FAILED'}),{status:500,headers:h})
  }
})
