# Push to GitHub and launch with GitHub Pages

Do this next from this folder.

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
git push -u origin changes
```

Example if your username is `jane` and repo is `entry-share-pal`:

```powershell
git remote add origin https://github.com/jane/entry-share-pal.git
git push -u origin changes
```

If GitHub asks for login, use your credentials or a Personal Access Token (Settings → Developer settings → Personal access tokens).

## 3. Enable GitHub Pages hosting

The workflow file `.github/workflows/deploy-pages.yml` is already included in this repo.

1. Open your repo on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Source: GitHub Actions**.
4. Push to branch `changes` (or merge to `main`) to trigger deployment.

Your app will be live at:

`https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/`

## 4. (Optional) Connect in Lovable

- In Lovable: **Import** or **Connect repository** → **GitHub**
- Select **YOUR_GITHUB_USERNAME/YOUR_REPO_NAME**
- Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
