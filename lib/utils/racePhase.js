/**
 * racePhase – single source of truth for "what should run right now", derived
 * purely from data/raceSchedule.js timestamps. This is what lets the automation
 * figure out which race + phase we're in without anyone copy-pasting meeting keys.
 *
 * The 2026 schedule entries store times in explicit UTC (…Z), so all comparisons
 * here are timezone-safe regardless of where this runs (GitHub runners are UTC).
 */
import raceSchedule from "../../data/raceSchedule.js";

// How long after a race ends we keep re-running store-results + calculate-scores.
// OpenF1 usually has final results within an hour or two; we keep trying (idempotently)
// across several hourly runs to be safe. Override with POST_RACE_WINDOW_HOURS.
const POST_RACE_WINDOW_HOURS = Number(process.env.POST_RACE_WINDOW_HOURS ?? 12);

/**
 * Determine the current race-weekend phase for a season, or null if nothing is due.
 *
 * @param {Date}   now    - reference time (defaults to now)
 * @param {string} season - season year as a string (defaults to SEASON env or "2026")
 * @returns {{ phase: "qualifying" | "race", meetingKey: string, season: string } | null}
 *
 * Phases:
 *  - "qualifying": picks are open (quali done, race not started) →
 *                  store qualifying data, then assign auto-picks.
 *  - "race":       the race has ended (within POST_RACE_WINDOW_HOURS) →
 *                  store race results, then calculate scores.
 */
export function getCurrentRacePhase(
  now = new Date(),
  season = process.env.SEASON || "2026"
) {
  const year = Number(season);
  const entries = Object.entries(raceSchedule);

  // 1) Post-race window takes priority: a finished race is the most time-sensitive
  //    thing to process (results + scores).
  for (const [meetingKey, data] of entries) {
    if (!data.race_end) continue;
    const raceEnd = new Date(data.race_end);
    if (raceEnd.getUTCFullYear() !== year) continue;
    const windowEnd = new Date(raceEnd.getTime() + POST_RACE_WINDOW_HOURS * 3600 * 1000);
    if (now >= raceEnd && now < windowEnd) {
      return { phase: "race", meetingKey, season: String(season) };
    }
  }

  // 2) Picks-open window (after qualifying, before race start): store quali data
  //    and assign auto-picks. Mirrors runAutopicks' original schedule logic.
  const open = entries.filter(([, data]) => {
    if (!data.picks_open || !data.picks_close) return false;
    const o = new Date(data.picks_open);
    const c = new Date(data.picks_close);
    return o.getUTCFullYear() === year && now >= o && now < c;
  });
  if (open.length > 0) {
    // At most one race should be open at a time; if somehow more, take the one
    // closing soonest.
    open.sort((a, b) => new Date(a[1].picks_close) - new Date(b[1].picks_close));
    const [meetingKey] = open[0];
    return { phase: "qualifying", meetingKey, season: String(season) };
  }

  return null;
}

export default getCurrentRacePhase;
