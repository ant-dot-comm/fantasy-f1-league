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
        bonusTitle = "Overtake Artist Bonus +2";
    } else if (positionsGained >= 14 && positionsGained <= 17) {
        driverPoints += 3;
        bonusTitle = "Track Titan Bonus +3";
    } else if (positionsGained >= 18) {
        driverPoints += 4;
        bonusTitle = "Zero to Hero Bonus +4";
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

// 🏎️ Advanced Scoring: 11–16 get bigger bump for position movement + "Big" bonuses; 17–22 get less + "Little" bonuses
// Any non-finish (DNF/DNS/DSQ → stored as racePos === 0) scores -1 point.
export function advancedScoring(qualifyingPos, racePos) {
    if (racePos === 0) return { points: -1, bonusTitle: null, gpWinner: false };

    const positionsGained = qualifyingPos - racePos;
    const isFrontOfBack = qualifyingPos >= 11 && qualifyingPos <= 16;  // 11–16
    const isRearOfBack = qualifyingPos >= 17 && qualifyingPos <= 22;   // 17–22

    // Main source of points: position movement, scaled by qualifying band
    let driverPoints;
    if (isFrontOfBack) {
        driverPoints = Math.round(positionsGained * 1.5);  // bigger bump
    } else if (isRearOfBack) {
        driverPoints = Math.round(positionsGained * 0.75); // less points
    } else {
        driverPoints = positionsGained; // fallback (e.g. if 1–10 ever used)
    }

    let bonusTitle = null;
    let gpWinner = false;
    if (racePos === 1) {
        driverPoints += 3;
        gpWinner = true;
    }

    // Mover bonuses: Front (P11–16) / Back (P17–22); names match Rules & Scoring
    if (isFrontOfBack) {
        if (positionsGained >= 10 && positionsGained <= 12) {
            driverPoints += 2;
            bonusTitle = "Overtake Artist Bonus";
        } else if (positionsGained >= 13 && positionsGained <= 14) {
            driverPoints += 3;
            bonusTitle = "Grid Charger Bonus";
        } else if (positionsGained >= 15) {
            driverPoints += 4;
            bonusTitle = "Midfield Mauler Bonus";
        }
    } else if (isRearOfBack) {
        if (positionsGained >= 10 && positionsGained <= 14) {
            driverPoints += 1;
            bonusTitle = "Apex Assassin Bonus";
        } else if (positionsGained >= 15 && positionsGained <= 18) {
            driverPoints += 2;
            bonusTitle = "Track Titan Bonus";
        } else if (positionsGained >= 19) {
            driverPoints += 3;
            bonusTitle = "Zero to Hero Bonus";
        }
    }

    return {
        points: driverPoints,
        bonusTitle,
        gpWinner,
    };
}

// 🎯 Bonus Picks Scoring
export function calculateBonusPicksScore(userBonusPicks, raceResults, qualifyingResults, raceDnfs = 0) {
    console.log(`🔍 calculateBonusPicksScore called with:`, {
        userBonusPicks,
        userBonusPicksKeys: Object.keys(userBonusPicks || {}),
        raceResultsLength: raceResults?.length,
        qualifyingResultsLength: qualifyingResults?.length,
        raceDnfs
    });
    
    let bonusPoints = 0;
    let bonusDetails = [];

    // ✅ Worst Driver Scoring
    if (userBonusPicks.worstDriver) {
        const worstDriverRace = raceResults.find(d => d.driverNumber === userBonusPicks.worstDriver);
        
        if (worstDriverRace) {
            const startPosition = worstDriverRace.startPosition; // Starting grid position (from qualifying)
            const finishPosition = worstDriverRace.finishPosition; // Race finish position
            
            console.log(`🔍 Worst Driver #${userBonusPicks.worstDriver} calculation:`, {
                startPosition,
                finishPosition,
                positionChange: startPosition - finishPosition,
                worstDriverPoints: -(startPosition - finishPosition)
            });
            
            if (finishPosition === 0) {
                // Driver DNF/DNS/DNQ – reverse of normal: +1 for correctly picking a non-finisher
                bonusPoints += 1;
                bonusDetails.push("Worst Driver: DNF/DNS/DNQ +1");
            } else {
                const positionChange = startPosition - finishPosition;
                // Positive points for positions lost, negative for positions gained
                // If startPosition > finishPosition (gained positions), positionChange is positive, so we want negative points
                // If startPosition < finishPosition (lost positions), positionChange is negative, so we want positive points
                const worstDriverPoints = -positionChange; // Flip the sign
                bonusPoints += worstDriverPoints;
                bonusDetails.push(`Worst Driver: ${worstDriverPoints > 0 ? '+' : ''}${worstDriverPoints} points (${startPosition} → ${finishPosition})`);
            }
        }
    }

    // ✅ DNFs Prediction Scoring
    console.log(`🔍 DNF Prediction check:`, {
        hasDnfsPick: 'dnfs' in userBonusPicks,
        dnfsValue: userBonusPicks.dnfs,
        dnfsType: typeof userBonusPicks.dnfs,
        isNull: userBonusPicks.dnfs === null,
        isUndefined: userBonusPicks.dnfs === undefined,
        willProcess: userBonusPicks.dnfs !== null && userBonusPicks.dnfs !== undefined
    });
    
    if (userBonusPicks.dnfs !== null && userBonusPicks.dnfs !== undefined) {
        const actualDnfs = raceDnfs;
        
        console.log(`🔍 DNF Prediction calculation:`, {
            predictedDnfs: userBonusPicks.dnfs,
            actualDnfs,
            isCorrect: userBonusPicks.dnfs === actualDnfs,
            willAwardPoints: actualDnfs > 0 && userBonusPicks.dnfs === actualDnfs
        });
        
        if (actualDnfs > 0) { // Only award points if there are actual DNFs
            if (userBonusPicks.dnfs === actualDnfs) {
                bonusPoints += 5;
                bonusDetails.push(`DNFs Prediction: +5 points (predicted ${userBonusPicks.dnfs}, actual ${actualDnfs})`);
            } else {
                bonusDetails.push(`DNFs Prediction: 0 points (predicted ${userBonusPicks.dnfs}, actual ${actualDnfs})`);
            }
        } else {
            bonusDetails.push("DNFs Prediction: 0 points (no DNFs in race)");
        }
    }

    console.log(`🔍 Final Bonus Points Summary:`, {
        totalBonusPoints: bonusPoints,
        breakdown: bonusDetails
    });

    return {
        bonusPoints,
        bonusDetails,
    };
}

// 🔄 Define a Default Scoring Model
export const activeScoringModel = advancedScoring; // Change this to one of the above scoring models at any time
