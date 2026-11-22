'use strict';
// AcePrep Research Agent. Groq requests go to a same-origin Cloudflare Pages Function. No browser API key.
// CV/job text is stored locally. Only share it with Groq when the user requests an AI action.
// Web searches contain role and topics only, never pasted CVs.
window.AceAgent=(()=>{
 const KEY='aceprep-agent-v1';
 const DEFAULT={name:'',experience:'',jobTitle:'',employer:'',jobAdvert:'',focus:'',level:'Career starter',research:[],qa:[],messages:[],stage:'idle',progress:'',error:'',researchAt:''};
 let model={...DEFAULT},aiEnabled=false,connectionChecked=false,connectionChecking=false,running=false,promptBusy=false;
 try{model={...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||'{}')};sessionStorage.removeItem('aceprep-groq-session')}catch(e){}
 const put=()=>{try{localStorage.setItem(KEY,JSON.stringify(model))}catch(e){model.error='Browser storage is full; please shorten your CV or job advert.'}};
 const safeURL=url=>{try{const u=new URL(url);return /^https?:$/.test(u.protocol)?u.href:'#'}catch(e){return '#'}};
 const limit=s=>String(s||'').trim().slice(0,8000);
 const escAgent=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const words=s=>String(s||'').trim().split(/\s+/).filter(Boolean);
 const chunks=s=>String(s||'').replace(/\s+/g,' ').trim().slice(0,400);
 const status=s=>{model.progress=s;put();const el=document.querySelector('#agent-status');if(el)el.textContent=s};
 const sanitizeTopics=str=>[...new Set(String(str||'').split(/[,;\n]/).map(s=>s.trim()).filter(x=>x.length>2&&x.length<100))].slice(0,5);
 function autoTopics(){
  const role=(model.jobTitle||ROLES[data.role]).toLowerCase(),advert=model.jobAdvert.toLowerCase();
  let terms=[];
  if(/care|support worker|healthcare assistant|health care assistant/.test(role)) terms=['person-centred care','safeguarding adults','infection prevention and control','dementia care','falls prevention','IDDSI swallowing'];
  else if(/micro|quality control|laboratory|lab|biotech/.test(role)) terms=['GMP microbiology','environmental monitoring cleanroom','water bioburden','deviation CAPA','aseptic technique','microbial identification'];
  else if(/nhs|nurse|patient|medical/.test(role)) terms=['NHS values','patient safety','duty of candour','infection prevention','patient confidentiality'];
  else if(/software|developer|tech|data/.test(role)) terms=['software engineering testing','problem solving','software deployment','team communication'];
  else terms=['communication skills','teamwork','workplace conflict','time management','problem solving'];
  const extras=['safeguarding','dementia','CQC','IDDSI','SALT','GMP','CAPA','deviation','PCR','ISO 14644','aseptic','validation','risk assessment','confidentiality','leadership','health and safety'];
  for(const t of extras)if(advert.includes(t.toLowerCase())&&!terms.some(v=>v.toLowerCase().includes(t.toLowerCase())))terms.unshift(t);
  return [...new Set([...sanitizeTopics(model.focus),...terms])].slice(0,6);
 }
 function page(){
  const keyOn=aiEnabled,findings=model.research||[],qas=model.qa||[];
  const sources=findings.length?findings.map((r,i)=>`<div class="agent-source"><span class="pill neutral">${i+1}</span><div><strong>${escAgent(r.title||'Research result')}</strong><p>${escAgent((r.content||'').slice(0,250))}</p><a href="${escAgent(safeURL(r.url))}" target="_blank" rel="noopener noreferrer">Open original source ↗</a></div></div>`).join(''):'<p class="micro muted">No web research yet. Complete your profile and click Scan web for my role.</p>';
  const questions=qas.length?qas.map((item,i)=>`<article class="agent-question"><div class="row-between"><span class="pill gold">Question ${i+1} · ${escAgent(item.category||'Tailored')}</span><button class="btn btn-outline btn-sm" data-agent="listen-question" data-id="${i}">Hear question</button></div><h3>${escAgent(item.question)}</h3><details><summary>Suggested answer and how to structure it</summary><p>${escAgent(item.answer||'Use your own experience and the guide below.')}</p></details>${item.sourceIndex!=null&&findings[item.sourceIndex]?`<a class="agent-ref" href="${escAgent(safeURL(findings[item.sourceIndex].url))}" target="_blank" rel="noopener noreferrer">Supporting source: ${escAgent(findings[item.sourceIndex].title)} ↗</a>`:''}<button class="btn btn-teal btn-sm" data-agent="practise" data-id="${i}">Practise this question →</button></article>`).join(''):'<div class="card agent-empty"><h3>Your customised questions will appear here.</h3><p>Scan the web to build a research-grounded study pack. With the secure AI backend enabled, the assistant also writes personalised model answers.</p></div>';
  const chat=(model.messages||[]).map(m=>`<div class="agent-msg ${m.role==='user'?'from-user':'from-coach'}"><span>${m.role==='user'?'YOU':'ACE · '+(m.mode||'COACH')}</span><p>${escAgent(m.text)}</p></div>`).join('')||'<div class="agent-msg from-coach"><span>ACE · INTERVIEW COACH</span><p>Welcome. Share a job role, CV or experience and the vacancy. I can search for relevant topics, make a custom question pack, and coach your practice. When the AI server is connected, I can give personalised follow-ups and feedback. Otherwise I can guide you with the research results.</p></div>';
  return `<div class="inner-page agent-page">${pageIntro('PERSONALISED INTERVIEW ASSISTANT','Meet your AI interview agent','Tailored to your role, experience and vacancy. Research the web, study sourced answers, practise aloud and improve — at your own pace.')}
   <div class="agent-steps"><span>1 · Tell Ace your goal</span><span>2 · Scan current sources</span><span>3 · Learn the answers</span><span>4 · Practise + get feedback</span></div>
   <div class="agent-cols"><div class="agent-primary">
    <div class="card agent-section"><div class="row-between"><div><div class="eyebrow">01 / YOUR PROFILE</div><h2>Make every interview yours.</h2></div><span class="pill neutral">Saved only on this device</span></div>
     <div class="agent-fields"><div><label class="field-label" for="agent-title">Target job title</label><input id="agent-title" class="field-input" placeholder="e.g. Care Assistant, QC Microbiology Analyst" value="${escAgent(model.jobTitle)}" /></div><div><label class="field-label" for="agent-employer">Employer (optional)</label><input id="agent-employer" class="field-input" placeholder="e.g. NHS, care home, GSK" value="${escAgent(model.employer)}" /></div></div>
     <div class="agent-fields"><div><label class="field-label" for="agent-name">How should Ace address you? (optional)</label><input id="agent-name" class="field-input" placeholder="First name or leave blank" value="${escAgent(model.name)}" /></div><div><label class="field-label" for="agent-level">Your level</label><select id="agent-level" class="field-select">${['Career starter','Some experience','Experienced professional','Returning to work','Changing career'].map(v=>`<option ${model.level===v?'selected':''}>${v}</option>`).join('')}</select></div></div>
     <div class="row-between"><label class="field-label" for="agent-experience">Your experience / CV highlights</label><label class="agent-upload">Import CV text (.txt)<input type="file" id="agent-cv-file" accept=".txt,.md,text/plain,text/markdown" hidden /></label></div><textarea id="agent-experience" class="textarea" rows="4" placeholder="Paste your CV or list your actual skills, achievements and experience. Remove contact details and other sensitive information.">${escAgent(model.experience)}</textarea>
     <div class="row-between"><label class="field-label" for="agent-advert">Target job advert or requirements</label><label class="agent-upload">Import job advert (.txt)<input type="file" id="agent-job-file" accept=".txt,.md,text/plain,text/markdown" hidden /></label></div><textarea id="agent-advert" class="textarea" rows="4" placeholder="Paste the job duties, essential criteria and interview invitation. This makes your questions more specific.">${escAgent(model.jobAdvert)}</textarea>
     <label class="field-label" for="agent-focus">Topics you want to master (comma-separated)</label><input id="agent-focus" class="field-input" placeholder="e.g. safeguarding, dementia, IDDSI, handling conflict" value="${escAgent(model.focus)}" />
     <div class="agent-button-row"><button class="btn btn-primary" data-agent="research">${ico('spark')} Scan web for my role</button><button class="btn btn-outline" data-agent="make-qa">Create tailored Q&A</button><button class="btn btn-outline" data-agent="clear-agent">Clear profile</button></div>
     <p class="micro muted">Web search sends only your job title, employer and skill topics, not your pasted CV. Using Groq AI sends relevant profile details and research excerpts only when you ask for AI coaching.</p>
    </div>
    <div class="card agent-section"><div class="row-between"><div><div class="eyebrow">02 / RESEARCH LIBRARY</div><h2>What the web says about your role</h2></div><span class="pill neutral">${findings.length} sources</span></div><p class="micro muted" id="agent-status">${escAgent(model.progress||'Research is ready when you are.')}</p>${model.error?`<div class="agent-warning" role="status">${escAgent(model.error)}</div>`:''}<div class="agent-sources">${sources}</div></div>
    <div class="agent-section"><div class="row-between"><div><div class="eyebrow">03 / STUDY & PRACTISE</div><h2>Questions chosen for you</h2></div><span class="pill neutral">${qas.length} questions</span></div><div class="agent-qgrid">${questions}</div></div>
   </div><aside class="agent-aside">
    <div class="card agent-connection"><div class="eyebrow">AI ENGINE</div><h3>AI coach, no API key to enter</h3><p class="help-text">Ace uses a private Groq connection on the website's server. Your clients never have to enter or see an API key.</p><p id="agent-ai-status" class="micro muted">${keyOn?'AI connected through secure server.':connectionChecking?'Checking secure server…':connectionChecked?'AI is not configured yet. Guided mode is available.':'Checking AI connection…'}</p><div class="agent-button-row"><button class="btn btn-outline btn-sm" data-agent="check-server">${ico('spark')} Check AI connection</button></div><p class="micro muted">The secure AI connection only works after deploying the included Cloudflare Pages Functions and adding the secret <code>GROQ_API_KEY</code> in Cloudflare. Pasted CV and answer text is sent to Groq when you request AI help. Never publish your private key.</p></div>
    <div class="card agent-chat"><div class="row-between"><div><div class="eyebrow">LIVE COACH</div><h3>Speak with Ace</h3></div><span class="pill neutral">${keyOn?'AI available':'Guided mode'}</span></div><div id="agent-dialog" class="agent-dialog" role="log" aria-live="polite">${chat}</div><label class="field-label" for="agent-message">Ask about an interview topic or practise an answer</label><textarea id="agent-message" class="textarea" rows="3" placeholder="e.g. Ask me a safeguarding scenario, then tell me how I did."></textarea><div class="agent-button-row"><button class="btn btn-primary btn-sm" data-agent="send">Ask Ace ${ico('arrow')}</button><button class="btn btn-outline btn-sm" data-agent="speak-chat">${ico('mic')} Dictate</button></div></div>
    <div class="card agent-note"><div class="eyebrow">VOICE CHOICES</div><h3>Try new interviewer voices</h3><p class="help-text">The failed Kokoro starred voices have been removed. Device voices work instantly. Orpheus offers six natural AI voices once the secure server connection is enabled; no large model download.</p><button class="btn btn-outline btn-sm" data-view="coach">Choose voice in Interview Coach →</button></div>
   </aside></div></div>`;
 }
 function readProfile(){const mapping={'agent-title':'jobTitle','agent-employer':'employer','agent-name':'name','agent-experience':'experience','agent-advert':'jobAdvert','agent-focus':'focus','agent-level':'level'};for(const [id,k] of Object.entries(mapping)){const el=document.getElementById(id);if(el)model[k]=limit(el.value)}put()}
 function isAiAvailable(){return aiEnabled}
 async function checkBackend(force=false){
  if(connectionChecking || (connectionChecked && !force))return aiEnabled;
  connectionChecking=true;
  const statusEl=document.getElementById('agent-ai-status');if(statusEl)statusEl.textContent='Checking secure server…';
  try{
   const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),7000);
   let response;
   try{response=await fetch('/api/status',{cache:'no-store',signal:ctrl.signal,headers:{Accept:'application/json'}})}finally{clearTimeout(timeout)}
   const result=await response.json();
   aiEnabled=Boolean(response.ok&&result?.configured);
  }catch(_){aiEnabled=false}
  connectionChecked=true;connectionChecking=false;
  const el=document.getElementById('agent-ai-status');if(el)el.textContent=aiEnabled?'AI connected through secure server.':'AI unavailable: deploy this app on Cloudflare Pages and configure GROQ_API_KEY.';
  if(state.view==='agent')window.render();
  return aiEnabled;
 }
 async function tavily(query){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),14000);try{
  const res=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json','X-Tavily-Access-Mode':'keyless'},body:JSON.stringify({query,search_depth:'basic',max_results:4,include_answer:false}),signal:ctl.signal});let d=await res.json();if(!res.ok)throw new Error('Web search '+res.status+': '+(d.error?.message||d.detail?.error||'Rate limit or service problem'));return (d.results||[]).map(r=>({title:String(r.title||'').slice(0,150),url:safeURL(r.url),content:chunks(r.content),score:Number(r.score)||0})).filter(r=>r.url!=='#');
 }finally{clearTimeout(timer)}}
 async function wikipedia(query){const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:query,gsrlimit:'3',prop:'extracts|info',inprop:'url',exintro:'1',explaintext:'1',exsentences:'3',format:'json',origin:'*'});const res=await fetch('https://en.wikipedia.org/w/api.php?'+params,{mode:'cors'});if(!res.ok)throw new Error('Wikipedia returned '+res.status);const d=await res.json();return Object.values(d.query?.pages||{}).map(p=>({title:p.title,url:safeURL(p.fullurl||'https://en.wikipedia.org/wiki/'+encodeURIComponent(p.title)),content:chunks(p.extract||''),score:0})).filter(r=>r.content)}
 async function research(){if(running)return;readProfile();model.error='';running=true;const title=model.jobTitle||ROLES[data.role];const topics=autoTopics().slice(0,4);const queries=[`${title} interview technical questions ${topics.slice(0,2).join(' ')} UK`,`${title} responsibilities ${topics.slice(2,4).join(' ')} training safety ${model.employer||''}`,`best practice ${title} ${topics[0]||'communication'} ${topics[1]||'safety'}`];try{
  status('Searching the live web for your role and priority topics…');const results=[];let issues=[];
  for(let i=0;i<queries.length;i++){try{const found=await tavily(queries[i]);results.push(...found);status(`Scanned ${i+1} of ${queries.length} personalised web searches…`)}catch(e){issues.push(e.message);break}}
  if(!results.length){status('Web search is limited. Trying Wikipedia as a public-source fallback…');for(const t of topics.slice(0,3)){try{results.push(...await wikipedia(t))}catch(e){issues.push(e.message)}}}
  const seen=new Set();model.research=results.filter(r=>{if(seen.has(r.url))return false;seen.add(r.url);return true}).slice(0,12);
  model.researchAt=new Date().toISOString();model.error=issues.length?'Live search limitation: '+issues.join('; ').slice(0,200)+(model.research.length?' Showing available sources.':'') : '';
  status(model.research.length?`Research complete: ${model.research.length} sources found. Create tailored Q&A next.`:'No accessible results returned. Check internet access or try a more specific topic.');
  if(model.research.length){makeFallbackQA();if(aiEnabled)await makeAIQA(true)}
 }catch(e){model.error=String(e.message||e);status('Could not complete live web research. Your existing questions remain available.')}finally{running=false;put();render()}}
 function makeFallbackQA(){
  const role=model.jobTitle||ROLES[data.role],topics=autoTopics(),research=model.research||[],qa=[];
  for(let i=0;i<Math.min(12,Math.max(6,topics.length*2));i++){
   const topic=topics[i%topics.length]||'communication',src=research.length?research[i%research.length]:null;
   let question='',answer='';const scenario=Math.floor(i/Math.max(1,topics.length))%2===1;
   if(scenario){question=`As a ${role}, how would you handle a challenging situation involving ${topic.toLowerCase()}?`;answer=`First, assess the situation, safety and your responsibilities. Then explain your immediate actions, who you would communicate or escalate to, and how you would document or check the outcome. Link your response to the actual job requirements. ${src?'Research context: '+src.content.slice(0,260):'Use your employer’s current policy and training rather than inventing a procedure.'}`}
   else{question=`What is ${topic}, and why is it important for a ${role}?`;answer=`Start with a clear one-sentence definition, then explain its practical importance in this role. Describe what you personally do or would do, and mention the relevant policy or evidence. ${src?'Research context (check the source): '+src.content.slice(0,260):'Use the job advert and the role-specific topic guides to support your answer.'}`}
   qa.push({category:scenario?'Practical scenario':'Knowledge',question,answer,sourceIndex:src?i%research.length:null});
  }
  model.qa=qa;put();
 }
 function context(){const role=model.jobTitle||ROLES[data.role];return `Candidate level: ${model.level}; applying for: ${role}; employer: ${model.employer||'unspecified'}. Experience / CV notes: ${model.experience.slice(0,4200)||'not provided'}. Job advert: ${model.jobAdvert.slice(0,4200)||'not provided'}. Development topics: ${autoTopics().join(', ')}. Research evidence: ${(model.research||[]).slice(0,7).map((s,i)=>`[${i}] ${s.title}, ${s.url}, ${s.content}`).join('\n').slice(0,4600)}`}
 async function groq(messages,maxTokens=1300){
  if(!aiEnabled)throw new Error('AI server not connected. Configure GROQ_API_KEY in Cloudflare Pages first.');
  const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),30000);
  try{
   const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({messages,maxTokens}),signal:ctl.signal});
   const d=await response.json();
   if(!response.ok)throw new Error(d.error||'AI server returned HTTP '+response.status);
   return String(d.text||'').trim();
  }catch(e){if(e.name==='AbortError')throw new Error('AI response timed out. Try again.');throw e}finally{clearTimeout(timeout)}
 }
 async function makeAIQA(silent=false){if(running&&!silent)return;readProfile();if(!aiEnabled){makeFallbackQA();render();return}model.error='';running=true;status('AI is writing questions using your profile and cited research…');try{
  const prompt=`Create 7 realistic, DIFFERENT interview questions and concise model answers tailored to this specific person and vacancy. Include introduction, role knowledge, safeguarding/safety if relevant, technical topic, STAR and an unexpected scenario. Never claim a past achievement not supplied in the CV; use "For example" if experience is missing. Answers 60-110 words each, practical, plain British English. Research evidence can inform factual claims but may be incomplete. No fabricated citations. Return ONLY a JSON array objects with fields category, question, answer, sourceIndex (integer 0-6 if relevant, otherwise null). CONTEXT:\n${context()}`;
  const output=await groq([{role:'system',content:'You are Ace, a patient, highly accurate UK interview tutor. Give clear, authentic and safe professional coaching. The user may not have fluent English. Never invent personal achievements.'},{role:'user',content:prompt}],2500);
  const m=output.match(/\[[\s\S]*\]/);if(!m)throw new Error('AI did not return the expected question format. Try again.');const list=JSON.parse(m[0]);if(!Array.isArray(list)||!list.length)throw new Error('No questions were returned.');model.qa=list.slice(0,10).filter(x=>x.question&&x.answer).map(x=>({category:limit(x.category).slice(0,40),question:limit(x.question).slice(0,500),answer:limit(x.answer).slice(0,1300),sourceIndex:Number.isInteger(x.sourceIndex)&&x.sourceIndex>=0&&x.sourceIndex<model.research.length?x.sourceIndex:null}));status(`${model.qa.length} tailored AI questions created. Practise any one.`);
 }catch(e){model.error='AI question generation failed: '+e.message+'. Your existing research-based questions are still available.';if(!model.qa.length)makeFallbackQA()}finally{running=false;put();if(!silent)render()}}
 function guidedReply(userText){const text=userText.toLowerCase(),qa=model.qa||[];if(/nervous|confidence|afraid|scared|anxious/.test(text))return 'Start with one short sentence. Take a second to organise your thoughts. Then add what you would do and why. You can retry without judgement. Try answering just one question now.';
  if(/next|ask me|question|practis/.test(text)){const q=qa[(model.messages||[]).filter(m=>m.role==='user').length%Math.max(1,qa.length)];return q?`Let’s practise: ${q.question} Answer in your own words. I will help you check whether you included a relevant action, example and outcome.`:'First click “Create tailored Q&A” or “Scan web” so I can choose a question that fits your role.'}
  const selected=qa.find(x=>text.includes(x.question.toLowerCase().slice(0,16)))||qa[0];
  let tips=[];if(words(userText).length<30)tips.push('Add more detail about your actions.');if(!/\bi\b|my|me/.test(text))tips.push('Use “I” to describe your own contribution.');if(!/for example|when i|in my|during|once|last time/.test(text))tips.push('Add a real example where you can.');if(!/result|outcome|improv|report|record|document|learn/.test(text))tips.push('Explain what happened next, or what you would report or learn.');
  return `Here is your practice feedback (a writing checklist, not an AI assessment): ${tips.length?tips.join(' '):'Your response has a useful structure. Make sure every claim is accurate and relevant.'} ${selected?'Compare your answer with the suggested model answer for: '+selected.question:''} Try again — clearer and more confident.`;
 }
 async function send(){if(promptBusy)return;readProfile();const input=document.getElementById('agent-message'),msg=limit(input?.value||'');if(!msg)return;model.error='';model.messages=(model.messages||[]).concat({role:'user',text:msg}).slice(-30);if(input)input.value='';put();render();const chat=document.getElementById('agent-dialog');if(chat)chat.scrollTop=chat.scrollHeight;promptBusy=true;
  try{let answer,mode='GUIDED';if(aiEnabled){status('Ace is analysing your answer and preparing feedback…');answer=await groq([{role:'system',content:'You are Ace, a friendly UK interview coach with real conversational ability. Respond naturally to the user, give targeted constructive feedback when they answer a question, ask only one realistic follow-up, include sample phrasing when helpful, and build confidence without false praise. Do not invent personal work experiences or regulations. Keep 90-180 words. Context follows:\n'+context()},...(model.messages||[]).slice(-9).map(m=>({role:m.role==='coach'?'assistant':'user',content:m.text}))],750);mode='AI COACH'}else answer=guidedReply(msg);
   model.messages.push({role:'coach',mode,text:answer||'I could not produce an answer. Please try again.'});
  }catch(e){model.messages.push({role:'coach',mode:'SYSTEM',text:'AI conversation unavailable: '+e.message+'. You can still study the saved questions and use the guided coach.'})}
  finally{promptBusy=false;status('Ready for your next practice question.');put();render();const el=document.getElementById('agent-dialog');if(el)el.scrollTop=el.scrollHeight}
 }
 function practice(index){const item=model.qa[index];if(!item)return;data.custom.unshift({id:'agent-'+Date.now()+'-'+index,role:data.role,category:'Agent research',text:item.question,focus:['Explain the relevant knowledge clearly','Describe your actions and responsibilities','Use an accurate, personal example if possible'],terms:[],type:'scenario'});data.custom=data.custom.slice(0,180);save();nav('questions');toast('Custom question added to your practice bank. Open its answer guide to begin.')}
 function clear(){if(!confirm('Clear the Ace research profile, sources, questions and chat on this device? Your normal AcePrep progress stays.'))return;model={...DEFAULT};put();render()}
 function render(){if(state.view==='agent')window.render()}
 function afterRender(){const el=document.querySelector('#agent-dialog');if(el)el.scrollTop=el.scrollHeight;if(!connectionChecked&&!connectionChecking)checkBackend()}
 document.addEventListener('change',async e=>{if(!['agent-cv-file','agent-job-file'].includes(e.target.id))return;const file=e.target.files?.[0];if(!file)return;if(file.size>200000){toast('Text file too large. Keep it under 200 KB.');return}try{const txt=(await file.text()).slice(0,8000);const target=e.target.id==='agent-cv-file'?'agent-experience':'agent-advert';const el=document.getElementById(target);if(el)el.value=txt;readProfile();toast('Text imported locally. Your file was not uploaded to any server.')}catch(err){toast('Could not read text file: '+err.message)}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-agent]');if(!b)return;const action=b.dataset.agent,i=Number(b.dataset.id||0);
  switch(action){case 'research':research();break;case 'make-qa':if(aiEnabled)makeAIQA();else{readProfile();makeFallbackQA();render()}break;case 'check-server':checkBackend(true);break;case 'send':send();break;case 'clear-agent':clear();break;case 'listen-question':if(model.qa[i])speakWithChosenVoice(model.qa[i].question);break;case 'practise':practice(i);break;case 'speak-chat':{const el=document.getElementById('agent-message');if(!el)return;const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){toast('Dictation needs browser speech recognition. You can type instead.');return}const rec=new Speech();rec.lang='en-GB';rec.onresult=evt=>{el.value=(el.value+' '+evt.results[0][0].transcript).trim()};rec.onerror=()=>toast('Speech recognition unavailable. Try typing.');rec.start();break}
  }
 });
 return {page,afterRender,isAiAvailable,checkBackend,tavily,wikipedia,autoTopics,makeFallbackQA};
})();
