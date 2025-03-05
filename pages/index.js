// pages/index.js
import { useState } from "react";
import Header from "../components/Header";
import Leaderboard from "../components/Leaderboard";

export default function Home() {
  const [season, setSeason] = useState(2023);

  return (
    <div>
      <Header />
      <div className="mb-4 p-4">
        <label className="mr-2 font-semibold">Select Season:</label>
        <select
          value={season}
          onChange={(e) => setSeason(parseInt(e.target.value))}
          className="p-2 border rounded"
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
      <main className="p-6">
        <Leaderboard season={season} />
      </main>
    </div>
  );
}