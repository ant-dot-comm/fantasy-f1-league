// achievements.js – achievement definitions, checks, and card effects
// Currently shelved: scoring is handled by raceScoring.js; this file only
// holds IDs/constants and helper logic that may be revived later.

// ─── Achievement & card type constants ─────────────────────────────────────
export const ACHIEVEMENT_IDS = {
  NEW_SEASON_BADGE: "new_season_badge",
  NO_AUTOPICKS_5: "no_autopicks_5",
  NO_AUTOPICKS_10: "no_autopicks_10",
  NO_AUTOPICKS_15: "no_autopicks_15",
  NO_AUTOPICKS_ALL: "no_autopicks_all",
  WORST_DRIVER_NAILED: "worst_driver_nailed",
  WORST_COMBO: "worst_combo",
  // Big mover cards (11–16 qualy)
  BIG_OVERTAKE_ARTIST: "big_overtake_artist",
  BIG_TRACK_TITAN: "big_track_titan",
  BIG_ZERO_TO_HERO: "big_zero_to_hero",
  // Little mover cards (17–22 qualy)
  LITTLE_OVERTAKE_ARTIST: "little_overtake_artist",
  LITTLE_TRACK_TITAN: "little_track_titan",
  LITTLE_ZERO_TO_HERO: "little_zero_to_hero",
};

// Reference: mover bonuses in scoringModel (Big 11–16, Little 17–22)
// Overtake Artist: 10–13 positions gained | Track Titan: 14–17 | Zero to Hero: 18+

export const CARD_TYPES = {
  STREAK_SHIELD: "streak_shield",
  POINTS_BOOST: "points_boost",
  CLEAN_SLATE_WORST_DRIVER: "clean_slate_worst_driver",
  WORST_COMBO_RESCUE: "worst_combo_rescue",
  // Big mover cards (qualy 11–16)
  BIG_OVERTAKE_ARTIST: "big_overtake_artist",
  BIG_TRACK_TITAN: "big_track_titan",
  BIG_ZERO_TO_HERO: "big_zero_to_hero",
  // Little mover cards (qualy 17–22)
  LITTLE_OVERTAKE_ARTIST: "little_overtake_artist",
  LITTLE_TRACK_TITAN: "little_track_titan",
  LITTLE_ZERO_TO_HERO: "little_zero_to_hero",
};

// Map bonusTitle from scoringModel to { achievementId, cardType } (Front P11–16 / Back P17–22)
const BONUS_TITLE_TO_CARD = {
  "Front Overtake Artist Bonus +2": { achievementId: ACHIEVEMENT_IDS.BIG_OVERTAKE_ARTIST, cardType: CARD_TYPES.BIG_OVERTAKE_ARTIST },
  "Front Grid Charger Bonus +3": { achievementId: ACHIEVEMENT_IDS.BIG_TRACK_TITAN, cardType: CARD_TYPES.BIG_TRACK_TITAN },
  "Front Midfield Mauler Bonus +4": { achievementId: ACHIEVEMENT_IDS.BIG_ZERO_TO_HERO, cardType: CARD_TYPES.BIG_ZERO_TO_HERO },
  "Back Apex Assassin Bonus +1": { achievementId: ACHIEVEMENT_IDS.LITTLE_OVERTAKE_ARTIST, cardType: CARD_TYPES.LITTLE_OVERTAKE_ARTIST },
  "Back Track Titan Bonus +2": { achievementId: ACHIEVEMENT_IDS.LITTLE_TRACK_TITAN, cardType: CARD_TYPES.LITTLE_TRACK_TITAN },
  "Back Zero to Hero Bonus +3": { achievementId: ACHIEVEMENT_IDS.LITTLE_ZERO_TO_HERO, cardType: CARD_TYPES.LITTLE_ZERO_TO_HERO },
};

// NO_AUTOPICKS milestones: [streak length] -> { pointsBoost, achievementId }
export const NO_AUTOPICKS_MILESTONES = [
  { streak: 5, pointsBoost: 1, achievementId: ACHIEVEMENT_IDS.NO_AUTOPICKS_5 },
  { streak: 10, pointsBoost: 2, achievementId: ACHIEVEMENT_IDS.NO_AUTOPICKS_10 },
  { streak: 15, pointsBoost: 3, achievementId: ACHIEVEMENT_IDS.NO_AUTOPICKS_15 },
  { streak: Infinity, pointsBoost: 4, achievementId: ACHIEVEMENT_IDS.NO_AUTOPICKS_ALL },
];

// ─── Display labels for UI (single source of truth) ─────────────────────────
export const ACHIEVEMENT_DISPLAY = {
  [ACHIEVEMENT_IDS.NEW_SEASON_BADGE]: {
    name: "New Season Badge",
    value: "Streak Shield",
    howToUse: "Next time you'd break a no-autopicks streak, it doesn't break (one-time).",
  },
  [ACHIEVEMENT_IDS.NO_AUTOPICKS_5]: { name: "No Autopicks (5)", value: "+1 pt", howToUse: "Add 1 point to one driver of your choice for one race." },
  [ACHIEVEMENT_IDS.NO_AUTOPICKS_10]: { name: "No Autopicks (10)", value: "+2 pts", howToUse: "Add 2 points to one driver of your choice for one race." },
  [ACHIEVEMENT_IDS.NO_AUTOPICKS_15]: { name: "No Autopicks (15)", value: "+3 pts", howToUse: "Add 3 points to one driver of your choice for one race." },
  [ACHIEVEMENT_IDS.NO_AUTOPICKS_ALL]: { name: "No Autopicks (All)", value: "+4 pts", howToUse: "Add 4 points to one driver of your choice for one race." },
  [ACHIEVEMENT_IDS.WORST_DRIVER_NAILED]: {
    name: "Worst Driver Nailed",
    value: "Clean slate",
    howToUse: "If your worst driver pick scored negative, set that to 0.",
  },
  [ACHIEVEMENT_IDS.WORST_COMBO]: {
    name: "Worst Combo",
    value: "0 or +3",
    howToUse: "If your race total was negative → 0; if lowest but positive → +3.",
  },
  [ACHIEVEMENT_IDS.BIG_OVERTAKE_ARTIST]: { name: "Big Overtake Artist", value: "+2", howToUse: "Earned when a picked driver (P11–16) gained 10–13 positions." },
  [ACHIEVEMENT_IDS.LITTLE_OVERTAKE_ARTIST]: { name: "Little Overtake Artist", value: "+1", howToUse: "Earned when a picked driver (P17–22) gained 10–13 positions." },
  [ACHIEVEMENT_IDS.BIG_TRACK_TITAN]: { name: "Big Track Titan", value: "+3", howToUse: "Earned when a picked driver (P11–16) gained 14–17 positions." },
  [ACHIEVEMENT_IDS.LITTLE_TRACK_TITAN]: { name: "Little Track Titan", value: "+2", howToUse: "Earned when a picked driver (P17–22) gained 14–17 positions." },
  [ACHIEVEMENT_IDS.BIG_ZERO_TO_HERO]: { name: "Big Zero to Hero", value: "+4", howToUse: "Earned when a picked driver (P11–16) gained 18+ positions." },
  [ACHIEVEMENT_IDS.LITTLE_ZERO_TO_HERO]: { name: "Little Zero to Hero", value: "+2", howToUse: "Earned when a picked driver (P17–22) gained 18+ positions." },
};

export function getAchievementDisplay(achievement) {
  const id = achievement?.id ?? achievement?.cardType ?? "";
  return (
    ACHIEVEMENT_DISPLAY[id] ?? {
      name: id ? id.replace(/_/g, " ") : "Achievement",
      value: "—",
      howToUse: "—",
    }
  );
}

// ─── Worst driver “nailed”: picked driver had worst result (most positions lost) ───
// Worst driver points = -(startPosition - finishPosition); highest such value = worst performer
function getWorstDriverPoints(r) {
  if (!r || r.finishPosition === 0) return null;
  return -(r.startPosition - r.finishPosition);
}

export function checkWorstDriverNailed(raceResults, bonusPicks) {
  if (!bonusPicks?.worstDriver) return false;
  const pickedResult = raceResults.find((d) => d.driverNumber === bonusPicks.worstDriver);
  const pickedPoints = getWorstDriverPoints(pickedResult);
  if (pickedPoints === null) return false;

  const finishers = raceResults.filter((d) => d.finishPosition > 0);
  let maxWorstPoints = -Infinity;
  for (const d of finishers) {
    const p = getWorstDriverPoints(d);
    if (p != null && p > maxWorstPoints) maxWorstPoints = p;
  }
  return maxWorstPoints !== -Infinity && pickedPoints >= maxWorstPoints;
}

// ─── Worst combo: user with lowest total for this race ───────────────────────
export function getWorstComboWinner(usersWithScoresForMeeting) {
  if (!usersWithScoresForMeeting.length) return null;
  let minScore = Infinity;
  let winner = null;
  for (const { username, totalScore } of usersWithScoresForMeeting) {
    if (totalScore < minScore) {
      minScore = totalScore;
      winner = username;
    }
  }
  return { username: winner, totalScore: minScore };
}

// Apply worst combo reward: if negative → 0; if lowest but > 0 → add 3
export function applyWorstComboRescue(totalScore, wasLowestButPositive) {
  if (totalScore < 0) return 0;
  if (wasLowestButPositive) return totalScore + 3;
  return totalScore;
}

// ─── No autopicks streak (ordered by race order) ─────────────────────────────
export function getNoAutopicksStreak(seasonPicks, orderedMeetingKeys) {
  let streak = 0;
  for (const meetingKey of orderedMeetingKeys) {
    const raceData = seasonPicks[meetingKey];
    if (!raceData?.picks?.length) break;
    if (raceData.autopick) break;
    streak++;
  }
  return streak;
}

export function getNoAutopicksMilestoneAchievement(currentStreak, totalRacesSoFar) {
  if (currentStreak === 0) return null;
  for (const m of NO_AUTOPICKS_MILESTONES) {
    const hit = m.streak === Infinity
      ? currentStreak >= totalRacesSoFar && totalRacesSoFar > 0
      : currentStreak >= m.streak;
    if (hit) return m;
  }
  return null;
}

// ─── Big / Little mover cards: earned when a picked driver gets that bonus ───
export function getBigLittleCardsEarnedForUser(raceData, race, scoringModel = activeScoringModel) {
  const cards = [];
  const { picks = [] } = raceData;
  const raceResults = race.race_results || [];
  const qualifyingResults = race.qualifying_results || [];

  for (const driverNumber of picks) {
    const raceResult = raceResults.find((d) => d.driverNumber === driverNumber);
    const qualiResult = qualifyingResults.find((d) => d.driverNumber === driverNumber);
    if (!raceResult || !qualiResult) continue;

    const { bonusTitle } = scoringModel(raceResult.startPosition, raceResult.finishPosition);
    const mapping = bonusTitle ? BONUS_TITLE_TO_CARD[bonusTitle] : null;
    if (mapping) {
      cards.push({
        achievementId: mapping.achievementId,
        type: mapping.cardType,
        driverNumber,
        bonusTitle,
      });
    }
  }
  return cards;
}

// ─── Card application (for stored scores) ────────────────────────────────────
export function applyCardToRaceScore(card, raceScoreContext) {
  const { cardType, pointsBoost } = card;
  const { totalScore, bonusPoints, driverScores, usedForDriverNumber } = raceScoreContext;

  if (cardType === CARD_TYPES.STREAK_SHIELD) {
    // No score change; consumed to avoid breaking streak
    return { totalScore, bonusPoints, driverScores };
  }
  if (cardType === CARD_TYPES.POINTS_BOOST && typeof pointsBoost === "number" && usedForDriverNumber != null) {
    const nextDriverScores = driverScores.map((d) =>
      d.driverNumber === usedForDriverNumber
        ? { ...d, points: d.points + pointsBoost }
        : d
    );
    const extra = pointsBoost;
    return {
      totalScore: totalScore + extra,
      bonusPoints,
      driverScores: nextDriverScores,
    };
  }
  if (cardType === CARD_TYPES.CLEAN_SLATE_WORST_DRIVER) {
    // If worst driver bonus was negative, set that contribution to 0 (already in totalScore; we'd need worstDriverBonus stored to subtract then add 0)
    return { totalScore, bonusPoints, driverScores };
  }
  if (cardType === CARD_TYPES.WORST_COMBO_RESCUE) {
    return { totalScore, bonusPoints, driverScores };
  }
  return { totalScore, bonusPoints, driverScores };
}

// ─── New season badge: grant streak shield (call when user signs up for season) ───
export function createNewSeasonBadgeAchievement(season) {
  return {
    id: ACHIEVEMENT_IDS.NEW_SEASON_BADGE,
    cardType: CARD_TYPES.STREAK_SHIELD,
    state: "active",
    earnedAt: new Date(),
    earnedMeetingKey: null,
    usedAt: null,
    usedForMeeting: null,
    season,
  };
}

export function createAchievementEntry(achievementId, cardType, meetingKey, season, extra = {}) {
  return {
    id: achievementId,
    cardType,
    state: "active",
    earnedAt: new Date(),
    earnedMeetingKey: meetingKey,
    usedAt: null,
    usedForMeeting: null,
    season,
    ...extra,
  };
}
