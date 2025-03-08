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
        <header className="border-b-8 border-neutral-700">
            <div className="px-6 mx-auto mt-2 -mb-2 flex justify-between items-end">
                <h1 className="font-display text-3xl leading-none">
                    <Link href="/">Fantasy F1 League</Link>
                </h1>
                <nav className="flex space-x-4 items-end">
                    {username ? (
                        <>
                            <span className="flex flex-col items-end">
                                <p className="text-xs text-neutral-500 font-bold leading-none mb-[-4px]">Welcome</p>
                                <p className="font-display text-lg mb-[-2px]">{username}</p>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="font-display"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/signup" className="font-display text-lg">
                                Sign Up
                            </Link>
                            <Link href="/login" className="font-display text-lg">
                                Login
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
