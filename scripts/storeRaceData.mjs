import axios from "axios";
import dbConnect from "../lib/mongodb.js";
import Races from "../models/Race.js";
import Driver from "../models/Driver.js";

async function storeRaceData(year, meetingKey = null) {
    await dbConnect();

    console.log(`📡 Fetching race data for season ${year}...`);

    let raceResponse;
    try {
        const url = meetingKey 
            ? `https://api.openf1.org/v1/meetings?meeting_key=${meetingKey}`
            : `https://api.openf1.org/v1/meetings?year=${year}`;

        const response = await axios.get(url);
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

        // ✅ Fetch all session data **ONCE** (instead of multiple times)
        let sessionKeyQualifying, sessionKeyRace, qualifyingEndTime, raceStartTime;
        try {
            const sessionResponse = await axios.get(`https://api.openf1.org/v1/sessions?meeting_key=${meeting_key}`);
            const sessions = sessionResponse.data;

            // Filter to find the correct qualifying and race session
            const qualifyingSession = sessions.find(s => s.session_type === "Qualifying" && s.session_name === "Qualifying");
            const raceSession = sessions.find(s => s.session_type === "Race");

            if (!qualifyingSession || !raceSession) {
                console.warn(`⚠️ Missing Qualifying or Race session for ${meeting_name}. Skipping...`);
                continue;
            }

            sessionKeyQualifying = qualifyingSession.session_key;
            sessionKeyRace = raceSession.session_key;
            qualifyingEndTime = new Date(qualifyingSession.date_end);
            raceStartTime = new Date(raceSession.date_start);
        } catch (error) {
            console.error(`❌ Error fetching session data for ${meeting_name}:`, error);
            continue;
        }

        // ✅ Store session times in DB
        raceEntry.picks_open = qualifyingEndTime;
        raceEntry.picks_closed = raceStartTime;

        // ✅ Fetch all driver numbers in a single call per session
        let qualifyingDriverNumbers = await fetchDriverNumbers(sessionKeyQualifying);
        let raceDriverNumbers = await fetchDriverNumbers(sessionKeyRace);
        let allDriverNumbers = new Set([...qualifyingDriverNumbers, ...raceDriverNumbers]);

        console.log(`🔎 Qualifying Drivers: ${qualifyingDriverNumbers.length}, Race Drivers: ${raceDriverNumbers.length}`);

        if (qualifyingDriverNumbers.length === 0) {
            console.warn(`⚠️ No qualifying driver numbers found for ${meeting_name}`);
        }

        // ✅ Check and store new drivers **without making unnecessary API calls**
        await checkAndStoreNewDrivers([...allDriverNumbers], sessionKeyQualifying, year);

        // ✅ Fetch Qualifying & Race Results in **Batch Calls**
        try {
            raceEntry.qualifying_results = await fetchAllDriverPositions(sessionKeyQualifying);
            console.log(`✅ Stored qualifying results for ${meeting_name}`);
        } catch (error) {
            console.error(`❌ Error fetching qualifying results for ${meeting_name}:`, error);
        }

        try {
            raceEntry.race_results = await fetchAllDriverPositions(sessionKeyRace);
            console.log(`✅ Stored race results for ${meeting_name}`);
        } catch (error) {
            console.error(`❌ Error fetching race results for ${meeting_name}:`, error);
        }

        await raceEntry.save();
        console.log(`✅ Successfully saved data for ${meeting_name}: Picks Open: ${qualifyingEndTime}, Picks Close: ${raceStartTime}`);
    }

    console.log("✅ All race data stored successfully!");
    process.exit();
}

storeRaceData("2025"); // Call for a specific year & meeting if needed
// storeRaceData("2024", "1229"); // Call for a specific year & meeting if needed

// 🔥 Fetch ALL driver positions for a session at once **(Optimized)**
async function fetchAllDriverPositions(sessionKey) {
    try {
        console.log(`🔎 Fetching driver positions for session: ${sessionKey}...`);
        const response = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
        const positions = response.data;

        if (!positions.length) {
            console.warn(`⚠️ No position data found for session ${sessionKey}`);
            return [];
        }

        let driverPositions = {};
        positions.forEach(entry => {
            if (!driverPositions[entry.driver_number]) {
                driverPositions[entry.driver_number] = {
                    driverNumber: entry.driver_number,
                    startPosition: entry.position,
                    finishPosition: entry.position,
                };
            } else {
                driverPositions[entry.driver_number].finishPosition = entry.position;
            }
        });

        return Object.values(driverPositions);
    } catch (error) {
        console.error(`❌ Error fetching positions for session ${sessionKey}:`, error);
        return [];
    }
}

// 🔥 Fetch all unique driver numbers for a given session
async function fetchDriverNumbers(sessionKey) {
    try {
        console.log(`🔎 Fetching driver numbers for session: ${sessionKey}...`);
        const response = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
        const uniqueDrivers = new Set(response.data.map(entry => entry.driver_number));
        return Array.from(uniqueDrivers);
    } catch (error) {
        console.error("❌ Error fetching driver numbers:", error);
        return [];
    }
}

// 🔥 Optimize driver storage by avoiding duplicate API calls
async function checkAndStoreNewDrivers(driverNumbers, sessionKey, year) {
    await dbConnect();

    let existingDrivers = await Driver.find({ driver_number: { $in: driverNumbers }, year });
    let existingDriverNumbers = new Set(existingDrivers.map(d => d.driver_number));

    for (const driverNumber of driverNumbers) {
        if (existingDriverNumbers.has(driverNumber)) {
            continue; // ✅ Skip existing drivers
        }

        console.log(`🔍 Driver ${driverNumber} not found. Fetching details...`);

        try {
            const response = await axios.get(`https://api.openf1.org/v1/drivers?driver_number=${driverNumber}&session_key=${sessionKey}`);
            if (!response.data.length) {
                console.warn(`⚠️ No driver data found for number ${driverNumber}`);
                continue;
            }

            const driverData = response.data[0];
            const newDriver = new Driver({
                driver_number: driverData.driver_number,
                full_name: driverData.full_name,
                name_acronym: driverData.name_acronym,
                team_name: driverData.team_name,
                team_colour: driverData.team_colour,
                headshot_url: driverData.headshot_url,
                year
            });

            await newDriver.save();
            console.log(`✅ Added new driver: ${driverData.full_name} (#${driverData.driver_number})`);
        } catch (error) {
            console.error(`❌ Error fetching driver data for ${driverNumber}:`, error);
        }
    }
}