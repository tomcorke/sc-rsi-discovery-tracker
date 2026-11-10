# sc-rsi-discovery-tracker

React single-page application for tracking Star Citizen’s RSI Discovery Month. Transport, Collection, and Defense each have a themed slider, exact point entry, tier shortcuts, and a reward manifest. Overall progress automatically adds the three tracks, up to 30,000 points. Contract recommendations show the number of runs remaining as progress changes.

Progress is saved locally in this browser, with a confirmation before resetting all tracks. The app requires no account, backend, credentials, or external asset requests. If browser storage is unavailable, tracking remains usable for the current session.

Event content follows the [Citizen Starter Guide](https://citizen-starter-guide.com/star-citizen-rsi-discovery-month-event-guide/), checked 10 November 2026, with attribution and patch-sensitive estimates shown in the app. The guide’s author also documents [contract unlock prerequisites](https://robertsspaceindustries.com/community-hub/post/rsi-discovery-month-guide-fast-finish-contracts-neCc2GRpMhr1t). The field guide explains party splitting: the calculated Overall total can exceed the in-game total after certain shared Collection contracts. Reaching a tier in this manual tracker does not verify an account reward.

## Publishing

The public site is <https://rsi-discovery.corke.dev/>. GitHub Pages serves the root of the `publish` branch, following the same setup as `sc-fleet-matrix`. That branch contains only the production `dist/` output, while `main` contains the application source.

Build with `pnpm build` before publishing. Vite copies `public/CNAME` and `public/.nojekyll` into `dist/` so each deployment preserves the custom domain and serves the compiled assets directly. Publish commits should record the source commit in a `Source-main-commit` message trailer.

## Setup

Use Node.js 26.13.0 or a newer Node.js 26 release and pnpm 10.32.1. The project pins Node.js 26.13.0 for pnpm scripts; pnpm downloads that runtime automatically without changing the system Node.js installation.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:5173>. No environment variables or account credentials are required.

## Commands

| Command             | Purpose                                                      |
| ------------------- | ------------------------------------------------------------ |
| `pnpm dev`          | Run the local development server                             |
| `pnpm lint`         | Check TypeScript, JavaScript, and CSS                        |
| `pnpm typecheck`    | Check TypeScript without emitting JavaScript                 |
| `pnpm test`         | Test point bounds, saved data, totals, and tier thresholds   |
| `pnpm test:e2e`     | Test tracker interactions and responsive layouts in Chromium |
| `pnpm format:check` | Check formatting                                             |
| `pnpm format`       | Apply formatting                                             |
| `pnpm build`        | Type-check and build static assets into `dist/`              |
| `pnpm preview`      | Serve the production build at <http://127.0.0.1:4173>        |

Installing dependencies enables the Git pre-commit hook, which lints and formats staged files. Browser tests start the Vite server automatically. Install Chromium once with `pnpm exec playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing compatible Chromium executable. Tests cover keyboard sliders, tier boundaries, exact input, saved progress, reset, unavailable storage, and widths from 320 to 1440 pixels.

The browser entry point is `src/main.tsx`. Components use co-located CSS modules; shared style tokens are in `src/styles/tokens.css`. `src/event.ts` contains application-facing event data and progress calculations. Maintained sourced research belongs in the separate `star-citizen-knowledge-base` repository. This app uses section anchors and needs only static hosting of `dist/`.
