---
applyTo: "frontend/**"
---

# Frontend instructions — Astro SSR + TypeScript

## Stack

- Astro SSR (`output: 'server'`, `@astrojs/node` standalone, port 7330),
  TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), `hls.js`, `qrcode`.
- Node.js (see `engines` in `package.json`), npm. Dev: `npm run dev`;
  validate: `npm run build`.

## Layout

- `src/pages/` routes (incl. `pages/docs/` for proxied OpenAPI views),
  `src/components/`, `src/lib/` (`api.ts`, `backend-proxy*` + `proxyBackendPath()`),
  `src/middleware.ts`, `src/layouts/`, `src/styles/`, `src/assets/`.

## Rules

- **All browser-initiated API calls go through `/api/proxy/`.** Never call
  Jellyfin/Plex/Emby/Trakt/Simkl/MDBList/Nuvio/ARVIO/Stremio/TMDB directly from
  the browser — flag any bypass as a mistake.
- `lib/api.ts request()` attaches `err.status`; `middleware.ts` logs out
  **only** on 401/403 — 5xx/network errors return 503 and keep the session.
- `pages/docs/*` import lib as `../../lib/backend-proxy` (one level deeper than
  `pages/*.ts`) — wrong depth breaks Astro dev imports.
- Never embed secrets, tokens, or instance URLs; never store third-party
  passwords; keep Stremio auth key server-side.
- App-like PWA: dashboard cards/tables collapse cleanly on mobile — verify at
  390px and 1280px, no fixed-pixel page widths.
- Match existing Astro component style; keep changes small and scoped.
