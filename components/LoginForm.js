import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";

export default function LoginForm({ onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

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

  return (
    <form onSubmit={handleLogin} className="p-6 rounded-lg flex flex-col gap-2">
      {error && <p className="text-red-500">{error}</p>}
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="text-input" required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-input" required />
      <button type="submit" className="w-full bg-cyan-800 text-white p-2 rounded-lg">Login</button>
    </form>
  );
}