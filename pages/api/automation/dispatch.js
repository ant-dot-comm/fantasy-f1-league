/**
 * GET /api/automation/dispatch  — runs the race-weekend pipeline server-side.
 *
 * This is the reliable replacement for the GitHub Actions cron (which GitHub
 * throttles to every few hours on free repos). A Claude cloud routine calls
 * this hourly during race weekends; it self-throttles so it does real work at
 * most once per few minutes, and every step is idempotent + guarded (it never
 * overwrites a valid pick — see [[picks-never-override]]).
 *
 *   - qualifying window: storeRaceData -> reconcilePicks -> runAutoPicks
 *   - race window:       storeRaceData -> runCalculateScores
 *
 * No auth token is required (safe, idempotent, returns no personal data), but a
 * throttle guard bounds how often the heavy work runs. Pass ?force=1 to bypass
 * the throttle for a manual kick.
 */
import dbConnect from "../../../lib/mongodb";
import Race from "../../../models/Race";
import { getCurrentRacePhase } from "../../../lib/utils/racePhase";
import { reconcilePicks } from "../../../lib/utils/reconcilePicks";
import { storeRaceData } from "../../../scripts/storeRaceData.mjs";
import { runAutoPicks } from "../../../scripts/runAutopicks.mjs";
import { runCalculateScores } from "../../../scripts/runCalculateScores.mjs";

// Allow the OpenF1 fetch loop time to finish (Hobby caps at 60s).
export const config = { maxDuration: 60 };

const MIN_INTERVAL_MS = 5 * 60 * 1000; // real work at most once per 5 min

export default async function handler(req, res) {
  await dbConnect();

  const season = String(req.query.season || process.env.SEASON || "2026");
  const now = new Date();
  const phase = getCurrentRacePhase(now, season);

  if (!phase) {
    return res.status(200).json({ ran: false, reason: "no active race window", at: now.toISOString() });
  }

  const { meetingKey } = phase;
  const race = await Race.findOne({ meeting_key: meetingKey });

  // --- Throttle guard (skip if we ran very recently; ?force=1 bypasses) ---
  if (
    race?.lastDispatchAt &&
    now - new Date(race.lastDispatchAt) < MIN_INTERVAL_MS &&
    req.query.force !== "1"
  ) {
    return res.status(200).json({
      ran: false,
      reason: "throttled (ran recently)",
      phase: phase.phase,
      meetingKey,
      lastDispatchAt: race.lastDispatchAt,
    });
  }
  // Mark start so concurrent calls don't double-run (doc exists after first store).
  if (race) await Race.updateOne({ meeting_key: meetingKey }, { $set: { lastDispatchAt: now } });

  const steps = [];
  try {
    if (phase.phase === "qualifying") {
      await storeRaceData(season, meetingKey);
      steps.push("storeRaceData");
      const rec = await reconcilePicks({ season, meetingKey });
      steps.push(`reconcile(${rec?.changes?.length ?? 0} swaps)`);
      await runAutoPicks({ season, meetingKey });
      steps.push("autopicks");
    } else {
      await storeRaceData(season, meetingKey);
      steps.push("storeRaceData");
      await runCalculateScores(Number(season), String(meetingKey));
      steps.push("scores");
    }
    // Stamp again on success (covers the first-ever run where the doc was created mid-way).
    await Race.updateOne({ meeting_key: meetingKey }, { $set: { lastDispatchAt: new Date() } });
    return res.status(200).json({ ran: true, phase: phase.phase, meetingKey, steps });
  } catch (e) {
    console.error("❌ dispatch error:", e);
    return res.status(500).json({ ran: false, phase: phase.phase, meetingKey, steps, error: String(e?.message || e) });
  }
}
