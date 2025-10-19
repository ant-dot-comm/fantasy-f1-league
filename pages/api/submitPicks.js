import dbConnect from "../../lib/mongodb";
import User from "../../models/User";
import { authenticateAndAuthorizeUser } from "../../lib/middleware";
import raceSchedule from "../../data/raceSchedule";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Authenticate and authorize user
  return authenticateAndAuthorizeUser(req, res, async () => {
    await dbConnect();

    const { username, season, meeting_key, driverNumbers } = req.body;

    if (!username || !season || !meeting_key || !driverNumbers || driverNumbers.length !== 2) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // ✅ Time-based validation: Check if picks submission is still allowed
    const raceInfo = raceSchedule[meeting_key];
    if (!raceInfo) {
      return res.status(400).json({ 
        error: "Invalid race", 
        message: `No race found for meeting key: ${meeting_key}` 
      });
    }

    // Define time variables (needed for response even with manual control)
    const now = new Date();
    const picksCloseTime = new Date(raceInfo.picks_close.getTime() + (raceInfo.picks_close.getTimezoneOffset() * 60000));

    // 🎛️ Check for manual override first
    if (raceInfo.manualControl !== null && raceInfo.manualControl !== undefined) {
      if (raceInfo.manualControl !== true) {
        return res.status(403).json({ 
          error: "Picks manually closed", 
          message: `Picks for ${raceInfo.race_name} are manually closed by admin`,
          manual_control: true
        });
      }
      // If manually open, skip time validation and proceed
    } else {
      // Use time-based validation
      if (now > picksCloseTime) {
        return res.status(403).json({ 
          error: "Picks deadline exceeded", 
          message: `Picks for ${raceInfo.race_name} closed at ${picksCloseTime.toLocaleString()}. Current time: ${now.toLocaleString()}`,
          picks_close: picksCloseTime.toISOString(),
          current_time: now.toISOString()
        });
      }
    }

    try {
      let user = await User.findOne({ username }).lean();
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // ✅ Ensure picks object exists
      if (!user.picks) user.picks = {};
      if (!user.picks[season]) user.picks[season] = {};
      if (!user.picks[season][meeting_key]) {
        user.picks[season][meeting_key] = { picks: [], autopick: false };
      }

      // ✅ Update picks & remove autopick flag
      user.picks[season][meeting_key].picks = driverNumbers;
      user.picks[season][meeting_key].autopick = false;

      // ✅ Save changes
      await User.updateOne({ username }, { $set: { picks: user.picks } });

      res.status(200).json({ 
        message: "Pick submitted successfully", 
        picks: user.picks[season][meeting_key].picks, 
        autopick: user.picks[season][meeting_key].autopick,
        race_info: {
          race_name: raceInfo.race_name,
          picks_close: picksCloseTime.toISOString(),
          time_remaining: Math.max(0, Math.floor((picksCloseTime - now) / 1000 / 60)) // minutes remaining
        }
      });
    } catch (error) {
      console.error("❌ Error saving user picks:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
}