// Shared beta security gate. Never put either secret in frontend source code.
export const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const enc=new TextEncoder();
async function compareSecret(a,b){
  const [x,y]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);
  const aa=new Uint8Array(x),bb=new Uint8Array(y);let diff=0;
  for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];
  return diff===0;
}
export async function protect({request,env},kind='chat'){
  // Fail CLOSED when the access secret has not been set. Public provider API endpoints cost money.
  if(!env.GROQ_API_KEY)return reply({error:'AI is not configured. Add GROQ_API_KEY in Cloudflare encrypted secrets.'},503);
  if(!env.ACEPREP_ACCESS_CODE || String(env.ACEPREP_ACCESS_CODE).length<16)return reply({error:'Private beta is locked. Set ACEPREP_ACCESS_CODE (at least 16 characters) as a Cloudflare encrypted secret.'},503);
  const origin=request.headers.get('Origin');
  if(origin && origin!==new URL(request.url).origin)return reply({error:'Cross-origin access denied.'},403);
  const attempt=request.headers.get('X-AcePrep-Access')||'';
  // Match hashes for predictable comparison without logging attempts or the secret.
  if(!attempt || attempt.length>200 || !(await compareSecret(attempt,String(env.ACEPREP_ACCESS_CODE))))return reply({error:'Enter the private-beta access code under AI connection settings.'},401);
  // Cloudflare native rate-limit binding is optional; set it for multi-user deployment.
  // It is an approximate, per-location rate limiter, not a global hard quota.
  if(env.ACEPREP_RATE_LIMIT && typeof env.ACEPREP_RATE_LIMIT.limit==='function'){
    const ip=request.headers.get('CF-Connecting-IP')||'unknown';
    const result=await env.ACEPREP_RATE_LIMIT.limit({key:`${kind}:${ip}`});
    if(!result.success)return reply({error:'Too many AI requests. Please try again later.'},429);
  }
  return null;
}
export async function readJson(request,maxBytes=20000){
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw Object.assign(new Error('Expected JSON content.'),{status:415});
  const length=Number(request.headers.get('content-length'));
  if(Number.isFinite(length)&&length>maxBytes)throw Object.assign(new Error('Request is too large.'),{status:413});
  const raw=await request.text();
  if(enc.encode(raw).length>maxBytes)throw Object.assign(new Error('Request is too large.'),{status:413});
  try{return JSON.parse(raw)}catch{throw Object.assign(new Error('Invalid JSON.'),{status:400})}
}
export const bad=e=>reply({error:e.message||'Invalid request.'},e.status||400);
