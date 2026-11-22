// Private Groq chat proxy: the browser NEVER receives the API key.
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const MAX_REQUEST_BYTES=28000;
export async function onRequestPost({request,env}) {
 if (!env.GROQ_API_KEY) return json({error:'AI is not configured on this server.'},503);
 if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json') return json({error:'Expected JSON.'},415);
 const length=Number(request.headers.get('content-length'));
 if(length>MAX_REQUEST_BYTES)return json({error:'Message too large.'},413);
 let body;
 try {const raw=await request.text();if(raw.length>MAX_REQUEST_BYTES)return json({error:'Message too large.'},413);body=JSON.parse(raw)}
 catch (_) {return json({error:'Invalid JSON.'},400)}
 if(!Array.isArray(body.messages)||body.messages.length<1||body.messages.length>20)return json({error:'Invalid message history.'},400);
 const messages=[];
 for(const message of body.messages){
  if(!message || !['system','user','assistant'].includes(message.role) || typeof message.content!=='string' || !message.content.trim() || message.content.length>11000)return json({error:'Invalid message content.'},400);
  messages.push({role:message.role,content:message.content});
 }
 const maxTokens=Math.min(Math.max(Number(body.maxTokens)||1300,100),2500);
 const upstream=new AbortController(),t=setTimeout(()=>upstream.abort(),26000);
 try {
  const res=await fetch('https://api.groq.com/openai/v1/chat/completions',{
   method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},
   body:JSON.stringify({model:'openai/gpt-oss-20b',messages,temperature:0.55,max_completion_tokens:maxTokens,stream:false}),signal:upstream.signal
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok){
   // Never forward Groq's full error object; it may contain echoes of submitted content.
   if(res.status===429)return json({error:'AI free-tier limit reached. Try again later.'},429);
   if(res.status===401||res.status===403)return json({error:'Server Groq key was rejected. Update the Cloudflare secret.'},502);
   return json({error:'AI service unavailable (provider '+res.status+').'},502);
  }
  const text=String(data.choices?.[0]?.message?.content||'');
  if(!text)return json({error:'AI returned an empty answer.'},502);
  return json({text});
 }catch(e){return json({error:e.name==='AbortError'?'AI request timed out.':'Could not reach the AI provider.'},504)}finally{clearTimeout(t)}
}
