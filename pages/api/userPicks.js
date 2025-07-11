import dbConnect from "../../lib/mongodb";
import User from "../../models/User";
import Driver from "../../models/Driver";
import { authenticateAndAuthorizeUser } from "../../lib/middleware";

async function handler(req, res) {
  await dbConnect();

  const { username, meeting_key, season } = req.query;

  if (!username || !meeting_key || !season) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({ error: "User not found" });
    }

    const userPicks = user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;

    const seasonPicks = userPicks[season] instanceof Map ? Object.fromEntries(userPicks[season]) : userPicks[season];
    const racePicks = seasonPicks?.[meeting_key];

    if (!racePicks || !racePicks.picks || racePicks.picks.length === 0) {
      console.log(`No picks found for ${username} in season ${season}, race ${meeting_key}`);
      return res.status(200).json({ picks: [], autopick: false });
    }

    const driverDetails = await Driver.find({
      driver_number: { $in: racePicks.picks },
    }).lean();

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

    res.status(200).json({ picks: enrichedPicks, autopick: racePicks.autopick || false });
  } catch (error) {
    console.error("Error fetching user picks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default authenticateAndAuthorizeUser(handler);