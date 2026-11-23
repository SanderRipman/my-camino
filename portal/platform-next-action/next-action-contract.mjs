/**
 * AidMe platform: one-next-action presentation contract, synthetic only.
 * No database/auth/clinical decision logic. Caller supplies server-authorized
 * action availability; never treat this output as an authorization decision.
 * This module is deliberately NOT wired into the active portal until role/RLS
 * negative UAT (#249/#247) and product review pass.
 */
const phases=Object.freeze(['VIA','SER','VIDA']);
const roles=Object.freeze(['participant','via_owner','ser_lead','vida_owner']);
const labels=Object.freeze({
  VIA:'VÍA',SER:'SER',VIDA:'VIDA'
});
const safeRoutes=Object.freeze({
  participant:'/portal/',
  via_owner:'/portal/',
  ser_lead:'/portal/',
  vida_owner:'/portal/'
});
export function nextAction({role,phase,status,authorized=false,taskId=null}={}){
  if(!roles.includes(role)||!phases.includes(phase))
    return Object.freeze({kind:'unavailable',label:'Åpne oversikten',href:'/portal/',reason:'unknown-context'});
  // A client-side cue is never a substitute for AAL2, scoped grant or RLS.
  if(authorized!==true)
    return Object.freeze({kind:'unavailable',label:'Åpne oversikten',href:safeRoutes[role],reason:'not-authorized'});
  if(status==='WAITING_REVIEW')
    return Object.freeze({kind:'wait',label:'Avventer faglig vurdering',href:safeRoutes[role],reason:'manual-review'});
  if(status==='BLOCKED')
    return Object.freeze({kind:'wait',label:'Avventer avklaring',href:safeRoutes[role],reason:'blocked'});
  if(status==='DONE'&&phase==='VIDA')
    return Object.freeze({kind:'info',label:'Se oppsummering og neste VÍA',href:safeRoutes[role],reason:'manual-new-cycle'});
  if(status!=='OPEN'||typeof taskId!=='string'||!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(taskId))
    return Object.freeze({kind:'unavailable',label:'Åpne oversikten',href:safeRoutes[role],reason:'no-safe-task'});
  const rolePhase={participant:'VIA',via_owner:'VIA',ser_lead:'SER',vida_owner:'VIDA'};
  if(rolePhase[role]!==phase)
    return Object.freeze({kind:'unavailable',label:'Åpne oversikten',href:safeRoutes[role],reason:'wrong-role-phase'});
  const label=role==='participant'?'Fortsett min VÍA':`Åpne ${labels[phase]}-oppgaven`;
  return Object.freeze({kind:'task',label,href:`/portal/?returnTask=${taskId}&returnView=tasks`,reason:'manual-task'});
}
