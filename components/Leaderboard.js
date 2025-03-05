import { useEffect, useState } from "react";
import axios from "axios";

export default function Leaderboard({ season }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [playerRaceScores, setPlayerRaceScores] = useState({});

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      try {
        console.log(`🔄 Fetching Leaderboard Data for season ${season}...`);
        const res = await axios.get(`/api/leaderboard?season=${season}`);
        setScores(res.data.leaderboard);
      } catch (error) {
        console.error("❌ Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [season]);

  const togglePlayer = async (username) => {
    if (expandedPlayer === username) {
      setExpandedPlayer(null); // Close accordion if already open
      return;
    }

    setExpandedPlayer(username);

    if (!playerRaceScores[username]) {
      const cachedData = sessionStorage.getItem(`raceScores_${season}_${username}`);
      if (cachedData) {
        console.log(`✅ Using Cached Race Scores for ${username}`);
        setPlayerRaceScores((prev) => ({ ...prev, [username]: JSON.parse(cachedData) }));
      } else {
        console.log(`🔄 Fetching Race Scores for ${username} in ${season}...`);
        try {
          const res = await axios.get(`/api/player-race-scores?season=${season}&username=${username}`);
          setPlayerRaceScores((prev) => ({ ...prev, [username]: res.data.scores }));
          sessionStorage.setItem(`raceScores_${season}_${username}`, JSON.stringify(res.data.scores));
        } catch (error) {
          console.error(`❌ Error fetching race scores for ${username}:`, error);
        }
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Season {season} Leaderboard</h2>
      <ul className="p-4 rounded-lg shadow-md">
        {scores.length > 0 ? (
          scores
            .sort((a, b) => b.points - a.points)
            .map((user, index) => (
              <li key={user.username} className="border-b">
                <button
                  className="w-full text-left p-2 font-bold  hover:bg-gray-300"
                  onClick={() => togglePlayer(user.username)}
                >
                  {index + 1}. {user.username} - {user.points} pts
                </button>

                {expandedPlayer === user.username && (
                  <div className="p-3 border-l-4 border-blue-500">
                    {playerRaceScores[user.username] ? (
                      playerRaceScores[user.username].map((race) => (
                        <div key={race.meetingKey} className="mb-2 p-2 border rounded-lg ">
                          <h3 className="font-semibold">{race.meetingName} - {race.points} pts</h3>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {race.drivers?.map((driver, idx) => (
                              <div key={driver.driverNumber} className="p-2  shadow rounded">
                                <p className="font-bold">Driver {driver.driverNumber}</p>
                                <p>Q: {driver.qualifyingPosition}</p>
                                <p>R: {driver.racePosition}</p>
                                <p>Pts: {driver.points}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Loading race breakdown...</p>
                    )}
                  </div>
                )}
              </li>
            ))
        ) : loading ? (
          <li className="p-2 text-gray-500">Loading...</li>
        ) : (
          <li className="p-2 text-gray-500">No scores available</li>
        )}
      </ul>
    </div>
  );
}