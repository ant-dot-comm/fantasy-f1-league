// import dbConnect from "@/lib/mongodb";
// import User from "@/models/User";
// import Race from "@/models/Race";

// /**
//  * Calculates scores for the leaderboard based on user picks and race results.
//  * @param {number} season - The selected season.
//  * @returns {Promise<Array>} - Array of users with updated scores.
//  */
// export async function bottomTenScoring(season) {
//   await dbConnect();

//   try {
//     // ✅ Fetch all users who have picks in the selected season
//     const users = await User.find({ [`picks.${season}`]: { $exists: true } });

//     if (!users.length) {
//       console.log(`🔴 No user picks found for season ${season}`);
//       return [];
//     }

//     console.log(`🟢 Found ${users.length} users with picks in season ${season}`);

//     const leaderboard = [];

//     for (const user of users) {
//       let totalPoints = 0;

//       // ✅ Debugging: Log user picks
//       console.log(`🔍 Checking user picks for ${user.username}:`, JSON.stringify(user.picks, null, 2));

//       if (!user.picks || !user.picks[season] || !user.picks[season].races) {
//         console.log(`⚠️ No race picks found for ${user.username} in season ${season}`);
//         continue;
//       }

//       // ✅ Convert MongoDB document field into a pure JavaScript object
//       const userPicks = user.picks && typeof user.picks === "object" ? user.picks : {};
//       const seasonPicks = userPicks[season] && typeof userPicks[season] === "object" ? userPicks[season] : {};
//       const races = seasonPicks.races && typeof seasonPicks.races === "object" ? seasonPicks.races : {};
//       const userPicksRaces = JSON.parse(JSON.stringify(races));
//       if (!Object.keys(userPicksRaces).length) {
//         console.warn(`⚠️ No race picks found for ${user.username} in season ${season}`);
//         continue; // ✅ Skip this user but prevent crashing
//       }

//       // ✅ Loop through each race the user made picks for
//       for (const [meetingKey, pickedDrivers] of Object.entries(userPicks)) {
//         console.log(`🟢 Calculating score for ${user.username} in race ${meetingKey}`);

//         // ✅ Convert meetingKey to Number
//         const raceData = await Race.findOne({ meeting_key: Number(meetingKey), year: season });

//         if (!raceData) {
//           console.log(`🔴 No race data found for meeting_key: ${meetingKey}`);
//           continue;
//         }

//         const { qualifying_results, race_results } = raceData;

//         // ✅ Check if race data exists
//         if (!qualifying_results || !race_results) {
//           console.log(`⚠️ No qualifying or race results found for meeting_key: ${meetingKey}`);
//           continue;
//         }

//         for (const driverNumber of pickedDrivers) {
//           // ✅ Find driver positions
//           const qualifyingPosition = qualifying_results.indexOf(driverNumber) + 1;
//           const racePosition = race_results.indexOf(driverNumber) + 1;

//           if (qualifyingPosition === 0 || racePosition === 0) {
//             console.warn(
//                 `⚠️ Missing data for driver ${driverNumber} in race ${meetingKey}:`,
//                 { qualifyingPosition, racePosition, qualifying_results, race_results }
//               );
//               // Still add the driver with 0 points instead of skipping
//               totalPoints += 0;
//               continue;
//           }

//           // ✅ Calculate position changes
//           const positionChange = qualifyingPosition - racePosition;
//           let driverPoints = positionChange; // 1 point per position gained/lost

//           // ✅ Apply Comeback King bonuses
//           if ((qualifyingPosition === 19 || qualifyingPosition === 20) && racePosition <= 10) {
//             driverPoints += 3; // +3 points if they finish in top 10
//           }
//           if ((qualifyingPosition === 19 || qualifyingPosition === 20) && racePosition <= 5) {
//             driverPoints += 5; // +5 points if they finish in top 5
//           }

//           console.log(`🟢 ${user.username} gets ${driverPoints} points for driver ${driverNumber} in race ${meetingKey}`);
//           totalPoints += driverPoints;
//         }
//       }

//       leaderboard.push({ username: user.username, points: totalPoints });
//     }

//     return leaderboard;
//   } catch (error) {
//     console.error("🔴 Error calculating bottomTenScoring:", error);
//     return [];
//   }
// }