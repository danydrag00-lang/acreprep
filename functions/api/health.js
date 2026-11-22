import {reply,protect} from '../_lib/security.js';
// A real provider credentials check; invoke only from an explicit user action.
export async function onRequestPost(ctx){
 const denied=await protect(ctx,'health');if(denied)return denied;
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),9000);
 try{
  const res=await fetch('https://api.groq.com/openai/v1/models',{headers:{Authorization:`Bearer ${ctx.env.GROQ_API_KEY}`},signal:ctl.signal});
  if(res.status===401||res.status===403)return reply({ok:false,error:'Groq rejected the key. Replace GROQ_API_KEY in Cloudflare secrets.'},502);
  if(res.status===429)return reply({ok:false,error:'Groq rate limit reached; try again later.'},429);
  if(!res.ok)return reply({ok:false,error:`Groq returned HTTP ${res.status}.`},502);
  return reply({ok:true,provider:'Groq',checkedAt:new Date().toISOString()});
 }catch(e){return reply({ok:false,error:e.name==='AbortError'?'Groq connection timed out.':'Cannot reach Groq.'},504)}finally{clearTimeout(t)}
}
