import {reply,protect,readJson,bad} from '../_lib/security.js';
const clean=(s,n=100)=>String(s||'').replace(/[<>\r\n]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
const urlSafe=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}};
function normalize(r,provider){const url=urlSafe(r.url);return url?{title:clean(r.title||'Source',180),url,content:clean(r.content||r.snippet||'',650),source:provider,checkedAt:new Date().toISOString()}:null}
async function tavily(query,signal){
 const res=await fetch('https://api.tavily.com/search',{
  method:'POST',headers:{'Content-Type':'application/json','X-Tavily-Access-Mode':'keyless'},
  body:JSON.stringify({query,search_depth:'basic',max_results:5,include_answer:false}),signal
 });
 if(!res.ok)throw new Error(`Tavily search unavailable (HTTP ${res.status})`);
 const data=await res.json();return (data.results||[]).map(r=>normalize(r,'Tavily search')).filter(Boolean);
}
async function wikipedia(topic,signal){
 const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:topic,gsrlimit:'4',prop:'extracts|info',inprop:'url',exintro:'1',explaintext:'1',exsentences:'3',format:'json'});
 const res=await fetch(`https://en.wikipedia.org/w/api.php?${params}`,{signal,headers:{'User-Agent':'AcePrepInterviewCoach/1.0 (public educational research)'}});
 if(!res.ok)throw new Error(`Wikipedia fallback unavailable (HTTP ${res.status})`);
 const json=await res.json();return Object.values(json.query?.pages||{}).map(p=>normalize({title:p.title,url:p.fullurl||`https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,content:p.extract},'Wikipedia background')).filter(x=>x?.content);
}
export async function onRequestPost(ctx){
 const denied=await protect(ctx,'research');if(denied)return denied;
 let body;try{body=await readJson(ctx.request,5000)}catch(e){return bad(e)}
 const role=clean(body?.title,120),employer=clean(body?.employer,100),topics=Array.isArray(body?.topics)?body.topics.slice(0,5).map(t=>clean(t,90)).filter(Boolean):[];
 if(role.length<3)return reply({error:'Enter a target job title before researching.'},400);
 const queries=[`${role} ${topics.slice(0,2).join(' ')} interview official guidelines UK`,`${employer?employer+' ':''}${role} responsibilities ${topics.slice(2,4).join(' ')}`];
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),18000);
 const errors=[],results=[];
 try{
  for(const query of queries){try{results.push(...await tavily(query,ctrl.signal))}catch(e){errors.push(e.message);break}}
  if(!results.length){for(const topic of topics.slice(0,3).length?topics.slice(0,3):[role]){try{results.push(...await wikipedia(topic,ctrl.signal))}catch(e){errors.push(e.message);break}}}
  const seen=new Set();const unique=results.filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return true}).slice(0,12);
  return reply({results:unique,checkedAt:new Date().toISOString(),warnings:errors,verified:false,note:'Search excerpts are unverified. Check the original link before relying on a claim.'});
 }catch(e){return reply({error:'Research search could not complete.',details:e.name==='AbortError'?'Search timed out.':undefined},502)}finally{clearTimeout(timer)}
}
