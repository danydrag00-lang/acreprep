# AcePrep 2.0 — repair log and outstanding priorities

## Fixed and locally tested

| Priority | Before | After | Test evidence |
|---|---|---|---|
| Critical | Public Groq chat/speech endpoints | All costly endpoints require a 16+ character Cloudflare-secret beta passcode, checked server-side; key remains on server | Node access-denied and allowed-path tests |
| High | AI status showed configured instead of verified | Explicit POST `/api/health` contacts Groq model list with server credentials | Mocked 200 and 401 tests |
| High | Orpheus voice cut speech after six chunks | Complete 180-character chunk queue, stop/cancel, status/error details | Browser WAV playback >6 chunks |
| High | Practise button merely appended custom bank question | Opens active practice question directly and gives contextual feedback | Browser interaction |
| High | Guided coaching and mocks only used generic checklist | Uses optional Groq JSON feedback with precise strengths, improvement and follow-up; retains checklist if AI fails | Browser AI feedback check |
| High | Browser-side keyless Tavily CORS issues | Same-origin `/api/research`, Tavily keyless and limited Wikipedia fallback, show links | Server research test + browser mock |
| High | No robust microphone recording path | MediaRecorder + `/api/transcribe` with Groq Whisper, editable text before sending; 60s/6MB max | Server mocked transcription test |
| Medium | Chat answer not tied to selected question | Active question persists, assistant receives it as context | Browser interaction |
| Medium | Fixed seven-question generation request | Add/expand question packs in repeated 10-question AI requests with deduplication | Browser mock |
| Medium | Service worker cached every successful same-origin GET, including API | Only static app shell cached; API always excluded | Code inspection |
| Medium | Export missed agent notes, no import | v2 backup includes practice + AI agent data and restore | Browser/manual inspection |
| Medium | Incomplete mobile usability | Focus indicators, reduced-motion and checked small-screen layout | Playwright mobile screenshot + overflow assertion |
| Medium | Corrupt local storage could white-screen app | Schema checks for main arrays and research/chat arrays | Code inspection |

## Still needed before public commercial use

1. Proper user sign-in, per-user account isolation, consent, and privacy/retention policy.
2. Persistent per-account quotas, provider-level spending caps and real alerting.
3. Independent security review including malicious user and prompt-injection tests.
4. End-to-end tests on live Cloudflare with a **new** Groq key and actual Orpheus audio playback.
5. Robust PDF and DOCX import without dependence on flaky external CDNs.
6. True low-latency full-duplex voice conversation, including mobile Safari support.
7. Additional accessibility testing (keyboard, assistive technologies) and high-load monitoring.
8. Reliable official-site search provider, caching/source freshness and domain-specific accuracy evaluation.

The ZIP cannot perform a GitHub upload or Cloudflare deployment on its own. Updating the public repo is a separate user action.
