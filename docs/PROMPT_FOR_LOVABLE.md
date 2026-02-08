# Prompt you can paste (e.g. into Lovable or another assistant)

Copy the **prompt** below and paste it where you need it (Lovable chat, support, or another AI). Then see **what Lovable can and cannot do**.

---

## Single prompt (copy from here)

```
I have a React + Vite + Supabase app already built. I want to deploy it on Lovable with the entire latest state.

- The code is in a Git repo on my PC, branch `main`, with all changes committed. I do not have a GitHub remote yet.
- I will create a new GitHub repo and push my code there (git remote add origin <url>; git push -u origin main).
- After the code is on GitHub, I need Lovable to:
  1. Connect to that GitHub repository (import / connect repository from GitHub).
  2. Use the `main` branch as the source for builds and deploys.
  3. Build the app (it's a Vite + React project; build command is `npm run build`).
  4. Deploy the built app and give me a live URL.
  5. Let me set environment variables for the deployed app: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (same as in my local .env), so the deployed app uses my Supabase project.
- Going forward, when I push new commits to `main` on GitHub, I want that to be the "latest state" that Lovable deploys (auto-deploy on push to main, or a one-click redeploy from the latest main).

Please guide me through the Lovable steps: where to connect the GitHub repo, where to set the env vars, and how to trigger a deploy or enable auto-deploy from main.
```

---

## Can Lovable do all of the same?

**Short answer:** Lovable can do the parts that happen **inside Lovable**. It **cannot** run Git on your PC or create the GitHub repo for you.

| Step | Who does it | Can Lovable do it? |
|------|-------------|--------------------|
| Create a new repo on GitHub | You (in browser at github.com/new) | No – Lovable doesn’t have access to your GitHub account to create repos. |
| Add remote and push from your PC | You (PowerShell: `git remote add origin ...` then `git push -u origin main`) | No – Lovable runs in the cloud; it can’t run commands on your Windows machine. |
| Connect to your GitHub repo | You in Lovable UI | Yes – you use Lovable’s “Import” / “Connect repository” and pick the repo you already pushed. |
| Build the app (e.g. npm run build) | Lovable (after it has the code) | Yes – once the repo is connected, Lovable runs the build. |
| Deploy and give you a URL | Lovable | Yes. |
| Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY | You in Lovable project settings | Yes – you enter them in Lovable’s env/config UI; Lovable then injects them into the build. |
| Deploy on every push to main (or redeploy from main) | Lovable | Yes – if Lovable supports “deploy on push” or “Redeploy” from the connected branch. |

So: **you** do: create GitHub repo → add remote → push from your PC. **Lovable** does: connect repo → build → deploy → use your env vars and (if available) auto-deploy on push.

---

## If you paste the prompt into Lovable

- Use it in Lovable’s chat or support so they can tell you exactly where to click (e.g. “Import”, “Settings”, “Environment variables”).
- They may also confirm their build command (e.g. `npm run build`) and how to enable auto-deploy from `main`.

---

## If you paste the prompt into another AI (e.g. Cursor, ChatGPT)

- The AI can’t run Git or open Lovable for you, but it can:
  - Remind you of the exact Git commands (create repo → remote → push).
  - Interpret Lovable’s docs or UI and explain the steps in Lovable (connect repo, env vars, deploy).

So: **yes, you can prompt with the above**, and **Lovable can do everything that happens on their side** (connect repo, build, deploy, env vars, and optionally auto-deploy); the rest (GitHub + push) stays on your side.
