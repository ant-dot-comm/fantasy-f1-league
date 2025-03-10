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
            setSelectedPlayer(null);
            setPlayerRaceData({});
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
                    playerRaceData[selectedPlayer].map((race, index) => (
                        <div key={race.meeting_key} className="mt-6 mb-10 relative">
                            <ul className="text-sm bg-neutral-300 rounded-lg flex items-end justify-between relative">
                                {race.results.length >= 2 && (
                                    <div className="grid grid-cols-3 gap-2 absolute top-[-1.5rem] left-1/2 -translate-x-1/2 items-center ">
                                        {/* ✅ Extract Driver Scores */}
                                        <p className="text-lg font-display text-right">{race.results[0].points}</p>

                                        {/* ✅ Display total score once in between */}
                                        <div className="text-center font-display text-2xl bg-cyan-800 rounded w-10">
                                            {race.results.reduce((acc, d) => acc + d.points, 0)}
                                        </div>
                                        <p className="text-lg font-display text-left">{race.results[1].points}</p>
                                    </div>
                                )}
                                {race.results.map((driver, index) => (
                                    <li 
                                        key={driver.driver_number} 
                                        className={classNames(
                                            "flex flex-col relative -mt-4 rounded-lg",
                                            index === 1 ? "items-end -mr-2" : "items-start -ml-2",
                                        )}
                                    >
                                        <img 
                                            src={driver.headshot_url} 
                                            alt={driver.driver_name} 
                                            className="h-14 mr-2 shrink-0"
                                        />
                                        <div 
                                            className={classNames(
                                                "absolute top-0 flex flex-col w-max",
                                                index === 1 ? "right-12 text-right" : "left-10 text-left",
                                            )}
                                        >
                                            <p className="font-display text-lg leading-none">{driver.name_acronym}</p>
                                            <p className="text-xs font-bold leading-none text-neutral-700">P{driver.qualifying_position} - P{driver.race_position}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <h4 className="text-center absolute bottom-1 left-1/2 -translate-x-1/2 w-[75%]">
                                <p className="leading-none text-[10px] font-bold text-neutral-500 uppercase">Round {index +1}</p>
                                <p className="font-bold text-center text-sm text-neutral-700 leading-none">{race.race}</p>
                            </h4>
                        </div>
                    ))
                ) : (
                    <p>Loading race results...</p>
                )}
            </Modal>
        </div>
    );
}