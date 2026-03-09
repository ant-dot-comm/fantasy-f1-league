import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Driver from "@/models/Driver";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { season } = req.query;
  const year = Number(season);

  try {
    console.time(`🏁 Leaderboard calculation for ${season}`);

    // ✅ Only show users who are in this season
    const users = await User.find({ seasons: year })
      .select("username first_name picks")
      .lean();

    if (!users.length) {
      return res.status(200).json({ leaderboard: [] });
    }

    // ✅ OPTIMIZATION 2: Get all unique meeting keys from all users
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

    // ✅ OPTIMIZATION 3: Batch fetch all races and drivers in 2 queries instead of hundreds
    const [allRaces, allDrivers] = await Promise.all([
      Race.find({ 
        meeting_key: { $in: Array.from(allMeetingKeys) }, 
        year 
      }).lean(),
      Driver.find({ 
        driver_number: { $in: Array.from(allDriverNumbers) } 
      }).lean()
    ]);

    // ✅ OPTIMIZATION 4: Create lookup maps for O(1) access
    const raceMap = new Map();
    allRaces.forEach(race => raceMap.set(race.meeting_key, race));
    
    const driverMap = new Map();
    allDrivers.forEach(driver => driverMap.set(driver.driver_number, driver));

    // ✅ OPTIMIZATION 5: Calculate leaderboard efficiently
    const leaderboard = users.map(user => {
      const userPicks = user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;
      const seasonPicks = userPicks?.[season] instanceof Map ? Object.fromEntries(userPicks[season]) : userPicks?.[season];
      
      let totalPoints = 0;
      let autoPicksCount = 0;
      let bonusPicksCount = 0;

      if (seasonPicks) {
        Object.entries(seasonPicks).forEach(([meetingKey, raceData]) => {
          if (!raceData.picks?.length) return;

          const race = raceMap.get(meetingKey);
          if (!race) return;

          if (raceData.autopick) autoPicksCount++;

          // ✅ Only trust stored scores from runCalculateScores
          if (typeof raceData.score === "number") {
            totalPoints += raceData.score;
            if (
              raceData.bonusPicks &&
              (raceData.bonusPicks.worstDriver ||
                raceData.bonusPicks.dnfs !== null)
            ) {
              bonusPicksCount++;
            }
          } else {
            // Log missing scores so issues are visible in the server logs
            console.warn(
              `⚠️ Missing precomputed score for ${user.username} in season ${season}, meeting_key ${meetingKey}`
            );
          }
        });
      }

      return {
        first_name: user.first_name,
        username: user.username,
        points: totalPoints,
        autoPicks: autoPicksCount,
        bonusPicks: bonusPicksCount,
      };
    });

    // ✅ Sort by points
    leaderboard.sort((a, b) => b.points - a.points);

    console.timeEnd(`🏁 Leaderboard calculation for ${season}`);
    console.log(`📊 Processed ${users.length} users, ${allMeetingKeys.size} races, ${allDriverNumbers.size} drivers`);

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("🚨 Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}