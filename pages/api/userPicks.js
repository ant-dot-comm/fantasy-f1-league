import dbConnect from "../../lib/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  await dbConnect();

  const { username, meeting_key, season} = req.query;

  if (!username || !meeting_key) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.picks[season] || !user.picks[season].races) {
        return res.status(200).json({ picks: [] });
    }
  
    const picks = user.picks[season].races[meeting_key] || [];

    res.status(200).json({ picks });
  } catch (error) {
    console.error("❌ Error fetching user picks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}