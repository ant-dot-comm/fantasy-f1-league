import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

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
      const sessionResponse = await axios.get(
        `https://api.openf1.org/v1/sessions?meeting_key=${meeting_key}`
      );
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

    // ✅ Fetch and store ordered Qualifying Results
    let qualifyingResults = [];
    try {
      const qualiResponse = await axios.get(
        `https://api.openf1.org/v1/position?session_key=${sessionKeyQualifying}`
      );
      qualifyingResults = getOrderedDriverResults(qualiResponse.data);
      raceEntry.qualifying_results = qualifyingResults;
      console.log(`✅ Stored qualifying results for ${meeting_name}:`, qualifyingResults);
    } catch (error) {
      console.error(`❌ Error fetching qualifying results for ${meeting_name}:`, error);
      continue;
    }

    // ✅ Fetch and store ordered Race Results
    let raceResults = [];
    try {
      const raceResponse = await axios.get(
        `https://api.openf1.org/v1/position?session_key=${sessionKeyRace}`
      );
      raceResults = getOrderedDriverResults(raceResponse.data);
      raceEntry.race_results = raceResults;
      console.log(`✅ Stored race results for ${meeting_name}:`, raceResults);
    } catch (error) {
      console.error(`❌ Error fetching race results for ${meeting_name}:`, error);
      continue;
    }

    // ✅ Save race data
    await raceEntry.save();
    console.log(`✅ Successfully saved data for ${meeting_name}`);

    // ✅ Fetch and store driver details
    await updateDrivers(year, [...new Set([...qualifyingResults, ...raceResults])], sessionKeyRace);
  }

  console.log("✅ All race data stored successfully!");
  process.exit();
}

storeRaceData(2023); // Call for the specific year

// Utility Function: Extract ordered driver results
function getOrderedDriverResults(positionData) {
  const driverFinalPositions = {};
  positionData.forEach(entry => {
    driverFinalPositions[entry.driver_number] = entry.position;
  });

  return Object.entries(driverFinalPositions)
    .sort((a, b) => a[1] - b[1])
    .map(entry => parseInt(entry[0]));
}

// ✅ Update the Drivers Collection in MongoDB
async function updateDrivers(year, driverNumbers, sessionKey) {
  console.log(`📡 Checking and updating drivers for ${year}...`);

  for (let driverNumber of driverNumbers) {
    const existingDriver = await Driver.findOne({ driver_number: driverNumber, year });

    if (!existingDriver) {
      try {
        const driverResponse = await axios.get(
          `https://api.openf1.org/v1/drivers?driver_number=${driverNumber}&session_key=${sessionKey}`
        );

        if (driverResponse.data.length > 0) {
          const driverData = driverResponse.data[0];

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
          console.log(`✅ Added new driver: ${driverData.full_name} (${driverData.team_name})`);
        }
      } catch (error) {
        console.error(`❌ Error fetching driver data for driver ${driverNumber}:`, error);
      }
    }
  }
}