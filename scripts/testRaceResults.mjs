import axios from "axios";

async function testRaceResults() {
    const sessionKeyRace = 9070; // 🔥 Test for only Azerbaijan GP
    console.log(`📡 Fetching driver list for session_key=${sessionKeyRace}`);

    let driverNumbers = [];
    try {
        const response = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKeyRace}`);
        const uniqueDrivers = new Set(response.data.map(entry => entry.driver_number));
        driverNumbers = Array.from(uniqueDrivers);
    } catch (error) {
        console.error("❌ Error fetching driver numbers:", error);
        return;
    }

    console.log(`🏎️ Found ${driverNumbers.length} unique drivers`);

    let raceResults = [];

    for (const driverNumber of driverNumbers) {
        try {
            const response = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKeyRace}&driver_number=${driverNumber}`);
            const positionData = response.data;

            if (positionData.length === 0) {
                console.warn(`⚠️ No position data found for driver ${driverNumber}`);
                continue;
            }

            // ✅ First recorded entry -> Start Position
            const startPosition = positionData[0].position;
            // ✅ Last recorded entry -> Finish Position
            const finishPosition = positionData.at(-1).position;

            raceResults.push({ driverNumber, startPosition, finishPosition });

            console.log(`✅ Driver ${driverNumber} Start: ${startPosition}, Finish: ${finishPosition}`);
        } catch (error) {
            console.error(`❌ Error fetching data for driver ${driverNumber}:`, error);
        }
    }

    // ✅ Sort results by finishing position
    raceResults.sort((a, b) => a.finishPosition - b.finishPosition);

    // ✅ Format into RaceSchema structure
    const raceData = {
        meeting_key: "1207",  // Example meeting_key (Azerbaijan GP)
        country_name: "Azerbaijan",
        meeting_name: "Azerbaijan Grand Prix",
        year: 2023,
        race_results: raceResults, // Matches RaceSchema format
    };

    console.log("\n✅ Final Processed Race Data (RaceSchema Format):");
    console.log(JSON.stringify(raceData, null, 2));
}

// Run test without DB writes
testRaceResults();