import dbConnect from "../lib/mongodb.js";
import User from "../models/User.js";
import Race from "../models/Race.js";

async function runAutoPicks() {
    await dbConnect();

    const season = "2024"; // ✅ Set the season

    console.log(`🚀 Running auto-picks for season ${season}`);

    const races = await Race.find({ year: season }).sort({ picks_closed: 1 });
    const users = await User.find({ seasons: season });

    if (!races.length || !users.length) {
        console.log("⚠️ No races or users found. Skipping auto-picks.");
        return;
    }

    for (const user of users) {
        if (!user.picks[season]) {
            user.picks[season] = {}; // Ensure structure exists
        }

        for (const race of races) {
            const meetingKey = race.meeting_key;

            // Skip if user already has picks for this race
            if (user.picks[season][meetingKey]?.picks?.length === 2) {
                continue;
            }

            // ✅ Log the structure of qualifying results to verify field names
            console.log(`🔍 Checking qualifying results for ${race.meeting_name}:`);
            console.table(
                race.qualifying_results
                    .sort((a, b) => a.finishPosition - b.finishPosition) // ✅ Sort by finish position
                    .map(d => ({
                        driverNumber: d.driverNumber,
                        finishPosition: d.finishPosition,
                    }))
            );

            // ✅ Select drivers who finished in P11-P20 in qualifying
            const eligibleDrivers = race.qualifying_results
                .filter(d => d.finishPosition && d.finishPosition >= 11 && d.finishPosition <= 20) // 🔍 Confirm field name
                .map(d => d.driverNumber);

            if (eligibleDrivers.length < 2) {
                console.log(`⚠️ Not enough eligible drivers for ${race.meeting_name}. Skipping...`);
                continue;
            }

            // ✅ Shuffle the eligible drivers to randomize selection
            for (let i = eligibleDrivers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [eligibleDrivers[i], eligibleDrivers[j]] = [eligibleDrivers[j], eligibleDrivers[i]];
            }

            // ✅ Ensure unique picks for this user
            const autoPicks = eligibleDrivers.slice(0, 2);

            // ✅ Update ONLY `picks` field
            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        [`picks.${season}.${meetingKey}`]: {
                            autopick: true,
                            picks: autoPicks,
                        },
                    },
                }
            );

            console.log(`✅ Assigned auto-picks for ${user.username} in ${race.meeting_name}: ${autoPicks.join(", ")}`);
        }
    }

    console.log("✅ Auto-picks completed!");
    process.exit(); // ✅ Exit the script once done
}

// ✅ Run the function immediately
runAutoPicks();