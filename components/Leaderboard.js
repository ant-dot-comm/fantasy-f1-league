import { useEffect, useState } from "react";
import axios from "axios";
import classNames from "classnames";
import { motion } from "framer-motion";
import Modal from "./Modal"; // Import the reusable modal

export default function Leaderboard({ season, loggedInUser, className }) {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [playerRaceData, setPlayerRaceData] = useState({});

    useEffect(() => {
        async function fetchScores() {
            setLoading(true);
            const storedScores = sessionStorage.getItem(`leaderboard-${season}`);
            if (storedScores) {
                setScores(JSON.parse(storedScores));
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`/api/leaderboard?season=${season}`);
                setScores(res.data.leaderboard);
                sessionStorage.setItem(`leaderboard-${season}`, JSON.stringify(res.data.leaderboard));
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
            const res = await axios.get(`/api/player-race-scores?username=${username}&season=${season}`);
            setPlayerRaceData((prev) => ({
                ...prev,
                [username]: res.data.raceBreakdown,
            }));
        } catch (error) {
            console.error("❌ Error fetching player race data:", error);
        }
    }

    return (
        <div className={classNames(className, "p-6 bg-neutral-700 rounded-2xl text-neutral-200 sm:min-h-[30rem]")}>
            <ul className="flex gap-2 flex-col">
                {scores.length > 0 ? (
                    scores
                        .sort((a, b) => b.points - a.points)
                        .map((user, index) => (
                            <li key={user.username}>
                                <button
                                    onClick={() => {
                                        setSelectedPlayer(user.username);
                                        fetchPlayerRaceData(user.username);
                                    }}
                                    className={classNames(
                                        "w-full text-left font-bold bg-neutral-200 px-2 rounded-lg flex items-center justify-between gap-4 border-b-8",
                                        user.username === loggedInUser ? "border-cyan-800 text-cyan-800 shadow-lg" : "border-neutral-500 text-neutral-500"
                                    )}
                                >
                                    <p className={classNames(
                                        "font-display text-4xl -mb-2 -mt-1 leading-none shrink-0",
                                        user.username === loggedInUser ? " text-cyan-800" : "text-neutral-500"
                                    )}>P{index + 1}</p>
                                    <p className="grow leading-none">{user.username}</p>
                                    <p className="shrink-0 text-neutral-700 ">{user.points}</p>
                                </button>
                            </li>
                        ))
                ) : loading ? (
                    <li>Loading player scores...</li>
                ) : (
                    <li>No scores available</li>
                )}
            </ul>

            {/* ✅ Reusable Modal Component */}
            <Modal
                isOpen={!!selectedPlayer}
                onClose={() => setSelectedPlayer(null)}
                user={selectedPlayer}
                title="Season Picks"
            >
                {playerRaceData[selectedPlayer] ? (
                    playerRaceData[selectedPlayer].map((race) => (
                        <div key={race.meeting_key} className="mb-3 p-2 bg-neutral-900 rounded-lg">
                            <h4 className="font-bold">{race.race}</h4>
                            <ul className="text-sm">
                                {race.results.map((driver) => (
                                    <li key={driver.driver_number}>
                                        {driver.driver_name} ({driver.team}) - Q:{driver.qualifying_position}, R:
                                        {driver.race_position}, Pts:{driver.points}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>Loading race results...</p>
                )}
            </Modal>
        </div>
    );
}