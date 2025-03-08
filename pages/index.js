import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Header from "../components/Header";
import Leaderboard from "../components/Leaderboard";
import CurrentPick from "../components/CurrentPicks";
import RankingsList from "@/components/RankingsList";

export default function Home() {
    const [season, setSeason] = useState(new Date().getFullYear());
    const [username, setUsername] = useState(null);
    const [topRaceScoresData, setTopRaceScoresData] = useState([]);
    const [averageRaceScoresData, setAverageRaceScoresData] = useState([]);
    const [topScoringDrivers, setTopScoringDrivers] = useState([]);
    const [driverSelectionData, setDriverSelectionData] = useState([]);
    const [loadingTopScores, setLoadingTopScores] = useState(true);

    // ✅ Get Logged-in Username from JWT Token
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

    useEffect(() => {
      async function fetchStats() {
          const cacheKey = `stats-${season}`;
          const cachedData = sessionStorage.getItem(cacheKey);
  
          if (cachedData) {
              const parsedData = JSON.parse(cachedData);
              setTopRaceScoresData(parsedData.topSingleRaceScores || []);
              setAverageRaceScoresData(parsedData.averagePointsPerUser || []);
              setDriverSelectionData(parsedData.driverSelectionPercent || []);
              setTopScoringDrivers(parsedData.topScoringDrivers || []);
              setLoadingTopScores(false);
              return;
          }
  
          try {
              const [raceStatsRes, driverSelectionRes] = await Promise.all([
                  fetch(`/api/top-race-scores?season=${season}`),
                  fetch(`/api/driver-selection-stats?season=${season}`)
              ]);
  
              const raceStatsData = await raceStatsRes.json();
              const driverSelectionData = await driverSelectionRes.json();
  
              setTopRaceScoresData(raceStatsData.topSingleRaceScores || []);
              setAverageRaceScoresData(raceStatsData.averagePointsPerUser || []);
              setTopScoringDrivers(raceStatsData.topScoringDrivers || []);
              setDriverSelectionData(driverSelectionData.driverSelectionPercent || []);
  
              sessionStorage.setItem(
                  cacheKey,
                  JSON.stringify({
                      ...raceStatsData,
                      driverSelectionPercent: driverSelectionData.driverSelectionPercent || [],
                  })
              );
          } catch (error) {
              console.error("❌ Error fetching race stats:", error);
          } finally {
              setLoadingTopScores(false);
          }
      }
  
      fetchStats();
  }, [season]);

    const leagueStats = (
      <div className="sm:flex sm:flex-row gap-4 w-full">
        <div className="w-full">
          <h2 className="text-xl font-bold mb-2">Best Single Race Scores</h2>
          <RankingsList scores={topRaceScoresData} loggedInUser={username} />
        </div>
        <div className="w-full">
          <h2 className="text-xl font-bold mb-2">Best Average Scores</h2>
          <RankingsList scores={averageRaceScoresData} loggedInUser={username} />
        </div>
      </div>
    )
          
    return (
        <div>
            <Header />
            <div className="flex flex-col justify-center items-center mb-8 p-8">
                <h1 className="text-xl font-display leading-none">
                    Best of the Rest
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

                <div className="flex flex-col sm:flex-row mx-auto relative gap-4">
                    <div className="responsive-contianer relative sm:absolute sm:w-full sm:mt-10 max-sm:mb-4">
                        <div className="responsive-line" />
                        <div className="flex flex-col items-end w-1/2 sm:px-8">
                            <div className="responsive-xl">League</div>
                            <div className="responsive-lg text-neutral-500 z-[1]">
                                Stats
                            </div>
                        </div>
                    </div>
                    <div className="max-sm:hidden w-1/2 flex items-start mt-[20%]">{leagueStats}</div>
                    <Leaderboard
                        season={season}
                        loggedInUser={username}
                        className="sm:w-1/2 sm:mr-3 max-sm:mx-3 z-10"
                    />
                </div>
            </section>

            {/* ✅ Top Race Scores */}
            <section>
              <div className="mt-32">
                  
                  {loadingTopScores ? (
                      <p>Loading...</p>
                  ) : (
                      <div className="sm:hidden">{leagueStats}</div>
                  )}
              </div>
            </section>

            <div className="responsive-contianer flex justify-end relative w-full my-12 max-sm:mb-4">
                <div className="responsive-line" />
                <div className="flex flex-col items-end w-1/2 sm:px-8">
                    <div className="responsive-xl">Driver</div>
                    <div className="responsive-lg text-neutral-500 z-[1]">
                        Stats
                    </div>
                </div>
            </div>

            <section className="flex flex-col sm:flex-row gap-4 items-center max-w-2xl mx-auto mt-24">
              <div className="w-full">
                <h2 className="text-xl font-bold mb-2">Most Picked Drivers</h2>
                {loadingTopScores ? <p>Loading...</p> : <RankingsList scores={driverSelectionData} />}
              </div>
              <div className="w-full">
                <h2 className="text-xl font-bold mb-2">Top Scoring Drivers</h2>
                {loadingTopScores ? <p>Loading...</p> : <RankingsList scores={topScoringDrivers} />}
              </div>
            </section>
        </div>
    );
}