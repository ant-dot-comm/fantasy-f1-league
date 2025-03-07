import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";

const leaderboardCache = new Map(); // In-memory storage

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { season } = req.query;

  // ✅ Check cache before querying DB
  if (leaderboardCache.has(season)) {
    console.log(`⚡ Returning cached leaderboard for ${season}`);
    return res.status(200).json({ leaderboard: leaderboardCache.get(season) });
  }

  try {
    console.log(`📡 Fetching leaderboard scores for season: ${season}`);
    
    const leaderboard = await calculateLeaderboard(season);
    
    // ✅ Store in cache
    leaderboardCache.set(season, leaderboard);

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("🚨 Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function calculateLeaderboard(season) {
  const users = await User.find({ [`picks.${season}`]: { $exists: true } });
  if (!users.length) return [];

  const leaderboard = [];

  for (const user of users) {
    let totalPoints = 0;

    if (!user.picks?.[season]?.races) continue;

    const races = user.picks[season].races;

    for (const [meetingKey, pickedDrivers] of Object.entries(races)) {
      const raceData = await Race.findOne({ meeting_key: meetingKey, year: season });
      if (!raceData) continue;

      for (const driverNumber of pickedDrivers) {
        const raceResult = raceData.race_results.find(d => d.driverNumber === driverNumber);
        if (!raceResult) continue;

        let driverPoints = raceResult.startPosition - raceResult.finishPosition;

        if ((raceResult.startPosition >= 19) && (raceResult.finishPosition <= 10)) driverPoints += 3;
        if ((raceResult.startPosition >= 19) && (raceResult.finishPosition <= 5)) driverPoints += 5;

        totalPoints += driverPoints;
      }
    }
    
    leaderboard.push({ username: user.username, points: totalPoints });
  }

  return leaderboard.sort((a, b) => b.points - a.points);
}