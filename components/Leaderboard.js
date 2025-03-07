import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard({ season, loggedInUser, className }) {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [playerRaceData, setPlayerRaceData] = useState({});

    useEffect(() => {
        async function fetchScores() {
            setLoading(true);

            // ✅ Check if leaderboard data is already in session storage
            const storedScores = sessionStorage.getItem(
                `leaderboard-${season}`
            );
            if (storedScores) {
                setScores(JSON.parse(storedScores));
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(
                    `/api/leaderboard?season=${season}`
                );
                setScores(res.data.leaderboard);
                sessionStorage.setItem(
                    `leaderboard-${season}`,
                    JSON.stringify(res.data.leaderboard)
                );
            } catch (error) {
                console.error("❌ Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchScores();
    }, [season]);

    async function fetchPlayerRaceData(username) {
        if (playerRaceData[username]) return;
        try {
            const res = await axios.get(
                `/api/player-race-scores?username=${username}&season=${season}`
            );
            setPlayerRaceData((prev) => ({
                ...prev,
                [username]: res.data.raceBreakdown,
            }));
        } catch (error) {
            console.error("❌ Error fetching player race data:", error);
        }
    }

    return (
        <div
            className={classNames(
                className,
                "p-6 bg-neutral-700 rounded-2xl text-neutral-200"
            )}
        >
            <h2 className="text-2xl font-bold mb-4">
                Season {season} Leaderboard
            </h2>
            <ul className="p-4 rounded-lg shadow-md">
                {scores.length > 0 ? (
                    scores
                        .sort((a, b) => b.points - a.points)
                        .map((user, index) => (
                            <li
                                key={user.username}
                                className={`p-2 border-b ${
                                    user.username === loggedInUser
                                        ? "bg-yellow-200 font-bold"
                                        : ""
                                }`}
                            >
                                <button
                                    onClick={() => {
                                        setSelectedPlayer(user.username);
                                        fetchPlayerRaceData(user.username);
                                    }}
                                    className="w-full text-left font-bold"
                                >
                                    {index + 1}. {user.username} - {user.points}{" "}
                                    pts
                                </button>
                            </li>
                        ))
                ) : loading ? (
                    <li>Loading player scores...</li>
                ) : (
                    <li>No scores available</li>
                )}
            </ul>

            {/* ✅ Framer Motion Modal */}
            <AnimatePresence>
                {selectedPlayer && (
                    <motion.div
                        className="fixed inset-0 flex items-end sm:items-center justify-end sm:justify-center bg-neutral-200/50 backdrop-blur-xl z-[500]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-[95%] max-w-md text-neutral-200 shadow-lg overflow-hidden flex flex-col relative"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{
                                type: "spring",
                                stiffness: 120,
                                damping: 15,
                            }}
                        >
                            <div className="flex justify-between items-center px-4">
                                <div>
                                    <h3 className="font-bold text-neutral-500 leading-none">
                                        {selectedPlayer}
                                    </h3>
                                    <p className="text-2xl font-display text-neutral-700 leading-none -mb-1.5">
                                        Season Picks
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedPlayer(null)}
                                    className="px-2 text-neutral-700 font-bold"
                                >
                                    <X size={32} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="bg-neutral-800 p-6 pb-20 max-sm:rounded-tl-2xl sm:rounded-2xl overflow-y-auto h-[90vh] model-content">
                                <div className="content-fade w-full h-1/5 absolute left-0 sm:rounded-b-2xl bottom-0 bg-gradient-to-b transparent to-neutral-800 z-[2]" />
                                {playerRaceData[selectedPlayer] ? (
                                    playerRaceData[selectedPlayer].map(
                                        (race) => (
                                            <div
                                                key={race.meeting_key}
                                                className="mb-3 p-2 bg-neutral-900 rounded-lg"
                                            >
                                                <h4 className="font-bold">
                                                    {race.race}
                                                </h4>
                                                <ul className="text-sm">
                                                    {race.results.map(
                                                        (driver) => (
                                                            <li
                                                                key={
                                                                    driver.driver_number
                                                                }
                                                            >
                                                                {
                                                                    driver.driver_name
                                                                }{" "}
                                                                ({driver.team})
                                                                - Q:
                                                                {
                                                                    driver.qualifying_position
                                                                }
                                                                , R:
                                                                {
                                                                    driver.race_position
                                                                }
                                                                , Pts:
                                                                {driver.points}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <p>Loading race breakdown...</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
