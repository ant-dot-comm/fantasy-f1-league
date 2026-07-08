This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

## Race weekend automation

Race-weekend processing runs **automatically via GitHub Actions** — no more copying meeting keys.

The workflow [`.github/workflows/race-weekend.yml`](.github/workflows/race-weekend.yml) runs **hourly** and calls `scripts/dispatchRaceWeekend.mjs`. That dispatcher reads [`data/raceSchedule.js`](data/raceSchedule.js) and the current time to decide what (if anything) is due, then runs the right scripts. It no-ops outside race windows and every step is idempotent, so running it repeatedly is safe.

| Phase (auto-detected from the schedule) | Window | Runs |
|---|---|---|
| **After qualifying** | `picks_open ≤ now < picks_close` | `storeRaceData` → `runAutopicks` |
| **After the race** | `race_end ≤ now < race_end + 12h` | `storeRaceData` → `runCalculateScores` |

Because manual picks override auto-picks right up until race start ([`submitPicks.js`](pages/api/submitPicks.js)), running auto-picks throughout the picks window is safe and also covers late joiners.

### One-time setup

1. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `MONGODB_URI` — Value: your production Mongo connection string (same one in `.env.local`).
   - *(Optional)* `POST_RACE_WINDOW_HOURS` as a **variable** to change the 12-hour post-race retry window.
2. Merge this workflow to the **`main`** branch (scheduled workflows only run from the default branch).
3. That's it. Verify from the **Actions** tab → *Race weekend automation* → **Run workflow** (manual trigger) — outside a race window it should log "no race window active".

### Running manually (fallback / one-off)

The individual scripts still work and now take the meeting key from the environment (no file edits needed):

| When | What to run | Command |
|------|-------------|--------|
| **After qualifying** | Store qualifying data | `MEETING_KEY=1290 npm run storeracedata` |
| Same run | Auto-assign picks for users who didn’t select | `MEETING_KEY=1290 npm run runautopicks` |
| **After the race** | Store race results + DNFs | `MEETING_KEY=1290 npm run storeracedata` |
| Same run | Calculate and save scores | `MEETING_KEY=1290 npm run runcalculatescores` |

- Or run the whole schedule-aware flow at once: `npm run dispatch` (auto-detects the current race/phase).
- Leave `MEETING_KEY` unset on any script to auto-detect the current race from the schedule.

> **Note:** Like the original scripts, automation handles the **main qualifying + race** only. Sprint sessions are not auto-processed.
