# Project Analysis, Structure Mapping, and Optimization Report

## 1) Project Overview

- **Project name**: `interview-experience` (theInterview / PICT interview experience sharing platform)
- **Framework**: Next.js App Router
- **Language mode**: JavaScript + ESM (`"type": "module"`)
- **Auth**: NextAuth (Google provider)
- **Database**: MongoDB (`int-exp` database)
- **Styling/UI**: TailwindCSS + custom components

The codebase is a full-stack Next.js application containing:
- Public pages and authenticated flows for creating/editing interview experiences.
- API route handlers under `app/api/*` for CRUD, search, drafts, user sync, and newsletter.
- MongoDB persistence and email notifications.

## 2) Current File/Folder Mapping

## Root

- `package.json`: scripts, dependencies, project metadata.
- `package-lock.json`: dependency lock file.
- `next.config.mjs`: Next.js config (image remote patterns, TS build behavior).
- `tailwind.config.mjs`: Tailwind scan paths + theme extension.
- `postcss.config.mjs`: PostCSS config.
- `jsconfig.json`: alias mapping (`@/*`).
- `.env`: environment variables (local only, not for commit).
- `.gitignore`: git ignore rules.
- `README.md`, `README 2.md`: project docs.

## `app/` (App Router)

- `app/layout.js`: root layout, session provider, analytics/footer wiring.
- `app/page.js`: home page server component (featured + top stories).
- `app/middleware.js`: CORS middleware for API routes.
- `app/globals.css`: global styles.

### Static/content pages

- `app/about/page.jsx`
- `app/help/page.jsx`
- `app/login/page.jsx`
- `app/privacy/page.jsx`
- `app/team/page.jsx`
- `app/terms/page.jsx`

### Main product pages

- `app/feed/page.jsx`: infinite feed page.
- `app/post/page.jsx`: create experience page.
- `app/profile/page.jsx`: user profile + authored posts.
- `app/search/page.jsx`: redirect search entry.
- `app/search/[search]/page.jsx`: search results.
- `app/single/[id]/page.jsx`: full article/experience page.
- `app/edit/[id]/page.jsx`: edit existing post.

### API routes (`app/api/*`)

- `auth/[...nextauth]/route.js`: NextAuth handlers.
- `feed/route.js`: paginated feed fetch.
- `topStories/route.js`: top viewed posts.
- `postsCount/route.js`: total post count.
- `exp/route.js`: fetch single post + increment views.
- `saveExp/route.js`: save experience + backup + acknowledgment email.
- `edit/route.js`: update experience.
- `delete/route.js`: delete experience.
- `profile/route.js`: fetch user posts by email.
- `drafts/route.js`: upsert/get drafts.
- `deleteDraft/route.js`: delete saved draft.
- `saveUser/route.js`: upsert user profile.
- `search/route.js`: Atlas Search query.
- `getCompanies/route.js`: company dropdown list.
- `newsletter/route.js`: newsletter email save.
- `sendEmail/route.js`: generic acknowledgment email send.

## `components/`

- Shared UI components, cards, navbar, markdown renderer, profile avatar/skeleton, ads, auth card, landing sections, etc.
- Key component groups:
  - Navigation/layout: `Navbar.jsx`, `Footer.jsx`
  - Post/feed cards: `Card.jsx`, `FeedCard.jsx`, `ArticleCard.jsx`
  - Content/markdown: `Markdown.jsx`, `ExpForm.jsx`
  - Auth/user: `Login.jsx`, `ProfileAvatar.jsx`, `ProfileCardSkeleton.jsx`
  - Utilities: `ShareButton.jsx`, `ScrollViewTracker.js`

## `lib/`

- `lib/mongoose.js`: legacy mongoose connection helper (still present).
- `lib/server/config.js`: **new** shared server constants.
- `lib/server/mongodb.js`: **new** shared cached MongoDB client/collection access.
- `lib/server/http.js`: **new** API response helpers.
- `lib/server/validation.js`: **new** parsing/validation helpers.
- `lib/server/email.js`: **new** email sending utilities.

## `models/`

- `models/User.js`, `models/Experience.js`, `models/test.js` (legacy mongoose-model layer; currently not used by the route handlers).

## `public/`

- Branding and static assets (`icon.svg`, `icon.png`, founder images, manifest).

## `tests/`

- `tests/validation.test.js`: **new** unit tests for shared validation utilities.

## `docs/`

- `docs/PROJECT_SETUP_OPTIMIZATION.md`: this full analysis and mapping document.

## 3) Key Issues Found Before Optimization

- API handlers each created their own Mongo client pattern (duplicate logic, inconsistent lifecycle).
- Some routes loaded full collections in memory and sorted in application code.
- Inconsistent API validation/error responses across routes.
- Hardcoded `NEXTAUTH` secret in source code.
- Server-side home page fetches were tied to a production URL instead of config.
- No test script and no automated validation tests.

## 4) Optimization Applied

## Backend/API structure hardening

- Introduced shared server modules under `lib/server/*`:
  - connection reuse
  - unified JSON responses
  - shared validation/parsing
  - centralized email utilities
- Refactored all API route handlers to use common helpers.
- Switched feed/top-stories/profile sorting to DB-level sort/skip/limit.
- Normalized required-field checks and error messaging.

## Security/config improvements

- Replaced hardcoded NextAuth secret with `process.env.NEXTAUTH_SECRET`.
- Added centralized `SITE_URL` usage in `app/page.js`.

## Testing + workflow improvements

- Added scripts:
  - `npm run test` (Node test runner)
  - `npm run check` (test + build)
- Added unit tests for shared validation logic.
- Enabled ESM mode in `package.json` for consistent server/test imports.

## 5) Updated High-Level Architecture

- **Presentation layer**: `app/*` pages + `components/*`
- **API layer**: `app/api/*` route handlers
- **Shared server services**: `lib/server/*`
  - `mongodb` for data access foundation
  - `http` for response conventions
  - `validation` for request sanitation
  - `email` for outbound email operations
- **Persistence**: MongoDB collections in `int-exp`

## 6) Collection Mapping (Database)

- `experience`: main published posts
- `backup`: mirrored saved posts
- `drafts`: one upserted draft per email
- `user`: user profile records
- `newsletter`: newsletter subscriptions
- `dropdowns`: companies lookup list

## 7) Environment Variables Required

- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (recommended)
- `NEXT_PUBLIC_SITE_URL` (recommended)
- `EMAIL_USER` and `EMAIL_PASS` (for mail features)

## 8) Recommended Next Improvements (Optional)

- Move duplicated `companies`/`roles` lists in `ExpForm.jsx` and `edit/[id]/page.jsx` into shared constants or DB source.
- Convert API routes to TypeScript (`.ts`) with schema validation (e.g., Zod) for stronger contracts.
- Add integration tests for critical routes (`saveExp`, `edit`, `delete`, `search`).
- Remove/cleanup unused legacy Mongoose model layer if not needed.
