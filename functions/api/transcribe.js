import {reply,protect} from '../_lib/security.js';
// Short user-initiated microphone recordings only; no audio is stored by this function.
export async function onRequestPost(ctx){
 const denied=await protect(ctx,'transcribe');if(denied)return denied;
 const type=ctx.request.headers.get('content-type')||'';
 if(!type.startsWith('multipart/form-data;'))return reply({error:'Expected a recorded audio file.'},415);
 const length=Number(ctx.request.headers.get('content-length')||0);
 if(length>7*1024*1024)return reply({error:'Recording too large (7 MB maximum).'},413);
 let form;try{form=await ctx.request.formData()}catch{return reply({error:'Unable to read recording.'},400)}
 const f=form.get('audio');
 if(!f||typeof f.arrayBuffer!=='function'||f.size<100||f.size>6*1024*1024)return reply({error:'Recording must be 100 bytes–6 MB.'},400);
 const mime=(f.type||'').toLowerCase();
 if(!/^(audio\/(webm|ogg|wav|mpeg|mp4|x-m4a|aac)|video\/webm)/.test(mime))return reply({error:'Unsupported recording type.'},415);
 const data=new FormData();data.append('file',f,'interview.'+(mime.includes('ogg')?'ogg':mime.includes('mp4')?'mp4':mime.includes('wav')?'wav':'webm'));
 data.append('model','whisper-large-v3-turbo');data.append('language','en');
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),30000);
 try{
  const res=await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${ctx.env.GROQ_API_KEY}`},body:data,signal:ctl.signal});
  if(!res.ok){if(res.status===429)return reply({error:'Transcription quota reached. Type your answer instead.'},429);
    return reply({error:`Transcription service unavailable (HTTP ${res.status}).`},502)}
  const out=await res.json();return reply({text:String(out.text||'').slice(0,8000)});
 }catch(e){return reply({error:e.name==='AbortError'?'Transcription timed out.':'Could not transcribe the recording.'},504)}finally{clearTimeout(t)}
}
