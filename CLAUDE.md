# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # webpack dev server (turbo variant: npm run dev:turbo)
npm run build          # next build; postbuild runs next-sitemap (needs MONGODB_URI)
npm run smoke:data     # test/data-smoke.mjs — hits a RUNNING server (BASE_URL=http://127.0.0.1:3000)
npm run test:security  # test/security-smoke.mjs — pure node, no server needed
npm run seed:colleges  # / seed:companies — mongoose seeders, both support --dry-run
node test/<file>.mjs   # every file in test/ is a standalone node script; that is how you run one
```

There is no lint or typecheck step. Tests are plain `node:assert` scripts — no framework.

## Architecture

Next.js App Router (JS, not TS), NextAuth Google, MongoDB, Upstash Redis. `@/*` maps to the repo root.

**Two data-access styles coexist, deliberately:**
- Most API routes use the native driver via `lib/mongodb.js` — `getMongoDb({ mode: "read" | "write" })`. Two pooled clients: read goes to `secondaryPreferred`, write is primary-only. DB name is `int-exp`.
- Routes under `colleges`, `comments`, `getCompanies`, `notifications`, `postCompanies`, `user/profile` use Mongoose (`lib/mongoose.js` + `models/`). Match whichever style the file you're editing already uses.

**Content model.** A post is either an `interview` or a `tale`, distinguished by `content_type`. Interviews live in `experience`, tales in `tales` (plus legacy `content_type: "tale"` docs still in `experience` — see `next-sitemap.config.js`). Both render at `/single/[uid]`, which resolves against `experience` first and falls back to `tales`, so **uids must be unique across both collections** (`saveExp` loops until they are). Writes mirror into `backup`/`tales_backup` fire-and-forget; a failed mirror must never fail the request.

**Server-side conventions in API routes:**
- Acting identity comes from `requireSession()` (`lib/auth.js`), never from the request body. `auth.response` is a ready-made 401 to return as-is. Emails are normalized lowercase before comparison.
- Mutating routes call `checkRateLimit(req, { key, limit, windowSeconds })` first.
- Errors go through `jsonError(err, fallback)` (`lib/api-response.js`), which maps Mongo/TLS/network messages to a 503 `DATABASE_UNAVAILABLE` instead of leaking driver text.
- Redis is optional: `lib/redis.js` exports `null` when env vars are absent, and `cache.js`/`rate-limit.js` fail open. Never assume it exists.
- Feed responses never expose author `email` — it was half the key pair behind past edit/delete IDORs.

**Caching.** `fetchWithCache(key, ttl, fetcher)` for reads; writes invalidate by explicit `redis.del` of the profile keys (see `invalidateAfterWrite` in `saveExp`). Keys are ad-hoc strings, so grep before inventing one.

**Security invariants** (guarded by `test/security-smoke.mjs`, keep in sync with `components/Markdown.jsx`): user markdown is rendered with `rehypeRaw` **plus** `rehypeSanitize`, and any user-supplied href goes through `safeExternalUrl` (`lib/utils.js`). Removing either is stored XSS.

**Middleware** lives at the repo root (`middleware.js`), not in `app/` — Next does not load it from `app/`. It only adds CORS for `/api/*` against a hardcoded allowlist of `theinterviewroom.in` origins.

**Slugs.** Company slugs must go through `companySlugFromName` (`lib/companySlug.js`); the seed script and `/api/postCompanies` both depend on identical output.

Note: `README.md` predates the tales/colleges/comments/likes features and the `pict.live` → `theinterviewroom.in` domain move; treat its API reference as partially stale.
