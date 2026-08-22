(()=>{
'use strict';

const taskWorkflowContextLoadData=loadData;
loadData=async function(){
  await taskWorkflowContextLoadData();
  if(!(tasks||[]).length)return;
  const ids=tasks.map(t=>t.id).filter(Boolean);
  if(!ids.length)return;
  const {data,error}=await client.from('tasks').select('id,workflow_key,source_type,source_id').in('id',ids);
  if(error)return;
  const meta=new Map((data||[]).map(row=>[row.id,row]));
  tasks=tasks.map(task=>Object.assign(task,meta.get(task.id)||{}));
};

})();
