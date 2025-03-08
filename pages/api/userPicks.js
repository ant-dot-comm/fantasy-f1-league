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
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.picks[season] || !user.picks[season].races) {
      return res.status(200).json({ picks: [] });
    }

    // ✅ Get picked driver numbers for the given race
    const pickedDriverNumbers = user.picks[season].races[meeting_key] || [];

    if (pickedDriverNumbers.length === 0) {
      return res.status(200).json({ picks: [] });
    }

    // ✅ Fetch driver details from DB
    const driverDetails = await Driver.find({
      driver_number: { $in: pickedDriverNumbers },
      year: season,
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

    res.status(200).json({ picks: enrichedPicks });
  } catch (error) {
    console.error("❌ Error fetching user picks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}