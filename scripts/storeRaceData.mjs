import axios from "axios";
import dbConnect from "../lib/mongodb.js";
import Races from "../models/Race.js";
import Driver from "../models/Driver.js"; 

async function storeRaceData(year) {
    await dbConnect();

    console.log(`📡 Fetching race data for season ${year}...`);

    let raceResponse;
    try {
        const response = await axios.get(`https://api.openf1.org/v1/meetings?year=${year}`);
        raceResponse = response.data;
    } catch (error) {
        console.error("❌ Failed to fetch race data:", error);
        process.exit(1);
    }

    console.log(`🏎️ Found ${raceResponse.length} races for ${year}.`);

    for (let race of raceResponse) {
        const { meeting_key, country_name, meeting_name } = race;

        console.log(`📡 Processing: ${meeting_name} (${country_name})...`);

        // ✅ Find or create race entry
        let raceEntry = await Races.findOne({ meeting_key });
        if (!raceEntry) {
            raceEntry = new Races({ meeting_key, country_name, meeting_name, year });
            console.log(`✅ Created new race entry: ${meeting_name} (${country_name})`);
        }

        // ✅ Get session keys for Qualifying & Race
        let sessionKeyQualifying, sessionKeyRace;
        try {
            const sessionResponse = await axios.get(`https://api.openf1.org/v1/sessions?meeting_key=${meeting_key}`);
            sessionKeyQualifying = sessionResponse.data.find(s => s.session_type === "Qualifying")?.session_key;
            sessionKeyRace = sessionResponse.data.find(s => s.session_type === "Race")?.session_key;
        } catch (error) {
            console.error(`❌ Error fetching session keys for ${meeting_name}:`, error);
            continue;
        }

        if (!sessionKeyQualifying || !sessionKeyRace) {
            console.warn(`⚠️ Missing session keys for ${meeting_name}. Skipping...`);
            continue;
        }

        // ✅ Fetch driver numbers
        let allDriverNumbers = new Set();
        try {
            const qualifyingDriverNumbers = await fetchDriverNumbers(sessionKeyQualifying);
            const raceDriverNumbers = await fetchDriverNumbers(sessionKeyRace);
            allDriverNumbers = new Set([...qualifyingDriverNumbers, ...raceDriverNumbers]);

            // ✅ Check and store new drivers
            await checkAndStoreNewDrivers(Array.from(allDriverNumbers), sessionKeyQualifying, year);
        } catch (error) {
            console.error(`❌ Error fetching driver numbers for ${meeting_name}:`, error);
            continue;
        }

        // ✅ Fetch and store Qualifying Results
        try {
            const qualifyingResults = await fetchDriverPositions(sessionKeyQualifying, qualifyingDriverNumbers, "qualifying");
            raceEntry.qualifying_results = qualifyingResults;
            console.log(`✅ Stored qualifying results for ${meeting_name}`);
        } catch (error) {
            console.error(`❌ Error fetching qualifying results for ${meeting_name}:`, error);
            continue;
        }

        // ✅ Fetch and store Race Results
        try {
            const raceResults = await fetchDriverPositions(sessionKeyRace, raceDriverNumbers, "race");
            raceEntry.race_results = raceResults;
            console.log(`✅ Stored race results for ${meeting_name}`);
        } catch (error) {
            console.error(`❌ Error fetching race results for ${meeting_name}:`, error);
            continue;
        }

        await raceEntry.save();
        console.log(`✅ Successfully saved data for ${meeting_name}`);
    }

    console.log("✅ All race data stored successfully!");
    process.exit();
}

storeRaceData("2024"); // Call for the specific year

// 🔥 Fetch all unique driver numbers for a given session
async function fetchDriverNumbers(sessionKey) {
    try {
        const response = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
        const uniqueDrivers = new Set(response.data.map(entry => entry.driver_number));
        return Array.from(uniqueDrivers);
    } catch (error) {
        console.error("❌ Error fetching driver numbers:", error);
        return [];
    }
}

async function checkAndStoreNewDrivers(driverNumbers, sessionKey, year) {
    await dbConnect();

    for (const driverNumber of driverNumbers) {
        // ✅ Check if driver already exists in DB
        const existingDriver = await Driver.findOne({ driver_number: driverNumber, year });

        if (existingDriver) {
            console.log(`✅ Driver ${driverNumber} already exists for ${year}, skipping...`);
            continue;
        }

        console.log(`🔍 Driver ${driverNumber} not found. Fetching details...`);

        try {
            const response = await axios.get(`https://api.openf1.org/v1/drivers?driver_number=${driverNumber}&session_key=${sessionKey}`);

            if (response.data.length === 0) {
                console.warn(`⚠️ No driver data found for number ${driverNumber}`);
                continue;
            }

            const driverData = response.data[0];

            // ✅ Create new driver entry
            const newDriver = new Driver({
                driver_number: driverData.driver_number,
                full_name: driverData.full_name,
                first_name: driverData.first_name,
                last_name: driverData.last_name,
                name_acronym: driverData.name_acronym,
                country_code: driverData.country_code,
                team_name: driverData.team_name,
                team_colour: driverData.team_colour,
                headshot_url: driverData.headshot_url,
                year
            });

            await newDriver.save();
            console.log(`✅ Added new driver: ${driverData.full_name} (#${driverData.driver_number})`);
        } catch (error) {
            console.error(`❌ Error fetching driver data for number ${driverNumber}:`, error);
        }
    }
}

// 🔥 Fetch correct positions for each driver (Qualifying & Race) with rate limiting & retries
async function fetchDriverPositions(sessionKey, driverNumbers, type) {
    let results = [];

    for (const driverNumber of driverNumbers) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Throttle requests (500ms delay)

        let attempts = 0;
        const maxAttempts = 5; // Max retries before failing

        while (attempts < maxAttempts) {
            try {
                const response = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}&driver_number=${driverNumber}`);
                const positionData = response.data;

                if (positionData.length === 0) {
                    console.warn(`⚠️ No position data found for driver ${driverNumber}`);
                    break;
                }

                const startPosition = positionData[0].position;
                const finishPosition = positionData.at(-1).position;

                if (type === "qualifying") {
                    results.push({ driverNumber, startPosition, finishPosition });
                } else {
                    results.push({ driverNumber, startPosition, finishPosition });
                }

                console.log(`✅ Driver ${driverNumber} ${type === "qualifying" ? `Q:${startPosition}, S:${startPosition}` : `Start: ${startPosition}, Finish: ${finishPosition}`}`);
                break; // Exit retry loop if successful
            } catch (error) {
                if (error.response?.status === 429) {
                    attempts++;
                    const waitTime = 1000 * attempts; // Increase wait time for each attempt
                    console.warn(`⚠️ Rate limited! Retrying in ${waitTime / 1000}s... (${attempts}/${maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime)); // Wait before retrying
                } else {
                    console.error(`❌ Error fetching data for driver ${driverNumber}:`, error);
                    break; // Don't retry for non-429 errors
                }
            }
        }
    }

    return results;
}