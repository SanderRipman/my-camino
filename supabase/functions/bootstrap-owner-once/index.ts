Deno.serve((_req:Request)=>new Response(JSON.stringify({error:'BOOTSTRAP_CLOSED'}),{status:410,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}))
