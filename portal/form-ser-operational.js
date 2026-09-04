(()=>{
'use strict';

let serOperationalStaff=[];
const SER_ROLE_KEYS=['front_anchor_user_id','rear_anchor_user_id','rover_user_id'];
const AUTH_RETURN_KEY='aidme:return-intent:v1';

function currentSerPilotId(){
  return selectedPilot()?.id||null;
}

function captureInterruptedFormReturn(){
  try{
    const q=new URLSearchParams(location.search);
    const specific=location.pathname.endsWith('/form-runner.html')&&(q.has('key')||q.has('participant')||q.has('pilot')||q.has('returnTask'));
    if(!specific)return;
    const target=`${location.pathname}${location.search}${location.hash}`;
    sessionStorage.setItem(AUTH_RETURN_KEY,JSON.stringify({target,createdAt:Date.now()}));
  }catch{}
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

function updateSerRoleOverlapWarning(){
  const section=$('#formSections .form-section .dynamic-grid');
  if(!section)return;
  let warning=$('#serRoleOverlapWarning');
  if(!warning){
    warning=document.createElement('div');
    warning.id='serRoleOverlapWarning';
    warning.className='ser-role-overlap-warning hidden';
    warning.setAttribute('role','status');
    section.appendChild(warning);
  }
  const selected=SER_ROLE_KEYS.map(key=>document.querySelector(`[name="${CSS.escape(key)}"]`)?.value||'').filter(Boolean);
  const unique=new Set(selected);
  if(selected.length>=2&&unique.size<selected.length){
    warning.textContent='Obs: Samme medarbeider er valgt i flere operative roller. Dette kan være riktig ved midlertidig bemanningsbehov – kontroller at det er tilsiktet.';
    warning.classList.remove('hidden');
  }else{
    warning.classList.add('hidden');
  }
}

function bindSerRoleOverlapWarning(){
  SER_ROLE_KEYS.forEach(key=>{
    const el=document.querySelector(`[name="${CSS.escape(key)}"]`);
    if(el&&!el.dataset.overlapBound){
      el.dataset.overlapBound='1';
      el.addEventListener('change',updateSerRoleOverlapWarning);
    }
  });
  updateSerRoleOverlapWarning();
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
    return `<div class="field-wrap"><fieldset class="yes-no-field"><legend>${esc(f.label)}${f.required?' *':''}</legend><div class="yes-no-options"><label><input type="radio" name="${esc(f.key)}" value="NO"${required}> <span>Nei</span></label><label><input type="radio" name="${esc(f.key)}" value="YES"${required}> <span>Ja</span></label></div>${f.help?`<small>${esc(f.help)}</small>`:''}</fieldset></div>`;
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
  updateSerRoleOverlapWarning();
};

const baseChooseForm=chooseForm;
chooseForm=async function chooseFormWithOperationalStaff(){
  const nextDef=definitions.find(d=>d.id===$('#formSelect').value)||null;
  if(nextDef?.key==='ser_daily')await loadSerOperationalStaff();
  else serOperationalStaff=[];
  const result=await baseChooseForm();
  if(nextDef?.key==='ser_daily')bindSerRoleOverlapWarning();
  return result;
};

// The initial init() has already started before this extension loads. Historically every
// auth event, including TOKEN_REFRESHED, called init() again and re-rendered the form.
// Later auth events only refresh the session reference. If the session disappears while
// a specific form is open, preserve that exact target before leaving for authentication.
init=async function refreshFormSessionWithoutRerender(){
  const {data:{session:s}}=await client.auth.getSession();
  session=s;
  if(!session){
    captureInterruptedFormReturn();
    location.replace('./');
  }
};

setTimeout(()=>{
  if(currentDef?.key==='ser_daily')chooseForm();
},100);
})();
