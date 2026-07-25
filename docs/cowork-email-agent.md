# Cowork email-draft agent

A scheduled Claude (Cowork) agent that reads the league's automation status and
**creates Gmail drafts for you to review and send** — one when picks open, and
one when a qualifying penalty changed the grid and players should re-check their
picks. It never sends anything itself; you review every draft.

## How it fits together

```
GitHub Actions (every 20 min)        Your app (Vercel)              Cowork agent (scheduled)
  dispatchRaceWeekend.mjs   ──►  /api/automation/status  ◄──  reads status, drafts Gmail
  (stores grid, reconciles picks)   (JSON: pool, deadline,        emails into YOUR mailbox
                                     penaltyAdjustments)
```

The app side ships in this repo (`pages/api/automation/status.js` + the
`penaltyAdjustments` log). The agent + Gmail connector are set up once in Claude.

## One-time setup

1. **Authorize the Gmail connector** in Claude/Cowork (Settings → Connectors →
   Gmail). This is what lets the agent create drafts. *(Claude cannot do this
   OAuth for you.)*
2. **Set the status token in Vercel.** The endpoint (running on the deployed
   Vercel app) accepts `AUTOMATION_TOKEN` or, if that isn't set, `CRON_SECRET`.
   Make sure one of them exists under Vercel → Project → Settings → Environment
   Variables (this is separate from your local `.env.local`). Use that value as
   `<TOKEN>` below.
3. **Confirm the endpoint works** (replace `<TOKEN>`):
   ```bash
   curl -s -H "Authorization: Bearer <TOKEN>" \
     "https://fantasy-f1-league.vercel.app/api/automation/status" | jq
   ```
   Outside a race window it returns `{"phase":null,...}`.

## Create the scheduled agent

Create a scheduled Cowork task running **hourly** (or every 30 min during race
weekends) with the prompt below. It's idempotent-friendly: tell it to only draft
when there's something new so you don't get duplicate drafts.

### Agent prompt

```
You help run a fantasy F1 league. Every run, call this endpoint:

  GET https://fantasy-f1-league.vercel.app/api/automation/status
  Header: Authorization: Bearer <TOKEN>

It returns JSON: { phase, meetingKey, raceName, picks_open, picks_close,
isPicksOpen, bottomDrivers[], penaltyAdjustments[] }.

Decide what to do:

1) If isPicksOpen is true AND you have not already drafted a "picks open" email
   for this meetingKey, create a Gmail DRAFT (do not send):
   - Subject: "🏁 Picks are open — {raceName}"
   - Body: picks are open, deadline is {picks_close} (show in a friendly local
     time), and list the eligible "bottom" drivers from bottomDrivers
     (position + fullName). Link: https://fantasy-f1-league.vercel.app

2) If penaltyAdjustments is non-empty AND contains entries you have not already
   drafted about (dedupe by username+driverOut+at), create a Gmail DRAFT:
   - Subject: "⚠️ Grid changed — re-check your pick for {raceName}"
   - Body: qualifying penalties moved some drivers, so a few auto-picks were
     adjusted. List each affected player: "{username}: {driverOutName} → {driverInName}".
     Remind them picks are still open until {picks_close} and they can change
     their pick at https://fantasy-f1-league.vercel.app

Always create DRAFTS only — never send. If nothing is new, do nothing.
Keep track (in your own notes/memory) of what you've already drafted per
meetingKey so you don't create duplicates.
```

Replace `<TOKEN>` with your real token. Adjust the recipient list (your league
distribution) in Gmail when you review the draft.

## Notes

- The endpoint returns **usernames only, never emails** — the drafts are a single
  league-wide announcement you address in Gmail, not per-player mail.
- `penaltyAdjustments` only grows when a pick is actually swapped, so a "grid
  changed" draft is created only on real penalty changes.
- If you'd rather not use Cowork/Gmail, the app already has `lib/email.js`
  (nodemailer) and could auto-send instead — but that removes the review step.
