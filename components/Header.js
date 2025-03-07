import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";

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
        <header className="border-b-8 border-neutral-700 uppercase">
            <div className="container mx-auto mt-2 -mb-2 flex justify-between items-end">
                <h1 className="font-display text-3xl leading-none">
                    <Link href="/">Fantasy F1 League</Link>
                </h1>
                <nav className="flex space-x-4">
                    {username ? (
                        <>
                            <span>Welcome, {username}!</span>
                            <button
                                onClick={handleLogout}
                                className="font-display"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/signup" className="font-display">
                                Sign Up
                            </Link>
                            <Link href="/login" className="font-display">
                                Login
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
