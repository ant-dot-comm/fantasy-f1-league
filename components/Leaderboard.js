import { useEffect, useState } from "react";
import axios from "axios";
import classNames from "classnames";
import { motion } from "framer-motion";
import { LayoutList } from "lucide-react";

import Modal from "./Modal"; // Import the reusable modal

export default function Leaderboard({ season, loggedInUser, className }) {
    const [leaderBoardScores, setLeaderBoardScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectePlayerRaceData, setSelectedPlayerRaceData] = useState({});

    useEffect(() => {
        async function fetchScores() {
            setLoading(true);
            setSelectedPlayer(null);
            setSelectedPlayerRaceData({});
            setLeaderBoardScores([]);
        
            try {
                console.log(`📡 Fetching leaderboard for season: ${season}`);
                const res = await axios.get(`/api/leaderboard?season=${season}`);        
                // console.log("✅ Leaderboard API Response:", res.data);
        
                if (res.data.leaderboard && res.data.leaderboard.length > 0) {
                    setLeaderBoardScores(res.data.leaderboard);
                    sessionStorage.setItem(`leaderboard-${season}`, JSON.stringify(res.data.leaderboard));
                    // console.log("✅ Leaderboard stored in session");
                } else {
                    console.warn("⚠️ No leaderboard data found.");
                }
            } catch (error) {
                console.error("❌ Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        }
    
        fetchScores();
    }, [season]);

    async function fetchSelectedPlayerRaceData(username) {
        if (selectePlayerRaceData[username]) return;
        try {
            const res = await axios.get(`/api/selected-leaderboard-player-race-scores?username=${username}&season=${season}`);
            setSelectedPlayerRaceData((prev) => ({
                ...prev,
                [username]: res.data.raceBreakdown,
            }));
        } catch (error) {
            console.error("❌ Error fetching player race data:", error);
        }
    }

    // console.log({leaderBoardScores});
    return (
        <div className={classNames(className, "p-6 bg-neutral-700 rounded-2xl text-neutral-200 sm:min-h-[30rem]")}>
            <ul className="flex gap-2 flex-col">
                {leaderBoardScores.length > 0 ? (
                    leaderBoardScores
                        .sort((a, b) => b.points - a.points)
                        .map((user, index) => (
                            <li key={user.username}>
                                <button
                                    onClick={() => {
                                        setSelectedPlayer(user.username);
                                        fetchSelectedPlayerRaceData(user.username);
                                    }}
                                    className={classNames(
                                        "w-full text-left font-bold bg-neutral-200 max-sm:pr-10 sm:px-2 rounded-lg flex items-center justify-between gap-4 border-b-8 group transition-all duration-200 relative",
                                        "hover:bg-neutral-50 hover:text-neutral-700 hover:shadow-md hover:cursor-pointer hover:pr-12",
                                        user.username === loggedInUser ? "border-cyan-800 text-cyan-800 shadow-md" : "border-neutral-500 text-neutral-500",
                                        // { "hover:bg-neutral-50 hover:text-neutral-700 hover:shadow-md hover:cursor-pointer hover:pr-12": user.points !== 0 }
                                    )}
                                    // disabled={user.points === null || user.points === 0}
                                >
                                    <p className={classNames(
                                        "font-display text-2xl -mb-3 leading-none shrink-0 w-10 text-center",
                                        user.username === loggedInUser ? "text-cyan-800" : "text-neutral-500"
                                    )}>
                                        P{index + 1}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:gap-1 flex-wrap grow overflow-hidden">
                                        <p className="leading-none max-sm:text-sm truncate">
                                            {user.username}
                                        </p>
                                        {loggedInUser && (
                                            <p className={classNames(
                                                "text-[8px] sm:text-xs sm:font-light leading-none sm:text-transparent",
                                                { "group-hover:text-neutral-500 transition-colors duration-300": loggedInUser }
                                            )}> 
                                                <span className="max-sm:hidden">-</span> {user.first_name}
                                            </p>
                                        )}
                                    </div>

                                    <p className="shrink-0 text-neutral-700 ">{user.points !== null ? user.points : "--"}</p>

                                    {/* {user.points !== 0 && ( */}
                                        <div className="sm:w-0 sm:opacity-0 group-hover:w-fit sm:group-hover:opacity-100 bg-neutral-300 rounded-tr-lg absolute right-0 top-0 bottom-0 flex items-center justify-center px-2 transition-all duration-200">
                                            <LayoutList size={16} strokeWidth={2.5} />
                                        </div>
                                    {/* )} */}
                                </button>
                            </li>
                        ))
                ) : loading ? (
                    <li className="animate-pulse space-y-2">
                        <div className="bg-neutral-800 h-6 w-full rounded-md" />
                        <div className="bg-neutral-800 h-6 w-full rounded-md" />
                        <div className="bg-neutral-800 h-6 w-full rounded-md" />
                        <div className="bg-neutral-800 h-6 w-full rounded-md" />
                        <div className="bg-neutral-800 h-6 w-full rounded-md" />
                        <div className="bg-neutral-800 h-6 w-full rounded-md" />
                    </li>
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
                {selectePlayerRaceData[selectedPlayer] ? (
                    selectePlayerRaceData[selectedPlayer].map((race, index) => {
                        console.log({race})
                        return ( 
                        <>
                        <div key={race.meeting_key} className="mt-6 mb-10 relative">
                            <ul className="text-sm bg-neutral-300 rounded-lg flex items-end justify-between relative">
                                {race.results.length >= 2 && (
                                    <div className="grid grid-cols-3 gap-2 absolute top-[-1.5rem] left-1/2 -translate-x-1/2 items-center ">
                                        <p className="text-lg font-display text-right">{race.results[0].points}</p>

                                        <div className="text-center font-display text-2xl bg-cyan-800 rounded w-10">
                                            {race.results.reduce((acc, d) => acc + d.points, 0)}
                                        </div>
                                        <p className="text-lg font-display text-left">{race.results[1].points}</p>
                                    </div>
                                )}
                                {race.results.map((driver, index) => (
                                    <li 
                                        key={driver.name_acronym} 
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
                                            <div className={classNames("flex items-end", index === 1 ? "flex-row-reverse" : "flex-row")}>
                                                <p className="font-display text-lg leading-none">{driver.name_acronym}</p>
                                                <span className={classNames("text-[8px] mb-[1px] text-neutral-400", index === 1 ? "mr-[2px]" : "ml-[2px]" )}>{driver.autoPicks && "Auto Picked"}</span>
                                            </div>
                                            <p className="text-xs font-bold leading-none text-neutral-700">
                                                P{driver.qualifying_position} - {driver.race_position === 0 ? "DNF" : `P${driver.race_position}`}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <h4 className="text-center absolute bottom-1 left-1/2 -translate-x-1/2 w-[75%]">
                                <p className="leading-none text-[10px] font-bold text-neutral-500 uppercase">Round {index +1}</p>
                                <p className="font-bold text-center text-sm text-neutral-700 leading-none">{race.race}</p>
                            </h4>
                        </div>
                        </>
                        )
                    })
                ) : (
                    <p>Loading race results...</p>
                )}
            </Modal>
        </div>
    );
}