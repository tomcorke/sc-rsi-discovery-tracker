# sc-rsi-discovery-tracker

React single-page application built with TypeScript and Vite. The initial project contains a minimal start page; discovery tracking and RSI integration are yet to be implemented.

## Setup

Use Node.js 26.13.0 or a newer Node.js 26 release and pnpm 10.32.1. The project pins Node.js 26.13.0 for pnpm scripts; pnpm downloads that runtime automatically without changing the system Node.js installation.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:5173>. No environment variables or account credentials are required.

## Commands

| Command             | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| `pnpm dev`          | Run the local development server                      |
| `pnpm lint`         | Check TypeScript, JavaScript, and CSS                 |
| `pnpm typecheck`    | Check TypeScript without emitting JavaScript          |
| `pnpm format:check` | Check formatting                                      |
| `pnpm format`       | Apply formatting                                      |
| `pnpm build`        | Type-check and build static assets into `dist/`       |
| `pnpm preview`      | Serve the production build at <http://127.0.0.1:4173> |

Installing dependencies enables the Git pre-commit hook, which lints and formats staged files. No tests are configured yet; add behavior tests as application features are introduced.

The browser entry point is `src/main.tsx`. Components use co-located CSS modules; shared style tokens are in `src/styles/tokens.css`. The app currently has no backend or client-side router. A future deployment using browser routes will need an `index.html` fallback.
