# AcePrep — secure, server-connected AI version

**Clients do not enter a Groq API key anywhere in the app.** The same private server key powers the personalised interview coaching and natural Orpheus voices. The question bank and guided practice still work offline.

## Important security action

The previous Groq key was pasted in a chat. **Revoke it** at https://console.groq.com/keys and create a new key. This project intentionally contains NO real key. Never put a key in `index.html`, `agent.js`, `app.js`, `README.md`, a public repo, or an ordinary Wrangler `vars` setting. Instead configure it as a Cloudflare encrypted Secret named `GROQ_API_KEY`.

## Deploy for free with Cloudflare Pages and GitHub (no command line needed)

1. Create a **private GitHub repository** for AcePrep. Upload all the files and folders in this ZIP, including the root-level `functions/` directory. Do not upload `.dev.vars` or `.env` with a real key. (The included `.dev.vars.example` only has a placeholder.)
2. Sign in at https://dash.cloudflare.com/ → **Workers & Pages** → create a **Pages** project connected to the GitHub repository. Choose your repository and `main` branch.
3. For this plain HTML/CSS/JS project use **no build command** and set **Build output directory** to `.` (repository root), if the setup requires a value. Cloudflare Pages serves `index.html`; the root-level `functions/api/*.js` supplies `/api/status`, `/api/chat`, and `/api/speech`.
4. In your Pages project go to **Settings → Variables and Secrets → Add**, select **Secret / Encrypt**, create a production secret named **GROQ_API_KEY**, and paste your NEW Groq key. **Redeploy** after adding it. (If preview deployments matter, set that environment separately.)
5. Visit the `*.pages.dev` URL and open **AI Research Agent → Check AI connection**. It should say **AI connected through secure server**. Go to Interactive Coach and test an Orpheus voice (natural voice availability depends on Groq limits).

**Don't use Cloudflare Pages dashboard drag-and-drop ZIP upload for this version:** that method does not compile a `functions/` folder. Use the Git repository integration, or Wrangler CLI. **Do not use GitHub Pages for this secure version:** GitHub Pages is static and cannot run the private API functions.

For local developer testing, install Node.js and run `npx wrangler pages dev .` in the project folder, with a `.dev.vars` file (copy `.dev.vars.example`, replace the placeholder with your *new* key, and keep that file out of Git). Then visit the local address shown by Wrangler. No real key is included in this downloadable ZIP.

## How it works

- `agent.js` submits AI chat requests to same-origin `/api/chat`, without a browser key. The server calls Groq and returns a generated answer.
- `app.js` submits Orpheus TTS requests to `/api/speech`, without a browser key. The server returns WAV audio for playing locally.
- `/api/status` reports whether the server has the secret configured (never its value).
- Role-topic web research still uses the previously implemented rate-limited keyless Tavily route and Wikipedia fallback. Search snippets must be verified against original sources.
- CV highlights and job ads are stored in the user's browser, and are only sent to Groq upon requesting AI help. Reduce personal details before submission.

## Limits and making it client-ready

This is a prototype. The public `/api/chat` and `/api/speech` routes can be called by visitors. **Hiding a key is not sufficient to prevent abuse or excessive account usage.** Before allowing public clients, add authentication, enforce per-user request limits and quotas, set budgets/alerts, provide privacy notices and a data-retention policy, and review Groq's voice and commercial terms. Free-tier availability, rate limits and pricing change. There is no unlimited free public AI voice service. The Orpheus model may not sound British; several voice options are provided.

A single local HTML file cannot use these private API routes by itself. For working AI and natural voices, deploy the included site with the Cloudflare Functions. For local-only offline guided practice, use the earlier offline AcePrep file.

References: https://developers.cloudflare.com/pages/functions/get-started/ · https://developers.cloudflare.com/pages/functions/bindings/ · https://developers.cloudflare.com/pages/get-started/git-integration/ · https://console.groq.com/docs/text-to-speech/orpheus
