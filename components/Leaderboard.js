import { useEffect, useState } from "react";
import axios from "axios";

export default function Leaderboard({ season }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      setLoading(true); // Show loading indicator
      const cachedScores = sessionStorage.getItem(`leaderboard_${season}`);

      if (cachedScores) {
        console.log("✅ Using Cached Leaderboard Data");
        setScores(JSON.parse(cachedScores));
      } else {
        console.log("🔄 Fetching Leaderboard Data from API...");
        try {
            console.log(`🔄 Fetching Leaderboard Data for season ${season}...`);
            const res = await axios.get(`/api/leaderboard?season=${season}`);
            setScores(res.data.leaderboard);
            // ✅ Store in sessionStorage
            sessionStorage.setItem(`leaderboard_${season}`, JSON.stringify(res.data.leaderboard));
          } catch (error) {
            console.error("❌ Error fetching leaderboard:", error);
          } finally {
            setLoading(false); // Hide loading indicator when done
          }
      }
    }

    fetchScores();
  }, [season]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Season {season} Leaderboard</h2>
      <ul className=" p-4 rounded-lg shadow-md">
        {scores.length > 0 ? (
          scores
            .sort((a, b) => b.points - a.points)
            .map((user, index) => (
              <li key={user.username} className="p-2 border-b">
                {index + 1}. {user.username} - {user.points} pts
              </li>
            ))
        ) : (
          loading ? <li>loading</li> : <li className="p-2 text-gray-500">No scores available</li>
        )}
      </ul>
    </div>
  );
}