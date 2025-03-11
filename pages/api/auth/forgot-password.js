import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "User with this email not found" });
    }

    // ✅ Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.reset_token = resetToken;

    user.reset_token_expires = Date.now() + 3600000; // Expires in 1 hour
    await user.save();

    // ✅ Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your mail service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Fantasy F1 League Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });

    res.status(200).json({ message: "If an account exists, a reset email will be sent." });
  } catch (error) {
    console.error("Error sending reset email:", error);
    res.status(500).json({ message: "Error sending reset email." });
  }
}