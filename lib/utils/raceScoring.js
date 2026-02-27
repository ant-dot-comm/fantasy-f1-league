import { activeScoringModel, calculateBonusPicksScore } from "./scoringModel.js";

// Score calculation for a single user and single race
// Uses the active scoring model (currently advancedScoring) plus bonus picks.
export function computeRaceScoreForUser(raceData, race, scoringModel = activeScoringModel) {
  const { picks = [], bonusPicks } = raceData;
  const raceResults = race.race_results || [];
  const qualifyingResults = race.qualifying_results || [];

  let driverPointsTotal = 0;
  const driverScores = [];

  for (const driverNumber of picks) {
    const raceResult = raceResults.find((d) => d.driverNumber === driverNumber);
    const qualiResult = qualifyingResults.find((d) => d.driverNumber === driverNumber);
    if (!raceResult || !qualiResult) continue;

    const { points, bonusTitle } = scoringModel(
      raceResult.startPosition,
      raceResult.finishPosition
    );

    driverPointsTotal += points;
    driverScores.push({
      driverNumber,
      points,
      bonusTitle: bonusTitle || null,
      startPosition: raceResult.startPosition,
      finishPosition: raceResult.finishPosition,
    });
  }

  let bonusPoints = 0;
  if (
    bonusPicks &&
    (bonusPicks.worstDriver ||
      (bonusPicks.dnfs !== null && bonusPicks.dnfs !== undefined))
  ) {
    const { bonusPoints: bp } = calculateBonusPicksScore(
      bonusPicks,
      raceResults,
      qualifyingResults,
      race.dnfs ?? 0
    );
    bonusPoints = bp;
  }

  const totalScore = driverPointsTotal + bonusPoints;
  return {
    totalScore,
    driverPointsTotal,
    bonusPoints,
    driverScores,
  };
}

