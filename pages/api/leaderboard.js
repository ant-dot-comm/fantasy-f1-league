import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import axios from "axios"; // ✅ Fetch selected-leaderboard-player-race-scores API instead of recalculating
const leaderboardCache = new Map();

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

    const users = await User.find({ seasons: season }).select("username first_name");

    if (!users.length) return res.status(200).json({ leaderboard: [] });

    let leaderboard = [];

    for (const user of users) {
      // console.log(`🔎 Fetching race scores for user: ${user.username}`);

      try {
        // ✅ Pull scores from selected-leaderboard-player-race-scores API instead of recalculating
        const { data } = await axios.get(`http://localhost:3000/api/selected-leaderboard-player-race-scores?username=${user.username}&season=${season}`);
        const totalUserPoints = data.raceBreakdown.reduce((acc, race) => {
          return acc + race.results.reduce((sum, driver) => sum + driver.points, 0);
        }, 0);

        leaderboard.push({
          first_name: user.first_name,
          username: user.username,
          points: totalUserPoints, // ✅ Uses pre-calculated points
          autoPicks: data.autoPicks,
        });
      } catch (error) {
        console.warn(`⚠️ No race data found for ${user.username}, setting score to null.`);
      }
    }

    leaderboard.sort((a, b) => (b.points || 0) - (a.points || 0)); // Sort by points
    leaderboardCache.set(season, leaderboard);
    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("🚨 Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}