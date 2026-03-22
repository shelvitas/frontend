# 🚀 frontend

A **batteries-included** starter kit for building production-ready frontend applications with Next.js. Opinionated, modern, and ready to ship.

---

## ✨ Features

| Category                     | Tool / Library                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| **Framework**                | [Next.js](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/)         |
| **Package Manager**          | [pnpm](https://pnpm.io/)                                                               |
| **Styling**                  | [Tailwind CSS](https://tailwindcss.com/)                                               |
| **Component Library**        | [shadcn/ui](https://ui.shadcn.com/) (Button, Input, Card, Dialog, Toast)               |
| **Linting**                  | [ESLint](https://eslint.org/) (Airbnb style guide)                                     |
| **Formatting**               | [Prettier](https://prettier.io/)                                                       |
| **Unit / Integration Tests** | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)  |
| **E2E Tests**                | [Playwright](https://playwright.dev/)                                                  |
| **Pre-commit Hooks**         | [Husky](https://typicode.github.io/husky/)                                             |
| **Server State**             | [TanStack Query](https://tanstack.com/query)                                           |
| **Client State**             | [Zustand](https://zustand-demo.pmnd.rs/)                                               |
| **Schema Validation**        | [Zod](https://zod.dev/)                                                                |
| **Env Validation**           | [@t3-oss/env-nextjs](https://env.t3.gg/) (powered by Zod)                              |
| **Error Tracking**           | [Sentry](https://sentry.io/)                                                           |
| **Bundle Analysis**          | [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)           |
| **Containerization**         | [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/) |
| **CI/CD**                    | [GitHub Actions](https://github.com/features/actions)                                  |
| **Deployment**               | [Vercel](https://vercel.com/)                                                          |
| **Code Quality**             | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Claude plugin)            |

---

## 📁 Project Structure

```
frontend/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD pipeline
├── .husky/
│   └── pre-commit                 # Pre-commit hook
├── app/
│   ├── (public)/                  # Public-facing pages
│   │   └── page.tsx
│   ├── api/
│   │   └── og/
│   │       └── route.tsx          # OpenGraph image generation
│   ├── error.tsx                  # Global error boundary
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   ├── not-found.tsx              # Custom 404 page
│   ├── providers.tsx              # App-wide providers (QueryClient, etc.)
│   └── sitemap.ts                 # Auto-generated sitemap
├── components/
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── toast.tsx
├── e2e/                           # Playwright E2E tests
├── lib/
│   ├── env.ts                     # @t3-oss/env-nextjs config
│   └── utils.ts
├── public/                        # Static assets
├── store/                         # Zustand stores
├── tests/                         # Vitest unit/integration tests
├── .node-version                  # Pinned Node.js version
├── .nvmrc                         # nvm Node.js version pin
├── .prettierrc
├── .eslintrc.js
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── playwright.config.ts
├── postcss.config.js
├── sentry.client.config.ts
├── sentry.edge.config.ts
├── sentry.server.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: See [`.node-version`](.node-version) for the pinned version. Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage versions.
- **pnpm**: Install globally via `npm install -g pnpm`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/projekt-xlr8/frontend.git
cd frontend

# 2. Use the correct Node version
nvm use
# or
fnm use

# 3. Install dependencies
pnpm install

# 4. Copy environment variables
cp .env.example .env.local
```

### Environment Variables

This project uses [`@t3-oss/env-nextjs`](https://env.t3.gg/) for type-safe, validated environment variables. All variables are declared in `lib/env.ts`.

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sentry (optional during local dev)
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
NEXT_PUBLIC_SENTRY_DSN=
```

> The app will throw a build-time error if required environment variables are missing or malformed.

### Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Start the development server        |
| `pnpm build`      | Build for production                |
| `pnpm start`      | Start the production server         |
| `pnpm lint`       | Run ESLint                          |
| `pnpm lint:fix`   | Run ESLint and auto-fix issues      |
| `pnpm format`     | Check formatting with Prettier      |
| `pnpm format:fix` | Format all files with Prettier      |
| `pnpm test`       | Run unit/integration tests (Vitest) |
| `pnpm test:e2e`   | Run E2E tests (Playwright)          |
| `pnpm precommit`  | Run the full pre-commit check suite |
| `pnpm analyze`    | Build with bundle analyzer enabled  |

---

## 🔍 Code Quality

### ESLint

Extends the **Airbnb style guide** with TypeScript and React-specific rules.

```bash
pnpm lint        # Check for issues
pnpm lint:fix    # Auto-fix where possible
```

### Prettier

Consistent code formatting across the entire codebase.

```bash
pnpm format      # Check formatting
pnpm format:fix  # Apply formatting
```

### Pre-commit Hooks (Husky)

Every commit automatically runs the following checks via Husky:

1. ✅ **TypeScript type check** — ensures there are no type errors (`tsc --noEmit`)
2. 🔍 **ESLint** — lints and auto-fixes issues (`pnpm lint:fix`)
3. 🎨 **Prettier** — formats files (`pnpm format:fix`)
4. 🧪 **Tests** — runs the full test suite (`pnpm test`)
5. 🏗️ **Build** — ensures the production build succeeds (`pnpm build`)

> If any step fails, the commit is blocked until the issues are resolved.

---

## 🧪 Testing

### Unit & Integration Tests (Vitest + React Testing Library)

```bash
pnpm test             # Run all tests
pnpm test --watch     # Watch mode
pnpm test --coverage  # With coverage report
```

Test files should be co-located with the source or placed in the `tests/` directory, following the `*.test.ts(x)` naming convention.

### E2E Tests (Playwright)

```bash
pnpm test:e2e                    # Run all E2E tests (headless)
pnpm test:e2e --ui               # Open Playwright UI
pnpm test:e2e --headed           # Run in headed browser mode
pnpm test:e2e --debug            # Debug mode
```

E2E tests live in the `e2e/` directory.

---

## 🗂️ State Management

### Server State — TanStack Query

Used for all async data fetching, caching, and synchronisation with the server. Wrap your data-fetching logic in query/mutation hooks under `lib/queries/`.

### Client State — Zustand

Used for UI state that doesn't need to go to the server. Stores are located in `store/` and follow the slice pattern.

---

## 🛡️ Schema Validation (Zod)

[Zod](https://zod.dev/) is used throughout the project for runtime type safety and validation:

- **API responses** — validate server data before it enters your app
- **Form inputs** — pair with React Hook Form or TanStack Form for end-to-end type safety
- **Environment variables** — `@t3-oss/env-nextjs` uses Zod schemas under the hood in `lib/env.ts`
- **Shared types** — define schemas once and infer TypeScript types from them

```ts
// Example: lib/schemas/user.ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;
```

---

## 🗺️ Routing & Pages

The app uses Next.js [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) to separate concerns:

| Route Group | Purpose                                     |
| ----------- | ------------------------------------------- |
| `(public)`  | Marketing, landing pages — no auth required |

> Add more route groups (e.g., `(auth)`, `(app)`) as your application grows.

---

## 📊 Bundle Analysis

To inspect your JavaScript bundle:

```bash
pnpm analyze
```

This builds the app and opens the bundle analyzer in your browser, powered by `@next/bundle-analyzer`.

---

## 🐛 Error Tracking (Sentry)

Sentry is configured for client, server, and edge runtimes:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

Set your `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in `.env.local` to enable error tracking. Source maps are automatically uploaded during production builds.

---

## 🐳 Docker

### Development

```bash
docker compose up
```

### Production Build

```bash
docker build -t frontend .
docker run -p 3000:3000 frontend
```

---

## 🚦 CI/CD

GitHub Actions runs the following pipeline on every push and pull request:

1. **Install** dependencies via pnpm
2. **Type check** with `tsc --noEmit`
3. **Lint** with ESLint
4. **Format check** with Prettier
5. **Unit tests** with Vitest
6. **E2E tests** with Playwright
7. **Build** for production

On merge to `main`, the app is automatically deployed to **Vercel**.

---

## 🌐 SEO

- **Metadata**: Configured via Next.js `metadata` export in layouts and pages
- **OpenGraph Images**: Dynamically generated at `app/api/og/route.tsx`
- **Sitemap**: Auto-generated at `app/sitemap.ts`

---

## 🚨 Error Pages

Custom error pages are provided instead of the Next.js defaults:

| File                | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `app/not-found.tsx` | Custom 404 page                          |
| `app/error.tsx`     | Global error boundary (500-level errors) |

---

## 🔌 Claude Plugin

This project uses **[pbakaus/impeccable](https://github.com/pbakaus/impeccable)** as a Claude plugin for code quality assistance directly in your editor.

---

## 📦 Adding shadcn/ui Components

Only the following components are pre-installed: `Button`, `Input`, `Card`, `Dialog`, `Toast`.

To add more:

```bash
pnpx shadcn@latest add <component-name>
```

See the [shadcn/ui docs](https://ui.shadcn.com/docs/components) for a full list.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes (pre-commit hooks will run automatically)
4. Push and open a pull request

---

## 📄 License

MIT
