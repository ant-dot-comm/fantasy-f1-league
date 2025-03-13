import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Driver from "@/models/Driver"; // ✅ Import driver model
import { activeScoringModel } from "@/lib/utils/scoringModel";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { season } = req.query;

  try {
    console.log(`📡 Fetching data for season: ${season}...`);

    // ✅ Get only users who participated in the given season
    const users = await User.find({ seasons: season }).select("username first_name picks").lean();
    // console.log(`👤 Found ${users.length} users for season ${season}`);
    // console.log(`🧐 Raw User Data from DB:`, JSON.stringify(users, null, 2));

    let topSingleRaceScores = [];
    let userTotalPoints = {}; // Stores total points per user
    let driverTotalPoints = {}; // ✅ Stores total points per driver
    let driverPositionChanges = {}; // ✅ Stores total positions gained per driver
    let driverPickCounts = {}; // ✅ Stores total picks per driver

    // Count only completed races for the season
    let totalRacesCompleted = await Race.countDocuments({ year: season, "race_results.0": { $exists: true } });
    // ✅ console.log(`🏁 Total races completed: ${totalRacesCompleted}`);

    for (const user of users) {
      // ✅ console.log(`🔍 Processing user: ${user.username}`);
      // ✅ console.log(`🧐 Raw User Data from DB:`, JSON.stringify(user, null, 2));
      // console.log(`🧐 Raw Picks Data for ${user.username}:`, JSON.stringify(user.picks[season], null, 2));

      // 🔍 Log the picks structure for debugging
      // console.log(`🧐 Picks structure for ${user.username}:`, JSON.stringify(user.picks, null, 2));
      const userPicks = user.picks && typeof user.picks === "object" ? { ...user.picks } : {};
      const seasonPicks = userPicks[season] instanceof Map ? Object.fromEntries(userPicks[season]) : userPicks[season];

      if (!seasonPicks || Object.keys(seasonPicks).length === 0) {
        console.warn(`⚠️ User ${user.username} has no picks for season ${season}.`);
        console.warn(`👉 Full Picks Data After Conversion:`, JSON.stringify(userPicks, null, 2));
        continue;
    }

    if (!user.picks?.[season] || !Object.values(user.picks[season]).some(race => race.picks?.length)) {
      console.warn(`⚠️ User ${user.username} has no picks for season ${season}. Skipping...`);
      console.warn(`👉 Full Picks Data:`, JSON.stringify(user.picks, null, 2))
      continue;
    }

      console.log(`✅ User ${user.username} has valid picks for ${season}`);

      userTotalPoints[user.username] = 0; // Initialize user's total points

      for (const [meetingKey, raceData] of Object.entries(user.picks[season])) {

        if (!raceData.picks || raceData.picks.length === 0) continue;
      
        // console.log(`📍 Checking race: ${meetingKey} for ${user.username}`);

        const raceEntry = await Race.findOne({ meeting_key: meetingKey, year: season });

        if (!raceEntry) {
          console.warn(`⚠️ No race data found for ${meetingKey}. Skipping...`);
          continue;
        }

        // console.log(`✅ Found race: ${raceEntry.meeting_name}`);

        let finalResult = 0;

        for (const driverNumber of raceData.picks) {
          // console.log(`🚗 Checking driver: ${driverNumber}`);

          const qualiResult = raceEntry.qualifying_results.find(d => d.driverNumber === driverNumber);
          const raceResult = raceEntry.race_results.find(d => d.driverNumber === driverNumber);

          if (!raceResult) {
            console.warn(`⚠️ No race result found for driver ${driverNumber}. Skipping...`);
            continue;
          }

          let driverPoints = activeScoringModel(
              qualiResult?.finishPosition || 20,  // ✅ Default to 20 if missing
              raceResult.finishPosition 
          );

          // console.log(`🏎 ${driverNumber} scored ${driverPoints} points`);

          finalResult += driverPoints;
          userTotalPoints[user.username] += driverPoints; // ✅ Store total season points per user

          // ✅ Add to driver point totals
          driverTotalPoints[driverNumber] = (driverTotalPoints[driverNumber] || 0) + driverPoints;

          // ✅ Track total positions gained across the season
          const positionsGained = (raceResult.startPosition || 20) - raceResult.finishPosition;
          driverPositionChanges[driverNumber] = (driverPositionChanges[driverNumber] || 0) + positionsGained;

          // ✅ Track how many times a driver was picked
          driverPickCounts[driverNumber] = (driverPickCounts[driverNumber] || 0) + 1;
        }

        // console.log(`📊 Final score for ${user.username} in ${raceEntry.meeting_name}: ${finalResult}`);

        // ✅ Track highest single-race scores
        topSingleRaceScores.push({
          username: user.username,
          race: raceEntry.meeting_name,
          meeting_key: meetingKey,
          finalResult,
        });
      }
    }

    console.log(`📊 Sorting top single race scores...`);
    topSingleRaceScores.sort((a, b) => b.finalResult - a.finalResult);
    const top10SingleRaceScores = topSingleRaceScores.slice(0, 10);

    console.log(`📊 Sorting average points per user...`);
    let averagePointsPerUser = Object.entries(userTotalPoints)
      .map(([username, totalPoints]) => ({
        username,
        totalPoints,
        raceCount: totalRacesCompleted || 1, // Prevent division by zero
        finalResult: (totalPoints / (totalRacesCompleted || 1)).toFixed(2),
      }))
      .sort((a, b) => b.finalResult - a.finalResult)
      .slice(0, 10); // ✅ Top 10 users by avg points

    console.log(`📊 Converting driver numbers to full names...`);
    const driverNumbers = Object.keys(driverTotalPoints).map(Number);
    const driverDetails = await Driver.find({ driver_number: { $in: driverNumbers }, year: season });

    let topScoringDrivers = driverDetails
      .map(driver => ({
        username: driver.full_name,
        finalResult: driverTotalPoints[driver.driver_number] || 0,
        headshot_url: driver.name_acronym 
          ? `/drivers/${season}/${driver.name_acronym}.png` 
          : `/drivers/${season}/default.png`,
        name_acronym: driver.name_acronym,
        teamColour: driver.team_colour,
      }))
      .sort((a, b) => b.finalResult - a.finalResult)
      .slice(0, 10);

    console.log(`📊 Sorting biggest position gainers...`);
    let biggestPositionGainers = driverDetails
      .map(driver => ({
        username: driver.full_name,
        finalResult: driverPositionChanges[driver.driver_number] || 0,
        headshot_url: driver.name_acronym 
          ? `/drivers/${season}/${driver.name_acronym}.png` 
          : `/drivers/${season}/default.png`,
        name_acronym: driver.name_acronym,
        teamColour: driver.team_colour,
      }))
      .sort((a, b) => b.finalResult - a.finalResult)
      .slice(0, 10);

    console.log(`📊 Sorting most underrated drivers...`);
    let underratedDrivers = driverDetails
      .map(driver => ({
        username: driver.full_name,
        points: driverTotalPoints[driver.driver_number] || 0,
        finalResult: driverPickCounts[driver.driver_number] > 0 
          ? ((driverTotalPoints[driver.driver_number] || 0) / driverPickCounts[driver.driver_number]).toFixed(1)
          : "0.0",
        headshot_url: driver.name_acronym 
          ? `/drivers/${season}/${driver.name_acronym}.png` 
          : `/drivers/${season}/default.png`,
        name_acronym: driver.name_acronym,
        teamColour: driver.team_colour,
      }))
      .sort((a, b) => b.finalResult - a.finalResult)
      .slice(0, 10);

    console.log(`✅ Sending API response...`);
    res.status(200).json({
      topSingleRaceScores: top10SingleRaceScores,
      averagePointsPerUser,
      topScoringDrivers, 
      biggestPositionGainers,
      underratedDrivers,
    });
  } catch (error) {
    console.error("🚨 Error fetching race stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}