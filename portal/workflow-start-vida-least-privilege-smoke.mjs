import fs from 'node:fs';

const src=fs.readFileSync(new URL('../supabase/functions/workflow-command/index.ts',import.meta.url),'utf8');
const start="}else if(action==='START_VIDA'){";
const end="\n }else{";
const i=src.indexOf(start);
const j=src.indexOf(end,i+start.length);
if(i<0||j<0)throw new Error('START_VIDA block not found');
const block=src.slice(i,j);
if(block.includes("'manage_program'"))throw new Error('START_VIDA must not accept project-level manage_program as an operational transition capability');
if(!block.includes("'manage_tasks'")||!block.includes("'edit_ser'"))throw new Error('START_VIDA must remain available to the existing operational program/SER capabilities');
if(!src.includes("claims(token).aal!=='aal2'"))throw new Error('workflow command must retain AAL2 gate');
if(!block.includes("oldStage!=='SER'"))throw new Error('START_VIDA must remain stage-constrained to SER');
if(!block.includes('NAMED_VIDA_OWNER_REQUIRED'))throw new Error('START_VIDA must retain named VIDA-owner gate');
console.log('START_VIDA least-privilege invariants passed.');
