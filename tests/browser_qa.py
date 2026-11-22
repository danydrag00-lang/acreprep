from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
import io,wave,json,re
ROOT=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}'
with io.BytesIO() as io_bytes:
 with wave.open(io_bytes,'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(22050);w.writeframes(b'\0\0'*3500)
 WAV=io_bytes.getvalue()
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'])
 context=browser.new_context(viewport={'width':1366,'height':900},permissions=['microphone'])
 context.add_init_script("sessionStorage.setItem('aceprep-beta-access','beta-test-secret-1234567')")
 errors=[];requests=[]
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**/api/status',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps({'configured':True,'privateBeta':True,'providerVerified':False})))
 page.route('**/api/health',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True,'provider':'Groq'})))
 def mocked_chat(r):
  requests.append(('chat',r.request.headers,r.request.post_data_json))
  body=r.request.post_data_json
  string=str(body)
  if 'Evaluate one candidate' in string:
   value=json.dumps({'score':73,'strength':'You clearly described your safety checks.','improvements':['Include who you would inform.','Explain the outcome.'],'followup':'How would you document the incident?','encouragement':'Your answer is improving with each attempt.'})
  elif 'Return ONLY a JSON array' in string:
   value=json.dumps([{'category':'Safety','question':'How would you respond when a resident falls?','answer':'Check safety, seek the appropriate clinical support, report and record accurately.','sourceIndex':0},{'category':'Teamwork','question':'How do you handle disagreement with a colleague?','answer':'Stay calm, listen and seek a respectful resolution.','sourceIndex':None}])
  else:value='You explained the safety check clearly. Include what you personally did and how you reported the issue. How would you document it?'
  r.fulfill(status=200,content_type='application/json',body=json.dumps({'text':value}))
 page.route('**/api/chat',mocked_chat)
 def mocked_questions(r):
  requests.append(('questions',r.request.headers,r.request.post_data_json))
  r.fulfill(status=200,content_type='application/json',body=json.dumps({'questions':[
   {'category':'Safety','question':'How would you respond when a resident falls?','answer':'I would first check the resident for immediate danger, contact a senior colleague for help, follow the care plan and record relevant facts accurately.','sourceIndex':0},
   {'category':'Teamwork','question':'How do you handle disagreement with a colleague?','answer':'I would stay calm, listen carefully to the colleague, share my perspective respectfully, focus on resident safety and escalate unresolved issues to senior staff.','sourceIndex':None}
  ]}))
 page.route('**/api/questions',mocked_questions)
 def mocked_research(r):
  requests.append(('research',r.request.headers,r.request.post_data_json))
  r.fulfill(status=200,content_type='application/json',body=json.dumps({'results':[{'title':'NHS information','url':'https://www.nhs.uk','content':'Safety and reporting requirements in practice','source':'Tavily search','checkedAt':'2026-11-22T00:00:00Z'}],'checkedAt':'2026-11-22T00:00:00Z','warnings':[]}))
 page.route('**/api/research',mocked_research)
 def mocked_speech(r):
  requests.append(('speech',r.request.headers,r.request.post_data_json))
  r.fulfill(status=200,content_type='audio/wav',body=WAV)
 page.route('**/api/speech',mocked_speech)
 page.route('**/api/transcribe',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps({'text':'I would reassure the resident and report concerns promptly.'})))
 html=(ROOT/'index.html').read_text().replace('<head>','<head><base href="https://aceprep.test/">')
 html=re.sub(r'<link rel="stylesheet" href="styles\.css(?:\?[^\"]+)?" />',lambda _: '<style>'+ (ROOT/'styles.css').read_text() + '</style>', html)
 for nm in ['coach-content.js','agent.js','app.js']:
  html=re.sub(r'<script src="'+re.escape(nm)+r'(?:\?[^\"]+)?" defer></script>',lambda _: '<script>'+ (ROOT/nm).read_text() + '</script>', html)
 page.set_content(html,wait_until='load')
 page.locator('.nav-link[data-view="agent"]').click()
 page.locator('#agent-access-code').fill('beta-test-secret-1234567')
 page.locator('[data-agent="unlock"]').click()
 page.wait_for_function("() => document.querySelector('#agent-ai-status')?.textContent.includes('verified')",timeout=12000)
 assert page.locator('#agent-ai-status').inner_text().startswith('Groq AI connected'),page.locator('#agent-ai-status').inner_text()
 page.locator('#agent-title').fill('Care Assistant')
 page.locator('#agent-experience').fill('I have two years of care experience helping residents with personal care and safe mobility.')
 page.locator('#agent-advert').fill('Care home job needs safeguarding, infection prevention and records.')
 page.locator('[data-agent="research"]').click()
 page.wait_for_function("() => document.querySelectorAll('.agent-source').length>0",timeout=10000)
 page.wait_for_function("() => document.querySelectorAll('.agent-question').length>0",timeout=10000)
 page.locator('.agent-question').filter(has_text='How would you respond when a resident falls?').locator('[data-agent="practise"]').click()
 assert 'LIVE PRACTICE' in page.locator('.agent-practice-banner').inner_text()
 assert 'respond when a resident falls' in page.locator('.agent-practice-banner').inner_text()
 page.locator('#agent-message').fill('I would check the resident for injuries and call a nurse, then report the fall.')
 page.locator('[data-agent="send"]').click()
 page.wait_for_function("() => document.querySelectorAll('.agent-msg').length>=3",timeout=12000)
 assert 'document' in page.locator('#agent-dialog').inner_text()
 assert requests and all('authorization' not in headers for _,headers,*_ in requests)
 assert all(headers.get('x-aceprep-access')=='beta-test-secret-1234567' for _,headers,*_ in requests)
 page.screenshot(path='/mnt/data/AcePrep_Fixed_Desktop.png',full_page=True)
 print('PASS research, personalised pack, immediate practice, AI turn context, private access headers')
 page.locator('.nav-link[data-view="coach"]').click()
 page.locator('[data-action="coach-practise"]').click()
 page.locator('#coach-answer').fill('I would listen carefully, check what happened, report concerns to senior staff and follow the care plan. I would also explain the outcome to the team and document the actions.')
 page.locator('[data-action="coach-assess"]').click()
 page.wait_for_function("() => document.querySelector('.coach-feedback')?.textContent.includes('AI coaching estimate')",timeout=10000)
 assert 'Include who you would inform' in page.locator('.coach-feedback').inner_text()
 assert 'AI coaching estimate' in page.locator('.coach-feedback').inner_text()
 print('PASS interactive coach AI feedback with checklist fallback')
 page.locator('#voiceSelect').select_option('orpheus:hannah')
 # Ensure a long paragraph is played in ALL chunks rather than first six only.
 long_text=('Please introduce yourself and explain how your experience is relevant to this job. ')*13
 speech_before=sum(1 for typ,*_ in requests if typ=='speech')
 page.evaluate('(v) => speakWithChosenVoice(v)',long_text)
 page.wait_for_function('() => document.querySelector("#voice-status")?.textContent.includes("Finished playing")',timeout=30000)
 speech_after=sum(1 for typ,*_ in requests if typ=='speech')
 assert speech_after-speech_before>=7,(speech_before,speech_after)
 assert not errors,errors
 print('PASS natural speech plays every segment, app has no page errors')
 # no key configured
 second=browser.new_context(viewport={'width':390,'height':844})
 mobile=second.new_page();mobile.on('pageerror',lambda e:errors.append(str(e)))
 mobile.route('**/api/status',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps({'configured':False,'privateBeta':False})))
 mobile.set_content(html,wait_until='load')
 mobile.locator('.mobile-menu').click()
 mobile.locator('.nav-link[data-view="agent"]').click()
 mobile.wait_for_function("() => document.querySelector('#agent-ai-status')?.textContent.includes('missing')",timeout=9000)
 mobile.locator('#agent-title').fill('QC Microbiology')
 mobile.locator('[data-agent="make-qa"]').click()
 assert mobile.locator('.agent-question').count()>=6
 mobile.screenshot(path='/mnt/data/AcePrep_Fixed_Mobile.png',full_page=True)
 overflow=mobile.evaluate('document.documentElement.scrollWidth-innerWidth')
 assert overflow<=15,f'mobile horizontal overflow {overflow}'
 assert not errors,errors
 print('PASS offline guide fallback, mobile navigation, no JS errors, no major overflow')
 browser.close()
server.shutdown()
