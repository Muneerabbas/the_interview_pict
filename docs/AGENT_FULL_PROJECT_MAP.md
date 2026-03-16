# Agent Project Map: theInterview (Full Structure + File Functionality)

## Purpose

This document is a complete, agent-friendly map of the codebase. It captures:
- Full project structure
- Functionality of every page and file
- API route responsibilities
- Key coupling points and data flow

Use this as the primary reference before making changes.

## 1) High-Level Architecture

- **Framework**: Next.js App Router (`app/`)
- **Rendering**: mix of server and client components
- **Backend**: route handlers in `app/api/*`
- **DB**: MongoDB (`int-exp`) via shared helper (`lib/server/mongodb.js`)
- **Auth**: NextAuth with Google provider
- **UI**: Tailwind + reusable components in `components/`
- **Email**: nodemailer wrapper in `lib/server/email.js`

## 2) Complete Project Structure

```text
.
├── .DS_Store
├── .env
├── .gitignore
├── .vscode/
│   └── settings.json
├── README 2.md
├── README.md
├── app/
│   ├── .DS_Store
│   ├── about/
│   │   └── page.jsx
│   ├── api/
│   │   ├── .DS_Store
│   │   ├── auth/
│   │   │   ├── .DS_Store
│   │   │   └── [...nextauth]/
│   │   │       └── route.js
│   │   ├── delete/
│   │   │   └── route.js
│   │   ├── deleteDraft/
│   │   │   └── route.js
│   │   ├── drafts/
│   │   │   └── route.js
│   │   ├── edit/
│   │   │   └── route.js
│   │   ├── exp/
│   │   │   └── route.js
│   │   ├── feed/
│   │   │   └── route.js
│   │   ├── getCompanies/
│   │   │   └── route.js
│   │   ├── newsletter/
│   │   │   └── route.js
│   │   ├── postsCount/
│   │   │   └── route.js
│   │   ├── profile/
│   │   │   └── route.js
│   │   ├── saveExp/
│   │   │   └── route.js
│   │   ├── saveUser/
│   │   │   └── route.js
│   │   ├── search/
│   │   │   └── route.js
│   │   ├── sendEmail/
│   │   │   └── route.js
│   │   └── topStories/
│   │       └── route.js
│   ├── edit/
│   │   └── [id]/
│   │       └── page.jsx
│   ├── feed/
│   │   └── page.jsx
│   ├── globals.css
│   ├── help/
│   │   └── page.jsx
│   ├── layout.js
│   ├── login/
│   │   └── page.jsx
│   ├── middleware.js
│   ├── page.js
│   ├── post/
│   │   └── page.jsx
│   ├── privacy/
│   │   └── page.jsx
│   ├── profile/
│   │   └── page.jsx
│   ├── search/
│   │   ├── [search]/
│   │   │   └── page.jsx
│   │   └── page.jsx
│   ├── single/
│   │   └── [id]/
│   │       └── page.jsx
│   ├── team/
│   │   └── page.jsx
│   └── terms/
│       └── page.jsx
├── components/
│   ├── AdComponent.jsx
│   ├── AdComponent2.jsx
│   ├── ArticleCard.jsx
│   ├── Card.jsx
│   ├── ExpForm.jsx
│   ├── FeaturesSection.jsx
│   ├── FeedCard.jsx
│   ├── Footer.jsx
│   ├── FounderCard.jsx
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Markdown.jsx
│   ├── Navbar.jsx
│   ├── ProfileAvatar.jsx
│   ├── ProfileCardSkeleton.jsx
│   ├── ScrollViewTracker.js
│   └── ShareButton.jsx
├── docs/
│   ├── PROJECT_SETUP_OPTIMIZATION.md
│   └── AGENT_FULL_PROJECT_MAP.md
├── jsconfig.json
├── lib/
│   ├── mongoose.js
│   └── server/
│       ├── config.js
│       ├── email.js
│       ├── http.js
│       ├── mongodb.js
│       └── validation.js
├── models/
│   ├── Experience.js
│   ├── User.js
│   └── test.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public/
│   ├── .DS_Store
│   ├── h1.jpg
│   ├── icon.png
│   ├── icon.svg
│   ├── manifest.json
│   ├── n1.jpg
│   └── n2.jpg
├── tailwind.config.mjs
└── tests/
    └── validation.test.js
```

## 3) File-by-File Functionality Map

## Root and config files

- `.DS_Store`: macOS metadata; no runtime value.
- `.env`: local environment variables (`MONGODB_URI`, OAuth, email, etc.).
- `.gitignore`: ignore rules.
- `.vscode/settings.json`: local editor settings.
- `README.md`: project setup + API notes.
- `README 2.md`: alternate/legacy documentation.
- `package.json`: scripts and dependencies (`dev`, `build`, `start`, `test`, `check`).
- `package-lock.json`: pinned package graph.
- `next.config.mjs`: Next config (images, TS build flags).
- `postcss.config.mjs`: PostCSS plugin setup.
- `tailwind.config.mjs`: Tailwind scan paths + theme customizations.
- `jsconfig.json`: `@/*` import alias.

## App shell + global behavior

- `app/layout.js`: root HTML/body wrapper, session provider wiring, analytics, footer visibility logic.
- `app/globals.css`: global design system and utility styling.
- `app/middleware.js`: CORS handling for `/api/:path*`.
- `app/page.js`: home landing route; fetches featured and top stories; renders `Landing` component.

## App pages

- `app/feed/page.jsx`: infinite scrolling feed UI, session-aware CTA, fetches `/api/feed`.
- `app/post/page.jsx`: post creation surface; shows login gate when unauthenticated; embeds `ExpForm` when authenticated.
- `app/profile/page.jsx`: profile banner + user posts; fetches `/api/profile`; supports edit/delete actions.
- `app/single/[id]/page.jsx`: single experience detail page; SEO metadata; related stories; share and markdown rendering.
- `app/edit/[id]/page.jsx`: experience edit form for existing post; submits `/api/edit`.
- `app/search/page.jsx`: redirects to default seeded search route.
- `app/search/[search]/page.jsx`: search results with pagination/infinite load via `/api/search`.
- `app/login/page.jsx`: login page; redirects authenticated users to `/feed`.
- `app/about/page.jsx`: team and story presentation page.
- `app/help/page.jsx`: interview-template helper page; copy-to-clipboard template guidance.
- `app/privacy/page.jsx`: privacy placeholder content.
- `app/terms/page.jsx`: terms placeholder content.
- `app/team/page.jsx`: team placeholder/external link page.

## API routes (`app/api/*`)

- `app/api/auth/[...nextauth]/route.js`: NextAuth route handlers (Google provider, JWT/session callbacks, env secret).
- `app/api/feed/route.js`: paginated feed fetch sorted by date descending.
- `app/api/topStories/route.js`: top viewed posts pagination sorted by `views`.
- `app/api/postsCount/route.js`: total count from `experience` collection.
- `app/api/exp/route.js`: get one experience by `uid` and increment views atomically.
- `app/api/saveExp/route.js`: create experience + backup copy + optional acknowledgment email.
- `app/api/edit/route.js`: update owned experience fields by `uid` + `email`.
- `app/api/delete/route.js`: delete experience by `uid` + `email`.
- `app/api/profile/route.js`: fetch all experiences by user email.
- `app/api/drafts/route.js`: upsert/get per-user draft.
- `app/api/deleteDraft/route.js`: remove user draft.
- `app/api/saveUser/route.js`: upsert user profile in `user` collection.
- `app/api/search/route.js`: Atlas Search aggregation (`main` index) with weighted field matching.
- `app/api/getCompanies/route.js`: read companies dropdown list from `dropdowns` collection.
- `app/api/newsletter/route.js`: subscribe Gmail address to newsletter collection.
- `app/api/sendEmail/route.js`: generic acknowledgment email API.
- `app/api/.DS_Store` and `app/api/auth/.DS_Store`: macOS metadata.

## Components

- `components/Navbar.jsx`: primary navigation, search submission, auth actions, responsive menu behavior.
- `components/Footer.jsx`: site footer links/info.
- `components/Landing.jsx`: home landing layout and sections.
- `components/FeaturesSection.jsx`: marketing/features section.
- `components/FounderCard.jsx`: reusable founder/team card.
- `components/Login.jsx`: login UI using NextAuth sign-in flow.
- `components/ExpForm.jsx`: rich markdown experience creation form with autosave draft, validation, submit flow.
- `components/Markdown.jsx`: markdown renderer with custom element styling and syntax highlighting.
- `components/FeedCard.jsx`: feed item card for list pages.
- `components/Card.jsx`: profile/general card with read/edit/delete controls.
- `components/ArticleCard.jsx`: related/suggested article card.
- `components/ProfileAvatar.jsx`: resilient avatar component with fallback icon.
- `components/ProfileCardSkeleton.jsx`: loading skeleton for feed/profile cards.
- `components/ShareButton.jsx`: copy/share controls (social links + clipboard UX).
- `components/ScrollViewTracker.js`: sends one-time view increment trigger on first scroll.
- `components/AdComponent.jsx`: ad slot renderer with adsbygoogle push.
- `components/AdComponent2.jsx`: second ad slot component variant.

## Libraries and server utilities

- `lib/mongoose.js`: legacy mongoose connection helper (not primary path for current APIs).
- `lib/server/config.js`: shared constants (DB name, pagination sizes, site URL).
- `lib/server/mongodb.js`: cached Mongo client/DB/collection access helpers.
- `lib/server/http.js`: standardized JSON response helpers (`ok`, `badRequest`, `serverError`, etc.).
- `lib/server/validation.js`: common input parsing and validation helpers.
- `lib/server/email.js`: centralized nodemailer transport + email send methods.

## Models (legacy/secondary data layer)

- `models/User.js`: mongoose user schema/model.
- `models/Experience.js`: mongoose experience schema/model.
- `models/test.js`: minimal placeholder test/module file.

## Public assets

- `public/icon.svg`: primary app logo vector.
- `public/icon.png`: icon/fallback favicon-like asset.
- `public/h1.jpg`, `public/n1.jpg`, `public/n2.jpg`: team/about images.
- `public/manifest.json`: web app manifest metadata.
- `public/.DS_Store`: macOS metadata.

## Documentation and tests

- `docs/PROJECT_SETUP_OPTIMIZATION.md`: optimization report and architecture summary.
- `docs/AGENT_FULL_PROJECT_MAP.md`: this complete mapping document.
- `tests/validation.test.js`: unit tests for `lib/server/validation.js`.

## 4) Runtime Data and Request Flow

- Frontend pages call internal API routes (`/api/*`) for CRUD/search/profile/drafts.
- API routes call shared server utilities (`lib/server/*`) and MongoDB collections.
- `saveExp` also writes to `backup` and optionally sends email.
- `single/[id]` consumes `/api/exp` and related feed data.

## 5) Collections Used

- `experience`: main published experiences
- `backup`: backup copy of posted experiences
- `drafts`: in-progress drafts keyed by email
- `user`: user records
- `newsletter`: subscriber emails
- `dropdowns`: predefined company list

## 6) Agent Usage Notes

- Prefer editing shared helpers in `lib/server/*` first for cross-route behavior changes.
- Keep route validation and responses consistent via `http.js` + `validation.js`.
- Avoid adding new direct `MongoClient` usage inside routes; use `getCollection`.
- `models/*` are legacy in current flow; verify usage before modifying.
- Placeholder policy pages (`privacy`, `terms`, `team`) are low-risk change targets.
