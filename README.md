## theInterview (PICT)

Web app for sharing and discovering interview/placement experiences (PICT community). Built with **Next.js App Router**, **NextAuth (Google)**, and **MongoDB**.

## Tech stack

- **Framework**: Next.js (App Router) + React
- **Auth**: `next-auth` (Google provider)
- **Database**: MongoDB (native driver in API routes; also has Mongoose models in `models/`)
- **UI**: TailwindCSS, shadcn/ui, framer-motion, lucide-react
- **Email**: Nodemailer (Gmail SMTP)

## Getting started (local development)

### Prerequisites

- **Node.js**: a modern Node version that supports your installed Next.js version (recommended: latest LTS)
- **MongoDB**: connection string (Atlas or local)
- **Google OAuth** credentials (for NextAuth)
- (Optional) **Gmail App Password** for sending emails from the API

### Install & run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Environment variables

Create a `.env.local` at the project root:

```bash
# MongoDB
MONGODB_URI="mongodb+srv://..."
MONGODB_DB_NAME="int-exp"

# NextAuth (Google)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Recommended (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

# Email (used by /api/saveExp and /api/sendEmail)
EMAIL_USER="yourgmail@gmail.com"
EMAIL_PASS="gmail-app-password"
```

Notes:

- **Database name** used by API routes defaults to `int-exp` and can be overridden with `MONGODB_DB_NAME`.
- Some pages currently fetch from `https://the-interview-pict.vercel.app/api/...` directly (not from the local server). If you’re developing locally and want local data/APIs, update those fetch URLs to use your local base URL (or refactor to an env like `NEXT_PUBLIC_BASE_URL`).

## Project structure

High-level layout (important folders/files):

```text
app/
  api/                      # API routes (server)
  layout.js                 # Root layout (SessionProvider, GA, ads, footer)
  page.js                   # Landing page (fetches feed + top stories)
  middleware.js             # CORS for /api/*
  feed/                     # /feed page
  post/                     # /post page (write experience; requires session)
  single/[id]/              # /single/:id (experience detail)
  edit/[id]/                # /edit/:id (edit experience)
  profile/                  # /profile page
  search/                   # /search pages
  login/, about/, help/, terms/, privacy/, team/
components/                 # UI components (cards, navbar, editor form, etc.)
lib/mongoose.js             # Mongoose connect helper (not used by most API routes)
models/                     # Mongoose models (User, Experience)
next.config.mjs             # Next.js config (images remotePatterns, etc.)
```

## Database

The API routes use the MongoDB database **`int-exp`** and these collections:

- **`experience`**: published experiences (main content)
- **`backup`**: backup copy written alongside `experience` on save
- **`drafts`**: per-user draft (upserted by `email`)
- **`user`**: users (created/updated via `/api/saveUser`)
- **`newsletter`**: newsletter emails
- **`dropdowns`**: company dropdown data (expects a document with a `companies` array)

Common `experience` fields you’ll see:

- `uid` (string, slug + nanoid)
- `exp_text` (string, markdown-ish content)
- `company`, `role`, `branch`, `batch`, `name`, `email`, `profile_pic`
- `date` (string ISO timestamp)
- `views` (number)

## API reference

All API routes live under `app/api/*` (Next.js route handlers). CORS headers are applied by `app/middleware.js` for `/api/:path*`.

### Auth

- **`GET|POST /api/auth/[...nextauth]`**
  - NextAuth handler (Google provider)
  - **Env**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, (recommended) `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

### Experiences

- **`GET /api/feed`**
  - **Query**: `page` (default `0`), `itemsPerPage` (default `10`)
  - **Response**: array of experience documents, sorted by newest first

- **`GET /api/topStories`**
  - **Query**: `page` (default `0`)
  - **Response**: array of experience documents, sorted by `views` desc (30/page)

- **`GET /api/postsCount`**
  - **Response**: `{ count: number }`

- **`GET /api/exp?uid=...`**
  - **Behavior**: fetches experience and increments `views`
  - **Response**: MongoDB `findOneAndUpdate` result (the updated document is under `value`)

- **`POST /api/saveExp`**
  - **Body**:
    - `exp_text` (required), `company` (required), `name` (required)
    - `branch`, `batch`, `role`, `profile_pic`, `email`
  - **Behavior**: inserts into `experience` and `backup`, and sends an acknowledgment email (if email env is configured)
  - **Response**: `{ message, uid }`
  - **Env**: `MONGODB_URI`, `EMAIL_USER`, `EMAIL_PASS`

- **`PUT /api/edit`**
  - **Body**: `uid` + `email` (required), plus any updated fields (`exp_text`, `company`, `branch`, `batch`, `role`)
  - **Response**: `{ message, uid }`

- **`DELETE /api/delete`**
  - **Body**: `{ uid, email }`
  - **Response**: `{ message }`

### Users & profile

- **`POST /api/saveUser`**
  - **Body**: `{ gmail, name, image }`
  - **Behavior**: upserts into `user` collection (by `gmail`)
  - **Response**: `{ message, operation, result }`

- **`POST /api/profile`**
  - **Body**: `{ email }`
  - **Response**: `{ posts: Experience[] }` (reverse order)

### Drafts

- **`POST /api/drafts`**
  - **Body**: draft fields + `email` (required)
  - **Behavior**: upserts one draft per email
  - **Response**: `{ message, email }`

- **`GET /api/drafts?email=...`**
  - **Response**: the draft document for that email

- **`POST /api/deleteDraft`**
  - **Body**: `{ email }`
  - **Response**: `{ message }`

### Search & dropdown data

- **`GET /api/search?search=...&page=1`**
  - Uses MongoDB Atlas Search (`$search`) with index name **`main`**
  - **Response**: `{ result: Experience[] }`

- **`GET /api/getCompanies`**
  - Reads `dropdowns` collection and returns its `companies` array
  - **Response**: `{ success: boolean, data?: string[], message?: string }`

### Newsletter & email

- **`POST /api/newsletter`**
  - **Body**: `{ email }` (only `@gmail.com` allowed)
  - **Response**: `{ message }`

- **`POST /api/sendEmail`**
  - **Body**: `{ userEmail, userName }`
  - **Env**: `EMAIL_USER`, `EMAIL_PASS`
  - **Response**: `{ message }` (or `{ error }` on failure)

## Scripts

- **`npm run dev`**: start dev server
- **`npm run build`**: production build
- **`npm run start`**: run production server
- **`npm run migrate:db`**: migrate data from one MongoDB to another

## Database migration (to your own MongoDB)

Use this when moving from current DB to your personal MongoDB cluster.

1. Set migration env vars and run:

```bash
SOURCE_MONGODB_URI="mongodb+srv://old-cluster-uri" \
TARGET_MONGODB_URI="mongodb+srv://your-new-cluster-uri" \
SOURCE_DB_NAME="int-exp" \
TARGET_DB_NAME="int-exp" \
DROP_TARGET="false" \
npm run migrate:db
```

2. Then update your app env to use your DB:

```bash
MONGODB_URI="mongodb+srv://your-new-cluster-uri"
MONGODB_DB_NAME="int-exp"
```

Optional migration env vars:
- `COLLECTIONS="experience,backup,drafts,user,newsletter,dropdowns"` (defaults to all above)
- `MIGRATION_BATCH_SIZE="500"` (default `500`)
- `DROP_TARGET="true"` to clear target collections before writing

## Notes for contributors

- **CORS**: `app/middleware.js` only whitelists the production origin (`the-interview-pict.vercel.app`). Local dev is fine for same-origin requests, but cross-origin testing may require adjusting `allowedOrigins`.
- **Security**: ensure secrets live in `.env.local` and are not committed (OAuth secrets, `NEXTAUTH_SECRET`, email password).
