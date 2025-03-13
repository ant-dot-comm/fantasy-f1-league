import dbConnect from "../../lib/mongodb";
import User from "../../models/User";
import Driver from "../../models/Driver";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { season } = req.query;

  if (!season) {
    return res.status(400).json({ error: "Season is required" });
  }

  try {
    const users = await User.find({ seasons: season }).select("username first_name picks").lean();
    if (!users.length) {
      console.log("⚠️ No users found for this season.");
      return res.status(404).json({ message: "No user picks found" });
    }

    let pickCounts = {};
    let totalSelections = 0;

    // ✅ Count how many times each driver was picked
    for (const user of users) {
      console.log(`🔍 Checking picks for user: ${user.username}`);
      
      // ✅ Ensure picks is a plain object and extract season picks
      const userPicks = user.picks && typeof user.picks === "object" ? { ...user.picks } : {};
      const seasonPicks = userPicks[season] instanceof Map ? Object.fromEntries(userPicks[season]) : userPicks[season];
  
      // ✅ Skip users who have no picks
      if (!seasonPicks || Object.keys(seasonPicks).length === 0) {
        console.warn(`⚠️ User ${user.username} has no picks for season ${season}.`);
        console.warn(`👉 Full Picks Data After Conversion:`, JSON.stringify(userPicks, null, 2));
        continue;
      }
  
      for (const [meetingKey, raceData] of Object.entries(seasonPicks)) {
        if (!raceData.picks || raceData.picks.length === 0) continue; // ✅ Skip empty picks
  
        // console.log(`🏎️ Processing picks for race ${meetingKey}:`, raceData.picks);
  
        for (const driverNumber of raceData.picks) {
          pickCounts[driverNumber] = (pickCounts[driverNumber] || 0) + 1;
          totalSelections++;
        }
        }
    }

    // ✅ Fetch driver details from the database (Only include drivers that have been picked)
    const selectedDriverNumbers = Object.keys(pickCounts).map(Number);
    const drivers = await Driver.find({ year: season, driver_number: { $in: selectedDriverNumbers } });

    let driverSelectionPercent = drivers.map(driver => ({
      username: driver.full_name, // ✅ Driver name instead of username
      finalResult: ((pickCounts[driver.driver_number] / totalSelections) * 100).toFixed(1), // ✅ Selection percentage
      headshot_url: driver.name_acronym 
        ? `/drivers/${season}/${driver.name_acronym}.png` 
        : `/drivers/${season}/default.png`,
      name_acronym: driver.name_acronym,
      teamColour: driver.team_colour,
    }));

    // ✅ Sort by highest selection percentage
    driverSelectionPercent.sort((a, b) => b.finalResult - a.finalResult);

    res.status(200).json({ driverSelectionPercent });
  } catch (error) {
    console.error("🚨 Error fetching driver selection stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}