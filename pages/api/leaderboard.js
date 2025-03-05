// pages/api/leaderboard.js
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { season } = req.query;

  try {
    console.log(`📡 Fetching leaderboard scores for season: ${season}`);
    
    // ✅ Fetch leaderboard data using bottomTenScoring logic
    const leaderboard = await bottomTenScoring(season);
    
    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("🚨 Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Moves bottomTenScoring logic inside the API route (server-side only).
 */
async function bottomTenScoring(season) {
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

      const { qualifying_results, race_results } = raceData;

      for (const driverNumber of pickedDrivers) {
        const qualifyingPosition = qualifying_results.indexOf(driverNumber) + 1;
        const racePosition = race_results.indexOf(driverNumber) + 1;
        if (!qualifyingPosition || !racePosition) continue;

        let driverPoints = qualifyingPosition - racePosition;
        if ((qualifyingPosition === 19 || qualifyingPosition === 20) && racePosition <= 10) driverPoints += 3;
        if ((qualifyingPosition === 19 || qualifyingPosition === 20) && racePosition <= 5) driverPoints += 5;

        totalPoints += driverPoints;
      }
    }
    
    leaderboard.push({ username: user.username, points: totalPoints });
  }

  return leaderboard;
}