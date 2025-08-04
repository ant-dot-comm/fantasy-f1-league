import axios from "axios";
import dbConnect from "../lib/mongodb.js";
import Races from "../models/Race.js";

async function runRaceResults(meetingKey, sessionKey) {
    await dbConnect();

    console.log(`📡 Fetching race results for meeting_key: ${meetingKey}, session_key: ${sessionKey}...`);

    try {
        // ✅ Get existing qualifying results for start positions
        const raceEntry = await Races.findOne({ meeting_key: meetingKey });
        if (!raceEntry || !raceEntry.qualifying_results) {
            console.error(`❌ No qualifying results found for meeting_key: ${meetingKey}`);
            return;
        }

        // ✅ Create a map of driver numbers to qualifying positions
        const qualifyingMap = {};
        raceEntry.qualifying_results.forEach(driver => {
            qualifyingMap[driver.driverNumber] = driver.finishPosition;
        });

        console.log(`📊 Found ${raceEntry.qualifying_results.length} qualifying positions`);

        // ✅ Fetch race results data
        const raceResultsResponse = await axios.get(
            `https://api.openf1.org/v1/session_result?session_key=${sessionKey}`
        );
        const raceResults = raceResultsResponse.data;

        if (!raceResults || raceResults.length === 0) {
            console.error(`❌ No race results found for session_key: ${sessionKey}`);
            return;
        }

        console.log(`📊 Found ${raceResults.length} drivers in race results`);

        // ✅ Convert to race results format using qualifying data for start positions
        const formattedResults = raceResults.map(driver => ({
            driverNumber: driver.driver_number,
            startPosition: qualifyingMap[driver.driver_number] || 0, // Use qualifying position
            finishPosition: driver.position || 0, // Use 0 if position is null
        }));

        // ✅ Update race entry
        await Races.findOneAndUpdate(
            { meeting_key: meetingKey },
            { $set: { race_results: formattedResults } },
            { new: true }
        );

        console.log(`✅ Successfully stored race results`);
        console.log(`📊 Results:`, formattedResults);

    } catch (error) {
        console.error(`❌ Error:`, error);
    }

    process.exit();
}

// Run for Hungarian GP (meeting_key: 1266, session_key: 9928)
runRaceResults("1266", "9928"); 