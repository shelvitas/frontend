# Shelvitas Frontend

Web app for **Shelvitas** — a social book tracking and discovery platform. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase Auth.

## Tech Stack

| Component           | Technology                                        |
| ------------------- | ------------------------------------------------- |
| **Framework**       | Next.js 15 (App Router, Turbopack)                |
| **Language**        | TypeScript (strict mode)                          |
| **Styling**         | Tailwind CSS 3.4 + shadcn/ui components           |
| **Auth**            | Supabase Auth (Google OAuth + email/password)     |
| **State**           | Zustand (auth store) + React Query (server state) |
| **API Client**      | Fetch-based with Zustand token injection          |
| **Icons**           | Lucide React                                      |
| **Testing**         | Vitest (unit) + Playwright (E2E)                  |
| **Linting**         | ESLint (Airbnb) + Prettier                        |
| **Package Manager** | pnpm                                              |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up env
cp .env.example .env
# Fill in your Supabase URL and publishable key

# 3. Start dev server
pnpm dev

# App: http://localhost:3000
```

## Project Structure

```
app/
├── (public)/               # Public pages (no auth required)
│   ├── page.tsx            # Homepage — hero, features, book sections
│   ├── [username]/page.tsx # Public profile page (SSR) — stats, tabs, follow
│   ├── books/[id]/page.tsx # Book page (SSR) — cover, metadata, histogram, status, reviews, Schema.org
│   ├── reviews/[id]/page.tsx # Review page (SSR) — full review, like/save, comments, share
│   ├── lists/[id]/page.tsx  # List page (SSR) — ranked books, % read, like/clone/share, comments
│   ├── logo/page.tsx       # Logo display
│   └── testing/page.tsx    # API testing page
├── (auth)/                 # Auth pages (split-screen layout with book mosaic)
│   ├── layout.tsx          # Auth layout — book cover mosaic + quote
│   ├── sign-in/page.tsx    # Email + Google OAuth sign in
│   ├── sign-up/page.tsx    # Email + Google OAuth sign up
│   ├── forgot-password/    # Password reset request
│   ├── reset-password/     # Set new password
│   └── complete-profile/   # Username + display name (after first OAuth)
├── (protected)/            # Authenticated pages
│   ├── layout.tsx          # Auth guard (redirects to /sign-in)
│   ├── profile/page.tsx    # User profile with stats
│   ├── diary/page.tsx      # Reading diary — chronological logs, year filter, edit inline
│   └── search/page.tsx     # Book search (Typesense + external APIs)
├── auth/callback/page.tsx  # OAuth callback handler
├── layout.tsx              # Root layout (Inter font, providers, metadata)
├── providers.tsx           # React Query + AuthProvider
├── error.tsx               # Global error boundary
├── not-found.tsx           # 404 page
├── globals.css             # Tailwind + Letterboxd dark theme
└── sitemap.ts              # SEO sitemap

components/
├── layout/
│   ├── navbar.tsx          # Sticky navbar with auth state, transparent on homepage
│   └── footer.tsx          # Site footer
├── auth/
│   └── oauth-buttons.tsx   # Google OAuth button
├── profile/
│   ├── follow-button.tsx   # Follow/Unfollow/Request button (client)
│   └── profile-tabs.tsx    # Read, Currently Reading, Reviews, Lists, Want to Read tabs
├── book/
│   ├── rating-histogram.tsx # Community rating histogram (5-star bars)
│   ├── status-controls.tsx  # 3-state + DNF reading status buttons
│   ├── review-card.tsx      # Review card with spoiler gate
│   ├── star-rating.tsx      # Clickable half-star rating input (0.5-5.0)
│   ├── tags-input.tsx       # Tag input with Enter/comma add, backspace remove
│   └── log-modal.tsx        # Full log/review modal (status, dates, rating, format, tags, review, notes)
├── diary/
│   └── diary-entry-card.tsx # Diary entry row (cover, dates, rating, format, tags, reread badge, edit)
├── review/
│   ├── review-actions.tsx   # Like + Save buttons with optimistic counts
│   ├── share-buttons.tsx    # Share to X/Threads links
│   └── comment-thread.tsx   # Threaded comments with spoiler toggle, reply input
├── list/
│   └── list-actions.tsx     # Like/Clone/Share buttons for lists
└── ui/                     # shadcn/ui primitives (Button, Card, Input, etc.)

lib/
├── api.ts                  # API client (auto-attaches JWT from Zustand store)
├── env.ts                  # Zod-validated env vars (t3-oss/env-nextjs)
├── utils.ts                # cn() classname helper
├── hooks/
│   └── use-auth.ts         # Auth hook (sign in/up/out, OAuth, profile)
└── supabase/
    ├── client.ts           # Browser Supabase client (singleton)
    ├── server.ts           # Server-side Supabase client
    ├── middleware.ts        # Middleware (auth route redirects)
    └── auth-provider.tsx   # AuthProvider (session + profile sync)

store/
├── index.ts                # App state (sidebar)
└── auth.ts                 # Auth state (user, session, profile)

middleware.ts               # Next.js middleware (route protection)
```

## Design System

Letterboxd-inspired dark theme with Shelvitas brand colors:

| Token              | Value     | Usage                                     |
| ------------------ | --------- | ----------------------------------------- |
| `background`       | `#14181c` | Page background (single color everywhere) |
| `foreground`       | `#ededed` | Primary text                              |
| `muted-foreground` | `#89929b` | Secondary text                            |
| `secondary`        | `#2c3440` | Card backgrounds, borders, inputs         |
| `shelvitas-green`  | `#00e054` | Primary CTAs, links, brand accent         |
| `shelvitas-orange` | `#ff8001` | Logo bar 1                                |
| `shelvitas-blue`   | `#40bcf4` | Hover states, secondary accent            |

## Pages

### Homepage (`/`)

- 3D animated book cover carousel (4 rows, Google Books covers)
- Transparent navbar that fades to solid on scroll
- Feature cards, popular books, reviews, lists sections
- Hero with logo + tagline + CTA

### Auth Pages (`/sign-in`, `/sign-up`, etc.)

- Split-screen: animated book cover mosaic (left) + form (right)
- Rotating literary quotes
- Google OAuth + email/password
- Post-signup profile completion (`/complete-profile`)

### Search (`/search`)

- Auto-focused debounced search input (400ms)
- ISBN auto-detection for exact-match
- Book result cards with cover art, authors, genre, description
- Searches Typesense first, falls back to Open Library + Google Books

### Profile (`/profile`)

- Avatar, display name, username
- Reading stats placeholders (Books, This year, Lists, Following)
- Account info (email, visibility, provider, member since)
- 4 favourite books slots
- Sign out

## Auth Flow

1. User clicks "Sign in with Google" or enters email/password
2. Supabase Auth handles OAuth/credentials, returns JWT
3. OAuth redirect → `/auth/callback` → checks if profile exists
4. New user → `/complete-profile` (choose username + display name)
5. Existing user → `/profile`
6. JWT stored in localStorage, read by Zustand auth store
7. `AuthProvider` syncs session state + fetches profile from API
8. `api.ts` reads token from Zustand store for every API request

## API Client

The `lib/api.ts` helper reads the JWT from the Zustand auth store (not from Supabase's `getSession()` — avoids deadlocks):

```typescript
import { api } from "@/lib/api";

const books = await api.get<Book[]>("/v1/books/search?q=dune");
const profile = await api.post("/v1/auth/register", { username, displayName });
```

## Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `pnpm dev`      | Start dev server (Turbopack)   |
| `pnpm build`    | Production build               |
| `pnpm start`    | Start production server        |
| `pnpm test`     | Run unit tests (Vitest)        |
| `pnpm test:e2e` | Run E2E tests (Playwright)     |
| `pnpm lint`     | Lint with ESLint               |
| `pnpm format`   | Check formatting with Prettier |

## Tests

**37 tests total** — 17 unit + 20 E2E.

```bash
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests (needs Playwright browsers: npx playwright install)
```

## Environment Variables

Copy `.env.example` to `.env`. Validated at runtime via `t3-oss/env-nextjs`.

| Variable                               | Required | Description                      |
| -------------------------------------- | -------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes      | Supabase project URL             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes      | Supabase publishable API key     |
| `NEXT_PUBLIC_APP_URL`                  | —        | Default: `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL`                  | —        | Default: `http://localhost:4000` |
| `NEXT_PUBLIC_CDN_URL`                  | —        | Cloudflare CDN URL               |
| `SENTRY_DSN`                           | —        | Error tracking                   |

## Development with Docker

When running via Docker Compose (from the `infra/` repo), the frontend source is volume-mounted for hot-reload. Environment variables come from `infra/.env`.

```bash
# From infra/ directory:
make dev            # Starts everything
make logs-frontend  # Tail frontend logs
make dev-rebuild    # Rebuild after adding npm packages
```

**Note:** The frontend uses `shamefully-hoist=true` in `.npmrc` because Turbopack can't resolve pnpm's strict symlinked `node_modules`.

## Deployment

The Dockerfile produces a standalone Next.js build (~200MB image). In production, it runs as a non-root `nextjs` user.

```bash
# Build production image
docker build -t shelvitas-frontend .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... \
  shelvitas-frontend
```

For VPS deployment, the `infra/` repo handles this via `make deploy`.
