import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";

export default function SignupForm({ onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("/api/auth/signup", { username, password });

      Cookies.set("token", res.data.token, { expires: 7 });
      sessionStorage.setItem("username", username);
      onClose(); // ✅ Close modal after signup
      router.reload(); // ✅ Refresh page to reflect login
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSignup} className="p-6 rounded-lg flex flex-col gap-2">
      {error && <p className="text-red-500">{error}</p>}
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="text-input" required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-input" required />
      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="text-input" required />
      <button type="submit" className="w-full bg-cyan-800 text-white p-2 rounded-lg">Sign Up</button>
    </form>
  );
}