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
    // ✅ Get only users who participated in the given season
    const users = await User.find({ seasons: season });

    let topSingleRaceScores = [];
    let userTotalPoints = {}; // Stores total points per user

    // ✅ Count only completed races for the season
    let totalRacesCompleted = await Race.countDocuments({ year: season, "race_results.0": { $exists: true } });

    for (const user of users) {
      if (!user.picks?.[season]?.races) continue;

      userTotalPoints[user.username] = 0; // Initialize user's total points

      for (const [meetingKey, pickedDrivers] of Object.entries(user.picks[season].races)) {
        const raceData = await Race.findOne({ meeting_key: meetingKey, year: season });
        if (!raceData) continue;

        let finalResult = 0;
        for (const driverNumber of pickedDrivers) {
          const raceResult = raceData.race_results.find(d => d.driverNumber === driverNumber);
          if (!raceResult) continue;

          let driverPoints = raceResult.startPosition - raceResult.finishPosition;

          if ((raceResult.startPosition >= 19) && (raceResult.finishPosition <= 10)) driverPoints += 3;
          if ((raceResult.startPosition >= 19) && (raceResult.finishPosition <= 5)) driverPoints += 5;

          finalResult += driverPoints;
        }

        userTotalPoints[user.username] += finalResult; // ✅ Store total season points

        // ✅ Track highest single-race scores
        topSingleRaceScores.push({
          username: user.username,
          race: raceData.meeting_name,
          meeting_key: meetingKey,
          finalResult,
        });
      }
    }

    // ✅ Sort by total points per race and return top 10
    topSingleRaceScores.sort((a, b) => b.finalResult - a.finalResult);
    const top10SingleRaceScores = topSingleRaceScores.slice(0, 10);

    // ✅ Calculate average points per race
    let averagePointsPerUser = Object.entries(userTotalPoints)
      .map(([username, totalPoints]) => ({
        username,
        totalPoints,
        raceCount: totalRacesCompleted || 1, // Prevent division by zero
        finalResult: (totalPoints / (totalRacesCompleted || 1)).toFixed(2),
      }))
      .sort((a, b) => b.finalResult - a.finalResult)
      .slice(0, 10); // ✅ Top 10 users by avg points

    res.status(200).json({
      topSingleRaceScores: top10SingleRaceScores,
      averagePointsPerUser,
    });
  } catch (error) {
    console.error("🚨 Error fetching race stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}