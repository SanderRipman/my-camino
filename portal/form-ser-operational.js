(()=>{
'use strict';

let serOperationalStaff=[];

function currentSerPilotId(){
  return selectedPilot()?.id||null;
}

async function loadSerOperationalStaff(){
  const pilotId=currentSerPilotId();
  serOperationalStaff=[];
  if(!pilotId)return;
  const {data,error}=await client.rpc('eligible_ser_operational_staff',{p_pilot_id:pilotId});
  if(error){
    console.warn('SER operational staff list unavailable');
    return;
  }
  serOperationalStaff=data||[];
}

const baseRenderField=renderField;
renderField=function renderSerOperationalField(f){
  const required=f.required?' required':'';
  if(f.type==='staff_select'){
    const options=serOperationalStaff.map(person=>{
      const label=[person.full_name||'Navngitt medarbeider',person.job_title].filter(Boolean).join(' · ');
      return `<option value="${esc(person.user_id)}">${esc(label)}</option>`;
    }).join('');
    const empty=options?'<option value="">Velg godkjent medarbeider</option>':'<option value="">Ingen godkjente operative medarbeidere tilgjengelig</option>';
    return `<div class="field-wrap"><label><span>${esc(f.label)}${f.required?' *':''}</span><select name="${esc(f.key)}"${required}>${empty}${options}</select>${f.help?`<small>${esc(f.help)}</small>`:''}</label></div>`;
  }
  if(f.type==='yes_no'){
    return `<div class="field-wrap"><fieldset class="yes-no-field"><legend>${esc(f.label)}${f.required?' *':''}</legend><label><input type="radio" name="${esc(f.key)}" value="NO"${required}> Nei</label><label><input type="radio" name="${esc(f.key)}" value="YES"${required}> Ja</label>${f.help?`<small>${esc(f.help)}</small>`:''}</fieldset></div>`;
  }
  return baseRenderField(f);
};

const baseRestorePayload=restorePayload;
restorePayload=function restoreSerOperationalPayload(payload={}){
  baseRestorePayload(payload);
  for(const sec of currentVersion?.schema_json?.sections||[])for(const f of sec.fields||[]){
    if(f.type!=='yes_no')continue;
    const value=payload?.[f.key];if(value==null)continue;
    const el=document.querySelector(`[name="${CSS.escape(f.key)}"][value="${CSS.escape(String(value))}"]`);
    if(el)el.checked=true;
  }
};

const baseChooseForm=chooseForm;
chooseForm=async function chooseFormWithOperationalStaff(){
  const nextDef=definitions.find(d=>d.id===$('#formSelect').value)||null;
  if(nextDef?.key==='ser_daily')await loadSerOperationalStaff();
  else serOperationalStaff=[];
  return baseChooseForm();
};

// form-runner historically re-ran init() for every auth event, including TOKEN_REFRESHED.
// The initial init has already started before this extension loads. Later auth events only
// refresh the session reference; SIGNED_OUT still returns to the portal. This preserves
// unsent form values when the user changes tab/window while keeping auth state current.
init=async function refreshFormSessionWithoutRerender(){
  const {data:{session:s}}=await client.auth.getSession();
  session=s;
  if(!session)location.replace('./');
};

setTimeout(()=>{
  if(currentDef?.key==='ser_daily')chooseForm();
},100);
})();
