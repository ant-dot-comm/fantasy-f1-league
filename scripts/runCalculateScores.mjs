/**
 * runCalculateScores – after storeRaceData, compute and store scores per user per race,
 * and award achievements (cards). Run for a season (and optionally a single meeting).
 *
 * Usage: node scripts/runCalculateScores.mjs
 * Set SEASON and optionally MEETING_KEY below.
 */

import dbConnect from "../lib/mongodb.js";
import User from "../models/User.js";
import Race from "../models/Race.js";
import { computeRaceScoreForUser } from "../lib/utils/raceScoring.js";
import { activeScoringModel } from "../lib/utils/scoringModel.js";

const SEASON = 2026;
const MEETING_KEY = "1279"; // set to a string (e.g. "1279") to run for one race only

async function runCalculateScores(season, meetingKeyFilter = null) {
  await dbConnect();

  const races = await Race.find({
    year: season,
    ...(meetingKeyFilter && { meeting_key: meetingKeyFilter }),
  })
    .sort({ picks_closed: 1 })
    .lean();

  const racesWithResults = races.filter(
    (r) =>
      r.race_results?.length > 0 &&
      r.qualifying_results?.length > 0
  );

  if (!racesWithResults.length) {
    console.log(`⚠️ No races with results for season ${season}.`);
    process.exit(0);
  }

  const orderedMeetingKeys = racesWithResults.map((r) => r.meeting_key);
  const raceMap = new Map(racesWithResults.map((r) => [r.meeting_key, r]));

  const users = await User.find({ seasons: season });
  if (!users.length) {
    console.log(`⚠️ No users for season ${season}.`);
    process.exit(0);
  }

  console.log(`📊 Calculating scores for ${users.length} users, ${racesWithResults.length} races.`);

  for (const meetingKey of orderedMeetingKeys) {
    const race = raceMap.get(meetingKey);
    if (!race) continue;

    const usersWithPicks = [];

    for (const user of users) {
      const picks = user.picks?.get?.(season) ?? user.picks?.[season];
      const raceData = (picks?.get?.(meetingKey) ?? picks?.[meetingKey])?.toObject?.() ?? picks?.[meetingKey];
      if (!raceData?.picks?.length) continue;

      const computed = computeRaceScoreForUser(raceData, race, activeScoringModel);
      usersWithPicks.push({
        user,
        raceData,
        meetingKey,
        ...computed,
      });
    }

    if (usersWithPicks.length === 0) {
      console.log(`  ⏭ ${race.meeting_name} (${meetingKey}): no picks, skip.`);
      continue;
    }

    for (const { user, raceData, totalScore, driverScores, bonusPoints } of usersWithPicks) {
      const seasonMap = user.picks?.get?.(season) ?? user.picks?.[season];
      const pickDoc = seasonMap?.get?.(meetingKey) ?? (seasonMap && seasonMap[meetingKey]);
      if (pickDoc) {
        pickDoc.score = totalScore;
        pickDoc.driverScores = driverScores;
        pickDoc.bonusPoints = bonusPoints;
      }
    }

    console.log(`  ✅ ${race.meeting_name} (${meetingKey}): ${usersWithPicks.length} users scored.`);
  }

  for (const user of users) {
    await user.save();
  }

  console.log("🎉 runCalculateScores done.");
}

runCalculateScores(SEASON, MEETING_KEY).catch((err) => {
  console.error("❌", err);
  process.exit(1);
}).finally(() => {
  process.exit(0);
});
