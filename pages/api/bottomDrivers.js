import dbConnect from "../../lib/mongodb";
import Races from "../../models/Race";
import Drivers from "../../models/Driver"; // ✅ Import driver model

export default async function handler(req, res) {
    await dbConnect();

    const { meeting_key, season } = req.query;

    try {
        const race = await Races.findOne({ meeting_key }).lean();
        if (!race || !race.qualifying_results) {
            return res.status(404).json({ error: "Race not found or missing qualifying results" });
        }

            // console.log(race.qualifying_results)
        // ✅ Get drivers who finished in positions 11-20 in qualifying
        const bottomDrivers = race.qualifying_results
            .filter(driver => driver.finishPosition >= 11 && driver.finishPosition <= 20);

        if (bottomDrivers.length === 0) {
            return res.status(404).json({ error: "No bottom drivers found" });
        }

        // ✅ Fetch driver details from MongoDB (only drivers in bottom 10)
        const driverNumbers = bottomDrivers.map(driver => driver.driverNumber);
        const driverDetails = await Drivers.find({ driver_number: { $in: driverNumbers } }).lean();

        // ✅ Merge driver details
        const enrichedDrivers = bottomDrivers.map(driver => {
            const driverInfo = driverDetails.find(d => d.driver_number === driver.driverNumber);
            return {
                driverNumber: driver.driverNumber,
                qualifyingPosition: driver.finishPosition, // ✅ Qualifying position
                fullName: driverInfo ? driverInfo.full_name : `Driver ${driver.driverNumber}`, // ✅ Full name
                team: driverInfo ? driverInfo.team_name : "Unknown", // ✅ Team name
                teamColour: driverInfo ? driverInfo.team_colour : "#000000", // ✅ Default black if missing
                headshot: driverInfo?.name_acronym 
                    ? `/drivers/${season}/${driverInfo.name_acronym}.png` 
                    : `/drivers/${season}/default.png`,
                countryCode: driverInfo ? driverInfo.country_code : "N/A", // ✅ Country code
            };
        });

        res.status(200).json(enrichedDrivers);
    } catch (error) {
        console.error("❌ Error fetching bottom 10 drivers:", error);
        res.status(500).json({ error: "Failed to fetch bottom 10 drivers." });
    }
}