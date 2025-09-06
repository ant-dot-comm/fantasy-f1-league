import dbConnect from "../lib/mongodb.js";
import User from "../models/User.js";
import Race from "../models/Race.js";

async function addTestBonusPicks() {
    await dbConnect();

    console.log("🎯 Adding test bonus picks for 2023 season...");

    try {
        // ✅ Get all 2023 users
        const users = await User.find({ seasons: 2023 });
        console.log(`📊 Found ${users.length} users with 2023 season`);

        // ✅ Get all 2023 races
        const races = await Race.find({ year: 2023 });
        console.log(`🏁 Found ${races.length} races for 2023`);

        // ✅ Add DNFs data to races
        for (const race of races) {
            const randomDnfs = Math.floor(Math.random() * 5) + 1; // 1-5 DNFs
            race.dnfs = randomDnfs;
            await race.save();
            console.log(`✅ Added ${randomDnfs} DNFs to ${race.meeting_name}`);
        }

        // ✅ Add random bonus picks to users
        for (const user of users) {
            const userPicks = user.picks instanceof Map ? Object.fromEntries(user.picks) : user.picks;
            const seasonPicks = userPicks?.[2023] instanceof Map ? Object.fromEntries(userPicks[2023]) : userPicks?.[2023];

            if (!seasonPicks) {
                console.log(`⚠️ No picks found for ${user.username} in 2023`);
                continue;
            }

            let bonusPicksAdded = 0;
            let updatedPicks = { ...seasonPicks };

            // ✅ Process each race
            for (const [meetingKey, raceData] of Object.entries(seasonPicks)) {
                if (!raceData.picks || raceData.picks.length === 0) continue;

                // ✅ Randomly decide if user makes bonus picks (70% chance)
                if (Math.random() < 0.7) {
                    // ✅ Initialize bonusPicks if it doesn't exist
                    if (!raceData.bonusPicks) {
                        raceData.bonusPicks = {
                            worstDriver: null,
                            dnfs: null,
                        };
                    }

                    // ✅ Randomly select worst driver from user's picks (50% chance)
                    if (Math.random() < 0.5 && raceData.picks.length > 0) {
                        const randomPickIndex = Math.floor(Math.random() * raceData.picks.length);
                        raceData.bonusPicks.worstDriver = raceData.picks[randomPickIndex];
                    }

                    // ✅ Randomly predict DNFs (60% chance)
                    if (Math.random() < 0.6) {
                        raceData.bonusPicks.dnfs = Math.floor(Math.random() * 5) + 1; // 1-5 DNFs
                    }

                    updatedPicks[meetingKey] = raceData;
                    bonusPicksAdded++;
                }
            }

            // ✅ Update user picks using findOneAndUpdate to avoid validation issues
            await User.findOneAndUpdate(
                { _id: user._id },
                { 
                    $set: { 
                        [`picks.2023`]: updatedPicks 
                    } 
                }
            );
            console.log(`✅ Added bonus picks to ${user.username} for ${bonusPicksAdded} races`);
        }

        console.log("🎉 Test bonus picks added successfully!");
        console.log("📊 Summary:");
        console.log(`   - ${races.length} races updated with DNFs data`);
        console.log(`   - ${users.length} users processed for bonus picks`);

    } catch (error) {
        console.error("❌ Error adding test bonus picks:", error);
    }

    process.exit();
}

// Run the script
addTestBonusPicks(); 