import dbConnect from "../../lib/mongodb";
import Race from "../../models/Race";

export default async function handler(req, res) {
  await dbConnect();

  const { season } = req.query; // Get the season from query params

  if (!season) {
    return res.status(400).json({ error: "Season parameter is required" });
  }

  try {
    // ✅ Fetch the latest race from the requested season (sort by createdAt)
    const latestRace = await Race.findOne({ year: season }).sort({ createdAt: -1 });

    if (!latestRace) {
      console.error(`❌ No race data found for season ${season}.`);
      // return res.status(404).json({ error: `No race data found for season ${season}` });
    }

    res.status(200).json(latestRace);
  } catch (error) {
    console.error("❌ Error fetching latest race:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}