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

## Race weekend scripts

Each race weekend you should run scripts **after qualifying** and **after the race** so the app has picks, results, and scores.

| When | What to run | Command |
|------|-------------|--------|
| **After qualifying** (once quali results are in) | 1. Store qualifying data for the current race | `npm run storeracedata` |
| Same run | 2. Auto-assign picks for users who didn’t make selections | `npm run runautopicks` |
| **After the race** (once official race results are in) | 3. Store updated race results + DNFs from OpenF1 | `npm run storeracedata` |
| Same run | 4. Calculate and save scores for all users | `npm run runcalculatescores` |

- **Order:** Within each phase, run the commands in the order shown. The auto-picks script depends on qualifying data; score calculation depends on stored quali + race data.
- **Single race:** To process one weekend only, set the `meeting_key` in `scripts/storeRaceData.mjs`, `currentMeetingKey` in `scripts/runAutopicks.mjs`, and `MEETING_KEY` in `scripts/runCalculateScores.mjs` to that race’s key (e.g. `"1279"`). Leave them unset/empty to run for the full season.
