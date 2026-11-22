import {reply,protect,readJson,bad} from '../_lib/security.js';
const MAX_MESSAGES=14;
export async function onRequestPost(ctx){
 const denied=await protect(ctx,'chat');if(denied)return denied;
 let body;try{body=await readJson(ctx.request,24500)}catch(e){return bad(e)}
 if(!body||!Array.isArray(body.messages)||body.messages.length<1||body.messages.length>MAX_MESSAGES)return reply({error:'Invalid message history.'},400);
 // Prevent visitor-supplied system/developer messages from controlling or replacing the tutor rules.
 const history=[];
 for(const m of body.messages){
  if(!m||!['system','user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.trim().length===0||m.content.length>10500)return reply({error:'Invalid message content.'},400);
  // Existing app supplies an interviewer system prompt. Keep a single bounded one.
  history.push({role:m.role,content:m.content});
 }
 if(history.filter(m=>m.role==='system').length>1)return reply({error:'Invalid system prompt.'},400);
 const tokens=Math.min(Math.max(Number(body.maxTokens)||1400,100),3000);
 const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),27000);
 try{
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
   method:'POST',headers:{Authorization:`Bearer ${ctx.env.GROQ_API_KEY}`,'Content-Type':'application/json'},
   body:JSON.stringify({model:'openai/gpt-oss-20b',messages:history,temperature:0.5,max_completion_tokens:tokens,stream:false}),signal:ctl.signal
  });
  if(!response.ok){if(response.status===429)return reply({error:'Groq quota or rate limit reached. Continue in guided mode.'},429);
   if([401,403].includes(response.status))return reply({error:'Groq rejected the Cloudflare key. Owner action required.'},502);
   return reply({error:`Groq is unavailable (HTTP ${response.status}).`},502)}
  const responseJson=await response.json();const text=String(responseJson.choices?.[0]?.message?.content||'').trim();
  if(!text)return reply({error:'Groq returned an empty answer.'},502);
  return reply({text:text.slice(0,15000)});
 }catch(e){return reply({error:e.name==='AbortError'?'Groq took too long; try again.':'Could not connect to Groq.'},504)}finally{clearTimeout(timeout)}
}
