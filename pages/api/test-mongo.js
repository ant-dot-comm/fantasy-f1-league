import dbConnect from "../../lib/mongodb";
import User from "../../models/User";
import { authenticateToken } from "../../lib/middleware";

export default async function handler(req, res) {
  // Authenticate user
  return authenticateToken(req, res, async () => {
    try {
      await dbConnect();

      const users = await User.find();

      res.status(200).json({ message: "MongoDB Connected!", users });
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      res.status(500).json({ error: "MongoDB connection failed" });
    }
  });
}
