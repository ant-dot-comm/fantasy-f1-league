import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Driver from "@/models/Driver"; // ✅ Import driver model

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
    let driverTotalPoints = {}; // ✅ Stores total points per driver
    let driverPositionChanges = {}; // ✅ Stores total positions gained per driver
    let driverPickCounts = {}; // ✅ Stores total picks per driver

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
          userTotalPoints[user.username] += driverPoints; // ✅ Store total season points per user

          // ✅ Add to driver point totals
          if (!driverTotalPoints[driverNumber]) {
            driverTotalPoints[driverNumber] = 0;
          }
          driverTotalPoints[driverNumber] += driverPoints;

          // ✅ Track total positions gained across the season
          const positionsGained = raceResult.startPosition - raceResult.finishPosition;
          if (!driverPositionChanges[driverNumber]) {
            driverPositionChanges[driverNumber] = 0;
          }
          driverPositionChanges[driverNumber] += positionsGained;

          // ✅ Track how many times a driver was picked
          if (!driverPickCounts[driverNumber]) {
            driverPickCounts[driverNumber] = 0;
          }
          driverPickCounts[driverNumber] += 1;
        }

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

    // ✅ Convert driver numbers to full names
    const driverNumbers = Object.keys(driverTotalPoints).map(Number);
    const driverDetails = await Driver.find({ driver_number: { $in: driverNumbers }, year: season });

    let topScoringDrivers = driverDetails
      .map(driver => ({
        username: driver.full_name, // ✅ Display full driver name
        finalResult: driverTotalPoints[driver.driver_number] || 0, // ✅ Driver total points
        headshot_url: driver.name_acronym 
          ? `/drivers/${season}/${driver.name_acronym}.png` 
          : `/drivers/${season}/default.png`,
        name_acronym: driver.name_acronym,
        teamColour: driver.team_colour,
      }))
      .sort((a, b) => b.finalResult - a.finalResult) // Sort highest to lowest
      .slice(0, 10); // ✅ Get top 10 scoring drivers

    // ✅ Biggest Position Gainers (NEW)
    let biggestPositionGainers = driverDetails
      .map(driver => ({
        username: driver.full_name, // ✅ Driver name
        finalResult: driverPositionChanges[driver.driver_number] || 0, // ✅ Total positions gained
        headshot_url: driver.name_acronym 
          ? `/drivers/${season}/${driver.name_acronym}.png` 
          : `/drivers/${season}/default.png`,
        name_acronym: driver.name_acronym,
        teamColour: driver.team_colour,
      }))
      .sort((a, b) => b.finalResult - a.finalResult) // Sort highest to lowest
      .slice(0, 10); // ✅ Get top 10 biggest gainers

      // ✅ Most Underrated Drivers (High Points, Low Picks)
    let underratedDrivers = driverDetails
    .map(driver => ({
      username: driver.full_name,
      points: driverTotalPoints[driver.driver_number] || 0,
      // picks: driverPickCounts[driver.driver_number] || 1, // Avoid division by zero
      finalResult: driverPickCounts[driver.driver_number] > 0 
        ? ((driverTotalPoints[driver.driver_number] || 0) / driverPickCounts[driver.driver_number]).toFixed(1)
        : "0.0",
      headshot_url: driver.name_acronym 
        ? `/drivers/${season}/${driver.name_acronym}.png` 
        : `/drivers/${season}/default.png`,
      name_acronym: driver.name_acronym,
      teamColour: driver.team_colour,
    }))
    .sort((a, b) => b.finalResult - a.finalResult) // Sort by points per pick
    // .slice(0, 10); // ✅ Get top 10 underrated drivers

    res.status(200).json({
      topSingleRaceScores: top10SingleRaceScores,
      averagePointsPerUser,
      topScoringDrivers, // ✅ Driver total points ranking
      biggestPositionGainers, // ✅ NEW Biggest Position Gainers
      underratedDrivers, // ✅ NEW Most Underrated Drivers
    });
  } catch (error) {
    console.error("🚨 Error fetching race stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}