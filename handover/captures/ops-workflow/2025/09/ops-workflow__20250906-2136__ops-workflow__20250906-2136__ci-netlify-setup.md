# CI & Netlify setup (20250906-2136)
- Branch: chore/ci-netlify-preview
- PR: 
- Files:
  - .github/workflows/ci.yml
  - .github/workflows/netlify-preview.yml
- Note: Deploy Preview kjører kun hvis secrets er definert i repo:
  - NETLIFY_AUTH_TOKEN
  - NETLIFY_SITE_ID_DEV
