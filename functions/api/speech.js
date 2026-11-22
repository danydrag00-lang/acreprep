import {reply,protect,readJson,bad} from '../_lib/security.js';
const VOICES=new Set(['hannah','autumn','diana','austin','daniel','troy']);
export async function onRequestPost(ctx){
 const denied=await protect(ctx,'speech');if(denied)return denied;
 let body;try{body=await readJson(ctx.request,1500)}catch(e){return bad(e)}
 const input=body?.input,voice=body?.voice;
 if(typeof input!=='string'||!input.trim()||input.length>200||typeof voice!=='string'||!VOICES.has(voice))return reply({error:'A valid Orpheus voice and 1–200 characters of speech are required.'},400);
 const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),27000);
 try{
  const res=await fetch('https://api.groq.com/openai/v1/audio/speech',{
   method:'POST',headers:{Authorization:`Bearer ${ctx.env.GROQ_API_KEY}`,'Content-Type':'application/json'},
   body:JSON.stringify({model:'canopylabs/orpheus-v1-english',input:input.trim(),voice,response_format:'wav'}),signal:ctl.signal
  });
  if(!res.ok){if(res.status===429)return reply({error:'Natural voice free-tier quota or rate limit reached.'},429);
   if([401,403].includes(res.status))return reply({error:'Groq rejected the Cloudflare key.'},502);
   return reply({error:`Voice service unavailable (HTTP ${res.status}).`},502)}
  return new Response(res.body,{status:200,headers:{'Content-Type':'audio/wav','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){return reply({error:e.name==='AbortError'?'Voice request timed out.':'Could not reach the voice provider.'},504)}finally{clearTimeout(timeout)}
}
