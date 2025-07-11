import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();
  const { first_name, username, email, password } = req.body;

  if (!first_name || !username || !email || !password) {
    return res.status(400).json({ message: "First name, Username, Email, and password are required" });
  }

  try {
    const existingUser = await User.findOne({ username }, { email });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // ✅ Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ✅ Automatically enroll user in the current season
    const currentYear = new Date().getFullYear();
    const newUser = new User({
      first_name,
      username,
      email,
      password: hashedPassword,
      seasons: [currentYear],
      picks: {},
    });

    await newUser.save();

    // ✅ Generate JWT token
    const token = sign(
      { userId: newUser._id, username: newUser.username, first_name: newUser.first_name },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "7d" }
    );

    // Set JWT token as HTTP cookie
    const cookieOptions = [
      `token=${token}`,
      'HttpOnly',
      'Path=/',
      'Max-Age=604800', // 7 days in seconds
      'SameSite=Lax'
    ];

    // Add Secure flag for production (HTTPS)
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '));
    res.status(201).json({ token, message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
} 