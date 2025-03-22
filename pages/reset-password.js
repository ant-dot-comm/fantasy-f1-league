import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (router.isReady) {
      const urlToken = router.query.token;
      if (!urlToken) {
        setError("Invalid reset link.");
      } else {
        setToken(urlToken);
      }
    }
  }, [router.isReady, router.query.token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid reset link 2.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/reset-password`, { token, password: newPassword });
      setMessage(res.data.message);
      setTimeout(() => router.push("/login"), 3000); // ✅ Redirect to login after success
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <form onSubmit={handleResetPassword} className="bg-neutral-700 rounded-2xl w-[90%] max-w-[500px] p-6 flex flex-col gap-2">
            {error && <p className="text-rose-400">{error}</p>}
            {message && <p className="text-emerald-400">{message}</p>}
            {token && (
                <>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="text-input"
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="text-input"
                    />
                    <button type="submit" className="w-full bg-cyan-800 text-white p-2 rounded-lg mt-4">Reset Password</button>
                </>
            )}
        </form>
    </div>
  );
}