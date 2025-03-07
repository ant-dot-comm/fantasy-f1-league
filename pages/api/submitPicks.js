import dbConnect from "../../lib/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await dbConnect();

  const { username, season, meeting_key, driverNumbers } = req.body;

  if (!username || !season || !meeting_key || !driverNumbers || driverNumbers.length !== 2) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Ensure season object exists
    if (!user.picks[season]) {
      user.picks[season] = { races: {} };
    }

    // ✅ Ensure races object exists inside the season
    if (!user.picks[season].races) {
      user.picks[season].races = {};
    }

    // ✅ Store or update picks for the specific meeting_key
    user.picks[season].races[meeting_key] = driverNumbers;

    // ✅ Mark the picks object as modified before saving
    user.markModified("picks");
    
    await user.save();

    res.status(200).json({ message: "Pick submitted successfully", picks: user.picks[season].races[meeting_key] });
  } catch (error) {
    console.error("❌ Error saving user picks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}