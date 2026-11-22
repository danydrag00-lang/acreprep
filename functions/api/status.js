// Cloudflare Pages Function — only tells the browser whether AI is configured.
export async function onRequestGet({env}) {
 return new Response(JSON.stringify({configured: Boolean(env.GROQ_API_KEY)}),{
  status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
 });
}
