## Description

<!-- What does this PR change and why? Link related issues: Fixes #… -->

## Changes

- <!-- e.g. backend/core/plex.py: … -->
- <!-- e.g. frontend/src/pages/…: … -->

## How to test

```bash
# backend
cd backend && uv run python -m unittest discover -s tests -v
# frontend
cd frontend && npm run build
# migrations (if models/ changed)
cd backend && uv run alembic upgrade head
```

<!-- Paste relevant test/build output. Assisted by [ai-ready](https://github.com/johnpapa/ai-ready). -->

## Checklist

- [ ] All browser-initiated API calls go through `/api/proxy/` (no direct third-party calls from the browser)
- [ ] Backend tests pass (`uv run python -m unittest discover -s tests -v`)
- [ ] Frontend builds (`npm run build`)
- [ ] Alembic migration included if `models/` changed (`alembic upgrade head` runs cleanly)
- [ ] New env vars have defaults + `README.md` Configuration table + `.env.example` entry
- [ ] Provider push uses merge/upsert semantics (preserves remote items Scrob doesn't own)
- [ ] Secrets/tokens redacted from logs and frontend-visible responses
- [ ] Commit messages follow Conventional Commits (`feat:`, `fix:`, …)
- [ ] Change is small and scoped (or split into reviewable PRs)
