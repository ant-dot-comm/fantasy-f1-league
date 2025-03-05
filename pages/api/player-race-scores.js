import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const { season, username } = req.query;
  if (!season || !username) {
    return res.status(400).json({ message: "Missing season or username parameter" });
  }

  try {
    console.log(`📡 Fetching race scores for ${username} in season ${season}...`);

    const user = await User.findOne({ username, [`picks.${season}`]: { $exists: true } });

    if (!user) {
      return res.status(404).json({ message: "User picks not found" });
    }

    const userPicks = user.picks[season]?.races || {};
    if (!Object.keys(userPicks).length) {
      return res.status(404).json({ message: "No race picks found" });
    }

    const raceScores = [];

    for (const [meetingKey, pickedDrivers] of Object.entries(userPicks)) {
      const raceData = await Race.findOne({ meeting_key: meetingKey, year: season });

      if (!raceData) continue;

      let totalRacePoints = 0;
      let driverDetails = [];

      for (const driverNumber of pickedDrivers) {
        const qualifyingPosition = raceData.qualifying_results.indexOf(driverNumber) + 1;
        const racePosition = raceData.race_results.indexOf(driverNumber) + 1;

        if (!qualifyingPosition || !racePosition) continue;

        let driverPoints = qualifyingPosition - racePosition;

        if ((qualifyingPosition === 19 || qualifyingPosition === 20) && racePosition <= 10) {
          driverPoints += 3;
        }
        if ((qualifyingPosition === 19 || qualifyingPosition === 20) && racePosition <= 5) {
          driverPoints += 5;
        }

        driverDetails.push({
          driverNumber,
          qualifyingPosition,
          racePosition,
          points: driverPoints,
        });

        totalRacePoints += driverPoints;
      }

      raceScores.push({
        meetingKey,
        meetingName: raceData.meeting_name,
        points: totalRacePoints,
        drivers: driverDetails,
      });
    }

    res.status(200).json({ scores: raceScores });

  } catch (error) {
    console.error("❌ Error fetching player race scores:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}