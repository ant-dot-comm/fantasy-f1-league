// scoringModel.js

export function standardScoring(qualifyingPos, racePos) {
    let driverPoints = qualifyingPos - racePos;
    // console.log(`Driver Points: ${driverPoints}`);

    if (qualifyingPos >= 11 && racePos <= 10) driverPoints += 3;
    if (qualifyingPos >= 11 && racePos <= 5) driverPoints += 5;

    return driverPoints;
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
