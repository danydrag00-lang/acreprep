import {reply} from '../_lib/security.js';
// Configuration only. Never claims that a provider request has succeeded.
export async function onRequestGet({env}){
 return reply({configured:Boolean(env.GROQ_API_KEY),privateBeta:Boolean(env.ACEPREP_ACCESS_CODE&&String(env.ACEPREP_ACCESS_CODE).length>=16),providerVerified:false});
}
