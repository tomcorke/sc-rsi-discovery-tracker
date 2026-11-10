# sc-rsi-discovery-tracker

React single-page application for tracking Star Citizen’s RSI Discovery Month. Transport, Collection, and Defense each have a themed slider, exact point entry, tier shortcuts, and a reward manifest. Overall progress automatically adds the three tracks, up to 30,000 points. A searchable mission catalogue covers 29 reported repeatable missions (14 Transport, 6 Collection, 9 Defense) with one-click completion logging and remaining-run estimates. The one-time rental and unreleased Scavenger Hunt are separate opt-in records.

Progress is saved locally in this browser, with a confirmation before resetting all tracks. The app requires no account, backend, credentials, or external asset requests. If browser storage is unavailable, tracking remains usable for the current session.

Event rewards follow the [Citizen Starter Guide](https://citizen-starter-guide.com/star-citizen-rsi-discovery-month-event-guide/). The mission catalogue cross-checks [community game data](https://api.star-citizen.wiki/api/missions?filter%5Btitle%5D=RSI%20Disc.&page%5Bsize%5D=1000), [wiki tables](https://starcitizen.tools/RSI_Discovery_Event), [VerseHub](https://versehub.space/events/discovery-month), and [SC Damage Simulator](https://sc-damage-simulator.com/events), checked 10 November 2026. Each mission includes source links, requirements, reported unlock points and fees, sharing caveats, and measured completion estimates only where available.

This is an Alpha 4.10.2 catalogue, not verified current mission-board availability. Published event dates precede the check date. Conflicting reports are kept beside the relevant data, including the provisional 167-point Clear Hostiles award (some sources list 164) and uncertain rental availability. Medium UCM is 255 points; large is 486. Raw game-data time budgets are not presented as measured run times or verified countdowns. Listed credit fees are not net profit or guaranteed per-member payouts.

The field guide explains party splitting: the calculated Overall total can exceed the in-game total after certain shared Collection contracts. Sharing is not guaranteed by community reports; some raw shareability flags disagree. Reaching a tier in this manual tracker does not verify an account reward. Beryl + Iron is a two-contract logging shortcut, not an extra mission.

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

The browser entry point is `src/main.tsx`. Components use co-located CSS modules; shared style tokens are in `src/styles/tokens.css`. `src/event.ts` contains rewards and progress calculations; `src/missionData.ts` contains the application-facing catalogue; `src/missions.ts` holds its types and filtering. Maintained research is in the separate `star-citizen-knowledge-base` repository at `knowledge/topics/gameplay/discovery-month-missions.md` (local research commit `36f115e`). This app uses section anchors and needs only static hosting of `dist/`.
