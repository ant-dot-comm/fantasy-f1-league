import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Driver from "@/models/Driver";
import { activeScoringModel } from "@/lib/utils/scoringModel";

// Cache with TTL for race stats
const raceStatsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { season } = req.query;

  // Check cache
  const cacheKey = `race-stats-${season}`;
  const cached = raceStatsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`⚡ Returning cached race stats for ${season}`);
    return res.status(200).json(cached.data);
  }

  try {
    console.time(`🏁 Race stats calculation for ${season}`);

    // OPTIMIZATION 1: Get all users with picks in one query
    const users = await User.find({ seasons: season })
      .select("username first_name picks")
      .lean();

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
    const allRaces = await Race.find({ 
      meeting_key: { $in: Array.from(allMeetingKeys) }, 
      year: season 
    }).lean();

    // OPTIMIZATION 4: Create race lookup map
    const raceMap = new Map();
    allRaces.forEach(race => raceMap.set(race.meeting_key, race));

    // OPTIMIZATION 5: Process all data efficiently
    let topSingleRaceScores = [];
    let userStats = {}; // Stores both total points and race count per user

    users.forEach(user => {
      const userPicks = user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;
      const seasonPicks = userPicks?.[season] instanceof Map ? Object.fromEntries(userPicks[season]) : userPicks?.[season];
      
      if (!seasonPicks) return;

      userStats[user.username] = { totalPoints: 0, raceCount: 0 };

      Object.entries(seasonPicks).forEach(([meetingKey, raceData]) => {
        if (!raceData.picks?.length) return;

        const race = raceMap.get(meetingKey);
        if (!race) return;

        let raceScore = 0;

        raceData.picks.forEach(driverNumber => {
          const qualiResult = race.qualifying_results?.find(d => d.driverNumber === driverNumber);
          const raceResult = race.race_results?.find(d => d.driverNumber === driverNumber);
          
                     if (raceResult && qualiResult) {
             const { points } = activeScoringModel(
               raceResult.startPosition,
               raceResult.finishPosition
             );
             raceScore += points;
             userStats[user.username].totalPoints += points;
           }
        });

        // Only count races where user actually had valid picks
        if (raceScore > 0 || raceData.picks.length > 0) {
          userStats[user.username].raceCount++;
          
          // Track single race scores
          topSingleRaceScores.push({
            username: user.username,
            race: race.meeting_name,
            meeting_key: meetingKey,
            finalResult: raceScore,
          });
        }
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

    // Cache with timestamp
    raceStatsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.timeEnd(`🏁 Race stats calculation for ${season}`);
    console.log(`📊 Processed ${users.length} users, ${allMeetingKeys.size} races`);

    res.status(200).json(result);
  } catch (error) {
    console.error("🚨 Error fetching race stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}