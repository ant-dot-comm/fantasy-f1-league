import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();
  const { token, password } = req.body;

//   console.log("Received token:", token); // ✅ Debug log
//   console.log("Received password:", password);

  if (!token || !password) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  try {
    const user = await User.findOne({ 
        reset_token: token,
        reset_token_expires: { $gt: Date.now() } // ✅ Check expiration
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ Hash new password
    user.password = await bcrypt.hash(password, 10);
    user.reset_token = undefined;
    user.reset_token_expires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
}