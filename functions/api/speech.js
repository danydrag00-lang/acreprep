// Private Groq Orpheus speech proxy. Never expose provider credentials.
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const VOICES=new Set(['hannah','autumn','diana','austin','daniel','troy']);
export async function onRequestPost({request,env}) {
 if(!env.GROQ_API_KEY)return json({error:'Natural voice not configured.'},503);
 if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json({error:'Expected JSON.'},415);
 let body;
 try{const raw=await request.text();if(raw.length>2000)return json({error:'Speech request too large.'},413);body=JSON.parse(raw)}catch(_){return json({error:'Invalid JSON.'},400)}
 const input=body.input,voice=body.voice;
 if(typeof input!=='string'||!input.trim()||input.length>200||typeof voice!=='string'||!VOICES.has(voice))return json({error:'Invalid voice or speech text (200-character maximum).'},400);
 const upstream=new AbortController(),t=setTimeout(()=>upstream.abort(),25000);
 try{
  const res=await fetch('https://api.groq.com/openai/v1/audio/speech',{
   method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},
   body:JSON.stringify({model:'canopylabs/orpheus-v1-english',input,voice,response_format:'wav'}),signal:upstream.signal
  });
  if(!res.ok){
   if(res.status===429)return json({error:'Natural voice rate limit reached. Try again later.'},429);
   if(res.status===401||res.status===403)return json({error:'Server voice API key was rejected.'},502);
   return json({error:'Voice provider unavailable ('+res.status+').'},502);
  }
  return new Response(res.body,{status:200,headers:{'Content-Type':'audio/wav','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){return json({error:e.name==='AbortError'?'Voice generation timed out.':'Could not reach the voice provider.'},504)}finally{clearTimeout(t)}
}
