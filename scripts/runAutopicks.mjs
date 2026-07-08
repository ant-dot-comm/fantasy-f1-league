/**
 * runAutopicks.mjs
 * Assigns random auto-picks (two drivers from P11–P22 in qualifying) to users who
 * haven't made picks for the target race. Uses race schedule to determine which
 * race to run for; never overwrites existing autopicks or manual picks.
 */
import { pathToFileURL } from "url";
import dbConnect from "../lib/mongodb.js";
import User from "../models/User.js";
import Race from "../models/Race.js";
import raceSchedule from "../data/raceSchedule.js";

// --- Config (override via env) ---
const SEASON = process.env.SEASON || "2026";
// Optional: set MEETING_KEY to force a specific race (e.g. MEETING_KEY=1279 node scripts/runAutopicks.mjs)
const MEETING_KEY_ENV = process.env.MEETING_KEY;

/**
 * Resolve which meeting (race) to run autopicks for.
 * - If an explicit key is passed (from the dispatcher), use that.
 * - Else if MEETING_KEY is set in env, use that.
 * - Otherwise find the race that currently has picks open: picks_open is in the past
 *   and picks_close is in the future (so we don't override an earlier race).
 */
function getMeetingKeyFromSchedule(season, explicitKey = null) {
    if (explicitKey) return String(explicitKey);
    if (MEETING_KEY_ENV) return String(MEETING_KEY_ENV);
    const now = new Date();
    const year = Number(season);
    const withPicksOpen = Object.entries(raceSchedule).filter(([_, data]) => {
        if (!data.picks_open || !data.picks_close) return false;
        const open = new Date(data.picks_open);
        const close = new Date(data.picks_close);
        return open.getFullYear() === year && open < now && close > now;
    });
    if (withPicksOpen.length === 0) return null;
    // At most one race has picks open at a time; take the first (or earliest picks_close if multiple)
    withPicksOpen.sort((a, b) => new Date(a[1].picks_close) - new Date(b[1].picks_close));
    return withPicksOpen[0][0];
}

async function runAutoPicks({ season = SEASON, meetingKey = null } = {}) {
    // --- Step 1: Connect to DB ---
    await dbConnect();

    // --- Step 2: Resolve which race to run for (explicit key, MEETING_KEY env, or schedule) ---
    const currentMeetingKey = getMeetingKeyFromSchedule(season, meetingKey);
    if (!currentMeetingKey) {
        console.log(`⚠️ No race with picks currently open for season ${season} (picks_open < now < picks_close). Set MEETING_KEY to override.`);
        return;
    }
    console.log(`🚀 Running auto-picks for season ${season} on race ${currentMeetingKey}`);

    // --- Step 3: Load the race from DB (need qualifying_results for P11–P22) ---
    const race = await Race.findOne({ meeting_key: currentMeetingKey, year: season });
    if (!race) {
        console.log(`⚠️ No race found for meeting key ${currentMeetingKey}. Skipping auto-picks.`);
        return;
    }

    // --- Step 4: Load all users in this season ---
    const users = await User.find({ seasons: season });
    if (!users.length) {
        console.log("⚠️ No users found for season. Skipping auto-picks.");
        return;
    }
    console.log(`Processing race: ${race.meeting_name}`);

    const seasonKey = String(season);
    const meetingKeyStr = String(currentMeetingKey);

    for (const user of users) {
        // 🔒 Read any existing pick for this race robustly. `user.picks` is a
        // Mongoose Map of Maps, so we MUST use .get() — bracket access on a Map
        // returns undefined, which is exactly what let a previous run overwrite
        // real picks. The `?? [bracket]` fallback also handles plain/lean objects.
        const seasonMap =
            user.picks?.get?.(seasonKey) ?? user.picks?.[seasonKey];
        const existingRaw =
            seasonMap?.get?.(meetingKeyStr) ?? seasonMap?.[meetingKeyStr];
        const existing = existingRaw?.toObject?.() ?? existingRaw ?? null;

        // 🔒 HARD GUARD: auto-picks only ever FILL IN users with nothing. Never
        // touch a user who already has manual picks OR an autopick for this race.
        const hasPicks = Array.isArray(existing?.picks) && existing.picks.length > 0;
        const hasAutopick = existing?.autopick === true;
        if (hasPicks || hasAutopick) {
            console.log(
                `⏭️ Skipping ${user.username}: already has ${hasPicks ? "picks" : "an autopick"} for this race (never overwritten).`
            );
            continue;
        }

        // --- Step 5: Debug — log qualifying order (optional, per user) ---
        console.log(`🔍 Checking qualifying results for ${race.meeting_name}:`);
        console.table(
            race.qualifying_results
                .sort((a, b) => a.finishPosition - b.finishPosition)
                .map(d => ({
                    driverNumber: d.driverNumber,
                    finishPosition: d.finishPosition,
                }))
        );

        // --- Step 6: Build pool of eligible drivers (P11–P22 in qualifying) ---
        const eligibleDrivers = race.qualifying_results
            .filter(d => d.finishPosition && d.finishPosition >= 11 && d.finishPosition <= 22)
            .map(d => d.driverNumber);
        if (eligibleDrivers.length < 2) {
            console.log(`⚠️ Not enough eligible drivers for ${race.meeting_name}. Skipping...`);
            continue;
        }

        // --- Step 7: Randomize and take two drivers as autopicks ---
        for (let i = eligibleDrivers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [eligibleDrivers[i], eligibleDrivers[j]] = [eligibleDrivers[j], eligibleDrivers[i]];
        }
        const autoPicks = eligibleDrivers.slice(0, 2);

        // --- Step 8: Set only autopick and picks (preserve score, bonusPoints, bonusPicks) ---
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    [`picks.${season}.${currentMeetingKey}.autopick`]: true,
                    [`picks.${season}.${currentMeetingKey}.picks`]: autoPicks,
                },
            }
        );
        console.log(`✅ Assigned auto-picks for ${user.username} in ${race.meeting_name}: ${autoPicks.join(", ")}`);
    }

    console.log("✅ Auto-picks completed!");
}

export { runAutoPicks };

// Run directly from the CLI: `MEETING_KEY=1290 npm run runautopicks`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    runAutoPicks()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error("❌ runAutoPicks failed:", err);
            process.exit(1);
        });
}