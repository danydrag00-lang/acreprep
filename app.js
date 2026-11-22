'use strict';

// AcePrep has offline learning guides and optional same-origin Cloudflare AI services. No key appears in browser code.
const ROLES = {general:'General / Office',care:'Care Assistant',micro:'QC Microbiology',nhs:'NHS Healthcare',tech:'Technology'};
const ROLE_META = {
  general:{description:'Competency, strengths and motivation',icon:'briefcase'},
  care:{description:'Person-centred care, safety and dignity',icon:'heart'},
  micro:{description:'GMP, environmental monitoring and QC',icon:'shield'},
  nhs:{description:'Patient safety, teamwork and NHS values',icon:'heart'},
  tech:{description:'Problem-solving, delivery and collaboration',icon:'chart'}
};
const q=(category,text,focus,terms=[],type='competency')=>({category,text,focus,terms,type});
const QUESTIONS={
  general:[
    q('Introduction','Tell me about yourself and why this role interests you.',['Give a brief professional overview','Connect relevant experience to the job','Finish with your motivation'],[['experience','background','worked'],['skill','strength','experience'],['role','opportunity','interested']],'intro'),
    q('Motivation','Why do you want to work for our organisation?',['Show you understand the organisation','Explain why its work appeals to you','Link your contribution to the position'],[['company','organisation','team'],['value','mission','service'],['experience','contribute','skills']],'intro'),
    q('Competency','Describe a time you managed several priorities at once.',['Explain the competing tasks','Describe how you prioritised','State the result and what you learned'],[['priority','prioritise','urgent','deadline'],['plan','organis','schedule','communicat'],['result','complete','delivered']],'behavior'),
    q('Competency','Tell me about a mistake you made and how you handled it.',['Own the mistake without blaming others','Explain your immediate response','Describe prevention or learning'],[['mistake','error','issue'],['report','correct','fix','inform'],['learn','prevent','improve']],'behavior'),
    q('Competency','Give an example of a time you worked well in a team.',['Describe the shared goal','Explain your contribution','Show the outcome'],[['team','colleague','support'],['communicat','collaborat','help'],['result','achiev','complete']],'behavior'),
    q('Competency','Tell me about a time you dealt with a difficult customer or stakeholder.',['Stay calm and listen','Describe how you identified the concern','Explain your solution and outcome'],[['listen','understand','concern'],['calm','respect','empath'],['resolv','solution','follow up']],'behavior'),
    q('Strengths','What are your three biggest strengths?',['Choose strengths related to the job','Prove at least one with a real example','Explain how they help the employer'],[['communicat','organis','patient','detail','reliable','adapt','team','problem'],['example','when','during','previous'],['role','job','team','work']],'intro'),
    q('Growth','What is one weakness you are working on?',['Choose a genuine manageable weakness','State concrete steps to improve','Show evidence of progress'],[['sometimes','used to','weakness','improv'],['practis','feedback','training','prioritis','learn'],['now','progress','better','improved']],'intro'),
    q('Problem solving','Describe a problem you solved at work.',['Define the challenge','Explain the options considered','Give the measurable or practical result'],[['problem','issue','challenge'],['analys','investigat','plan','approach'],['resolv','improv','result']],'behavior'),
    q('Communication','Describe a time you had to explain something complicated simply.',['Consider your audience','Show clear, suitable language','Confirm understanding'],[['explain','communicat','simpl'],['listen','check','question','understand'],['result','clear','understood']],'behavior'),
    q('Adaptability','Tell me about a change at work you had to adapt to.',['Explain what changed','Describe your positive response','Show successful adaptation'],[['change','new','adapt'],['learn','training','adjust'],['outcome','success','improv']],'behavior'),
    q('Decision making','How do you make decisions under pressure?',['Check urgency and risks','Use evidence, policy or available support','Communicate and evaluate your decision'],[['urgent','risk','priorit'],['information','policy','procedure','support'],['communicat','review','result']],'scenario'),
    q('Motivation','Where would you like your career to develop over the next few years?',['Show a realistic growth goal','Connect it to the role','Mention skills you plan to develop'],[['develop','grow','career'],['learn','training','skill'],['role','team','organisation']],'intro'),
    q('Closing','Why should we hire you?',['Summarise your strongest relevant skills','Mention one specific achievement','Show confidence and enthusiasm'],[['experience','skill','background'],['example','achiev','improv','result'],['team','role','contribut']],'intro'),
    q('Closing','Do you have any questions for us?',['Ask about induction and support','Ask what excellent performance looks like','Choose a question demonstrating genuine interest'],[['training','induction','development'],['team','role','success'],['question','opportunity','expectation']],'intro')
  ],
  care:[
    q('Introduction','Tell me about yourself and your experience in care.',['Summarise previous care duties','Mention personal care, meals, mobility or companionship','Emphasise safe and compassionate person-centred care'],[['care','resident','client','patient'],['personal care','mobility','meal','companionship'],['dignity','respect','safe','person centred']],'intro'),
    q('Motivation','Why do you want to work in a care home?',['Explain interest in consistent support and relationships','Show understanding of the team environment','Mention dignity and quality of life'],[['resident','older','care home'],['team','relationship','support'],['dignity','wellbeing','person centred']],'intro'),
    q('Person-centred care','What does person-centred care mean to you?',['Respect individual needs, wishes and routines','Promote independence and informed choices','Follow and review the care plan'],[['choice','wish','preference','individual'],['independen','dignity','respect'],['care plan','support','person']],'scenario'),
    q('Safeguarding','What would you do if you suspected a resident was being abused?',['Ensure immediate safety and listen carefully','Report promptly following safeguarding policy','Record facts accurately; do not investigate yourself'],[['safe','risk','protect'],['report','senior','manager','safeguard'],['record','document','facts','confidential']],'scenario'),
    q('Safeguarding','What are the different types of abuse in care?',['Name physical, emotional and sexual abuse','Mention financial, neglect and discriminatory abuse','Include organisational, domestic, modern slavery and self-neglect'],[['physical','emotional','psychological'],['financial','neglect'],['sexual','discriminat','organis','domestic','slavery']],'scenario'),
    q('Infection prevention','How would you prevent infection spreading in a care home?',['Follow the five moments of hand hygiene and correct PPE','Use safe cleaning, waste and linen procedures','Report symptoms and follow isolation policy'],[['hand','hygiene','wash'],['ppe','glove','apron','protective'],['clean','isolation','report','waste']],'scenario'),
    q('Infection prevention','A resident has diarrhoea and vomiting. What would you do?',['Protect the resident and reduce transmission','Inform senior staff and follow local infection-control precautions','Record and monitor hydration, symptoms and care as directed'],[['report','inform','senior','nurse'],['ppe','hand','isolat','infection'],['fluid','hydration','record','monitor']],'scenario'),
    q('Dignity','How do you maintain privacy and dignity during personal care?',['Ask permission and explain each step','Close doors and curtains; cover the person','Offer choices and encourage independence'],[['permission','consent','explain'],['curtain','door','cover','privacy'],['choice','respect','independen','dignity']],'scenario'),
    q('Behaviour','How would you support a resident who becomes upset or aggressive?',['Stay calm and non-confrontational','Consider triggers, needs and communication','Keep everyone safe and seek support as needed'],[['calm','reassur','listen'],['trigger','cause','understand','need'],['safe','report','senior','support']],'scenario'),
    q('Dementia','How do you support someone living with dementia?',['Speak slowly and simply; reassure','Respect routines and individual preferences','Assess unmet needs and report changes'],[['calm','reassur','patient'],['routine','choice','person'],['communicat','report','safe']],'scenario'),
    q('Emergency','What would you do if you found a resident on the floor?',['Check immediate danger and responsiveness','Call for help and follow emergency protocols','Do not move them unnecessarily; monitor and document'],[['safe','danger','respons'],['call','help','senior','ambulance','emergency'],['move','injur','record','monitor']],'scenario'),
    q('Falls','How can you reduce the risk of falls in a care home?',['Check environment and suitable footwear','Support mobility according to the care plan and training','Report and document any changes or incidents'],[['risk','assess','environment','clutter'],['mobility','walking','footwear','care plan'],['report','record','support']],'scenario'),
    q('Food and fluids','What do food and fluid consistencies mean, and why are they important?',['Understand texture-modified foods and thickened fluids','Follow the individual SALT/IDDSI plan','Never change a prescribed consistency independently'],[['texture','thick','consistency','iddi','iddsi'],['speech','salt','swallow','aspirat'],['care plan','follow','safe']],'scenario'),
    q('Nutrition','A resident refuses to eat or drink. How would you respond?',['Offer choice, dignity and gentle encouragement','Check immediate concerns and follow the care plan','Inform staff and document intake as required'],[['choice','ask','encourag','preference'],['fluid','food','hydration','care plan'],['report','inform','document','record']],'scenario'),
    q('Moving and handling','How do you support a resident with moving and handling?',['Follow risk assessment and care plan','Use approved equipment and correct staffing','Never attempt an unsafe manual lift'],[['risk','care plan','assess'],['hoist','equipment','training','staff'],['safe','report','never','lift']],'scenario'),
    q('Documentation','Why are accurate care records important?',['Provide clear factual, timely records','Protect confidentiality','Support continuity of care and safeguarding'],[['accurate','fact','time','record'],['confidential','privacy','secure'],['care','team','safeguard','continu']],'scenario'),
    q('Teamwork','Tell me about a time you supported a colleague under pressure.',['Explain the situation and workload','Describe how you prioritised safe support','Explain the positive outcome'],[['colleague','team','help'],['priorit','communicat','safe'],['result','complete','resident','support']],'behavior'),
    q('Escalation','What would you do if a resident suddenly became unwell?',['Observe and assess immediate safety within your training','Get prompt clinical assistance or emergency help','Stay with the resident and record/report observations'],[['safe','responsive','breath','vital'],['nurse','senior','emergency','ambulance','call'],['monitor','stay','record','report']],'scenario'),
    q('Professional values','What do the six Cs of care mean to you?',['Explain care, compassion, competence, communication, courage and commitment','Illustrate how these influence daily support'],[['care','compassion'],['competence','communication'],['courage','commitment']],'scenario'),
    q('Closing','Why should we hire you as a Care Assistant?',['Describe experience or transferable skills','Emphasise kindness, reliability and safe working','Explain commitment to residents and teamwork'],[['caring','kind','compassion','patient'],['reliable','saf','respect'],['team','resident','role']],'intro')
  ],
  micro:[
    q('Introduction','Tell me about your background as a QC Microbiology Technician.',['Summarise core microbiology techniques','Mention GMP, cleanroom and documentation experience','Connect your skills to the new role'],[['microbiolog','qc','laboratory'],['gmp','cleanroom','sampling'],['document','quality','role']],'intro'),
    q('Environmental monitoring','Explain how you conduct environmental monitoring in controlled areas.',['Cover viable air, settle plates, contact plates and swabs','Explain aseptic technique, site selection and frequencies','Describe incubation, trending and escalation of excursions'],[['air','settle','contact','swab'],['aseptic','sampling','cleanroom','grade'],['trend','limit','excursion','report']],'technical'),
    q('Contamination control','What steps would you take if you detected an environmental monitoring excursion?',['Verify details and immediately inform appropriate staff','Follow SOP and deviation processes; evaluate risk','Support investigation, CAPA and effectiveness checks'],[['excursion','limit','result'],['inform','report','deviation','investigat'],['risk','capa','corrective','prevent']],'scenario'),
    q('Water microbiology','How do you sample and test purified water or WFI for bioburden?',['State aseptic sampling and sampling-point controls','Mention appropriate method, incubation and controls','Describe recording, alerts, trend review and escalation'],[['water','wfi','pw','sampling'],['aseptic','bioburden','incubat','filter'],['limit','trend','record','deviation']],'technical'),
    q('GMP','What does GMP mean in a microbiology laboratory?',['Explain controlled, reproducible quality practices','Mention approved SOPs, training and traceability','Include deviations, data integrity and documentation'],[['gmp','quality','sop','procedure'],['document','traceab','record'],['deviation','data integrity','training']],'technical'),
    q('Data integrity','How do you ensure data integrity and ALCOA+ compliance?',['Explain attributable, legible, contemporaneous, original and accurate','Include completeness, consistency, enduring and availability','Give an example of recording and correction practice'],[['alcoa','attribut','legible','contempor'],['original','accurate','complete'],['record','correction','traceab','audit']],'technical'),
    q('Aseptic technique','How do you minimise contamination while performing microbiological testing?',['Prepare equipment and workspace correctly','Use aseptic handling, disinfection and gowning','Include negative controls and observing procedural requirements'],[['aseptic','steril','disinfect','clean'],['gown','glove','technique'],['control','sop','contaminat']],'technical'),
    q('Investigations','Describe a deviation or out-of-trend result you investigated.',['Give the context and the original issue','Explain how you checked data and root causes','Describe the outcome, CAPA and learning'],[['deviation','trend','issue','result'],['investigat','root cause','data'],['capa','action','outcome','prevent']],'behavior'),
    q('Media quality','What is growth promotion testing and why is it important?',['Describe confirming media can support target organism growth','Mention suitable organisms, controls and acceptance criteria','Explain the implications of failed growth promotion'],[['media','growth','promotion'],['organism','control','acceptance'],['result','fail','valid','sop']],'technical'),
    q('Microbial identification','How do you approach an unknown microbial isolate?',['Explain safe colony observation and initial checks','Mention Gram stain and validated identification method','Record identification and assess potential impact'],[['isolate','colony','organism'],['gram','identif','method'],['record','impact','report']],'technical'),
    q('Sampling','How would you perform bioburden testing for a pharmaceutical product?',['Follow approved sample preparation and validated method','Explain suitable dilutions, recovery and controls','Interpret counts and compare with specifications'],[['sample','product','bioburden'],['dilut','membrane','plate','method'],['control','specification','limit','count']],'technical'),
    q('Quality systems','How do you manage a CAPA and confirm effectiveness?',['Use a systematic root-cause investigation','Set corrective and preventive actions with owners/dates','Check effectiveness using follow-up data'],[['root cause','investigat'],['corrective','preventive','capa','action'],['effective','review','trend','check']],'technical'),
    q('Prioritisation','How do you prioritise urgent sampling and routine QC testing?',['Clarify critical timelines and risk to operations','Coordinate with stakeholders without compromising GMP','Track deadlines and maintain data quality'],[['urgent','priority','deadline'],['risk','communicat','plan'],['gmp','quality','document']],'behavior'),
    q('Audit readiness','What would you do to prepare a QC microbiology area for an audit?',['Review SOP compliance, training and equipment status','Check records and traceability','Respond accurately and transparently to auditors'],[['sop','training','equipment'],['record','traceab','documentation'],['audit','evidence','answer']],'scenario'),
    q('Trending','Why is trending environmental or water monitoring data important?',['Detect shifts before specifications are exceeded','Consider location, organism, season or process changes','Escalate adverse trends and initiate preventive actions'],[['trend','pattern','shift'],['environment','water','location','data'],['prevent','investigat','action','report']],'technical'),
    q('Teamwork','Tell me about a quality improvement you contributed to.',['Describe the previous gap or inefficiency','Explain your specific action and collaboration','Quantify or describe the quality benefit'],[['improv','problem','opportunity'],['action','team','sop','process'],['result','reduc','quality','efficient']],'behavior'),
    q('Closing','Why are you interested in developing your career in pharmaceutical microbiology?',['Connect current practical experience to next steps','Show enthusiasm for GMP and patient/product safety','Mention relevant learning goals'],[['microbiolog','pharma','qc'],['gmp','patient','safety','quality'],['develop','learn','grow','skill']],'intro')
  ],
  nhs:[
    q('NHS values','What attracts you to working for the NHS?',['Demonstrate service and patient motivation','Reference respect, compassion, teamwork and quality','Connect skills to the specific job'],[['nhs','patient','service'],['compassion','respect','team'],['quality','skill','role']],'intro'),
    q('Values','How would you demonstrate compassion and dignity in everyday work?',['Listen and respond to individual needs','Protect privacy and choice','Explain one practical example'],[['listen','kind','compassion'],['privacy','choice','dignity'],['example','when','patient']],'scenario'),
    q('Patient safety','What would you do if you noticed a potential patient safety concern?',['Make the situation safe within your role','Escalate promptly using local policy','Document factually and support learning'],[['safe','risk','patient'],['escalat','report','senior'],['document','incident','learn']],'scenario'),
    q('Confidentiality','How would you protect confidential patient information?',['Access information only when necessary','Follow information governance and local systems','Escalate a breach promptly'],[['confidential','privacy','data'],['access','authoris','secure'],['report','breach','policy']],'scenario'),
    q('Equality','How do you ensure patients from different backgrounds feel included?',['Avoid assumptions and ask about needs','Use accessible communication or interpreting support','Treat everyone fairly with dignity'],[['respect','fair','equal'],['communicat','interpret','accessible'],['need','choice','dignity']],'scenario'),
    q('Teamwork','Describe a time you worked with colleagues to maintain safety.',['Explain the shared challenge','Describe collaboration and escalation','Show the outcome'],[['team','colleague'],['communicat','report','support'],['safe','result','outcome']],'behavior'),
    q('Communication','How would you communicate with someone who is anxious or confused?',['Stay calm and use clear language','Listen actively and allow time','Seek suitable support when needed'],[['calm','reassur','patient'],['listen','clear','simple'],['support','understand','check']],'scenario'),
    q('Prioritisation','You have several urgent tasks. How do you decide what comes first?',['Put patient safety first','Check clinical risk and instructions within your competence','Communicate and document priorities'],[['patient','safe','risk'],['priorit','urgent','assess'],['communicat','team','report']],'scenario'),
    q('Reflection','Tell me about feedback you received and what you changed.',['State the feedback objectively','Explain the action you took','Describe evidence of improvement'],[['feedback','suggest'],['improv','learn','training'],['result','better','change']],'behavior'),
    q('Professional limits','What would you do if asked to perform a task beyond your training?',['Do not perform unsafe tasks','Explain your competence limits respectfully','Seek guidance and training'],[['training','competence','limit'],['safe','risk','do not','refus'],['senior','ask','guidance']],'scenario'),
    q('Quality','How would you improve a process while maintaining quality and safety?',['Identify the problem using evidence','Involve colleagues and follow approval processes','Measure effect and monitor risks'],[['improv','quality','process'],['data','team','evidence'],['risk','review','safe']],'behavior'),
    q('Closing','Why should we appoint you to this NHS role?',['Match examples to the person specification','Emphasise values and reliable teamwork','Show commitment to learning and patient outcomes'],[['experience','skill','criteria'],['patient','team','compassion'],['learn','quality','contribut']],'intro')
  ],
  tech:[
    q('Introduction','Walk me through your background and why this position suits you.',['Explain your relevant technical background','Highlight projects and measurable outcomes','Tie your skills to the role'],[['technical','project','experience','software'],['skill','build','develop'],['role','team','interested']],'intro'),
    q('Problem solving','Explain a difficult technical problem you solved.',['Define the problem and constraints','Explain investigation and trade-offs','Quantify results and lessons'],[['problem','bug','issue','challenge'],['analys','debug','investigat','approach'],['result','improv','fix','learn']],'behavior'),
    q('Projects','Tell me about a project you are most proud of.',['Describe the objective and your contribution','Explain technologies and decisions','Describe impact and lessons'],[['project','built','develop'],['design','implemented','tool','technical'],['result','user','impact','learn']],'behavior'),
    q('Teamwork','How do you work with colleagues who disagree with your approach?',['Listen and clarify the trade-offs','Use evidence and user impact to decide','Reach a respectful outcome'],[['listen','understand','perspective'],['data','evidence','trade-off'],['agree','decision','team']],'behavior'),
    q('Quality','How do you test your work before release?',['Describe different levels of testing','Include edge cases and peer review','Mention monitoring and feedback'],[['test','unit','integration','manual'],['edge','review','quality'],['deploy','monitor','bug']],'technical'),
    q('Prioritisation','How do you handle competing technical deadlines?',['Estimate urgency, effort and risk','Communicate trade-offs early','Break work into milestones'],[['priorit','deadline','urgency'],['communicat','stakeholder','team'],['plan','milestone','deliver']],'behavior'),
    q('Learning','How do you keep your technical skills up to date?',['Explain deliberate learning methods','Give an example of applying new skills','Connect learning to team impact'],[['learn','course','read','practice'],['project','appl','experiment'],['improv','team','skill']],'intro'),
    q('Incident response','What would you do if an important system failed?',['Assess impact and restore safe operation','Communicate and escalate appropriately','Document root cause and prevention'],[['incident','impact','critical'],['investigat','rollback','restor','debug'],['communicat','postmortem','prevent','monitor']],'scenario'),
    q('Communication','How would you explain a technical issue to a non-technical person?',['Use plain language and context','Focus on impact and next steps','Check for understanding'],[['simple','plain','explain'],['impact','business','user'],['question','understand','check']],'behavior'),
    q('Design','How do you approach designing a new feature from scratch?',['Clarify user needs and constraints','Consider alternatives and risks','Plan iteration, testing and success measures'],[['user','requirement','problem'],['design','alternative','trade-off'],['test','feedback','measure']],'technical'),
    q('Adaptability','Describe a time you had to learn a new tool quickly.',['Explain why the skill was needed','Describe deliberate practice','Show how you applied it'],[['new','tool','learn'],['tutorial','practice','experiment'],['result','deliver','apply']],'behavior'),
    q('Closing','What value would you bring in your first three months?',['Understand the team before proposing changes','Commit to achievable contributions','Describe learning and communication priorities'],[['understand','learn','onboard'],['team','communicat'],['deliver','improv','impact']],'intro')
  ]
};
Object.entries(QUESTIONS).forEach(([role,arr])=>arr.forEach((item,index)=>{item.id=`${role}-${index+1}`;item.role=role}));
const SKILLS={
 'Communication':['communication','communicate','listening','verbal','written','stakeholder'],
 'Teamwork':['teamwork','collaboration','team player','multidisciplinary','cross-functional'],
 'Leadership':['leadership','lead a team','supervise','mentor','coaching'],
 'Problem solving':['problem solving','problem-solving','analytical','critical thinking','troubleshooting'],
 'Quality & compliance':['gmp','good manufacturing','quality','sop','compliance','iso 9001','audit'],
 'Microbiology':['microbiology','microbial','bioburden','environmental monitoring','cleanroom','aseptic'],
 'Documentation':['documentation','record keeping','report writing','data integrity','alcoa'],
 'Safeguarding':['safeguarding','abuse','protect vulnerable','duty of care'],
 'Person-centred care':['person centred','person-centered','care plan','personal care','dignity'],
 'Infection prevention':['infection control','infection prevention','hand hygiene','ppe'],
 'Adaptability':['adaptability','flexibility','adaptable','quick learner'],
 'Time management':['time management','prioritisation','prioritization','deadlines','organised'],
 'Customer care':['customer service','customer satisfaction','client service','customer care'],
 'Software development':['javascript','python','software development','software engineer','web development','api'],
 'Data analysis':['data analysis','excel','sql','statistics','data driven','data-driven']
};

const KEY='aceprep-data-v1';
const defaults=()=>({role:'general',sessions:[],answered:[],stories:[],custom:[],starred:[],jobText:'',jobTitle:'',session:null,coach:{}});
function normaliseData(o){const base=defaults();if(!o||typeof o!=='object'||Array.isArray(o))return base;
 const result={...base,...o};for(const k of ['sessions','answered','stories','custom','starred'])if(!Array.isArray(result[k]))result[k]=[];
 if(!result.coach||typeof result.coach!=='object'||Array.isArray(result.coach))result.coach={};
 if(result.session&&(!Array.isArray(result.session.ids)||!Array.isArray(result.session.entries)))result.session=null;
 if(!['general','care','micro','nhs','tech'].includes(result.role))result.role='general';
 return result;}
function loadData(){try{return normaliseData(JSON.parse(localStorage.getItem(KEY)))}catch(e){return defaults()}}
let data=loadData();if(!ROLES[data.role])data.role='general';
let state={view:'home',search:'',filter:'all',expanded:new Set(),starDraft:{title:'',s:'',t:'',a:'',r:''},jobResults:null};
let recognition=null, listening=false, voiceBase='';
// Interviewer speech: select the softest available English voice rather than
// relying on the browser's sometimes harsh or robotic system default.
const VOICE_KEY='aceprep-voice-v2';
let preferredVoiceURI='auto';
try{preferredVoiceURI=localStorage.getItem('aceprep-voice-v3')||'auto'}catch(e){preferredVoiceURI='auto'}
if(preferredVoiceURI.startsWith('kokoro:'))preferredVoiceURI='auto';
const voiceSample='Hello, and welcome to your interview practice. Take your time. You are doing well. Shall we begin?';
function browserVoices(){
 if(!('speechSynthesis' in window))return [];
 try{return speechSynthesis.getVoices().filter(v=>/^en(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>voiceRank(b)-voiceRank(a)||a.name.localeCompare(b.name))}catch(e){return []}
}
function voiceRank(v){
 const name=v.name.toLowerCase(),lang=v.lang.toLowerCase();let score=0;
 if(lang==='en-gb')score+=65;else if(lang.startsWith('en-'))score+=25;
 if(/online.*natural|neural|premium|enhanced/.test(name))score+=80;
 if(/sonia|libby|serena|kate|google uk english female|jenny|aria/.test(name))score+=100;
 if(/samantha|allison|ava|victoria|moira|susan|google uk english male|daniel|alex/.test(name))score+=50;
 if(/compact|espeak|robot|fred|bad news|bubbles|whisper/.test(name))score-=140;
 return score;
}
function currentVoice(){const voices=browserVoices();return preferredVoiceURI==='auto'?(voices[0]||null):(voices.find(v=>v.voiceURI===preferredVoiceURI)||voices[0]||null)}
function voiceOptions(){
 const voices=browserVoices();
 let options='<optgroup label="Instant voices · no download">';
 options+=`<option value="auto" ${preferredVoiceURI==='auto'?'selected':''}>${esc(voices[0]?`Best available · ${voices[0].name}`:'Device default')}</option>`;
 for(const v of voices)options+=`<option value="${esc(v.voiceURI)}" ${preferredVoiceURI===v.voiceURI?'selected':''}>${esc(v.name)} · ${esc(v.lang)}${v.localService?' · installed':''}</option>`;
 options+='</optgroup><optgroup label="Natural Orpheus voices · private server connection">';
 for (const [id,name] of [['hannah','Hannah · female'],['autumn','Autumn · female'],['diana','Diana · female'],['austin','Austin · man'],['daniel','Daniel · man'],['troy','Troy · man']]) options+=`<option value="orpheus:${id}" ${preferredVoiceURI==='orpheus:'+id?'selected':''}>${name} · natural AI</option>`;
 return options+'</optgroup>';
}
function voiceSettingsHTML(){
 return `<div class="voice-panel"><div class="voice-panel-copy"><div class="eyebrow">${ico('sound')} INTERVIEWER VOICE</div><h3>Interview voices — choose what works</h3><p><strong>Instant:</strong> choose a voice already installed on your device. <strong>Natural:</strong> choose Hannah, Autumn, Diana, Austin, Daniel or Troy with AcePrep’s private server connection. Orpheus runs through your private Groq server, not through a browser model download. Voice quality and regional accent vary.</p><p class="micro muted">Orpheus has limited free-tier usage and requires internet. It isn't an unlimited free voice. The voice provider receives the text to speak. You can always turn audio off.</p></div><div class="voice-panel-controls"><label class="field-label" for="voiceSelect">Choose interviewer voice</label><select class="field-select voice-select" id="voiceSelect">${voiceOptions()}</select><div class="voice-test-buttons"><button class="btn btn-teal btn-sm" data-action="preview-voice">${ico('play')} Hear sample</button><button class="btn btn-outline btn-sm" data-action="stop-voice">Stop voice</button><button class="btn btn-outline btn-sm" data-view="agent">AI connection status</button></div><div id="voice-status" class="voice-caption">${preferredVoiceURI.startsWith('orpheus:')?'Natural voice requires a secure AI server connection. See AI Research Agent.':'Device voices are ready without a download. Change voice if this one sounds robotic.'}</div></div></div>`;
}
function refreshVoiceChoices(){const select=document.getElementById('voiceSelect');if(select)select.innerHTML=voiceOptions()}
let orpheusAudio=null,orpheusURL='',speechSequence=0,activeSpeechAbort=null,activeSpeechResolve=null;
function voiceStatus(value){const el=document.getElementById('voice-status');if(el)el.textContent=value}
function splitVoiceText(value){
 const text=String(value||'').replace(/\s+/g,' ').trim(),pieces=[],words=text.split(/\s+/);
 let chunk='';
 for(const word of words){
  // Keep each Groq chunk under its documented 200-character request limit.
  if(word.length>180){if(chunk){pieces.push(chunk);chunk=''}for(let i=0;i<word.length;i+=180)pieces.push(word.slice(i,i+180));continue}
  if(chunk&&(chunk.length+1+word.length)>180){pieces.push(chunk);chunk=word}else chunk+=(chunk?' ':'')+word;
 }
 if(chunk)pieces.push(chunk);
 return pieces;
}
function stopSpeaking(){
 speechSequence++;if(activeSpeechAbort){activeSpeechAbort.abort();activeSpeechAbort=null}
 if(orpheusAudio){orpheusAudio.pause();orpheusAudio.removeAttribute('src');orpheusAudio.load();orpheusAudio=null}
 if(activeSpeechResolve){activeSpeechResolve();activeSpeechResolve=null}
 if(orpheusURL){URL.revokeObjectURL(orpheusURL);orpheusURL=''}
 if('speechSynthesis'in window){try{speechSynthesis.cancel()}catch(_){}}
 voiceStatus('Audio stopped.');
}
async function speakWithChosenVoice(text){
 stopSpeaking();const seq=speechSequence;
 if(preferredVoiceURI.startsWith('orpheus:')){
  if(!window.AceAgent?.isAiAvailable()){toast('Unlock AI in the Research Agent to use Orpheus.');return}
  const parts=splitVoiceText(text);
  if(!parts.length)return;
  if(parts.join('').length>15000){toast('This text is too long to read aloud. Try a shorter response.');return}
  const controller=new AbortController();activeSpeechAbort=controller;
  try{
   for(let i=0;i<parts.length;i++){
    if(seq!==speechSequence)return;
    voiceStatus(`Generating natural speech ${i+1} of ${parts.length}…`);
    const response=await fetch('/api/speech',{method:'POST',headers:{'Content-Type':'application/json',...(window.AceAgent?.authHeaders?.()||{})},credentials:'same-origin',cache:'no-store',signal:controller.signal,body:JSON.stringify({input:parts[i],voice:preferredVoiceURI.slice(8)})});
    if(!response.ok){let reason=`HTTP ${response.status}`;try{const e=await response.json();reason=e.error||reason}catch(_){}throw new Error(reason)}
    const blob=await response.blob();if(seq!==speechSequence)return;
    orpheusURL=URL.createObjectURL(blob);orpheusAudio=new Audio(orpheusURL);
    voiceStatus(`Speaking part ${i+1} of ${parts.length}…`);
    await new Promise((resolve,reject)=>{
     activeSpeechResolve=resolve;
     orpheusAudio.onended=resolve;
     orpheusAudio.onerror=()=>reject(new Error('Browser could not play this audio segment.'));
     orpheusAudio.play().catch(reject);
    });
    activeSpeechResolve=null;
    if(orpheusURL)URL.revokeObjectURL(orpheusURL);orpheusURL='';orpheusAudio=null;
   }
   if(seq===speechSequence)voiceStatus('Finished playing the full response.');
  }catch(e){if(seq===speechSequence&&e.name!=='AbortError'){voiceStatus('Natural voice failed: '+e.message);toast('Natural voice unavailable: '+e.message.slice(0,110))}}
  finally{if(seq===speechSequence)activeSpeechAbort=null}
  return;
 }
 if(!('speechSynthesis'in window)){toast('No system voices available. Use text practice.');return}
 try{
  const utter=new SpeechSynthesisUtterance(text);const v=currentVoice();
  if(v){utter.voice=v;utter.lang=v.lang}else utter.lang='en-GB';
  utter.rate=.94;utter.pitch=1.0;utter.volume=.92;
  utter.onend=()=>voiceStatus('Device voice finished.');
  utter.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')toast('Device voice could not play. Choose another voice.')};
  voiceStatus('Speaking with device voice…');speechSynthesis.speak(utter);
 }catch(e){toast('Device speech failed. Choose another voice or use text.')}
}

const app=document.getElementById('app');
const esc=str=>String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ico=(name)=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){if(e?.name==='QuotaExceededError')toast('Browser storage is full. Export your progress for a backup.');else console.warn('Progress could not be saved in this browser context',e)}};
const today=()=>new Date().toISOString().slice(0,10);
const dateLabel=s=>{try{return new Date(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}catch(e){return ''}};
const allQuestions=(role=data.role)=>[...(QUESTIONS[role]||[]),...data.custom.filter(x=>x.role===role)];
const questionById=id=>Object.values(QUESTIONS).flat().find(x=>x.id===id)||data.custom.find(x=>x.id===id);
const scoreLabel=n=>n>=80?'Strong answer':n>=60?'Good foundation':n>=40?'Keep developing':'Needs more detail';
const wordCount=s=>(String(s||'').trim().match(/\b[\w'-]+\b/g)||[]).length;
const overallAvg=()=>data.sessions.length?Math.round(data.sessions.reduce((s,x)=>s+x.score,0)/data.sessions.length):0;
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),3200)}
function nav(view){stopListening();stopSpeaking();if(!['home','agent','coach','practice','questions','star','jobfit','vault','progress'].includes(view))return;state.view=view;state.expanded.clear();render();window.scrollTo({top:0,behavior:'smooth'});document.getElementById('shell').classList.remove('menu-open')}
function render(){
 const titles={home:'Overview',agent:'AI Research Agent',coach:'Interactive coach',practice:'Mock interview',questions:'Question bank',star:'STAR story builder',jobfit:'Job description lab',vault:'My answers',progress:'My progress'};
 document.getElementById('page-crumb').textContent=titles[state.view];
 document.querySelectorAll('.nav-link').forEach(btn=>{btn.classList.toggle('active',btn.dataset.view===state.view);if(btn.dataset.view===state.view)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});
 document.getElementById('roleSelect').value=data.role;
 const pages={home:homePage,agent:()=>AceAgent.page(),coach:coachPage,practice:practicePage,questions:questionsPage,star:starPage,jobfit:jobfitPage,vault:vaultPage,progress:progressPage};
 app.innerHTML=pages[state.view]();
 window.AceAgent?.afterRender?.();
}
function pageIntro(kicker,title,desc,action=''){return `<div class="page-intro"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`}
function homePage(){
 const sessions=data.sessions.length,avg=overallAvg(),answers=data.answered.length,stories=data.stories.length;
 const roleOptions=['care','micro','nhs','general'].map(role=>`<button class="role-card ${role===data.role?'selected':''}" data-action="choose-role" data-role="${role}"><div class="role-icon">${ico(ROLE_META[role].icon)}</div><div><strong>${esc(ROLES[role])}</strong><small>${esc(ROLE_META[role].description)}</small></div>${ico('chevron')}</button>`).join('');
 return `<div class="hero"><div class="hero-copy"><div class="eyebrow">✦ YOUR INTERVIEW CONFIDENCE STUDIO</div><h1>Confident answers.<br/><em>Stronger interviews.</em></h1><p>Practise real questions, turn experience into powerful stories, and improve one answer at a time. All free, at your own pace.</p><div class="row"><button class="btn btn-warm" data-view="agent">Meet your AI interview agent ${ico('arrow')}</button><button class="btn btn-outline" style="border-color:#3c6670;background:#18364a;color:#d8eee9" data-view="questions">Explore questions</button></div></div><div class="hero-art" aria-hidden="true"><div class="art-orbit"><div class="art-disc"><span>A<i>✦</i></span></div></div><div class="art-tag one">${ico('check')} Well prepared</div><div class="art-tag two"><span class="gold-dot"></span> Ready to impress</div></div></div>
 <div class="metric-grid"><div class="metric"><small>Mocks completed</small><strong>${sessions}</strong><span class="metric-icon">${ico('mic')}</span></div><div class="metric"><small>Average feedback score</small><strong>${avg||'—'}${avg?'<span style="font-size:12px;color:#8996a5"> /100</span>':''}</strong><span class="metric-icon">${ico('chart')}</span></div><div class="metric"><small>Answers practised</small><strong>${answers}</strong><span class="metric-icon">${ico('check')}</span></div><div class="metric"><small>STAR stories saved</small><strong>${stories}</strong><span class="metric-icon">${ico('star')}</span></div></div>
 <div class="home-grid"><section><div class="section-header"><div><div class="eyebrow">PRACTISE WITH PURPOSE</div><h2>What role are you preparing for?</h2><p>Choose one to see the most relevant practice questions.</p></div></div><div class="role-cards">${roleOptions}</div><div class="section-space question-spotlight"><span class="pill dark">${esc(ROLES[data.role])} · featured question</span><h3>${esc(allQuestions()[0]?.text||'Tell me about yourself.')}</h3><p>Use the answer guide to learn what interviewers want, then practise speaking in your own words.</p><button class="btn btn-warm btn-sm" data-view="questions">Study the question ${ico('arrow')}</button></div></section><aside class="plan-card"><span class="pill">YOUR PRACTICE ROUTINE</span><h3>10 minutes to a better answer</h3><p>You don’t need to memorise scripts. Build clear, natural answers through short, repeated practice.</p><div class="plan-steps"><div class="plan-step"><b>1</b><span>Choose a role-specific question</span></div><div class="plan-step"><b>2</b><span>Speak or type a real answer</span></div><div class="plan-step"><b>3</b><span>Review feedback and improve</span></div><div class="plan-step"><b>4</b><span>Save your best examples as STAR stories</span></div></div><button class="btn btn-primary" data-view="coach">Begin learning ${ico('arrow')}</button></aside></div>
 <div class="footer-note">Free practice · Optional free-tier AI limits · No adverts · Your answers stay on this device unless you submit them to an AI provider</div>`;
}
// -------- Guided interview coach: study → checkpoint → feedback → retry --------
function coachLessons(){
 const lessons=typeof COACH_LESSONS!=='undefined'?(COACH_LESSONS[data.role]||[]):[];
 // The lesson library is independent from the mock interview bank, so we can teach
 // longer answers as well as test scenarios. A full syllabus can be repeated.
 return lessons;
}
function coachState(){
 if(!data.coach || typeof data.coach!=='object')data.coach={};
 if(!data.coach[data.role])data.coach[data.role]={index:0,phase:'learn',draft:'',feedback:null,attempts:0,completed:0,challenge:false};
 const s=data.coach[data.role],total=coachLessons().length;
 if(total)s.index=Math.min(Math.max(0,s.index||0),total-1);
 return s;
}
function coachLesson(){return coachLessons()[coachState().index]}
function coachCoachLine(s){
 if(s.phase==='learn')return 'I’ll teach you this topic first. Read the model answer, then explain it in your own words. You don’t need to memorise everything.';
 if(s.phase==='feedback')return s.feedback?.score>=75?'Good structure. Now make it sound more natural by practising again.':'You have a starting point. Focus on one missing idea and try again.';
 return 'Your turn. Imagine I am the interviewer. Take your time, answer clearly, and give a real example if possible.';
}
function coachProgressHTML(s,total){
 const seen=Math.max(0,Math.min(total,s.completed||0));
 return `<div class="coach-progress"><div class="row-between"><span class="small muted">${seen} of ${total} lessons studied · no question limit</span><strong>${Math.round(100*seen/Math.max(1,total))}%</strong></div><div class="meter"><span style="width:${100*seen/Math.max(1,total)}%"></span></div></div>`;
}
function coachPage(){
 const items=coachLessons(),s=coachState(),item=coachLesson();
 if(!item)return `<div class="inner-page">${pageIntro('INTERACTIVE COACH','Lessons are being added','Try another role for now.')}</div>`;
 const index=s.index+1;
 const mode=s.phase==='learn'?'LEARN THE ANSWER':s.phase==='feedback'?'YOUR PERSONAL FEEDBACK':'PRACTICE CHECKPOINT';
 const focus=(item.focus||[]).map(x=>`<li>${esc(x)}</li>`).join('');
 const model=`<div class="model-answer"><div class="row-between"><span class="pill gold">${ico('book')} Suggested answer</span><button class="btn btn-outline btn-sm" data-action="coach-hear-answer">${ico('sound')} Listen</button></div><p>${esc(item.answer)}</p></div>`;
 let content='';
 if(s.phase==='learn'){
  content=`<div class="coach-learning"><span class="pill neutral">Lesson ${index} / ${items.length} · ${esc(item.category)}</span><h2 class="interview-q">${esc(item.text)}</h2><div class="row-between"><span class="small muted">What your answer needs to include</span><button class="btn btn-outline btn-sm" data-action="coach-hear-question">${ico('sound')} Hear the question</button></div><ul class="coach-focus">${focus}</ul>${model}<div class="coach-actions"><button class="btn btn-primary" data-action="coach-practise">${ico('mic')} Let me answer it</button><button class="btn btn-outline" data-action="coach-next">Next lesson ${ico('arrow')}</button></div><p class="micro muted">After every two taught lessons the coach introduces a compulsory practice checkpoint. You can also practise now.</p></div>`;
 } else {
  const question=s.challenge?(s.followup||'Can you give a specific example, explain exactly what you did, and describe the result?'):item.text;
  content=`<div class="coach-learning"><span class="pill gold">${s.challenge?'INTERVIEW FOLLOW-UP':'PRACTICE CHECKPOINT'} · ${esc(item.category)}</span><div class="row-between" style="align-items:flex-start"><h2 class="interview-q">${esc(question)}</h2><button class="btn btn-outline btn-sm" data-action="coach-hear-question">${ico('sound')} Hear</button></div><p class="help-text">Speak naturally, or type your answer. Explain what <strong>you</strong> would do, and why.</p><label class="field-label" for="coach-answer">Your answer</label><textarea id="coach-answer" class="textarea" rows="6" placeholder="Take your time. Begin with the main point, then give a clear example…">${esc(s.draft||'')}</textarea><div class="row-between section-spacer"><span class="small muted" id="coach-count">${wordCount(s.draft||'')} words</span><button class="btn btn-outline btn-sm" data-action="dictate" id="dictate-btn">${ico('mic')} Speak your answer</button></div>
  ${s.phase==='feedback'?coachFeedbackHTML(s,item):''}
  <div class="coach-actions">${s.phase==='feedback'?`<button class="btn btn-primary" data-action="coach-retry">Try again with feedback</button><button class="btn btn-outline" data-action="coach-followup">Ask a follow-up question</button><button class="btn btn-teal" data-action="coach-next">Next lesson ${ico('arrow')}</button>`:`<button class="btn btn-primary" data-action="coach-assess">${ico('spark')} Coach my answer</button><button class="btn btn-outline" data-action="coach-show-example">Show example answer</button>`}</div></div>`;
 }
 return `<div class="inner-page">${pageIntro('YOUR ALWAYS-ON INTERVIEW COACH','Learn. Speak. Improve. Repeat.','Study realistic questions and model answers, then practise in a conversation-style routine. No five-question limit.',`<button class="btn btn-outline btn-sm" data-action="coach-jump">${ico('book')} Browse topics</button>`)}
 <div class="coach-layout"><section class="coach-main"><div class="coach-assistant"><div class="coach-avatar">A✦</div><div class="coach-bubble"><span class="eyebrow">ACE · YOUR STUDY COACH</span><p>${esc(coachCoachLine(s))}</p></div></div>
 ${coachProgressHTML(s,items.length)}<div class="card coach-card"><div class="eyebrow">${mode}</div>${content}</div>${voiceSettingsHTML()}</section>
 <aside class="coach-sidebar"><div class="card"><span class="pill neutral">CONFIDENCE TOOLKIT</span><h3>Improve one thing at a time</h3><p class="help-text">A strong interview answer is not the longest answer. Be relevant, safe, specific and clear.</p><div class="coach-tips"><div><b>1</b><span>Start with a direct answer</span></div><div><b>2</b><span>Explain your action or responsibility</span></div><div><b>3</b><span>Add an example and outcome</span></div><div><b>4</b><span>Finish calmly</span></div></div><button class="btn btn-outline btn-sm" data-action="coach-encourage">I'm feeling nervous</button></div><div class="card section-space"><div class="eyebrow">TOPIC LIBRARY</div><h3>${items.length} detailed lessons</h3><label class="field-label" for="coachTopic">Jump to any question</label><select class="field-select" id="coachTopic">${items.map((x,i)=>`<option value="${i}" ${i===s.index?'selected':''}>${esc(`${i+1}. ${x.text}`)}</option>`).join('')}</select><p class="micro muted">Question banks are extensive but no app can predict literally every interview question.</p></div></aside></div></div>`;
}
function coachFeedbackHTML(s,item){
 const f=s.feedback||{score:0},missing=f.missing||[];
 const positive=f.score>=75?'Your answer includes useful, relevant details.':f.score>=45?'You covered some important ideas.':'You started answering, and that is valuable practice.';
 return `<div class="coach-feedback" role="status"><div class="row-between"><div><div class="eyebrow">COACHING FEEDBACK</div><h3>Practice score: ${f.score}/100 <span class="micro muted">(${f.ai?'AI coaching estimate':'checklist estimate'})</span></h3></div><span class="pill neutral">Attempt ${s.attempts}</span></div><p>${esc(f.aiPositive||positive)}</p><h4>What to improve next</h4><ul>${missing.length?missing.map(x=>`<li>${esc(x)}</li>`).join(''):'<li>Keep your answer concise and make your example specific.</li>'}</ul><div class="coach-confidence">${ico('heart')} ${esc(f.message||'Practising is how you build confidence. One clearer answer at a time.')}</div>${modelAnswerForCoach(item)}</div>`;
}
function modelAnswerForCoach(item){return `<details class="coach-details"><summary>Compare with the model answer</summary><p>${esc(item.answer)}</p><ul>${item.focus.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`}
async function coachAssess(){
 const s=coachState(),item=coachLesson(),answer=(document.getElementById('coach-answer')?.value||s.draft||'').trim();
 if(wordCount(answer)<8){toast('Try speaking or writing at least one complete thought first.');return}
 const base=assessAnswer(answer,item),lower=answer.toLowerCase();
 let missing=[];
 for(const phrase of item.focus){
  const keywords=phrase.toLowerCase().split(/[^a-z]+/).filter(w=>w.length>4&&!['describe','explain','mention','include','state','offer','follow','person','should','could','where','needs','would','their'].includes(w));
  if(keywords.length&&!keywords.some(w=>lower.includes(w.slice(0,Math.max(4,w.length-2))))){missing.push('Add a point about: '+phrase)}
  if(missing.length>=2)break;
 }
 if(wordCount(answer)<35)missing.push('Expand beyond a short definition: explain the action or give an example.');
 if(item.type==='behavior'&&!/(when i|in my|for example|one day|last time|previous role|during|once)/i.test(answer))missing.push('Give one genuine STAR example, not just a general statement.');
 if(!/(i would|i did|i checked|i reported|i made|i helped|i used|i supported|i explained|i followed|i asked|my role)/i.test(answer))missing.push('Use “I” to explain what you personally did or would do.');
 s.attempts=(s.attempts||0)+1;s.draft=answer;s.phase='feedback';
 s.feedback={score:base.score,missing:missing.slice(0,4),message:base.score<60?'You can redo this answer with the model guide. Improvement is more useful than the number.':'Good work: practise the same idea without reading, at your own pace.'};
 if(window.AceAgent?.isAiAvailable()){
  toast('Ace is reading your answer and preparing specific feedback…');
  const question=s.challenge?(s.followup||item.text):item.text;
  try{const ai=await window.AceAgent.evaluateAnswer(question,answer,item.focus,item.answer);
    if(ai){s.feedback.ai=true;s.feedback.aiPositive=ai.strength;s.feedback.missing=ai.improvements;s.feedback.message=ai.encouragement;s.followup=ai.followup;s.feedback.score=ai.score;}
  }catch(e){s.feedback.message+=' AI feedback unavailable: '+e.message.slice(0,90)+'; showing checklist instead.';}
 }

 data.answered.unshift({uid:'coach-'+Date.now(),role:data.role,category:item.category,question:item.text,answer:answer,score:base.score,createdAt:new Date().toISOString()});
 data.answered=data.answered.slice(0,300);save();render();
}
function coachNext(){
 const s=coachState(),items=coachLessons();if(!items.length)return;
 s.completed=Math.max(s.completed||0,s.index+1);s.index=(s.index+1)%items.length;
 s.phase=(s.index%3===2)?'practice':'learn';s.draft='';s.feedback=null;s.attempts=0;s.challenge=false;s.followup='';save();render();
}
function coachStartPractice(){const s=coachState();s.phase='practice';s.draft='';s.feedback=null;s.challenge=false;save();render();document.getElementById('coach-answer')?.focus()}
function coachRetry(followup=false){const s=coachState();s.phase='practice';s.draft='';s.feedback=null;s.challenge=followup;save();render();document.getElementById('coach-answer')?.focus()}
function coachExplainSimple(){const item=coachLesson();toast('Read the three key points, then answer using your own words. Avoid memorising the full script.');speakWithChosenVoice('Here are the three ideas to include. '+item.focus.join('. '))}

function practicePage(){const s=data.session;if(s && s.index>=s.ids.length)return summaryPage(s);if(s)return activePracticePage(s);
 return `<div class="inner-page">${pageIntro('SIMULATED INTERVIEW','Practise like it’s the real thing','Take a mock interview for '+esc(ROLES[data.role])+'. Answer naturally, get structured feedback and build your confidence.')}
 <div class="setup-grid"><button class="mode-card featured" data-view="coach"><div class="mode-icon">${ico('play')}</div><div class="mode-arrow">${ico('arrow')}</div><h3>Guided learning + practice</h3><p>Learn every topic, see a complete answer, practise every few questions, and receive feedback.</p><span class="pill gold">Continue as long as you like</span></button><button class="mode-card" data-action="start-mock" data-size="10"><div class="mode-icon">${ico('mic')}</div><div class="mode-arrow">${ico('arrow')}</div><h3>Full mock interview</h3><p>10 questions covering motivations, technical knowledge, scenarios and teamwork.</p><span class="pill neutral">10 questions · around 20 minutes</span></button></div>
 ${voiceSettingsHTML()}<div class="info-strip">${ico('shield')} <span>Free and private. Feedback is based on a transparent checklist, not a paid AI model. You can type answers, or try microphone dictation if your browser supports it. Browser speech services may process spoken audio.</span></div></div>`}
function chooseQuestions(role,n){const all=allQuestions(role);const categoryMap=new Map();all.forEach(x=>{if(!categoryMap.has(x.category))categoryMap.set(x.category,[]);categoryMap.get(x.category).push(x)});const chosen=[];const buckets=[...categoryMap.values()].map(group=>[...group].sort(()=>Math.random()-.5));let cursor=0;while(chosen.length<Math.min(n,all.length)){let progressed=false;for(const bucket of buckets){if(bucket[cursor]){chosen.push(bucket[cursor].id);progressed=true;if(chosen.length>=n)break}}if(!progressed)break;cursor++}return chosen}
function startMock(size){const ids=chooseQuestions(data.role,size);data.session={id:`session-${Date.now()}`,role:data.role,ids,index:0,startedAt:new Date().toISOString(),elapsed:0,draft:'',feedback:null,entries:[]};save();nav('practice')}
function getCurrent(s){return questionById(s.ids[s.index])}
function activePracticePage(s){const item=getCurrent(s);if(!item)return `<div class="empty"><p>This question is no longer available.</p><button class="btn btn-primary" data-action="end-mock">Finish interview</button></div>`;
 const current=s.index+1,completed=s.ids.length;const steps=s.ids.map((id,i)=>`<span class="step ${i<s.index?'done':i===s.index?'current':''}"></span>`).join('');const words=wordCount(s.draft);
 return `<div class="inner-page">${pageIntro('INTERVIEW IN PROGRESS',`${esc(ROLES[s.role])} mock interview`,'Speak clearly, give relevant examples, and don’t worry about being perfect.',`<button class="btn btn-outline btn-sm" data-action="quit-mock">${ico('cross')} End interview</button>`)}<div class="interview-panel"><div class="interview-header"><div><div class="eyebrow">QUESTION ${current} OF ${completed}</div><div class="steps" style="margin-top:11px">${steps}</div></div><span class="pill neutral">${esc(item.category)}</span></div><div class="question-body"><div class="row-between"><span class="pill gold">${ico('spark')} Interviewer asks</span><button class="btn btn-outline btn-sm" data-action="read-question">${ico('sound')} Hear question</button></div><h2 class="interview-q">${esc(item.text)}</h2><div class="q-hint">${ico('clock')} Aim for 60–120 seconds. There is no strict time limit.</div>${voiceSettingsHTML()}<label class="field-label" for="practice-answer">Your answer</label><textarea class="textarea" id="practice-answer" placeholder="Start with your own words. Add a real example, what you did, and the outcome..." aria-label="Your interview answer">${esc(s.draft)}</textarea><div class="answer-bar"><div class="row"><span class="small muted" id="word-count">${words} words</span><div class="word-meter"><span id="word-fill" style="width:${Math.min(100,words/120*100)}%"></span></div></div><div class="answer-actions"><button class="btn btn-outline btn-sm" data-action="dictate" id="dictate-btn">${ico('mic')} ${listening?'Stop dictation':'Dictate answer'}</button></div></div>
 ${s.feedback?feedbackPanel(s.feedback,item):''}</div><div class="interview-footer"><div class="timer" id="timer">${ico('clock')} <span id="clock">${timeText(s.elapsed)}</span></div><div class="row"><button class="btn btn-outline btn-sm" data-action="skip-question">Skip</button>${s.feedback?`<button class="btn btn-teal" data-action="next-question">${current===completed?'Finish interview':'Next question'} ${ico('arrow')}</button>`:`<button class="btn btn-primary" data-action="assess">${ico('spark')} Check my answer</button>`}</div></div></div></div>`;
}
function timeText(seconds){const s=Math.max(0,Math.floor(seconds||0));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function textHas(answer,term){return answer.includes(term.toLowerCase())}
function assessAnswer(answer,item){const lower=answer.toLowerCase(),words=wordCount(answer), groups=item.terms||[];const matched=groups.filter(variants=>variants.some(term=>textHas(lower,term))).length;const relevance=groups.length?matched/groups.length:0.75;
 const example=/(for example|for instance|in my previous|one day|there was a time|i remember|i once|when i|during my|on one occasion|a resident|a patient|a colleague|a sample)/i.test(answer);
 const action=/(i (checked|reported|helped|spoke|made|used|followed|ensured|provided|organised|investigated|reviewed|explained|documented|analysed|assessed|asked|contacted|supported|planned|identified|worked)|my action|i would|i did|i took)/i.test(answer);
 const outcome=/(as a result|the result|this meant|this helped|we were able|it improved|it prevented|the outcome|i learnt|i learned|i now|afterwards|successfully|resolved|completed|ensured their safety)/i.test(answer);
 const reflection=/(learned|learnt|improv|next time|reflect|development|feedback|effective|prevent|future|better|follow-up|follow up)/i.test(lower);
 const clear=words>=35&&words<=260;const coveragePoints=Math.round(30*relevance);const lengthPoints=words>=55&&words<=220?20:words>=30?12:words>=15?6:0;
 const evidencePoints=example?15:0;const actionPoints=action?15:0;const resultPoints=outcome?12:0;const reflectionPoints=reflection?8:0;
 const score=Math.min(100,coveragePoints+lengthPoints+evidencePoints+actionPoints+resultPoints+reflectionPoints);
 const checks=[
 {ok:words>=55&&words<=220,label:'Answer length',detail:words<55?'Add more detail, ideally 60–150 spoken words.':words>220?'Tighten this into a more focused 1–2 minute answer.':'Good level of detail for a spoken answer.'},
 {ok:relevance>=.67,label:'Role-specific detail',detail:groups.length?`${matched} of ${groups.length} key topic areas mentioned.`:'Good starting point. Add details that match the job description.'},
 {ok:example,label:'Concrete example',detail:example?'You’ve included experience or a scenario.':'Add a brief real example to make your answer convincing.'},
 {ok:action,label:'Your contribution',detail:action?'You describe something you did or would do.':'Be explicit about your own actions, using “I”.'},
 {ok:outcome,label:'Result or impact',detail:outcome?'You mention an outcome or impact.':'Close with what happened, changed or improved.'},
 {ok:reflection,label:'Learning or next step',detail:reflection?'You show learning, improvement or prevention.':'Add one sentence about what you learned or would do next.'}
 ];
 let tips=[];if(relevance<.67&&item.focus.length)tips.push('Include: '+item.focus.slice(0,2).map(x=>x.charAt(0).toLowerCase()+x.slice(1)).join('; ')+'.');if(!example&&item.type==='behavior')tips.push('Use STAR: situation → task → your action → result.');if(!outcome)tips.push('Finish with a clear result or lesson.');if(words>220)tips.push('Remove repetition to keep your answer concise.');if(words<55)tips.push('Develop your example with two or three additional sentences.');if(!tips.length)tips.push('Try saying the answer aloud naturally, then practise once more without reading it.');
 return {score,checks,tips,words};
}
function feedbackPanel(feedback,item){const p=feedback;return `<div class="feedback"><div class="feedback-header"><div><span class="eyebrow">ANSWER REVIEW</span><h3>${scoreLabel(p.score)}</h3><p>${p.ai?'This is an AI coaching estimate, not a prediction of interview performance.':'This is a practice checklist score, not an AI evaluation or a hiring prediction.'}</p></div><div class="score-circle" style="--score:${p.score}%"><b>${p.score}</b></div></div><div class="feedback-list">${p.checks.map(x=>`<div class="fb-item ${x.ok?'':'bad'}"><b>${x.ok?'✓':'!'}</b><div><strong>${esc(x.label)}</strong><br/>${esc(x.detail)}</div></div>`).join('')}</div><div class="feedback-tips">${p.aiPositive?`<p><b>What you did well:</b> ${esc(p.aiPositive)}</p>`:''}<b>Try this next:</b> ${esc(p.tips.join(' '))}<div class="question-tools"><button class="btn btn-outline btn-sm" data-action="guide-practice">Show answer guide</button><button class="btn btn-outline btn-sm" data-action="retry-answer">Improve this answer</button></div>${state.expanded.has('current-guide')?`<div class="guide"><strong>What to cover:</strong><ul>${item.focus.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}</div></div>`}
async function evaluateCurrent(){const s=data.session,item=getCurrent(s);const textarea=document.getElementById('practice-answer');s.draft=textarea?.value||s.draft;if(wordCount(s.draft)<3){toast('Write at least a short answer before checking it.');return}stopListening();const answer=s.draft;s.feedback=assessAnswer(answer,item);
 if(window.AceAgent?.isAiAvailable()){
  toast('Ace is reviewing your answer…');
  try{const ai=await window.AceAgent.evaluateAnswer(item.text,answer,item.focus,'');if(ai){s.feedback.ai=true;s.feedback.score=ai.score;s.feedback.aiPositive=ai.strength;s.feedback.tips=ai.improvements;s.feedback.followup=ai.followup;}}
  catch(e){s.feedback.tips.unshift('AI review unavailable: '+e.message.slice(0,80)+'. Showing checklist instead.');}
 }
 save();render();document.querySelector('.feedback')?.scrollIntoView({behavior:'smooth',block:'nearest'})}
function advance(skip=false){stopSpeaking();const s=data.session;if(!s)return;const item=getCurrent(s);if(!skip&&s.feedback){const entry={id:item.id,question:item.text,category:item.category,answer:s.draft,score:s.feedback.score};s.entries[s.index]=entry;data.answered.unshift({...entry,role:s.role,createdAt:new Date().toISOString(),uid:`a-${Date.now()}-${s.index}`});data.answered=data.answered.slice(0,120)}else if(skip){s.entries[s.index]={id:item.id,question:item.text,category:item.category,answer:'',score:null}}s.index++;s.draft='';s.feedback=null;s.elapsed=0;state.expanded.delete('current-guide');save();render();window.scrollTo({top:0,behavior:'smooth'})}
function completeSession(){const s=data.session;if(!s||s.finalScore!==undefined)return;const completed=s.entries.filter(x=>typeof x?.score==='number');const avg=completed.length?Math.round(completed.reduce((sum,x)=>sum+x.score,0)/completed.length):0;s.finalScore=avg;s.finishedAt=new Date().toISOString();s.answeredCount=completed.length;data.sessions.unshift({id:s.id,role:s.role,score:avg,answeredCount:completed.length,total:s.ids.length,createdAt:s.finishedAt});data.sessions=data.sessions.slice(0,80);save();}
function summaryPage(s){if(s.finalScore===undefined)completeSession();const n=s.answeredCount||0;return `<div class="inner-page"><div class="card summary-card"><span class="pill">${ico('spark')} MOCK INTERVIEW COMPLETE</span><h1 class="headline" style="margin:20px 0 6px">You showed up for yourself.</h1><p class="muted small">Every practice session gives you a clearer idea of what to improve.</p><div class="summary-score">${s.finalScore}<span>/100</span></div><p class="small muted">${scoreLabel(s.finalScore)} · ${n} of ${s.ids.length} answers checked</p><div class="content-divider"></div><div class="row" style="justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" data-action="new-mock">Practise again ${ico('arrow')}</button><button class="btn btn-outline" data-view="vault">Review your answers</button><button class="btn btn-outline" data-view="progress">See your progress</button></div></div><div class="card" style="margin-top:17px"><h3>Question-by-question review</h3>${s.entries.map(entry=>`<div class="score-row"><span>${esc(entry.question)}</span><b>${entry.score===null?'Skipped':entry.score+'/100'}</b></div>`).join('')}</div><div class="footer-note">Scores are automated practice indicators, not hiring predictions.</div></div>`}
function questionsPage(){return `<div class="inner-page">${pageIntro('LEARN THE WHY','Question bank','Explore ${allQuestions().length} questions for ${esc(ROLES[data.role])}. Learn the key points interviewers are listening for.',`<button class="btn btn-outline btn-sm" data-action="toggle-add">${ico('spark')} Add your own question</button>`)}<div id="addQuestionBox" style="display:none" class="mini-form"><div class="field-label">Add your own interview question</div><div class="form-grid"><input id="customQuestion" class="field-input" placeholder="Type an interview question..." maxlength="320"/><button class="btn btn-primary" data-action="add-question">Save to ${esc(ROLES[data.role])} bank</button></div></div><div class="library-toolbar"><input class="field-input" id="questionSearch" value="${esc(state.search)}" placeholder="Search questions, topics or keywords..." aria-label="Search questions"/><select id="categoryFilter" class="field-select" aria-label="Filter by category"><option value="all">All categories</option>${[...new Set(allQuestions().map(x=>x.category))].sort().map(x=>`<option value="${esc(x)}" ${state.filter===x?'selected':''}>${esc(x)}</option>`).join('')}<option value="favorites" ${state.filter==='favorites'?'selected':''}>★ Saved questions</option></select></div><div id="questionResults">${questionResults()}</div></div>`}
function filteredQuestions(){return allQuestions().filter(x=>(state.filter==='all'||state.filter===x.category||(state.filter==='favorites'&&data.starred.includes(x.id)))&&(!state.search||(`${x.text} ${x.category} ${x.focus.join(' ')}`).toLowerCase().includes(state.search.toLowerCase())))}
function questionResults(){const list=filteredQuestions();return `<div class="row-between section-spacer"><span class="question-count">${list.length} questions found</span><span class="pill neutral">${esc(ROLES[data.role])}</span></div>${list.length?`<div class="question-list">${list.map(x=>`<div class="question-item"><div class="question-top"><span class="pill neutral">${esc(x.category)}</span><button class="icon-button" data-action="favorite" data-id="${esc(x.id)}" aria-label="${data.starred.includes(x.id)?'Remove from':'Add to'} saved questions" title="Save question" style="color:${data.starred.includes(x.id)?'#d79542':'#9daab8'}">${ico('star')}</button></div><h3>${esc(x.text)}</h3><div class="question-actions"><button class="btn btn-light btn-sm" data-action="guide" data-id="${esc(x.id)}">${state.expanded.has(x.id)?'Hide':'Show'} answer guide ${ico('chevron')}</button><span class="micro muted">${x.type==='behavior'?'Try the STAR technique':'Focus on the essential points'}</span></div>${state.expanded.has(x.id)?`<div class="guide"><strong>Your answer should cover:</strong><ul>${x.focus.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>${x.type==='behavior'?'<p>STAR: describe the Situation, your Task, your Action and the Result.</p>':''}</div>`:''}</div>`).join('')}</div>`:`<div class="empty"><div class="empty-icon">${ico('book')}</div><h3>No matching questions</h3><p>Try a different search term or category.</p><button class="btn btn-outline" data-action="clear-search">Clear filters</button></div>`}`}
function starPage(){const d=state.starDraft;return `<div class="inner-page">${pageIntro('TURN EXPERIENCE INTO EVIDENCE','STAR story builder','Build memorable examples for “Tell me about a time…” interview questions. Keep it real and concise.')}
 <div class="star-grid"><div class="card"><label class="field-label" for="star-title">Name this story</label><input id="star-title" class="field-input" value="${esc(d.title)}" placeholder="e.g. Helping a resident in an emergency" maxlength="100" style="margin-bottom:20px"/>
 ${[['s','S','Situation','What was happening? Who was involved?'],['t','T','Task','What was your responsibility or goal?'],['a','A','Action','What did YOU do, step by step?'],['r','R','Result','What changed? What did you learn?']].map(([key,letter,label,placeholder])=>`<div class="star-field"><label class="star-field-label" for="star-${key}"><span class="star-badge">${letter}</span> ${label}</label><textarea class="textarea" data-star="${key}" id="star-${key}" placeholder="${placeholder}">${esc(d[key])}</textarea></div>`).join('')}
 <div class="row" style="flex-wrap:wrap"><button class="btn btn-primary" data-action="save-star">${ico('check')} Save STAR story</button><button class="btn btn-outline" data-action="copy-star">${ico('copy')} Copy answer</button><button class="btn btn-outline" data-action="clear-star">Clear</button></div></div><div class="star-preview"><div class="eyebrow" style="color:#7de3cf">YOUR STORY PREVIEW</div><h3 id="star-preview-title">${esc(d.title||'A story worth telling')}</h3><p style="font-size:12px;line-height:1.7;color:#abc7cc">Write in your own words. In an interview, spend most of your time explaining <strong style="color:#fff">your actions</strong> and the <strong style="color:#fff">result</strong>.</p><div id="star-preview-sections">${starPreviewSections()}</div></div></div><div class="info-strip">${ico('spark')} <span>Tip: aim for roughly 15% Situation, 10% Task, 55% Action and 20% Result. Use “I” to make your individual contribution clear.</span></div></div>`}
function starPreviewSections(){const d=state.starDraft;return [['s','SITUATION'],['t','TASK'],['a','ACTION'],['r','RESULT']].map(([k,t])=>`<div class="star-preview-section"><b>${t}</b><p>${esc(d[k]||'Your '+t.toLowerCase()+' will appear here...')}</p></div>`).join('')}
function formattedStar(story){return `${story.title||'My STAR example'}\n\nSITUATION\n${story.s}\n\nTASK\n${story.t}\n\nACTION\n${story.a}\n\nRESULT\n${story.r}`}
function jobfitPage(){return `<div class="inner-page">${pageIntro('TAILOR YOUR PRACTICE','Job description lab','Paste a job advert. AcePrep will find familiar skills and turn them into practice questions — without sending your text to a server.')}
 <div class="card"><div class="form-grid"><div><label class="field-label" for="jobTitle">Job title</label><input id="jobTitle" class="field-input" placeholder="e.g. Care Assistant" value="${esc(data.jobTitle)}" maxlength="100"/></div><div><label class="field-label">Interview category</label><div class="field-input" style="display:flex;align-items:center;background:#f7faf9">${esc(ROLES[data.role])}</div></div></div><div style="margin-top:19px"><label class="field-label" for="jobText">Paste job description</label><textarea class="textarea" id="jobText" style="min-height:215px" placeholder="Paste the responsibilities, person specification and required skills here...">${esc(data.jobText)}</textarea><p class="field-help">Text remains in your browser. The app uses keyword matching, not a language model.</p></div><button class="btn btn-primary" data-action="analyse-job">${ico('spark')} Find interview topics</button></div><div id="jobOutput">${state.jobResults?jobResultsHtml(state.jobResults):''}</div></div>`}
function detectJobSkills(text){const lower=text.toLowerCase();return Object.entries(SKILLS).filter(([label,words])=>words.some(w=>lower.includes(w))).map(([label])=>label)}
function jobResultsHtml(results){if(!results.skills.length)return `<div class="card section-space"><h3>No standard skills detected</h3><p class="help-text">Try pasting a longer job description that includes responsibilities, requirements and competencies. You can still add questions manually.</p></div>`;
 return `<div class="card section-space"><div class="row-between"><div><div class="eyebrow">KEYWORD MATCH</div><h2 style="font-size:21px">${results.skills.length} relevant topics found</h2></div><span class="pill">On-device only</span></div><div class="tag-cloud">${results.skills.map(x=>`<span class="skill-tag">${esc(x)}</span>`).join('')}</div><div class="content-divider"></div><h3 style="font-size:15px">Possible interview questions</h3><div class="question-list">${results.skills.slice(0,6).map((skill,i)=>`<div class="score-row"><span>${esc(i%2?`Describe a time you demonstrated ${skill.toLowerCase()} in your work.`:`How would you apply your ${skill.toLowerCase()} skills in this role?`)}</span></div>`).join('')}</div><p class="help-text">These prompts are generated from detected terms, not personalised AI reasoning. Review them against the advert.</p><button class="btn btn-teal" data-action="add-job-questions">Add these questions to my bank ${ico('arrow')}</button></div>`}
function vaultPage(){const answers=data.answered.filter(x=>x.role===data.role),stories=data.stories;return `<div class="inner-page">${pageIntro('YOUR PERSONAL EXAMPLES','My answers','Review, reuse and refine what you’ve practised.',`<button class="btn btn-outline btn-sm" data-action="export">${ico('upload')} Export my data</button>`)}
 <div class="section-header"><div><div class="eyebrow">MOCK INTERVIEW HISTORY</div><h2>Practised answers <span style="font-size:15px;color:#93a0ad">(${answers.length})</span></h2></div></div>${answers.length?`<div class="question-list">${answers.slice(0,30).map((item)=>`<article class="vault-item"><div class="row-between"><span class="pill neutral">${esc(item.category)}</span><span class="pill ${item.score>=70?'':'neutral'}">${item.score}/100</span></div><h3>${esc(item.question)}</h3><p>${esc(item.answer)}</p><div class="row-between"><span class="micro muted">${dateLabel(item.createdAt)}</span><div class="row"><button class="btn btn-outline btn-sm" data-action="copy-answer" data-id="${esc(item.uid)}">${ico('copy')} Copy</button><button class="btn btn-outline btn-sm" data-action="delete-answer" data-id="${esc(item.uid)}">${ico('trash')} Delete</button></div></div></article>`).join('')}</div>`:`<div class="empty"><div class="empty-icon">${ico('folder')}</div><h3>Your answer collection starts here</h3><p>Complete a mock interview to save your answers automatically.</p><button class="btn btn-primary" data-view="practice">Start practising</button></div>`}
 <div class="section-space"><div class="section-header"><div><div class="eyebrow">REAL-LIFE EVIDENCE</div><h2>Saved STAR stories <span style="font-size:15px;color:#93a0ad">(${stories.length})</span></h2></div><button class="text-btn" data-view="star">Create another story ${ico('arrow')}</button></div>${stories.length?`<div class="question-list">${stories.map(story=>`<article class="vault-item"><div class="row-between"><span class="pill gold">STAR story</span><span class="micro muted">${dateLabel(story.createdAt)}</span></div><h3>${esc(story.title)}</h3><p>${esc(story.a.slice(0,250))}${story.a.length>250?'…':''}</p><div class="row"><button class="btn btn-outline btn-sm" data-action="copy-story" data-id="${esc(story.id)}">${ico('copy')} Copy full story</button><button class="btn btn-outline btn-sm" data-action="delete-story" data-id="${esc(story.id)}">${ico('trash')} Delete</button></div></article>`).join('')}</div>`:`<div class="empty"><p>No saved STAR stories yet. Build a reusable example about teamwork, safety or handling pressure.</p><button class="btn btn-outline" data-view="star">Create a STAR story</button></div>`}</div></div>`}
function progressPage(){const all=data.sessions,selected=all.filter(x=>x.role===data.role),avg=overallAvg(),best=all.length?Math.max(...all.map(x=>x.score)):0;const last=all.slice(0,7).reverse();return `<div class="inner-page">${pageIntro('PRACTICE MAKES PROGRESS','Your interview growth','A simple overview of your practice sessions and improvements.',`<button class="btn btn-outline btn-sm" data-action="export">${ico('upload')} Export your progress</button>`)}<div class="metric-grid"><div class="metric"><small>Total mock interviews</small><strong>${all.length}</strong></div><div class="metric"><small>Average score</small><strong>${avg||'—'}</strong></div><div class="metric"><small>Best checklist score</small><strong>${best||'—'}</strong></div><div class="metric"><small>${esc(ROLES[data.role])} mocks</small><strong>${selected.length}</strong></div></div>
 <div class="progress-grid"><div class="card"><div class="eyebrow">LAST 7 MOCKS</div><h3>Practice score trend</h3>${last.length?`<div class="chart-bars">${last.map(s=>`<div class="bar-col"><span style="font-size:10px;font-weight:800">${s.score}</span><div class="bar" style="height:${Math.max(5,s.score)}%"></div><small>${new Date(s.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</small></div>`).join('')}</div>`:`<div class="empty" style="border:0;padding:25px 5px"><p>No mock sessions yet. Your scores will appear here.</p></div>`}<p class="field-help">Scores are heuristic practice feedback, not objective measures of interview ability.</p></div><div class="card"><div class="eyebrow">YOUR NEXT STEP</div><h3>Keep your momentum</h3><p class="help-text">Practise the same question twice. First answer naturally; then improve it using the checklist and a short example.</p><div style="margin:20px 0"><div class="row-between"><span class="small muted">Mock interviews completed</span><strong>${all.length}</strong></div><div class="meter" style="margin-top:9px"><span style="width:${Math.min(100,all.length/10*100)}%"></span></div><p class="micro muted">${Math.min(all.length,10)} of 10 starter practice sessions</p></div><button class="btn btn-primary" data-view="practice">Do another mock ${ico('arrow')}</button></div></div>
 <div class="card section-space"><div class="row-between"><h3>Recent mock interviews</h3><button class="btn btn-outline btn-sm" data-action="export">Back up data</button></div>${all.length?all.slice(0,12).map(s=>`<div class="session-row"><div><strong style="font-size:12px">${esc(ROLES[s.role]||s.role)}</strong><div class="micro muted" style="margin-top:4px">${dateLabel(s.createdAt)} · ${s.answeredCount} of ${s.total} questions answered</div></div><div class="round-score">${s.score}/100</div></div>`).join(''):`<p class="help-text">You haven't finished a mock interview yet.</p>`}</div>
 <div class="card section-space"><h3>Privacy & your data</h3><p class="help-text">Your written answers, STAR stories, and progress are saved in this browser's local storage. Export a backup before clearing browser data or switching devices. There is no AcePrep account or cross-device sync. When you request AI coaching, web research, natural voice or server transcription, relevant content is transmitted to those providers. Browser dictation may also use your browser provider.</p><label class="btn btn-outline btn-sm" style="cursor:pointer">Import a backup<input type="file" id="restore-backup" accept="application/json,.json" hidden></label> <button class="btn btn-danger btn-sm" data-action="reset-all">${ico('trash')} Clear all saved data</button></div></div>`}
function startDictation(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){toast('Voice dictation is not available in this browser. Please type your answer.');return}if(listening){stopListening();return}try{recognition=new SR();recognition.lang='en-GB';recognition.interimResults=true;recognition.continuous=true;voiceBase=(document.getElementById('coach-answer')||document.getElementById('practice-answer'))?.value.trim()||'';recognition.onresult=(event)=>{let final='',interim='';for(let i=0;i<event.results.length;i++){const txt=event.results[i][0].transcript;if(event.results[i].isFinal)final+=txt+' ';else interim+=txt}const ta=document.getElementById('coach-answer')||document.getElementById('practice-answer');if(ta){ta.value=[voiceBase,(final+interim).trim()].filter(Boolean).join(' ');if(ta.id==='coach-answer'){const s=coachState();s.draft=ta.value;save();const counter=document.getElementById('coach-count');if(counter)counter.textContent=wordCount(ta.value)+' words';}else updateAnswer(ta.value)}};recognition.onerror=(e)=>{toast('Microphone transcription was interrupted: '+e.error);stopListening()};recognition.onend=()=>{listening=false;const btn=document.getElementById('dictate-btn');if(btn)btn.innerHTML=`${ico('mic')} Dictate answer`};recognition.start();listening=true;const btn=document.getElementById('dictate-btn');if(btn)btn.innerHTML=`${ico('mic')} Stop dictation`;toast('Dictation started. Please allow microphone access if asked.')}catch(e){toast('Could not start dictation. Please type your answer.')}}
function stopListening(){if(recognition){try{recognition.stop()}catch(e){}recognition=null}listening=false}
function updateAnswer(value){const s=data.session;if(!s)return;s.draft=value;if(s.feedback){s.feedback=null;const feedback=document.querySelector('.feedback');if(feedback)feedback.remove();const next=document.querySelector('[data-action="next-question"]');if(next){next.dataset.action='assess';next.innerHTML=`${ico('spark')} Check my answer`}}const words=wordCount(value),label=document.getElementById('word-count'),fill=document.getElementById('word-fill');if(label)label.textContent=`${words} words`;if(fill)fill.style.width=Math.min(100,words/120*100)+'%';save()}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('Copied to clipboard.')}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();toast(ok?'Copied to clipboard.':'Please select and copy the text manually.')}}
function downloadBackup(){const blob=new Blob([JSON.stringify({format:'aceprep-backup-2',progress:data,agent:window.AceAgent?.exportModel?.()||null,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='aceprep-progress-'+today()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Your backup has been exported.')}
function timerTick(){const s=data.session;if(s&&s.index<s.ids.length&&state.view==='practice'&&!s.feedback){s.elapsed++;const el=document.getElementById('clock');if(el)el.textContent=timeText(s.elapsed);const timer=document.getElementById('timer');if(timer)timer.classList.toggle('overtime',s.elapsed>=150);if(s.elapsed%10===0)save()}}
setInterval(timerTick,1000);

document.addEventListener('click',event=>{
 const btn=event.target.closest('[data-action],[data-view]');if(!btn)return;
 if(btn.dataset.view){nav(btn.dataset.view);return}
 const action=btn.dataset.action,id=btn.dataset.id;
 switch(action){
  case 'menu':document.getElementById('shell').classList.toggle('menu-open');break;
  case 'choose-role':data.role=btn.dataset.role;state.search='';state.filter='all';save();render();toast('Now practising for '+ROLES[data.role]);break;
  case 'coach-practise':coachStartPractice();break;
  case 'coach-next':coachNext();break;
  case 'coach-assess':coachAssess();break;
  case 'coach-retry':coachRetry();break;
  case 'coach-followup':coachRetry(true);break;
  case 'coach-show-example':{const item=coachLesson();speakWithChosenVoice(item.answer);toast('You can read the sample answer above after giving your response.');break}
  case 'coach-hear-question':{const s=coachState();speakWithChosenVoice(s.challenge?'Can you give me a specific example, explain exactly what you did, and describe the result?':coachLesson().text);break}
  case 'coach-hear-answer':speakWithChosenVoice(coachLesson().answer);break;
  case 'coach-jump':document.getElementById('coachTopic')?.focus();break;
  case 'coach-encourage':speakWithChosenVoice('You do not need perfect English. Give yourself time. Start with one clear sentence, then say what you did and why. You can try the same question as many times as you need.');toast('You do not need perfect English. Small, repeated practice builds confidence.');break;
  case 'start-mock':startMock(Number(btn.dataset.size));break;
  case 'quit-mock':if(confirm('End this mock interview? Answers checked so far will be saved to My answers.')){if(data.session){data.session.index=data.session.ids.length;completeSession()}render()}break;
  case 'end-mock':if(data.session){data.session.index=data.session.ids.length;completeSession()}render();break;
  case 'assess':evaluateCurrent();break;
  case 'next-question':advance();if(data.session.index>=data.session.ids.length)completeSession(),render();break;
  case 'skip-question':advance(true);if(data.session.index>=data.session.ids.length)completeSession(),render();break;
  case 'retry-answer':data.session.feedback=null;state.expanded.delete('current-guide');save();render();document.getElementById('practice-answer')?.focus();break;
  case 'guide-practice':state.expanded.has('current-guide')?state.expanded.delete('current-guide'):state.expanded.add('current-guide');render();document.querySelector('.feedback')?.scrollIntoView({behavior:'smooth',block:'nearest'});break;
  case 'new-mock':data.session=null;save();render();break;
  case 'read-question':{const item=data.session&&getCurrent(data.session);if(item)speakWithChosenVoice(item.text);break}
  
  
  case 'preview-voice':speakWithChosenVoice(voiceSample);break;
  case 'stop-voice':stopSpeaking();break;
  case 'dictate':startDictation();break;
  case 'guide':state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);document.getElementById('questionResults').innerHTML=questionResults();break;
  case 'favorite':data.starred=data.starred.includes(id)?data.starred.filter(x=>x!==id):[...data.starred,id];save();document.getElementById('questionResults').innerHTML=questionResults();break;
  case 'clear-search':state.search='';state.filter='all';render();break;
  case 'toggle-add':{const form=document.getElementById('addQuestionBox');form.style.display=form.style.display==='none'?'block':'none';if(form.style.display==='block')document.getElementById('customQuestion').focus();break}
  case 'add-question':{const value=document.getElementById('customQuestion')?.value.trim();if(!value||value.length<8){toast('Please enter a full interview question.');break}data.custom.push({id:'custom-'+Date.now(),role:data.role,category:'Custom',text:value,focus:['Connect your answer to the job requirements','Use a specific example where possible','Explain the outcome or learning'],terms:[],type:'behavior'});save();state.search='';state.filter='all';render();toast('Question added to your bank.');break}
  case 'save-star':{const d=state.starDraft;if(!d.s.trim()||!d.a.trim()||!d.r.trim()){toast('Please complete Situation, Action and Result before saving.');break}data.stories.unshift({...d,title:d.title.trim()||'Untitled STAR story',id:'star-'+Date.now(),createdAt:new Date().toISOString()});save();toast('STAR story saved in My answers.');break}
  case 'copy-star':copyText(formattedStar(state.starDraft));break;
  case 'clear-star':state.starDraft={title:'',s:'',t:'',a:'',r:''};render();break;
  case 'analyse-job':{data.jobTitle=document.getElementById('jobTitle').value.trim();data.jobText=document.getElementById('jobText').value;if(data.jobText.trim().length<40){toast('Paste at least a few lines of the job description.');break}state.jobResults={skills:detectJobSkills(data.jobText)};save();document.getElementById('jobOutput').innerHTML=jobResultsHtml(state.jobResults);break}
  case 'add-job-questions':{const skills=state.jobResults?.skills.slice(0,6)||[];let added=0;skills.forEach((skill,i)=>{const text=i%2?`Describe a time you demonstrated ${skill.toLowerCase()} in your work.`:`How would you apply your ${skill.toLowerCase()} skills in this role?`;if(!data.custom.some(x=>x.role===data.role&&x.text===text)){data.custom.push({id:`job-${Date.now()}-${i}`,role:data.role,category:'From job advert',text,focus:[`Give a strong example related to ${skill.toLowerCase()}`,'Explain your individual contribution','Link the outcome to the vacancy'],terms:[[skill.toLowerCase()]],type:i%2?'behavior':'scenario'});added++}});save();toast(`${added} question${added===1?'':'s'} added to your bank.`);break}
  case 'copy-answer':{const item=data.answered.find(x=>x.uid===id);if(item)copyText(item.answer);break}
  case 'delete-answer':if(confirm('Delete this saved answer?')){data.answered=data.answered.filter(x=>x.uid!==id);save();render()}break;
  case 'copy-story':{const item=data.stories.find(x=>x.id===id);if(item)copyText(formattedStar(item));break}
  case 'delete-story':if(confirm('Delete this STAR story?')){data.stories=data.stories.filter(x=>x.id!==id);save();render()}break;
  case 'export':downloadBackup();break;
  case 'reset-all':if(confirm('Permanently delete all your AcePrep progress, saved answers and stories from this browser? Export a backup first if needed.')){data=defaults();state.starDraft={title:'',s:'',t:'',a:'',r:''};state.jobResults=null;window.AceAgent?.clearLocal?.();save();nav('home');toast('Local answers and agent profile cleared. Your browser access passcode remains until this tab closes.')}break;
 }
});
document.addEventListener('input',event=>{
 const target=event.target;
 if(target.id==='practice-answer'){updateAnswer(target.value);return}
 if(target.id==='coach-answer'){const s=coachState();s.draft=target.value;save();const el=document.getElementById('coach-count');if(el)el.textContent=wordCount(target.value)+' words';return}
 if(target.id==='questionSearch'){state.search=target.value;document.getElementById('questionResults').innerHTML=questionResults();return}
 if(target.dataset.star){state.starDraft[target.dataset.star]=target.value;document.getElementById('star-preview-sections').innerHTML=starPreviewSections();return}
 if(target.id==='star-title'){state.starDraft.title=target.value;document.getElementById('star-preview-title').textContent=target.value||'A story worth telling';return}
});
document.addEventListener('change',async event=>{
 if(event.target.id==='restore-backup'){
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>3*1024*1024){toast('Backup too large (maximum 3 MB).');return}
  try{const parsed=JSON.parse(await file.text());if(parsed.format!=='aceprep-backup-2'||!parsed.progress||!Array.isArray(parsed.progress.sessions))throw new Error('Not an AcePrep v2 backup.');
   if(!confirm('Import this backup? It will replace current local progress and AI agent notes.'))return;
   data=normaliseData(parsed.progress);save();window.AceAgent?.importModel?.(parsed.agent);nav('progress');toast('Backup restored in this browser.');
  }catch(e){toast('Cannot import backup: '+e.message.slice(0,90))}return;
 }

 if(event.target.id==='voiceSelect'){preferredVoiceURI=event.target.value;try{localStorage.setItem('aceprep-voice-v3',preferredVoiceURI)}catch(e){}stopSpeaking();toast('Voice changed. Tap Hear sample to try it.');refreshVoiceChoices();return}
 if(event.target.id==='coachTopic'){const s=coachState();s.index=Number(event.target.value)||0;s.phase='learn';s.draft='';s.feedback=null;s.challenge=false;save();render();return}
 if(event.target.id==='roleSelect'){data.role=event.target.value;state.search='';state.filter='all';save();render();toast('Role changed to '+ROLES[data.role])}
 if(event.target.id==='categoryFilter'){state.filter=event.target.value;document.getElementById('questionResults').innerHTML=questionResults()}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.getElementById('shell').classList.remove('menu-open')});
if('speechSynthesis' in window){if(speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',refreshVoiceChoices);else speechSynthesis.onvoiceschanged=refreshVoiceChoices;}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();refreshVoiceChoices();
// Probe the same-origin backend on startup so Orpheus voices also work before visiting the Agent page.
window.AceAgent?.checkBackend();
