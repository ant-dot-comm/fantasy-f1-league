import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Driver from "@/models/Driver";

const playerRaceCache = new Map(); // In-memory storage

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { username, season } = req.query;
  const cacheKey = `${username}-${season}`;

  // ✅ Check cache before querying DB
  if (playerRaceCache.has(cacheKey)) {
    console.log(`⚡ Returning cached race breakdown for ${username} in ${season}`);
    return res.status(200).json({ raceBreakdown: playerRaceCache.get(cacheKey) });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || !user.picks?.[season]?.races) {
      return res.status(404).json({ message: "User not found or no picks for this season" });
    }

    const raceBreakdown = [];
    for (const [meetingKey, pickedDrivers] of Object.entries(user.picks[season].races)) {
      const raceData = await Race.findOne({ meeting_key: meetingKey, year: season });
      if (!raceData) continue;

      const driverDetails = await Driver.find({ driver_number: { $in: pickedDrivers }, year: season });

      const results = pickedDrivers.map(driverNumber => {
        const raceResult = raceData.race_results.find(d => d.driverNumber === driverNumber);
        const driverInfo = driverDetails.find(d => d.driver_number === driverNumber);

        if (!raceResult || !driverInfo) return null;

        let driverPoints = raceResult.startPosition - raceResult.finishPosition;

        if ((raceResult.startPosition >= 19) && (raceResult.finishPosition <= 10)) driverPoints += 3;
        if ((raceResult.startPosition >= 19) && (raceResult.finishPosition <= 5)) driverPoints += 5;

        return {
          driver_name: driverInfo.full_name,
          team: driverInfo.team_name,
          qualifying_position: raceResult.startPosition, // Placeholder for qual pos
          race_position: raceResult.finishPosition,
          points: driverPoints,
        };
      }).filter(Boolean);

      raceBreakdown.push({
        race: raceData.meeting_name,
        meeting_key: meetingKey,
        results,
      });
    }

    // ✅ Store in cache
    playerRaceCache.set(cacheKey, raceBreakdown);

    res.status(200).json({ raceBreakdown });
  } catch (error) {
    console.error("🚨 Error fetching player race data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}