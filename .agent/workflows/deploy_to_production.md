---
description: Standard workflow for deploying changes to Production (Vercel)
---

# Standard Deployment Workflow

For Vercel-hosted projects, the standard practice is **Git-Flow based**.

## 1. Development (Feature Branches)
Never work directly on `main`.
```bash
git checkout -b feature/my-cool-feature
# ... make changes ...
git add .
git commit -m "Add cool feature"
git push origin feature/my-cool-feature
```

## 2. Preview (Pull Requests)
1. Go to GitHub and create a **Pull Request (PR)** from your feature branch to `main`.
2. **Vercel** will automatically detect this and create a **Preview URL**.
3. **Verify** your changes on the Preview URL (check responsiveness, API calls, etc.).

## 3. Production (Merge to Main)
Once the preview looks good:
1. **Merge** the Pull Request into `main`.
2. **Vercel** will automatically detect the push to `main` and trigger a **Production Deployment**.
3. All users will see the changes within minutes.

## Troubleshooting "Changes not showing"
- **Wrong Branch**: Did you push to `main`? or just a branch? (Vercel Prod only tracks `main`).
- **Build Failed**: Check Vercel logs. If the build fails, the old version remains live.
- **Caching**: Vercel has aggressive caching. Redeploying usually clears it, but users might need to hard refresh.

## Manual "Emergency" Push
If you need to strictly sync local state to production immediately (skip PR):
```bash
git checkout main
git pull origin main
git merge <your-feature-branch>
git push origin main
```
