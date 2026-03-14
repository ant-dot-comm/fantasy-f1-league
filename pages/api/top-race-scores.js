import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Driver from "@/models/Driver";
import { computeRaceScoreForUser } from "@/lib/utils/raceScoring";

// Mover bonus point values by title (scoringModel doesn't include +N in the string)
const BONUS_TITLE_TO_MOVER_POINTS = {
  "Overtake Artist Bonus": 2,
  "Grid Charger Bonus": 3,
  "Midfield Mauler Bonus": 4,
  "Apex Assassin Bonus": 1,
  "Track Titan Bonus": 2,
  "Zero to Hero Bonus": 3,
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const { season } = req.query;

  try {
    console.time(`🏁 Race stats calculation for ${season}`);

    // OPTIMIZATION 1: Get all users with picks in one query
    const year = Number(season);
    const users = await User.find({ seasons: year })
      .select("username first_name picks")
      .lean();

    console.log(
      `📊 top-race-scores: found ${users.length} users for season ${season}`
    );

    if (!users.length) {
      return res.status(200).json({
        topSingleRaceScores: [],
        averagePointsPerUser: [],
        bonusPickLeaders: [],
        moverBonusLeaders: [],
        driverMostPicked: [],
        driverHighestScoring: [],
        driverBandComparison: [],
      });
    }

    // OPTIMIZATION 2: Collect all unique meeting keys
    const allMeetingKeys = new Set();
    const allDriverNumbers = new Set();

    users.forEach((user) => {
      const userPicks =
        user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;
      const seasonPicks =
        userPicks?.[season] instanceof Map
          ? Object.fromEntries(userPicks[season])
          : userPicks?.[season];

      if (seasonPicks) {
        Object.entries(seasonPicks).forEach(([meetingKey, raceData]) => {
          if (raceData.picks?.length) {
            allMeetingKeys.add(meetingKey);
            raceData.picks.forEach((driverNum) =>
              allDriverNumbers.add(driverNum)
            );
          }
        });
      }
    });

    // OPTIMIZATION 3: Batch fetch all races in one query
    const meetingKeyArray = Array.from(allMeetingKeys);
    console.log(
      `📊 top-race-scores: unique meeting keys from picks = ${meetingKeyArray.length}`,
      meetingKeyArray
    );

    const allRaces = await Race.find({
      meeting_key: { $in: meetingKeyArray },
      year: year,
    }).lean();

    // OPTIMIZATION 4: Create race & driver lookup maps
    const raceMap = new Map();
    allRaces.forEach((race) => raceMap.set(race.meeting_key, race));

    console.log(
      `📊 top-race-scores: loaded ${allRaces.length} Race docs for season ${season}`
    );

    const driverNumbersArray = Array.from(allDriverNumbers);
    const allDrivers = await Driver.find({
      driver_number: { $in: driverNumbersArray },
    }).lean();

    const driverMap = new Map();
    allDrivers.forEach((driver) =>
      driverMap.set(driver.driver_number, driver)
    );

    console.log(
      `📊 top-race-scores: loaded ${allDrivers.length} Driver docs for season ${season}`
    );

    // OPTIMIZATION 5: Process all data efficiently
    let topSingleRaceScores = [];
    let userStats = {}; // Stores per-user aggregates
    let driverStats = new Map(); // key: driver_number -> aggregates

    users.forEach((user) => {
      const userPicks =
        user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;
      const seasonPicks =
        userPicks?.[season] instanceof Map
          ? Object.fromEntries(userPicks[season])
          : userPicks?.[season];

      if (!seasonPicks) return;

      if (!userStats[user.username]) {
        userStats[user.username] = {
          totalPoints: 0,
          raceCount: 0,
          bonusPointsTotal: 0,
          moverPointsTotal: 0,
          moverCounts: {}, // bonusTitle -> count
        };
      }

      Object.entries(seasonPicks).forEach(([meetingKey, raceData]) => {
        if (!raceData.picks?.length) return;

        const race = raceMap.get(meetingKey);
        if (!race) return;

        // Only include races that have been run (have results) in aggregates and averages
        if (!race.race_results?.length) return;

        // Always use unified scoring helper so stats stay consistent
        let computed;
        try {
          computed = computeRaceScoreForUser(raceData, race);
        } catch (err) {
          console.error(
            `❌ Failed to compute score for ${user.username}, season ${season}, meeting_key ${meetingKey}:`,
            err
          );
          return;
        }

        const { totalScore, driverScores, bonusPoints } = computed;

        if (typeof totalScore !== "number") return;

        // ── User-level aggregates ─────────────────────────────
        const userAgg = userStats[user.username];
        userAgg.totalPoints += totalScore;
        userAgg.raceCount += 1;
        userAgg.bonusPointsTotal += typeof bonusPoints === "number" ? bonusPoints : 0;

        // Per-driver and mover bonus aggregation
        (driverScores || []).forEach((ds) => {
          const driverNum = ds.driverNumber;

          // Always track driver aggregates, regardless of bonusTitle
          if (driverNum != null) {
            if (!driverStats.has(driverNum)) {
              driverStats.set(driverNum, {
                driverNumber: driverNum,
                totalPoints: 0,
                pickCount: 0,
                frontBandPoints: 0,
                frontBandCount: 0,
                backBandPoints: 0,
                backBandCount: 0,
              });
            }
            const dAgg = driverStats.get(driverNum);
            dAgg.totalPoints += ds.points ?? 0;
            dAgg.pickCount += 1;

            const start = ds.startPosition;
            if (typeof start === "number") {
              if (start >= 11 && start <= 16) {
                dAgg.frontBandPoints += ds.points ?? 0;
                dAgg.frontBandCount += 1;
              } else if (start >= 17 && start <= 22) {
                dAgg.backBandPoints += ds.points ?? 0;
                dAgg.backBandCount += 1;
              }
            }
          }

          // Mover bonuses: sum point value from title (scoringModel doesn't put +N in title)
          if (ds.bonusTitle) {
            const bonusValue = BONUS_TITLE_TO_MOVER_POINTS[ds.bonusTitle] ?? 0;
            userAgg.moverPointsTotal += bonusValue;
            userAgg.moverCounts[ds.bonusTitle] =
              (userAgg.moverCounts[ds.bonusTitle] || 0) + 1;
          }
        });

        // Track single race scores (highest single race totals across season)
        topSingleRaceScores.push({
          username: user.username,
          race: race.meeting_name,
          meeting_key: meetingKey,
          finalResult: totalScore,
        });
      });
    });

    // Sort and limit single race scores
    topSingleRaceScores.sort((a, b) => b.finalResult - a.finalResult);
    const top10SingleRaceScores = topSingleRaceScores.slice(0, 10);

    // Calculate CORRECT averages (per user's actual races, not total races)
    const averagePointsPerUser = Object.entries(userStats)
      .filter(([username, stats]) => stats.raceCount > 0) // Only users who actually participated
      .map(([username, stats]) => ({
        username,
        totalPoints: stats.totalPoints,
        raceCount: stats.raceCount,
        finalResult: (stats.totalPoints / stats.raceCount).toFixed(2), // CORRECT: per user's races
      }))
      .sort((a, b) => parseFloat(b.finalResult) - parseFloat(a.finalResult))
      .slice(0, 10);

    // User bonus pick leaders (total bonus points from bonus picks)
    const bonusPickLeaders = Object.entries(userStats)
      .map(([username, stats]) => ({
        username,
        finalResult: stats.bonusPointsTotal,
      }))
      .sort((a, b) => (b.finalResult ?? 0) - (a.finalResult ?? 0))
      .slice(0, 10);

    // User mover bonus leaders (total mover points, with breakdown)
    const moverBonusLeaders = Object.entries(userStats)
      .map(([username, stats]) => ({
        username,
        finalResult: stats.moverPointsTotal,
        moverCounts: stats.moverCounts,
      }))
      .sort((a, b) => (b.finalResult ?? 0) - (a.finalResult ?? 0))
      .slice(0, 10);

    // Driver-level stats
    const driverMostPicked = [];
    const driverHighestScoring = [];
    const driverBandComparison = [];

    driverStats.forEach((dAgg, driverNumber) => {
      const driverInfo = driverMap.get(driverNumber);
      if (!driverInfo) return;

      const label = driverInfo.name_acronym || driverInfo.full_name;
      const headshot_url = driverInfo.name_acronym
        ? `/drivers/${season}/${driverInfo.name_acronym}.png`
        : `/drivers/${season}/default.png`;

      const base = {
        username: label,
        headshot_url,
        teamColour: driverInfo.team_colour,
      };

      // Most picked: by pick count
      driverMostPicked.push({
        ...base,
        finalResult: dAgg.pickCount,
      });

      // Highest scoring: average points when picked
      if (dAgg.pickCount > 0) {
        const avg = dAgg.totalPoints / dAgg.pickCount;
        driverHighestScoring.push({
          ...base,
          finalResult: avg.toFixed(2),
        });
      }

      // Band comparison: front vs back averages formatted as a string
      const frontAvg =
        dAgg.frontBandCount > 0
          ? dAgg.frontBandPoints / dAgg.frontBandCount
          : null;
      const backAvg =
        dAgg.backBandCount > 0
          ? dAgg.backBandPoints / dAgg.backBandCount
          : null;

      if (frontAvg !== null || backAvg !== null) {
        const frontText =
          frontAvg !== null ? frontAvg.toFixed(2) : "—";
        const backText =
          backAvg !== null ? backAvg.toFixed(2) : "—";

        driverBandComparison.push({
          ...base,
          finalResult: `Front: ${frontText} | Back: ${backText}`,
        });
      }
    });

    driverMostPicked.sort((a, b) => (b.finalResult ?? 0) - (a.finalResult ?? 0));
    driverHighestScoring.sort(
      (a, b) => parseFloat(b.finalResult) - parseFloat(a.finalResult)
    );
    // For band comparison, sort by back-band advantage (back - front), when both exist
    driverBandComparison.sort((a, b) => {
      const parseDiff = (entry) => {
        const matchFront = entry.finalResult.match(/Front:\s([0-9.\-]+)/);
        const matchBack = entry.finalResult.match(/Back:\s([0-9.\-]+)/);
        const front = matchFront ? parseFloat(matchFront[1]) : 0;
        const back = matchBack ? parseFloat(matchBack[1]) : 0;
        return back - front;
      };
      return parseDiff(b) - parseDiff(a);
    });

    const result = {
      topSingleRaceScores: top10SingleRaceScores,
      averagePointsPerUser,
      bonusPickLeaders,
      moverBonusLeaders,
      // For drivers, return the full sorted lists; RankingsList already
      // shows top 5 and the modal shows all entries.
      driverMostPicked,
      driverHighestScoring,
      driverBandComparison,
    };

    console.timeEnd(`🏁 Race stats calculation for ${season}`);
    console.log(
      `📊 top-race-scores: processed ${users.length} users, ${allMeetingKeys.size} races.`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("🚨 Error fetching race stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}