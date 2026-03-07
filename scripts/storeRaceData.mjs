import axios from "axios";
import dbConnect from "../lib/mongodb.js";
import Races from "../models/Race.js";
import Driver from "../models/Driver.js";

// OpenF1 rate limit: max 3 requests/second
const OPENF1_DELAY_MS = 400;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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
        } else {
            // Ensure year is set so /api/currentRace?season=X finds this race
            raceEntry.year = Number(year);
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

        // ✅ Fetch driver numbers from position endpoint (and from starting_grid when available)
        let allDriverNumbers = new Set();
        if (sessionKeyQualifying) {
            const qualifyingDriverNumbers = await fetchDriverNumbers(sessionKeyQualifying);
            qualifyingDriverNumbers.forEach((n) => allDriverNumbers.add(n));
        }
        if (sessionKeyRace) {
            const raceDriverNumbers = await fetchDriverNumbers(sessionKeyRace);
            raceDriverNumbers.forEach((n) => allDriverNumbers.add(n));
        }

        // ✅ Prefer starting_grid for "qualifying_results": all 22 drivers (including DNS/DNF in quali)
        let qualifyingResultsFromStartingGrid = false;
        const sessionKeysToTry = [sessionKeyRace, sessionKeyQualifying].filter(Boolean);
        for (const sk of sessionKeysToTry) {
            if (qualifyingResultsFromStartingGrid) break;
            try {
                const gridRes = await axios.get(
                    `https://api.openf1.org/v1/starting_grid?session_key=${sk}`,
                    { validateStatus: (s) => s === 200 || s === 404 }
                );
                if (gridRes.status === 200 && Array.isArray(gridRes.data) && gridRes.data.length > 0) {
                    raceEntry.qualifying_results = gridRes.data.map((d) => ({
                        driverNumber: d.driver_number,
                        finishPosition: d.position ?? 0,
                    }));
                    gridRes.data.forEach((d) => allDriverNumbers.add(d.driver_number));
                    qualifyingResultsFromStartingGrid = true;
                    console.log(`✅ Stored starting grid for ${meeting_name} (${raceEntry.qualifying_results.length} drivers, session_key=${sk})`);
                    if (raceEntry.qualifying_results.length < 22) {
                        console.warn(`⚠️ Starting grid has ${raceEntry.qualifying_results.length} drivers; expected 22. OpenF1 may not have full grid yet.`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ starting_grid session_key=${sk} for ${meeting_name}:`, error.message);
            }
        }

        if (!qualifyingResultsFromStartingGrid && sessionKeyQualifying) {
            try {
                console.log(`🔎 No starting grid yet; fetching qualifying session_result for ${meeting_name}...`);
                const qualiRes = await axios.get(
                    `https://api.openf1.org/v1/session_result?session_key=${sessionKeyQualifying}`
                );
                const qualiResults = qualiRes.data;
                if (Array.isArray(qualiResults) && qualiResults.length > 0) {
                    raceEntry.qualifying_results = qualiResults.map((d) => ({
                        driverNumber: d.driver_number,
                        finishPosition: d.position ?? 0,
                        dnf: d.dnf === true,
                        dns: d.dns === true,
                        dsq: d.dsq === true,
                    }));
                    qualiResults.forEach((d) => allDriverNumbers.add(d.driver_number));
                    console.log(`✅ Stored qualifying results (fallback, ${qualiResults.length} drivers) for ${meeting_name}`);
                } else {
                    console.log(`⚠️ No qualifying results for ${meeting_name}, keeping existing data`);
                }
            } catch (error) {
                console.error(`❌ Error fetching qualifying results for ${meeting_name}:`, error.message);
            }
        }

        console.log(`🔎 Total Drivers Found: ${allDriverNumbers.size}`);

        // ✅ Store new drivers **without making unnecessary API calls**
        await checkAndStoreNewDrivers([...allDriverNumbers], sessionKeyQualifying || sessionKeyRace, year);

        if (sessionKeyRace) {
            try {
                console.log(`🔎 Fetching race classification for session: ${sessionKeyRace}...`);
                const raceRes = await axios.get(
                    `https://api.openf1.org/v1/session_result?session_key=${sessionKeyRace}`
                );
                const raceResults = raceRes.data;

                if (Array.isArray(raceResults) && raceResults.length > 0) {
                    // Build map from qualifying results for start positions
                    const qualifyingMap = {};
                    (raceEntry.qualifying_results || []).forEach((q) => {
                        qualifyingMap[q.driverNumber] = q.finishPosition;
                    });

                    const formattedRaceResults = raceResults.map((d) => ({
                        driverNumber: d.driver_number,
                        startPosition: qualifyingMap[d.driver_number] ?? 0,
                        finishPosition: d.position ?? 0,
                        dnf: d.dnf === true,
                        dns: d.dns === true,
                        dsq: d.dsq === true,
                    }));

                    // Count all non-finishers (DNF, DNS, DSQ) for bonus pick logic
                    const dnfs = raceResults.filter(
                        (d) => d.dnf === true || d.dns === true || d.dsq === true
                    ).length;
                    raceEntry.race_results = formattedRaceResults;
                    raceEntry.dnfs = dnfs;

                    console.log(
                        `✅ Stored race results for ${meeting_name} (DNFs: ${dnfs})`
                    );
                } else {
                    console.log(
                        `⚠️ No race results found via session_result for ${meeting_name}, keeping existing data`
                    );
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    console.warn(`⚠️ Race results not available yet for ${meeting_name} (404). Run again after the race.`);
                } else {
                    console.error(`❌ Error fetching race results for ${meeting_name}:`, error.message);
                }
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
storeRaceData("2026", "1279"); // Call for a specific year & meeting if needed

// 🔥 Fetch all unique driver numbers for a given session (uses /v1/position; 404 = no data yet e.g. race not run)
async function fetchDriverNumbers(sessionKey) {
    try {
        console.log(`🔎 Fetching driver numbers for session: ${sessionKey}...`);
        const response = await axios.get(
            `https://api.openf1.org/v1/position?session_key=${sessionKey}`,
            { validateStatus: (s) => s === 200 || s === 404 }
        );
        if (response.status === 404) {
            console.warn(`⚠️ No position data for session ${sessionKey} (404).`);
            return [];
        }
        const uniqueDrivers = new Set(
            response.data.map((entry) => entry.driver_number)
        );
        return Array.from(uniqueDrivers);
    } catch (error) {
        console.error("❌ Error fetching driver numbers:", error.message);
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
            let response = await axios.get(
                `https://api.openf1.org/v1/drivers?driver_number=${driverNumber}&session_key=${sessionKey}`,
                { validateStatus: (s) => s === 200 || s === 429 }
            );

            // ✅ Respect OpenF1 rate limit (3 req/s): retry once after delay if 429
            if (response.status === 429) {
                const retryAfter = Number(response.headers["retry-after"]) || 1;
                console.warn(`⚠️ Rate limited (429). Waiting ${retryAfter}s before retry...`);
                await delay(retryAfter * 1000);
                response = await axios.get(
                    `https://api.openf1.org/v1/drivers?driver_number=${driverNumber}&session_key=${sessionKey}`
                );
            }

            if (!response.data.length) {
                console.warn(`⚠️ No driver data found for number ${driverNumber}`);
                await delay(OPENF1_DELAY_MS);
                continue;
            }

            const driverData = response.data[0];

            // ✅ Check by full_name instead of year
            if (existingDriverNames.has(driverData.full_name)) {
                console.log(`✅ Driver ${driverData.full_name} already exists. Skipping.`);
                await delay(OPENF1_DELAY_MS);
                continue;
            }

            // ✅ Ensure required fields exist before saving
            if (!driverData.first_name || !driverData.last_name) {
                console.warn(`⚠️ Missing required fields for driver #${driverNumber}, skipping...`, driverData);
                await delay(OPENF1_DELAY_MS);
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
            console.error(`❌ Error fetching driver data for ${driverNumber}:`, error.message);
        }

        await delay(OPENF1_DELAY_MS);
    }
}
