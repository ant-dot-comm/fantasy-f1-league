import axios from "axios";
import dbConnect from "../lib/mongodb.js";
import Races from "../models/Race.js";

async function runStartingGrid(meetingKey) {
    await dbConnect();

    console.log(`📡 Fetching starting grid for meeting_key: ${meetingKey}...`);

    try {
        // ✅ Fetch starting grid data
        const startingGridResponse = await axios.get(
            `https://api.openf1.org/v1/starting_grid?meeting_key=${meetingKey}`
        );
        const startingGrid = startingGridResponse.data;

        if (!startingGrid || startingGrid.length === 0) {
            console.error(`❌ No starting grid data found for meeting_key: ${meetingKey}`);
            return;
        }

        console.log(`📊 Found ${startingGrid.length} drivers in starting grid`);

        // ✅ Convert to qualifying results format
        const qualifyingResults = startingGrid.map(driver => ({
            driverNumber: driver.driver_number,
            startPosition: driver.position,
            finishPosition: driver.position,
        }));

        // ✅ Update race entry
        await Races.findOneAndUpdate(
            { meeting_key: meetingKey },
            { $set: { qualifying_results: qualifyingResults } },
            { new: true }
        );

        console.log(`✅ Successfully stored qualifying results`);
        console.log(`📊 Results:`, qualifyingResults);

    } catch (error) {
        console.error(`❌ Error:`, error);
    }

    process.exit();
}

// Run for Hungarian GP
runStartingGrid("1266"); 