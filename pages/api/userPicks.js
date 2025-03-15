import dbConnect from "../../lib/mongodb";
import User from "../../models/User";
import Driver from "../../models/Driver";

export default async function handler(req, res) {
  await dbConnect();

  const { username, meeting_key, season } = req.query;

  if (!username || !meeting_key || !season) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    // ✅ Find user in DB
    const user = await User.findOne({ username });

    if (!user) {
      console.log("❌ User not found:", username);
      return res.status(404).json({ error: "User not found" });
    }

    // console.log(`🔍 Found User: ${username}`, user.picks);

    // ✅ Convert MongoDB Map to a plain JS object
    const userPicks = user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;

    // ✅ Check if user has picks for the season & meeting_key
    const seasonPicks = userPicks[season] instanceof Map ? Object.fromEntries(userPicks[season]) : userPicks[season];
    const racePicks = seasonPicks?.[meeting_key];

    if (!racePicks || !racePicks.picks || racePicks.picks.length === 0) {
      console.log(`⚠️ No picks found for ${username} in season ${season}, race ${meeting_key}`);
      return res.status(200).json({ picks: [], autopick: false });
    }

    // console.log(`✅ Found picks for ${username}:`, racePicks);

    // ✅ Fetch driver details from DB
    const driverDetails = await Driver.find({
      driver_number: { $in: racePicks.picks },
    }).lean();

    // ✅ Format enriched driver picks
    const enrichedPicks = driverDetails.map(driver => ({
      driverNumber: driver.driver_number,
      fullName: driver.full_name,
      team: driver.team_name,
      teamColour: driver.team_colour,
      headshot_url: driver.name_acronym 
          ? `/drivers/${season}/${driver.name_acronym}.png` 
          : `/drivers/${season}/default.png`,
      name_acronym: driver.name_acronym,
    }));

    // console.log("✅ Returning picks:", enrichedPicks);
    res.status(200).json({ picks: enrichedPicks, autopick: racePicks.autopick || false });
  } catch (error) {
    console.error("❌ Error fetching user picks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}