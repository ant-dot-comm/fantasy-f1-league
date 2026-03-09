import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import { computeRaceScoreForUser } from "@/lib/utils/raceScoring";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { season } = req.query;

  try {
    console.time(`🏁 Race stats calculation for ${season}`);

    // OPTIMIZATION 1: Get all users with picks in one query
    const year = Number(season);
    const users = await User.find({ seasons: year })
      .select("username first_name picks")
      .lean();

    console.log(
      `📊 top-race-scores: found ${users.length} users for season ${season}`
    );

    if (!users.length) {
      return res.status(200).json({ 
        topSingleRaceScores: [], 
        averagePointsPerUser: [] 
      });
    }

    // OPTIMIZATION 2: Collect all unique meeting keys
    const allMeetingKeys = new Set();
    const allDriverNumbers = new Set();
    
    users.forEach(user => {
      const userPicks = user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;
      const seasonPicks = userPicks?.[season] instanceof Map ? Object.fromEntries(userPicks[season]) : userPicks?.[season];
      
      if (seasonPicks) {
        Object.entries(seasonPicks).forEach(([meetingKey, raceData]) => {
          if (raceData.picks?.length) {
            allMeetingKeys.add(meetingKey);
            raceData.picks.forEach(driverNum => allDriverNumbers.add(driverNum));
          }
        });
      }
    });

    // OPTIMIZATION 3: Batch fetch all races in one query
    const meetingKeyArray = Array.from(allMeetingKeys);
    console.log(
      `📊 top-race-scores: unique meeting keys from picks = ${meetingKeyArray.length}`,
      meetingKeyArray
    );

    const allRaces = await Race.find({
      meeting_key: { $in: meetingKeyArray },
      year: year,
    }).lean();

    // OPTIMIZATION 4: Create race lookup map
    const raceMap = new Map();
    allRaces.forEach((race) => raceMap.set(race.meeting_key, race));

    console.log(
      `📊 top-race-scores: loaded ${allRaces.length} Race docs for season ${season}`
    );

    // OPTIMIZATION 5: Process all data efficiently
    let topSingleRaceScores = [];
    let userStats = {}; // Stores both total points and race count per user

    let racesWithStoredScore = 0;
    let racesWithRecomputedScore = 0;

    users.forEach((user) => {
      const userPicks =
        user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;
      const seasonPicks =
        userPicks?.[season] instanceof Map
          ? Object.fromEntries(userPicks[season])
          : userPicks?.[season];

      if (!seasonPicks) return;

      userStats[user.username] = { totalPoints: 0, raceCount: 0 };

      Object.entries(seasonPicks).forEach(([meetingKey, raceData]) => {
        if (!raceData.picks?.length) return;

        const race = raceMap.get(meetingKey);
        if (!race) return;

        // Prefer stored per-race score from runCalculateScores (driver + bonus picks)
        let finalScore =
          typeof raceData.score === "number" ? raceData.score : null;

        if (finalScore === null) {
          try {
            const recomputed = computeRaceScoreForUser(
              raceData,
              race
            );
            finalScore = recomputed?.totalScore ?? null;
            if (typeof finalScore === "number") {
              racesWithRecomputedScore += 1;
            }
          } catch (err) {
            console.error(
              `❌ Failed to recompute score for ${user.username}, season ${season}, meeting_key ${meetingKey}:`,
              err
            );
          }
        } else {
          racesWithStoredScore += 1;
        }

        if (typeof finalScore !== "number") {
          console.warn(
            `⚠️ Unable to derive score for ${user.username} in season ${season}, meeting_key ${meetingKey}.`
          );
          return;
        }

        userStats[user.username].totalPoints += finalScore;
        userStats[user.username].raceCount++;

        // Track single race scores (highest single race totals across season)
        topSingleRaceScores.push({
          username: user.username,
          race: race.meeting_name,
          meeting_key: meetingKey,
          finalResult: finalScore,
        });
      });
    });

    // Sort and limit single race scores
    topSingleRaceScores.sort((a, b) => b.finalResult - a.finalResult);
    const top10SingleRaceScores = topSingleRaceScores.slice(0, 10);

    // Calculate CORRECT averages (per user's actual races, not total races)
    const averagePointsPerUser = Object.entries(userStats)
      .filter(([username, stats]) => stats.raceCount > 0) // Only users who actually participated
      .map(([username, stats]) => ({
        username,
        totalPoints: stats.totalPoints,
        raceCount: stats.raceCount,
        finalResult: (stats.totalPoints / stats.raceCount).toFixed(2), // CORRECT: per user's races
      }))
      .sort((a, b) => parseFloat(b.finalResult) - parseFloat(a.finalResult))
      .slice(0, 10);

    const result = {
      topSingleRaceScores: top10SingleRaceScores,
      averagePointsPerUser,
    };

    console.timeEnd(`🏁 Race stats calculation for ${season}`);
    console.log(
      `📊 top-race-scores: processed ${users.length} users, ${allMeetingKeys.size} races. ` +
        `${racesWithStoredScore} races used stored scores, ${racesWithRecomputedScore} races recomputed.`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("🚨 Error fetching race stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}