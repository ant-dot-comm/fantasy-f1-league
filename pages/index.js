import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Header from "../components/Header";
import Leaderboard from "../components/Leaderboard";
import CurrentPick from "../components/CurrentPicks";
import RankingsList from "@/components/RankingsList";
import classNames from "classnames";
import RulesAndScoring from "@/components/RulesAndScoring";

export default function Home() {
    const [season, setSeason] = useState(new Date().getFullYear());
    const [username, setUsername] = useState(null);
    const [topRaceScoresData, setTopRaceScoresData] = useState([]);
    const [averageRaceScoresData, setAverageRaceScoresData] = useState([]);
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
            // console.log("Fetching stats for season rightchere:", season);
          const cacheKey = `stats-${season}`;
          const cachedData = sessionStorage.getItem(cacheKey);
          setLoadingTopScores(true);
  
          if (cachedData) {
              const parsedData = JSON.parse(cachedData);
              setTopRaceScoresData(parsedData.topSingleRaceScores || []);
              setAverageRaceScoresData(parsedData.averagePointsPerUser || []);
              setDriverSelectionData(parsedData.driverSelectionStats || []);
              setLoadingTopScores(false);
              return;
          }
          
          try {
              const [raceStatsRes, driverSelectionRes] = await Promise.all([
                  fetch(`/api/top-race-scores?season=${season}`), // users rankings lists
                  fetch(`/api/driver-selection-stats?season=${season}`)
              ]);

              const raceStatsData = await raceStatsRes.json();
  
              setTopRaceScoresData(raceStatsData.topSingleRaceScores || []);
              setAverageRaceScoresData(raceStatsData.averagePointsPerUser || []);
              setDriverSelectionData(driverSelectionRes.driverSelectionStats || []);
  
              sessionStorage.setItem(
                  cacheKey,
                  JSON.stringify({
                        ...raceStatsData,
                        driverSelectionStats: driverSelectionRes.driverSelectionStats
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

  console.log({driverSelectionData});

    const leagueStats = (
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:ml-3">
            <div className="w-full">
                <h2 className="font-bold px-2 leading-none mb-1">Single Race Scores</h2>
                <RankingsList loading={loadingTopScores} scores={topRaceScoresData} loggedInUser={username} title="Single Race Scores" />
            </div>
            <div className="w-full">
                <h2 className="font-bold px-2 leading-none mb-1">Average Scores</h2>
                <RankingsList loading={loadingTopScores} scores={averageRaceScoresData} loggedInUser={username} title="Average Scores" />
            </div>
        </div>
    )
          
    return (
        <div className="mb-32">
            <Header />
            <div className="flex flex-col justify-center items-center pt-10 max-w-screen-sm mx-auto">
                <h1 className="text-xl font-display leading-none mb-4">
                    Best of the Rest
                </h1>
                <label className="text-sm leading-none text-center px-3">
                    Redemption starts at the back! Pick your drivers wisely from the back half of the grid (P11-P20) and watch them climb to glory. The bigger the comeback, the bigger the rewards!
                </label>
                <a href="#rules-and-guide" className="font-bold text-sm hover:text-neutral-500 mt-4 underline">See Rules and Guide</a>
                <select
                    value={season}
                    onChange={(e) => setSeason(parseInt(e.target.value))}
                    className={classNames(
                        "p-2 h-12 border-4 border-neutral-700 rounded-lg -mb-6 bg-neutral-100 z-10",
                        username ? "-mb-6 mt-10" : "mb-16 mt-2"
                    )}
                >
                    {[...Array(new Date().getFullYear() - 2022)].map((_, i) => {
                        const year = 2023 + i; // ✅ Start at 2023
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

                <div className="flex flex-col sm:flex-row sm:justify-center mx-auto relative gap-4">
                    <div className="responsive-contianer relative sm:absolute sm:w-full sm:mt-10 max-sm:mb-4">
                        <div className="responsive-line" />
                        <div className="flex flex-col items-end w-1/2 sm:px-8">
                            <div className="responsive-xl">League</div>
                            <div className="responsive-lg text-neutral-500 z-[1]">
                                Stats
                            </div>
                        </div>
                    </div>
                    <div className="max-sm:hidden w-1/2 max-w-[600px] flex items-start mt-[20%] xl:mt-[260px]">
                        {leagueStats}
                    </div>
                    <div className="sm:w-1/2 sm:max-w-[600px] sm:mr-3 max-sm:mx-3 z-10">
                        <h2 className="font-display text-2xl px-4 -mb-2.5">Leaderboard</h2>
                        <Leaderboard
                            season={season}
                            loggedInUser={username}
                        />
                    </div>
                </div>
            </section>

            {/* ✅ Top Race Scores */}
            <section>
              <div className="mt-8 px-3 sm:mt-32">
                <div className="sm:hidden">{leagueStats}</div>
              </div>
            </section>

            {/* <div className="responsive-contianer flex justify-end relative w-full my-12 max-sm:mb-4">
                <div className="responsive-line" />
                <div className="flex flex-col items-end w-1/2 sm:px-8 px-3">
                    <div className="responsive-xl">Driver</div>
                    <div className="responsive-lg text-neutral-500 z-[1]">
                        Stats
                    </div>
                </div>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center max-w-2xl lg:max-w-4xl mx-auto mt-10 sm:mt-24 px-3">
              <div className="w-full">
                <h2 className="font-bold px-2 leading-none mb-1">Most Picked Drivers</h2>
                <RankingsList loading={loadingTopScores} scores={driverSelectionData} title="Most Picked Drivers" />
              </div>
              <div className="w-full">
                <h2 className="font-bold px-2 leading-none mb-1">Top Scoring Drivers</h2>
                <RankingsList loading={loadingTopScores} scores={topScoringDrivers} title="Top Scoring Drivers" />
              </div>
              <div className="w-full">
                <h2 className="font-bold px-2 leading-none mb-1">Points Per Selection</h2>
                <RankingsList loading={loadingTopScores} scores={underratedDrivers} title="Top Scoring Drivers" />
              </div>
            </section> */}

            <div className="responsive-contianer flex justify-start relative w-full my-12 sm:my-32 max-sm:mb-4">
                <div className="responsive-line" />
                <div className="flex flex-col items-start w-1/2 sm:px-8 px-3">
                    <div className="responsive-xl">Rules</div>
                    <div className="responsive-lg text-neutral-500 z-[1]">
                        Scoring
                    </div>
                </div>
            </div>

            <RulesAndScoring />
        </div>
    );
}