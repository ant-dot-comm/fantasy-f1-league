/**
 * dispatchRaceWeekend.mjs
 * Schedule-driven entry point for the race-weekend automation (GitHub Actions).
 *
 * It reads data/raceSchedule.js + the current time to decide what's due, then runs
 * the matching scripts. No meeting keys to copy-paste. Safe to run on a frequent
 * cron: every step is idempotent, and it does nothing outside race windows.
 *
 *   - "qualifying" window (picks open):  storeRaceData → runAutoPicks
 *   - "race" window (race just ended):   storeRaceData → runCalculateScores
 *
 * Override the season with SEASON, or force a specific race/phase from the CLI by
 * running the individual npm scripts with MEETING_KEY set.
 */
import mongoose from "mongoose";
import { getCurrentRacePhase } from "../lib/utils/racePhase.js";
import { storeRaceData } from "./storeRaceData.mjs";
import { runAutoPicks } from "./runAutopicks.mjs";
import { runCalculateScores } from "./runCalculateScores.mjs";

async function main() {
  const season = process.env.SEASON || "2026";
  const now = new Date();
  const phase = getCurrentRacePhase(now, season);

  if (!phase) {
    console.log(`😴 ${now.toISOString()} — no race window active for season ${season}. Nothing to do.`);
    return;
  }

  const { meetingKey } = phase;
  console.log(`🏁 ${now.toISOString()} — phase="${phase.phase}", meeting_key=${meetingKey}, season=${season}`);

  if (phase.phase === "qualifying") {
    console.log("➡️  [1/2] Storing qualifying data...");
    await storeRaceData(season, meetingKey);
    console.log("➡️  [2/2] Assigning auto-picks...");
    await runAutoPicks({ season, meetingKey });
  } else if (phase.phase === "race") {
    console.log("➡️  [1/2] Storing race results...");
    await storeRaceData(season, meetingKey);
    console.log("➡️  [2/2] Calculating scores...");
    await runCalculateScores(Number(season), String(meetingKey));
  }

  console.log("✅ Dispatch complete.");
}

main()
  .catch((err) => {
    console.error("❌ Dispatch failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Scripts no longer call process.exit(), so close the shared connection
    // ourselves to let Node exit cleanly.
    await mongoose.connection.close().catch(() => {});
    process.exit(process.exitCode || 0);
  });
