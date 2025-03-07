import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Header from "../components/Header";
import Leaderboard from "../components/Leaderboard";
import CurrentPick from "../components/CurrentPicks";

export default function Home() {
    const [season, setSeason] = useState(new Date().getFullYear());
    const [username, setUsername] = useState(null);

    useEffect(() => {
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

    return (
        <div>
            <Header />
            <div className="flex flex-col justify-center items-center mb-8 p-8">
                <h1 className="text-xl font-display leading-none">
                    Best of the rest
                </h1>
                <label className="text-sm leading-none mb-2">
                    Redemption starts at the back
                </label>
                <select
                    value={season}
                    onChange={(e) => setSeason(parseInt(e.target.value))}
                    className="p-2 border-4 rounded-lg"
                >
                    {[...Array(10)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        );
                    })}
                </select>
            </div>
            <section>
                {username && (
                    <CurrentPick season={season} username={username} />
                )}

                <div className="flex flex-col sm:flex-row sm:justify-end mx-auto relative">
                    <div className="responsive-contianer relative sm:absolute sm:w-full sm:mt-10 max-sm:mb-4">
                        <div className="responsive-line" />
                        <div className="flex flex-col items-end w-1/2 sm:px-8">
                            <div className="responsive-xl">League</div>
                            <div className="responsive-lg text-neutral-600 z-[1]">
                                Stats
                            </div>
                        </div>
                    </div>
                    <Leaderboard
                        season={season}
                        className="sm:w-1/2 sm:mr-3 max-sm:mx-3 z-10"
                    />
                </div>
            </section>
            <div className="responsive-contianer flex justify-end relative w-full my-12 max-sm:mb-4">
                <div className="responsive-line" />
                <div className="flex flex-col items-end w-1/2 sm:px-8">
                    <div className="responsive-xl">Driver</div>
                    <div className="responsive-lg text-neutral-600 z-[1]">
                        Stats
                    </div>
                </div>
            </div>
        </div>
    );
}
