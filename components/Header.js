import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import { Menu } from "lucide-react";
import raceSchedule from "../data/raceSchedule.js";
import Modal from "@/components/Modal";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import classNames from "classnames";

export default function Header() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);

    useEffect(() => {
        // ✅ Check for token in cookies
        const token = Cookies.get("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsername(decoded.username);
            } catch (error) {
                console.error("Error decoding token:", error);
                setUsername(null);
            }
        } else {
            setUsername(null); // ✅ Handle logout case
        }
    }, [Cookies.get("token")]);

    const handleLogout = () => {
        Cookies.remove("token"); // ✅ Remove auth token
        sessionStorage.clear();  // ✅ Clear session storage
        setUsername(null); // ✅ Clear user info
        setIsMenuOpen(false);
        router.push("/"); // ✅ Redirect to home
    };

    const signupBeforeDate = new Date(raceSchedule["1254"].picks_close); // Convert to Date object
    const formattedTime = signupBeforeDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    const hideAtSeasonStart  = signupBeforeDate > new Date() && !username


    return (
        <header className="border-b-8 border-neutral-700">
            {hideAtSeasonStart && (
                <div className="bg-gradient-to-b from-cyan-800 to-neutral-700 text-neutral-100 p-2 text-center leading-none py-4">
                    Sign up before <span className="font-bold text-white">{formattedTime} on {signupBeforeDate.toLocaleDateString()}</span> to be eligible for the 2025 season!
                    <button
                        onClick={() => setIsSignupOpen(true)}
                        className="font-bold text-lg block mx-auto bg-neutral-100 text-cyan-800 rounded-md px-2 mt-2 shadow-2xl"
                    >
                        Sign Up
                    </button>
                </div>
            )}
            <div className="sm:mt-2 flex justify-between items-end sm:px-3">
                <h1 className="font-display -mb-1.5 sm:-mb-2 text-2xl sm:text-3xl leading-none max-sm:ml-3">
                    <Link href="/">Fantasy F1 League</Link>
                </h1>

                {/* ✅ Desktop Navigation */}
                <nav className={classNames(
                    "hidden sm:flex space-x-6 items-end",
                    username ? "-mb-2" : "-mb-2.5"
                )}>
                    {username ? (
                        <>
                            <span className="flex flex-col items-end">
                                <p className="text-xs text-neutral-500 font-bold leading-none mb-[-6px]">Welcome</p>
                                <p className="font-display text-lg mb-[-1.5px] text-cyan-800">{username}</p>
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
                            {hideAtSeasonStart && (
                                <button
                                    onClick={() => setIsSignupOpen(true)}
                                    className="font-display text-lg"
                                >
                                    Sign Up
                                </button>
                            )}
                            <button
                                onClick={() => setIsLoginOpen(true)}
                                className="font-display text-lg"
                            >
                                Login
                            </button>
                        </>
                    )}
                </nav>

                {/* ✅ Mobile Hamburger Button */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="py-2 px-4 bg-neutral-700 text-neutral-300 sm:hidden"
                >
                    <Menu size={32} strokeWidth={2.5} />
                </button>
            </div>

            {/* ✅ Mobile Menu Modal */}
            <Modal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Menu">
                <nav className="flex flex-col">
                    {username ? (
                        <>
                            <p className="text-sm text-neutral-400 leading-none">Welcome</p>
                            <p className="text-lg font-display text-white leading-none">{username}</p>
                            <button
                                onClick={handleLogout}
                                className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-md"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {hideAtSeasonStart && (
                                <button
                                    onClick={() => { setIsSignupOpen(true); setIsMenuOpen(false); }}
                                    className="block text-lg font-display text-white hover:text-gray-400"
                                >
                                    Sign Up
                                </button>
                            )}
                            <button
                                onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }}
                                className="block text-lg font-display text-white hover:text-gray-400"
                            >
                                Login
                            </button>
                        </>
                    )}
                </nav>
            </Modal>

            {/* ✅ Login Modal */}
            <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Login">
                <LoginForm onClose={() => setIsLoginOpen(false)} />
            </Modal>

            {/* ✅ Signup Modal */}
            <Modal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} title="Sign Up">
                <SignupForm onClose={() => setIsSignupOpen(false)} />
            </Modal>
        </header>
    );
}