import dbConnect from "@/lib/mongodb";
import { activeScoringModel } from "@/lib/utils/scoringModel";
import User from "@/models/User";
import Race from "@/models/Race";
import Driver from "@/models/Driver";

// In-memory cache for race breakdowns
const playerRaceCache = new Map();

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    await dbConnect();
    const { username, season } = req.query;
    const cacheKey = `${username}-${season}`;

    // ✅ Check cache before querying DB
    if (playerRaceCache.has(cacheKey)) {
        console.log(
            `⚡ Returning cached race breakdown for ${username} in ${season}`
        );
        return res
            .status(200)
            .json({ raceBreakdown: playerRaceCache.get(cacheKey) });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res
                .status(404)
                .json({
                    message: "User not found or no picks for this season",
                });
        }

        // ✅ Convert MongoDB Map to Object
        const userPicks =
            user.picks instanceof Map
                ? Object.fromEntries(user.picks)
                : user.picks;
        const seasonPicks =
            userPicks[season] instanceof Map
                ? Object.fromEntries(userPicks[season])
                : userPicks[season];

        if (!seasonPicks) {
            return res
                .status(404)
                .json({ message: "No picks for this season" });
        }

        const raceBreakdown = [];

        for (const [meetingKey, raceData] of Object.entries(seasonPicks)) {
            if (!raceData.picks || raceData.picks.length === 0) continue;

            const raceEntry = await Race.findOne({
                meeting_key: meetingKey,
                year: season,
            });
            if (!raceEntry) {
                console.log(`⚠️ No race data found for ${meetingKey}`);
                continue;
            }
            // console.log(`🔎 Found race ${raceEntry.meeting_name} for ${meetingKey}`);
            // console.log(`🏁 Race results:`, raceEntry.race_results);

            const driverDetails = await Driver.find({
                driver_number: { $in: raceData.picks },
                year: season,
            });

            const results = raceData.picks
                .map((driverNumber) => {
                    const qualiResult = raceEntry.qualifying_results.find(
                        (d) => d.driverNumber === driverNumber
                    );
                    const raceResult = raceEntry.race_results.find(
                        (d) => d.driverNumber === driverNumber
                    );
                    const driverInfo = driverDetails.find(
                        (d) => d.driver_number === driverNumber
                    );

                    if (!raceResult || !qualiResult|| !driverInfo) return null; // ✅ Handles missing data

                    let driverPoints = activeScoringModel(
                        qualiResult.finishPosition,  // ✅ Qualifying finish position
                        raceResult.finishPosition    // ✅ Race finish position
                    );

                    // console.log(
                    //     `🏎 ${driverInfo.full_name} scored ${driverPoints} points`
                    // );

                    return {
                        driver_name: driverInfo.full_name,
                        team: driverInfo.team_name,
                        qualifying_position: qualiResult.finishPosition,  // ✅ Use the actual qualifying finish position
                        race_position: raceResult.finishPosition, 
                        points: driverPoints,
                        name_acronym: driverInfo.name_acronym,
                        autoPicks: raceData.autopick,
                        headshot_url: driverInfo.name_acronym
                            ? `/drivers/${season}/${driverInfo.name_acronym}.png`
                            : `/drivers/${season}/default.png`,
                    };
                })
                .filter(Boolean);

            raceBreakdown.push({
                race: raceEntry.meeting_name,
                meeting_key: meetingKey,
                results,
            });
        }

        playerRaceCache.set(cacheKey, raceBreakdown);
        res.status(200).json({ raceBreakdown });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
