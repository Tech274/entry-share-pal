# Push to GitHub (then connect in Lovable)

Everything is committed on branch `main`. Do this next:

## 1. Create a new repo on GitHub

- Go to **https://github.com/new**
- Repository name: e.g. **entry-share-pal** (or any name you like)
- Leave "Add a README" **unchecked** (you already have code)
- Create repository

## 2. Add remote and push (run in this folder)

Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repo name:

```powershell
cd "c:\Users\Administrator\Downloads\entry-share-pal-main\entry-share-pal-main"

git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Example if your username is `jane` and repo is `entry-share-pal`:

```powershell
git remote add origin https://github.com/jane/entry-share-pal.git
git push -u origin main
```

If GitHub asks for login, use your credentials or a Personal Access Token (Settings → Developer settings → Personal access tokens).

## 3. Connect in Lovable

- In Lovable: **Import** or **Connect repository** → **GitHub**
- Select **YOUR_GITHUB_USERNAME/YOUR_REPO_NAME**
- Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

Done. Future pushes to `main` will be the "latest state" for Lovable.
