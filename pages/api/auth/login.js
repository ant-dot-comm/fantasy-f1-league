// pages/api/auth/login.js
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  await dbConnect();
  const { username, password } = req.body;
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  const user = await User.findOne({ username: trimmedUsername });
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = sign(
    { userId: user._id, username: user.username, seasons: user.seasons },
    process.env.NEXTAUTH_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({ token, message: "Login successful" });
}