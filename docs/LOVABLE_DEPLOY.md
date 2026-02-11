# Deploying to Lovable – Recommendation

## Use GitHub (recommended), not a single code block

- **Single code block:** The project is 250+ files (src, supabase, docs, config). Lovable doesn’t deploy by pasting one block; you’d lose structure, history, and reliable deploys.
- **GitHub:** Push the repo to GitHub and connect that repo to Lovable. Lovable builds and deploys from the repo, so the **latest state** is whatever is on the branch you connect (e.g. `main`). This is the standard and recommended way.

---

## Steps to have “entire latest state” on Lovable

### 1. Push this project to GitHub

```bash
cd "c:\Users\Administrator\Downloads\entry-share-pal-main\entry-share-pal-main"

# If you haven’t already
git init
git add .
git commit -m "Latest state: personnel, schema, product plan, reports"

# Create a new repo on GitHub (e.g. your-username/entry-share-pal), then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

- Ensure **`.env`** is not committed (it’s in `.gitignore`). Set Supabase URL and anon key in Lovable’s environment / project settings instead.

### 2. Connect the repo in Lovable

- In Lovable: **Import** or **Connect repository** → choose **GitHub**.
- Select the repo you just pushed (e.g. `entry-share-pal`).
- Lovable will use the **latest commit** on the default branch (e.g. `main`) for builds and deploys.

### 3. Keep “latest state” in sync

- After making changes locally:  
  `git add .` → `git commit -m "..."` → `git push origin main`
- Lovable will deploy from the new commit (or on the next deploy, depending on your Lovable settings).

---

## Environment variables (Supabase)

- Do **not** commit `.env`. In Lovable, set:
  - `VITE_SUPABASE_URL` = your Supabase project URL  
  - `VITE_SUPABASE_PUBLISHABLE_KEY` = your Supabase anon/public key  
- Same keys you use locally so the deployed app talks to the same Supabase project.

---

## Summary

| Approach              | Use? | Why |
|-----------------------|-----|-----|
| **Single code block** | No  | Project is large; Lovable expects a repo, not a paste. |
| **Pull from GitHub**  | Yes | One source of truth, full history, and Lovable deploys the latest state from the repo. |

**Recommendation:** Push this folder to a GitHub repo and connect that repo in Lovable. That gives you the entire latest state available for deployment whenever you push.
