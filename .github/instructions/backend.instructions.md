---
applyTo: "backend/**"
---

# Backend instructions — FastAPI + SQLAlchemy (async)

## Stack

- Python (see `requires-python` in `backend/pyproject.toml`), FastAPI, SQLAlchemy
  async (`postgresql+asyncpg://`), Alembic (`migrations/`), PostgreSQL 16.
- Manage deps with `uv` (`uv sync`); pinned lock is `requirements.txt`.
- Run: `uv run uvicorn main:app --reload --port 7331`.
- Test: `uv run python -m unittest discover -s tests -v` (`tests/test_*.py`,
  `unittest`-style, mocked transport, dummy `SECRET_KEY`/`DATABASE_URL`).
- Migrate: `uv run alembic upgrade head` — schema changes only via
  `migrations/versions/`, never hand-edit.

## Layout

- `routers/<area>.py` (routes) → `core/<provider>.py` (provider logic, one module
  per integration) → `models/<entity>.py` (SQLAlchemy).
- Shared: `core/config.py` (env), `core/security.py`, `core/limiter.py`,
  `dependencies.py` (auth), `schemas.py`.

## Rules

- Browser-reachable third-party calls live behind `/api/proxy/` — never expose
  direct provider calls to the frontend; keep credentials server-side.
- Passwords are exchanged for tokens then discarded, never persisted; redact
  sensitive tokens (e.g. Stremio auth key) from frontend-visible responses.
- Provider pushes use merge/upsert semantics — preserve remote items the
  connection doesn't own; skip no-op writes.
- `app.openapi()` returns a cached dict by reference — `deepcopy()` before
  prefixing paths (see `_build_proxy_openapi` in `main.py`).
- asyncpg DSN uses `?ssl=require` (not `?sslmode=require`); use direct DB
  endpoints, not transaction-mode pooler hosts.
- Keep `DB_POOL_SIZE + DB_MAX_OVERFLOW` under the provider `max_connections`
  (defaults total 30; Aiven free = 20).
- New settings: env var with default in `core/config.py` + `README.md`
  Configuration table + `.env.example` entry.
- Conventional Commits (`feat:`, `fix:`, …); small scoped changes.
