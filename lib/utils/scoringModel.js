// scoringModel.js

export function standardScoring(qualifyingPos, racePos) {
    if (racePos === 0) return { points: 0 };

    let driverPoints = qualifyingPos - racePos;
    const positionsGained = qualifyingPos - racePos;
    let bonusTitle = null;
    let gpWinner = false

    if (racePos === 1) driverPoints += 3;
    if (racePos === 1) gpWinner = true;

    // Bonus for big movers
    if (positionsGained >= 10 && positionsGained <= 13) {
        driverPoints += 2;
        bonusTitle = "+2";
    } else if (positionsGained >= 14 && positionsGained <= 17) {
        driverPoints += 3;
        bonusTitle = "+3";
    } else if (positionsGained >= 18) {
        driverPoints += 4;
        bonusTitle = "+4";
    }

    return {
        points: driverPoints,
        bonusTitle,
        gpWinner,
    };
}

// 🏎️ Alternative Scoring Model: Reward More for Lower Grid Starts
export function aggressiveScoring(qualifyingPos, racePos) {
    let driverPoints = (qualifyingPos - racePos) * 2; // Double points for big movements

    if (qualifyingPos >= 15 && racePos <= 10) driverPoints += 5;
    if (qualifyingPos >= 15 && racePos <= 5) driverPoints += 10;

    return driverPoints;
}

// 🔄 Define a Default Scoring Model
export const activeScoringModel = standardScoring; // Change this to `aggressiveScoring` anytime
