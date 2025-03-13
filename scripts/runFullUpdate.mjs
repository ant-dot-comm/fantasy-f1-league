import storeRaceData from "./storeRaceData.js";
import autopickForSeason from "../pages/api/autopicks.js";
import dbConnect from "../lib/mongodb.js"; // Ensure DB is connected

async function runFullUpdate(year) {
    try {
        await dbConnect();
        console.log(`🚀 Running full update for season: ${year}...`);

        await storeRaceData(year);
        console.log("✅ Race data updated!");

        await autopickForSeason(year);
        console.log("✅ Auto-picks assigned!");

        console.log("🎉 Full update completed successfully!");
    } catch (error) {
        console.error("❌ Error during full update:", error);
    } finally {
        process.exit(); // Exit script when done
    }
}

// ✅ Change the year here (no need to pass it via CLI)
const YEAR = "2025"; // Change this to any season
runFullUpdate(YEAR);