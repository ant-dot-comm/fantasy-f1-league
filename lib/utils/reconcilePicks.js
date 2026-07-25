/**
 * reconcilePicks – keep every stored pick inside the current "bottom" pool
 * (qualifying positions P11–P22) while picks are open. Quali penalties can move
 * a driver a player already picked up into the top 10, which makes that pick
 * illegal; this swaps ONLY that pick for a random eligible driver and leaves the
 * valid pick alone.
 *
 * Safety rules (see [[picks-never-override]]):
 *  - user.picks is a Mongoose Map of Maps → read with .get(), write with a
 *    dot-path $set. Bracket access on a Map silently returns undefined.
 *  - Only ever change a pick we can POSITIVELY confirm is now in the top 10.
 *    Never touch a valid pick, and never act on an incomplete grid.
 */
import dbConnect from "../mongodb.js";
import User from "../../models/User.js";
import Race from "../../models/Race.js";

const POOL_MIN = 11; // first eligible qualifying position
const POOL_MAX = 22; // last eligible qualifying position

const isEligible = (pos) => typeof pos === "number" && pos >= POOL_MIN && pos <= POOL_MAX;
const isTopTen = (pos) => typeof pos === "number" && pos >= 1 && pos < POOL_MIN; // 1..10

/**
 * Pure decision logic (no DB) — easy to unit test.
 * Replaces ONLY picks confirmed to be in the top 10, with a random pool driver
 * not already picked. Unknown drivers (not in the grid) are left untouched.
 *
 * @returns {{ newPicks: number[], replaced: {out:number,outPos:number,in:number}[] }}
 */
export function computeReplacements({ picks, posByDriver, pool, rng = Math.random }) {
  const newPicks = [...picks];
  const replaced = [];
  for (let i = 0; i < newPicks.length; i++) {
    const dn = newPicks[i];
    const pos = posByDriver.get(dn);
    if (!isTopTen(pos)) continue; // only touch confirmed top-10 picks
    const candidates = pool.filter((p) => !newPicks.includes(p));
    if (candidates.length === 0) break; // nothing legal left to give (shouldn't happen)
    const replacement = candidates[Math.floor(rng() * candidates.length)];
    replaced.push({ out: dn, outPos: pos, in: replacement });
    newPicks[i] = replacement;
  }
  return { newPicks, replaced };
}

/**
 * @param {{ season: string|number, meetingKey: string|number, dryRun?: boolean }} args
 * @returns {Promise<{ skipped?: string, changes: Array }>}
 */
export async function reconcilePicks({ season, meetingKey, dryRun = false }) {
  await dbConnect();
  const seasonKey = String(season);
  const meetingKeyStr = String(meetingKey);

  const race = await Race.findOne({ meeting_key: meetingKeyStr }).lean();
  if (!race || !Array.isArray(race.qualifying_results) || race.qualifying_results.length === 0) {
    console.log(`🔁 reconcilePicks: no qualifying grid stored for ${meetingKeyStr}; skipping.`);
    return { skipped: "no-grid", changes: [] };
  }

  // Build driverNumber → grid position map.
  const posByDriver = new Map();
  for (const d of race.qualifying_results) {
    if (typeof d.finishPosition === "number" && d.finishPosition > 0) {
      posByDriver.set(d.driverNumber, d.finishPosition);
    }
  }

  // 🔒 Safety guard: only act on a grid that looks final. We must be able to
  // trust "moved into the top 10", so require positions 1..10 all present and a
  // usable pool. Otherwise a partial OpenF1 response could wrongly reset picks.
  const presentPositions = new Set(posByDriver.values());
  const topComplete = Array.from({ length: POOL_MIN - 1 }, (_, i) => i + 1)
    .every((p) => presentPositions.has(p));
  const pool = race.qualifying_results
    .filter((d) => isEligible(d.finishPosition))
    .map((d) => d.driverNumber);

  if (!topComplete || pool.length < 2) {
    console.log(
      `🔁 reconcilePicks: grid for ${meetingKeyStr} looks incomplete ` +
      `(top-10 complete=${topComplete}, pool=${pool.length}); skipping to avoid resetting on partial data.`
    );
    return { skipped: "incomplete-grid", changes: [] };
  }

  const users = await User.find({ seasons: Number(season) }); // non-lean → use .get()
  const changes = [];
  const adjustmentEvents = [];

  for (const user of users) {
    // 🔒 Read via .get() — bracket access on a Mongoose Map returns undefined.
    const seasonMap = user.picks?.get?.(seasonKey);
    const pickDoc = seasonMap?.get?.(meetingKeyStr);
    if (!pickDoc) continue;
    const data = pickDoc.toObject?.() ?? pickDoc;
    const picks = data?.picks;
    if (!Array.isArray(picks) || picks.length === 0) continue;

    const { newPicks, replaced } = computeReplacements({ picks, posByDriver, pool });
    if (replaced.length === 0) continue;

    if (!dryRun) {
      // 🔒 Write via dot-path $set (works through the Map layers).
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            [`picks.${seasonKey}.${meetingKeyStr}.picks`]: newPicks,
            [`picks.${seasonKey}.${meetingKeyStr}.penaltyAdjusted`]: true,
          },
        }
      );
    }

    changes.push({ username: user.username, before: picks, after: newPicks, replaced });
    for (const r of replaced) {
      adjustmentEvents.push({
        username: user.username,
        driverOut: r.out,
        driverIn: r.in,
        positionOut: r.outPos,
        at: new Date(),
      });
    }
    console.log(
      `${dryRun ? "🔎 [dry-run] would reconcile" : "🔧 Reconciled"} ${user.username}: ` +
      replaced.map((r) => `${r.out}(P${r.outPos})→${r.in}`).join(", ")
    );
  }

  // Append events to the Race log so the status endpoint / email agent can report them.
  if (!dryRun && adjustmentEvents.length > 0) {
    await Race.updateOne(
      { meeting_key: meetingKeyStr },
      { $push: { penaltyAdjustments: { $each: adjustmentEvents } } }
    );
  }

  console.log(`🔁 reconcilePicks${dryRun ? " [dry-run]" : ""}: ${changes.length} user(s) adjusted for ${meetingKeyStr}.`);
  return { changes };
}

export default reconcilePicks;
