import dbConnect from "../lib/mongodb.js";
import User from "../models/User.js";
import Race from "../models/Race.js";

async function runAutoPicks() {
    await dbConnect();

    const season = "2025"; // Set the season
    // Determine the current race (this should be dynamic; here it's hardcoded)
    const currentMeetingKey = "1274"; // e.g. the current race meeting key

    console.log(`🚀 Running auto-picks for season ${season} on race ${currentMeetingKey}`);

    // Find the current race document
    const race = await Race.findOne({ meeting_key: currentMeetingKey, year: season });
    if (!race) {
        console.log(`⚠️ No race found for meeting key ${currentMeetingKey}. Skipping auto-picks.`);
        return;
    }

    // Get users who participated in the season
    const users = await User.find({ seasons: season });
    if (!users.length) {
        console.log("⚠️ No users found for season. Skipping auto-picks.");
        return;
    }

    console.log(`Processing race: ${race.meeting_name}`);

    for (const user of users) {
        // Ensure structure exists
        if (!user.picks[season]) {
            user.picks[season] = {};
        }

        // Skip if user already has two picks for this race
        if (user.picks[season][currentMeetingKey]?.picks?.length === 2) {
            continue;
        }

        // Log qualifying results for debugging
        console.log(`🔍 Checking qualifying results for ${race.meeting_name}:`);
        console.table(
            race.qualifying_results
                .sort((a, b) => a.finishPosition - b.finishPosition)
                .map(d => ({
                    driverNumber: d.driverNumber,
                    finishPosition: d.finishPosition,
                }))
        );

        // Select eligible drivers from P11 to P20 in qualifying
        const eligibleDrivers = race.qualifying_results
            .filter(d => d.finishPosition && d.finishPosition >= 11 && d.finishPosition <= 20)
            .map(d => d.driverNumber);

        if (eligibleDrivers.length < 2) {
            console.log(`⚠️ Not enough eligible drivers for ${race.meeting_name}. Skipping...`);
            continue;
        }

        // Shuffle the eligible drivers to randomize selection
        for (let i = eligibleDrivers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [eligibleDrivers[i], eligibleDrivers[j]] = [eligibleDrivers[j], eligibleDrivers[i]];
        }

        // Take the first two as auto picks
        const autoPicks = eligibleDrivers.slice(0, 2);

        // Update ONLY the picks for the current race
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    [`picks.${season}.${currentMeetingKey}`]: {
                        autopick: true,
                        picks: autoPicks,
                    },
                },
            }
        );

        console.log(`✅ Assigned auto-picks for ${user.username} in ${race.meeting_name}: ${autoPicks.join(", ")}`);
    }

    console.log("✅ Auto-picks completed!");
    process.exit(); // Exit when done
}

// Run the auto picks script immediately
runAutoPicks();