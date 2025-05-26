import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import axios from "axios";

export const Top3Players = ({ drivers, season }) => {
    const [topPlayers, setTopPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTopPlayers() {
            setLoading(true);
            setTopPlayers([]);

            try {
                // console.log(`📡 Fetching top 3 players for season: ${season}`);
                const res = await axios.get(`/api/leaderboard?season=${season}`);
                // console.log("🔍 API Response:", res.data);
                if (res.data.leaderboard && res.data.leaderboard.length > 0) {
                    // ✅ Sort leaderboard and get top 3 players
                    const sortedPlayers = res.data.leaderboard
                        .sort((a, b) => b.points - a.points)
                        .slice(0, 3);
                    
                    setTopPlayers(sortedPlayers);
                    setLoading(false);
                    // console.log("✅ Top 3 Players:", sortedPlayers);
                } else {
                    console.warn("⚠️ No leaderboard data found.");
                }
            } catch (error) {
                console.error("❌ Error fetching top players:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchTopPlayers();
    }, [season]);

    // console.log("🏁 Top 3 Players:", topPlayers);

    const playerLockup = ( position, player, score ) => {
        return (
            <div 
                className={classNames(
                    "flex flex-col items-center shrink-0 leading-none", 
                    {"-mx-15 z-10 items-center": position === "1", "items-start": position === "2", "items-end": position === "3"},
                )}>
                <p className="font-bold text-neutral-400 text-xs">P{position}</p>
                <p className="font-bold mb-[2px] text-xs">{player}</p>
                <p className="font-bold text-neutral-400">
                    {score}
                </p>
                <img 
                    src={position === "1" ? "/drivers/default1.png" : position === "2" ? "/drivers/default2.png" : "/drivers/default3.png"} 
                    alt={player}
                    className={classNames("shrink-0", position === "1" ? "h-40" : "h-32", {"-scale-x-100": position === "3"})}
                />
            </div>
        )
    };
    return (
        <div className="text-neutral-200 text-center relative">
            <h2 className="font-display text-2xl font-bold uppercase mb-2"> 
                {season} Results
            </h2>
            <div className="divider-glow-dark mb-4" />

            {/* Podium Layout */}
            <div className="flex items-end justify-center gap-6 relative">
                {/* P2 - Left */}
                {/* <div className="flex flex-col items-center">
                    <p className="text-lg sm:text-xl font-bold text-neutral-400">P2</p>
                    <p className="text-xl sm:text-2xl font-bold">{topPlayers[1]?.username || "TBD"}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-cyan-400">
                        {topPlayers[1]?.points ?? "--"}
                    </p>
                    <div className="w-28 sm:w-32 h-40 sm:h-44 bg-neutral-700 rounded-lg mt-2" />
                </div> */}
                {playerLockup("2", topPlayers[1]?.username, topPlayers[1]?.points)}
                {playerLockup("1", topPlayers[0]?.username, topPlayers[0]?.points)}
                {playerLockup("3", topPlayers[2]?.username, topPlayers[2]?.points)}
            </div>
        </div>
    );
};