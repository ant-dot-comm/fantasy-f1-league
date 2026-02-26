import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import { authenticateToken } from "../../../lib/middleware";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return authenticateToken(req, res, async () => {
    await dbConnect();
    const user = await User.findOne(
      { username: req.user.username },
      { username: 1, seasons: 1 }
    ).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      username: user.username,
      seasons: user.seasons || [],
    });
  });
}
