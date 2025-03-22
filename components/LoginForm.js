import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";

export default function LoginForm({ onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // 🔹 For forgot password
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // 🔹 Success messages
  const [showForgotPassword, setShowForgotPassword] = useState(false); // 🔹 Toggle forms
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/api/auth/login", { username, password });
      Cookies.set("token", res.data.token, { expires: 7 });
      sessionStorage.setItem("username", username);
      onClose(); // ✅ Close modal after login
      router.reload(); // ✅ Refresh page to reflect login
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/forgot-password`, { email });
      setMessage("If an account exists, you'll receive a reset email soon.");
      setEmail(""); // Clear input after submission
    } catch (err) {
      setError(err.response?.data?.message || "Error sending reset email.");
    }
  };

  return (
    <div className="p-6 rounded-lg flex flex-col gap-2">
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}

      {!showForgotPassword ? (
        // ✅ Login Form
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="text-input" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-input" required />
          <button type="submit" className="w-full bg-cyan-800 text-white p-2 rounded-lg">Login</button>
          <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-neutral-300 mt-2">Forgot Password?</button>
        </form>
      ) : (
        // ✅ Forgot Password Form
        <form onSubmit={handleForgotPassword} className="flex flex-col gap-2">
          <p className="text-sm text-neutral-400">Enter your email, and we'll send you a password reset link.</p>
          <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-input" required />
          <button type="submit" className="w-full bg-cyan-800 text-white p-2 rounded-lg">Send Reset Link</button>
          <button type="button" onClick={() => setShowForgotPassword(false)} className="text-sm text-neutral-300 mt-2">Back to Login</button>
        </form>
      )}
    </div>
  );
}