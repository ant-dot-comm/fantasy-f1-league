import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export default function Header() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    // ✅ Check for token in cookies
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token"); // ✅ Remove auth token
    setUsername(""); // ✅ Clear user info
    router.push("/"); // ✅ Redirect to home
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        <Link href="/">Fantasy F1 League</Link>
      </h1>
      <nav className="flex space-x-4">
        {username ? (
          <>
            <span>Welcome, {username}!</span>
            <button onClick={handleLogout} className="px-3 py-1 border rounded bg-red-500 hover:bg-red-600">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/signup" className="px-3 py-1 border rounded bg-blue-500 hover:bg-blue-600">
              Sign Up
            </Link>
            <Link href="/login" className="px-3 py-1 border rounded bg-green-500 hover:bg-green-600">
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}