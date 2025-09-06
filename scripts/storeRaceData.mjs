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
            raceEntry = new Races({
                meeting_key,
                country_name,
                meeting_name,
                year,
            });
            console.log(`✅ Created new race entry: ${meeting_name} (${country_name})`);
        }

        // ✅ Fetch session data **ONCE** and store what is available
        let sessionKeyQualifying = null,
            sessionKeyRace = null,
            qualifyingEndTime = null,
            raceStartTime = null;

        try {
            const sessionResponse = await axios.get(
                `https://api.openf1.org/v1/sessions?meeting_key=${meeting_key}`
            );
            const sessions = sessionResponse.data;

            const qualifyingSession = sessions.find(
                (s) => s.session_type === "Qualifying" && !s.session_name.includes("Sprint")
            );
            const raceSession = sessions.find((s) => s.session_type === "Race" && !s.session_name.includes("Sprint"));

            if (qualifyingSession) {
                sessionKeyQualifying = qualifyingSession.session_key;
                qualifyingEndTime = new Date(qualifyingSession.date_end);
                console.log(`🔍 Found Qualifying Session: ${sessionKeyQualifying}`);
            } else {
                console.warn(`⚠️ No Qualifying session found for ${meeting_name}.`);
            }

            if (raceSession) {
                sessionKeyRace = raceSession.session_key;
                raceStartTime = new Date(raceSession.date_start);
                console.log(`🔍 Found Race Session: ${sessionKeyRace}`);
            } else {
                console.warn(`⚠️ No Race session found for ${meeting_name}.`);
            }
        } catch (error) {
            console.error(`❌ Error fetching session data for ${meeting_name}:`, error);
        }

        // ✅ Store session times in DB if available
        if (qualifyingEndTime) raceEntry.picks_open = qualifyingEndTime;
        if (raceStartTime) raceEntry.picks_closed = raceStartTime;

        // ✅ Fetch driver numbers **only for available sessions**
        let allDriverNumbers = new Set();
        if (sessionKeyQualifying) {
            let qualifyingDriverNumbers = await fetchDriverNumbers(sessionKeyQualifying);
            allDriverNumbers = new Set([...allDriverNumbers, ...qualifyingDriverNumbers]);
        }
        if (sessionKeyRace) {
            let raceDriverNumbers = await fetchDriverNumbers(sessionKeyRace);
            allDriverNumbers = new Set([...allDriverNumbers, ...raceDriverNumbers]);
        }

        console.log(`🔎 Total Drivers Found: ${allDriverNumbers.size}`);

        // ✅ Store new drivers **without making unnecessary API calls**
        await checkAndStoreNewDrivers([...allDriverNumbers], sessionKeyQualifying || sessionKeyRace, year);

        // ✅ Fetch Qualifying & Race Results if available
        if (sessionKeyQualifying) {
            try {
                raceEntry.qualifying_results = await fetchAllDriverPositions(sessionKeyQualifying);
                console.log(`✅ Stored qualifying results for ${meeting_name}`);
            } catch (error) {
                console.error(`❌ Error fetching qualifying results for ${meeting_name}:`, error);
            }
        }

        if (sessionKeyRace) {
            try {
                raceEntry.race_results = await fetchAllDriverPositions(sessionKeyRace);
                console.log(`✅ Stored race results for ${meeting_name}`);
            } catch (error) {
                console.error(`❌ Error fetching race results for ${meeting_name}:`, error);
            }
        }

        // ✅ Save whatever data we have
        await raceEntry.save();
        console.log(`✅ Successfully saved data for ${meeting_name}`);
    }

    console.log("✅ All race data stored successfully!");
    process.exit();
}

// storeRaceData("2023"); // Call for a specific year & meeting if needed
storeRaceData("2025", "1268"); // Call for a specific year & meeting if needed

// 🔥 Fetch ALL driver positions for a session at once **(Optimized)**
async function fetchAllDriverPositions(sessionKey) {
    try {
        console.log(
            `🔎 Fetching driver positions for session: ${sessionKey}...`
        );
        const response = await axios.get(
            `https://api.openf1.org/v1/position?session_key=${sessionKey}`
        );
        const positions = response.data;

        if (!positions.length) {
            console.warn(`⚠️ No position data found for session ${sessionKey}`);
            return [];
        }

        let driverPositions = {};
        positions.forEach((entry) => {
            if (!driverPositions[entry.driver_number]) {
                driverPositions[entry.driver_number] = {
                    driverNumber: entry.driver_number,
                    startPosition: entry.position,
                    finishPosition: entry.position,
                };
            } else {
                driverPositions[entry.driver_number].finishPosition =
                    entry.position;
            }
        });

        return Object.values(driverPositions);
    } catch (error) {
        console.error(
            `❌ Error fetching positions for session ${sessionKey}:`,
            error
        );
        return [];
    }
}

// 🔥 Fetch all unique driver numbers for a given session
async function fetchDriverNumbers(sessionKey) {
    try {
        console.log(`🔎 Fetching driver numbers for session: ${sessionKey}...`);
        const response = await axios.get(
            `https://api.openf1.org/v1/position?session_key=${sessionKey}`
        );
        const uniqueDrivers = new Set(
            response.data.map((entry) => entry.driver_number)
        );
        return Array.from(uniqueDrivers);
    } catch (error) {
        console.error("❌ Error fetching driver numbers:", error);
        return [];
    }
}

// 🔥 Optimize driver storage by avoiding duplicate API calls
async function checkAndStoreNewDrivers(driverNumbers, sessionKey) {
    await dbConnect();

    let existingDrivers = await Driver.find({
        driver_number: { $in: driverNumbers },
    });

    let existingDriverNames = new Set(existingDrivers.map((d) => d.full_name));

    for (const driverNumber of driverNumbers) {
        console.log(`🔍 Checking driver ${driverNumber}...`);

        try {
            const response = await axios.get(
                `https://api.openf1.org/v1/drivers?driver_number=${driverNumber}&session_key=${sessionKey}`
            );

            if (!response.data.length) {
                console.warn(`⚠️ No driver data found for number ${driverNumber}`);
                continue;
            }

            const driverData = response.data[0];

            // ✅ Check by full_name instead of year
            if (existingDriverNames.has(driverData.full_name)) {
                console.log(`✅ Driver ${driverData.full_name} already exists. Skipping.`);
                continue;
            }

            // ✅ Ensure required fields exist before saving
            if (!driverData.first_name || !driverData.last_name) {
                console.warn(`⚠️ Missing required fields for driver #${driverNumber}, skipping...`, driverData);
                continue;
            }

            const newDriver = new Driver({
                driver_number: driverData.driver_number,
                first_name: driverData.first_name,
                last_name: driverData.last_name,
                full_name: driverData.full_name, // ✅ Store by full_name
                name_acronym: driverData.name_acronym,
                country_code: driverData.country_code,
                team_name: driverData.team_name,
                team_colour: driverData.team_colour,
                headshot_url: driverData.headshot_url,
            });

            await newDriver.save();
            console.log(`✅ Added new driver: ${driverData.full_name} (#${driverData.driver_number})`);

            // ✅ Add to set to prevent duplicate API checks
            existingDriverNames.add(driverData.full_name);
        } catch (error) {
            console.error(`❌ Error fetching driver data for ${driverNumber}:`, error);
        }
    }
}