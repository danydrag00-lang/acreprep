# AcePrep 2.0 — repaired Cloudflare Pages interview coach

This is a **tested replacement package** for the existing GitHub repository: https://github.com/danydrag00-lang/acreprep

Current live deployment (not automatically updated by this ZIP): https://acreprep.pages.dev

**Important:** The ZIP contains code only. It does **not** automatically overwrite the existing GitHub repository or live Cloudflare project. The application is still a **private beta**. Do not open the costly AI endpoints to unlimited public use.

## What is included

- Guided lessons and a large role-based question bank (no short five-question restriction)
- Individual research profile (job title, employer, vacancy and real CV highlights)
- Private-server web research using Tavily keyless where accessible, with Wikipedia background fallback and source links
- Expandable AI-generated question packs; immediate practice button opens an active interview question
- Conversational coaching targeted to the current question and candidate's answer
- AI feedback for Guided Coach and Mock Interview; transparent heuristic fallback without AI
- Natural speech choices via Groq Orpheus, plus locally installed device voices
- Speech playback queues **all** text chunks, with stop button and clear failure messages
- Recorded answer transcription via Groq Whisper, with the chance to edit before sending
- Confidence self-assessment, progress tracking, export/import of both practice and agent information
- Additional security and privacy controls, accessible focus indicators and reduced-motion support

## How to update the existing website

1. **Back up your current repository** before replacing anything. If you have new interview answers saved in your existing website's browser, export them from **My Progress** first.
2. Download the AcePrep 2.0 ZIP from ChatGPT and unzip it on your Mac.
3. Open https://github.com/danydrag00-lang/acreprep → **Add file → Upload files**. Upload the CONTENTS of the extracted folder, preserving the `functions/api/` and `functions/_lib/` directory structure. Replace files of the same name when asked; keep your repository's `main` branch. If your browser cannot upload folders correctly, use **GitHub Desktop** or the equivalent Git client rather than flattening directories.
4. Commit the changes. Cloudflare Pages connected to that repository should start a new production deployment automatically. Verify in **Cloudflare → Workers & Pages → acreprep → Deployments** that the newest deployment succeeded.
5. In the Cloudflare **acreprep** project open **Settings → Variables and Secrets** (production environment). Add **encrypted** secrets:
   - `GROQ_API_KEY`: a **NEW** Groq API key, NOT the previously exposed key.
   - `ACEPREP_ACCESS_CODE`: a new strong private-beta passcode, **at least 16 characters**, ideally 24+ random characters. This is **not** the Groq key; keep it confidential and only share it with authorised beta testers.
6. Save the secrets and trigger a new deployment (a new GitHub commit is a reliable way to redeploy).
7. Open https://acreprep.pages.dev → **AI Research Agent** → enter your private-beta passcode → click **Unlock AI**. The status now calls Groq to verify the configured API key. Do not mistake a configured secret for a successful connection.
8. Test **Create / expand tailored Q&A**, **Practise this question**, **Coach my answer**, the microphone recording and **Hear sample** with an Orpheus voice. Providers may have varying free-tier limits.

**You do not put any key into `index.html`, `app.js`, or `agent.js`.** Those files are publicly downloadable and must never contain secrets. The private beta passcode is temporarily entered by authorised users in the app; the Groq API key is never shown to them.

### Required repository layout

```
index.html
app.js
agent.js
coach-content.js
styles.css
sw.js
_headers
icon.svg
manifest.webmanifest
functions/
  _lib/security.js
  api/chat.js
  api/health.js
  api/research.js
  api/speech.js
  api/status.js
  api/transcribe.js
```

**Build setup** for the existing Cloudflare Pages Git integration: framework `None`, build command `exit 0`, output directory `.`. This package does not require an npm build step.

### Optional protective rate-limiting binding

The backend supports an optional Cloudflare native rate-limit binding named `ACEPREP_RATE_LIMIT`. If you configure it in your Cloudflare deployment, the code will use it for chat, speech, health, research and transcription requests. Check the latest Cloudflare binding instructions at https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/ and verify the binding in your deployed Pages Functions environment. This is approximate per location, not a global spending cap. Use Groq usage limits and monitoring as well.

## What is still NOT complete

- **This is not a public production SaaS.** The access passcode is a temporary beta gate, not proper multi-user authentication, accounts, per-customer quotas or billing. Those require additional infrastructure and testing.
- **PDF and DOCX CV parsing is not implemented** in this version. Import `.txt` or `.md`, or paste the text from your CV and job advert. No claims of PDF/DOCX support are made.
- **Voice is push-to-talk, not live full-duplex human speech.** Recording is transcribed, reviewed and submitted; natural AI replies are played in sequence. Web browser permissions and provider limits vary.
- **Web search availability is external.** The rate-limited Tavily keyless endpoint may stop working or throttle requests; Wikipedia is background context, not a substitute for official technical guidance. Read the original links and verify critical claims.
- **No provider calls were exercised using your real secret in the test environment**; automated tests used realistic mocked responses. Production health and voice playback need a post-deploy check.
- AI feedback scores are coaching estimates, not validated competence measurements. The app cannot predict every interview question or guarantee an interview result.
- There is no cross-device syncing or full commercial privacy compliance package. Before enrolling clients, create proper privacy notices, a retention policy, age/consent flows where necessary, incident response, user account isolation and budget controls.
- The prior key shared in conversation should be revoked at https://console.groq.com/keys before any further use.

## Tests

The ZIP includes a native Node.js test suite. Run `npm test` in the extracted folder if you have Node.js. Tests cover backend access control, real provider-status routing with mocked replies, speech, research, transcription, request validation, rate-limit binding behaviour, and credential isolation. A Python Playwright test (`tests/browser_qa.py`) checks desktop/mobile flows using mocked APIs. `npm test` requires no third-party Node packages; browser QA uses Playwright and Chromium.

**Latest local result:** 8/8 Node backend tests passed; scripted desktop/mobile interaction checks passed. Full live Groq/WAV behaviour is **not** verified in this isolated test environment.

## Data handling

Interview notes, questions and progress are saved in the current browser (local storage). The beta passcode is stored in the current tab's session storage. Research sends role/employer/topic queries to external search providers via the server; requesting AI coaching sends relevant profile, vacancy and answer content to Groq; recording sends temporary audio to Groq transcription. No real API keys are present in the downloaded files. The export feature may include sensitive CV information—keep backups secure.

See `RELEASE_NOTES.md` for a detailed checklist of improvements, verification and remaining limitations.
