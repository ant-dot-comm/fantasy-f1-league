import dbConnect from "../../lib/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  // console.log("📡 API Route `/api/test-mongo` Triggered...");
  
  try {
    await dbConnect(); // ✅ Ensure DB is connected

    const users = await User.find(); // ✅ Test if it can find users
    // console.log("✅ Found users:", users.length);

    res.status(200).json({ message: "✅ MongoDB Connected!", users });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    res.status(500).json({ error: "MongoDB connection failed" });
  }
}
