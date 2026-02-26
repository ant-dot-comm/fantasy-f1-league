import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import { authenticateToken } from "../../../lib/middleware";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return authenticateToken(req, res, async () => {
    await dbConnect();
    const season =
      typeof req.body?.season === "number"
        ? req.body.season
        : parseInt(req.query?.season || req.body?.season, 10);
    if (Number.isNaN(season) || season < 2020 || season > 2100) {
      return res.status(400).json({ message: "Valid season (year) is required" });
    }

    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const seasons = Array.isArray(user.seasons) ? [...user.seasons] : [];
    if (seasons.includes(season)) {
      return res.status(200).json({
        success: true,
        message: "Already in this season",
        seasons: seasons.sort((a, b) => a - b),
      });
    }

    seasons.push(season);
    seasons.sort((a, b) => a - b);
    user.seasons = seasons;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Joined ${season} season`,
      seasons: user.seasons,
    });
  });
}
