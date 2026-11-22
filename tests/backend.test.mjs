import {test} from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet as status} from '../functions/api/status.js';
import {onRequestPost as health} from '../functions/api/health.js';
import {onRequestPost as chat} from '../functions/api/chat.js';
import {onRequestPost as speech} from '../functions/api/speech.js';
import {onRequestPost as research} from '../functions/api/research.js';
import {onRequestPost as transcribe} from '../functions/api/transcribe.js';
const URL='https://acreprep.pages.dev';
const ACCESS='a-very-long-private-test-code';
const ENV={GROQ_API_KEY:'server-test-key',ACEPREP_ACCESS_CODE:ACCESS};
const request=(pathname,data,access=ACCESS)=>new Request(URL+pathname,{method:'POST',headers:{'Content-Type':'application/json','Origin':URL,'X-AcePrep-Access':access},body:JSON.stringify(data)});
async function useFetch(mock,fn){const original=globalThis.fetch;globalThis.fetch=mock;try{return await fn()}finally{globalThis.fetch=original}}
test('status does not claim provider is verified',async()=>{
 const response=await status({env:ENV});const body=await response.json();
 assert.equal(body.configured,true);assert.equal(body.privateBeta,true);assert.equal(body.providerVerified,false);
 assert.equal(response.headers.get('cache-control'),'no-store');
});
test('private beta closes unconfigured and unauthorized endpoints',async()=>{
 const r=request('/api/chat',{messages:[{role:'user',content:'Hi'}]});
 assert.equal((await chat({request:r,env:{}})).status,503);
 assert.equal((await chat({request:request('/api/chat',{messages:[{role:'user',content:'Hi'}]},'wrong'),env:ENV})).status,401);
 assert.equal((await speech({request:request('/api/speech',{input:'Hi',voice:'hannah'},'wrong'),env:ENV})).status,401);
 const r3=new Request('https://acreprep.pages.dev/api/chat',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json','X-AcePrep-Access':ACCESS},body:'{}'});
 assert.equal((await chat({request:r3,env:ENV})).status,403);
});
test('health genuinely checks Groq with the server secret',async()=>{
 await useFetch(async (url,opt)=>{assert.equal(opt.headers.Authorization,'Bearer server-test-key');return new Response('{}',{status:200})},async()=>{
  const res=await health({request:request('/api/health',{}),env:ENV});assert.equal((await res.json()).ok,true);
 });
 await useFetch(async()=>new Response('',{status:401}),async()=>{
  const res=await health({request:request('/api/health',{}),env:ENV});assert.equal(res.status,502);
 });
});
test('chat validates input, isolates Groq credentials and handles rate limits',async()=>{
 assert.equal((await chat({request:request('/api/chat',{messages:[{role:'hacker',content:'Hello'}]}),env:ENV})).status,400);
 await useFetch(async(url,opt)=>{assert.equal(opt.headers.Authorization,'Bearer server-test-key');assert.match(url,/api.groq.com/);return Response.json({choices:[{message:{content:'Feedback from Ace.'}}]})},async()=>{
  const res=await chat({request:request('/api/chat',{messages:[{role:'user',content:'Hello'}]}),env:ENV});assert.equal((await res.json()).text,'Feedback from Ace.');
 });
 await useFetch(async()=>new Response('{}',{status:429}),async()=>{
  const res=await chat({request:request('/api/chat',{messages:[{role:'user',content:'Hello'}]}),env:ENV});assert.equal(res.status,429);
 });
});
test('natural Orpheus speech validates voice and returns WAV',async()=>{
 assert.equal((await speech({request:request('/api/speech',{input:'test',voice:'invalid'}),env:ENV})).status,400);
 await useFetch(async(url,opt)=>{assert.equal(opt.headers.Authorization,'Bearer server-test-key');assert.equal(JSON.parse(opt.body).voice,'hannah');return new Response(new Uint8Array([82,73,70,70]),{status:200})},async()=>{
  const res=await speech({request:request('/api/speech',{input:'Good morning',voice:'hannah'}),env:ENV});assert.equal(res.status,200);assert.equal(res.headers.get('Content-Type'),'audio/wav');
 });
});
test('research requests go server-side with safe, attributed results',async()=>{
 let calls=0;
 await useFetch(async (url)=>{calls++;assert.equal(new globalThis.URL(url).hostname,'api.tavily.com');return Response.json({results:[{title:'Official guidance',url:'https://www.nhs.uk/',content:'Useful information'}]})},async()=>{
  const r=await research({request:request('/api/research',{title:'Care Assistant',topics:['safeguarding','infection control']}),env:ENV});const b=await r.json();assert.equal(r.status,200);assert.equal(b.results[0].title,'Official guidance');assert.equal(b.verified,false);assert.equal(b.results[0].source,'Tavily search');
 });assert.equal(calls,2);
});
test('transcription sends short microphone recordings to Groq',async()=>{
 const f=new FormData();f.append('audio',new Blob([new Uint8Array(400)],{type:'audio/webm'}),'answer.webm');
 const req=new Request(URL+'/api/transcribe',{method:'POST',headers:{Origin:URL,'X-AcePrep-Access':ACCESS},body:f});
 await useFetch(async(url,opt)=>{assert.match(url,/audio\/transcriptions/);assert.equal(opt.headers.Authorization,'Bearer server-test-key');return Response.json({text:'I explained the situation clearly.'})},async()=>{
  const res=await transcribe({request:req,env:ENV});assert.equal((await res.json()).text,'I explained the situation clearly.');
 });
});
test('configured rate limit can reject bursts',async()=>{
 const env={...ENV,ACEPREP_RATE_LIMIT:{limit:async()=>({success:false})}};
 const res=await chat({request:request('/api/chat',{messages:[{role:'user',content:'Hi'}]}),env});assert.equal(res.status,429);
});
