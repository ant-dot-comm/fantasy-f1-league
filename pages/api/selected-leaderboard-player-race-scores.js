import dbConnect from "@/lib/mongodb";
import { activeScoringModel, calculateBonusPicksScore } from "@/lib/utils/scoringModel";
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

        // console.log(`🔍 Season picks structure:`, JSON.stringify(seasonPicks, null, 2));

        if (!seasonPicks) {
            return res
                .status(404)
                .json({ message: "No picks for this season" });
        }

        const raceBreakdown = [];

        for (const [meetingKey, raceData] of Object.entries(seasonPicks)) {
            if (!raceData.picks || raceData.picks.length === 0) continue;

            // ✅ Convert Mongoose document to plain object if needed
            const plainRaceData = raceData.toObject ? raceData.toObject() : raceData;

            // console.log(`🔍 Processing ${meetingKey}:`, {
            //     raceDataKeys: Object.keys(plainRaceData),
            //     hasBonusPicks: 'bonusPicks' in plainRaceData,
            //     bonusPicksValue: plainRaceData.bonusPicks,
            //     raceDataType: typeof plainRaceData
            // });

            const raceEntry = await Race.findOne({
                meeting_key: meetingKey,
                year: season,
            });
            if (!raceEntry) {
                continue;
            }

            const driverDetails = await Driver.find({
                driver_number: { $in: plainRaceData.picks },
                // year: season,
            });

            const results = plainRaceData.picks
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

                    const { points: driverPoints, bonusTitle, gpWinner } = activeScoringModel(
                        raceResult.startPosition,
                        raceResult.finishPosition
                    );

                    // console.log(
                    //     `🏎 ${driverInfo.full_name} scored ${driverPoints} points`
                    // );

                    return {
                        driver_name: driverInfo.full_name,
                        team: driverInfo.team_name,
                        qualifying_position: qualiResult.finishPosition,  // ✅ Use the actual qualifying finish position
                        race_startPosition: raceResult.startPosition,  // ✅ Use the actual qualifying finish position
                        race_position: raceResult.finishPosition,  // 0 if DNF
                        points: driverPoints,
                        bonusTitle,
                        gpWinner,
                        name_acronym: driverInfo.name_acronym,
                        autoPicks: plainRaceData.autopick,
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
                bonusPicks: plainRaceData.bonusPicks || null,
                bonusPoints: 0, // Will be calculated below
                actualDnfs: raceEntry.dnfs || 0, // Use the dnf field from the race document
                pickedWorstDriver: null, // Will be calculated below
            });
            
            console.log(`🔍 Added to raceBreakdown for ${meetingKey}:`, {
                race: raceEntry.meeting_name,
                bonusPicks: plainRaceData.bonusPicks,
                hasBonusPicks: !!plainRaceData.bonusPicks
            });
        }

        // ✅ Calculate bonus points for each race
        for (const race of raceBreakdown) {
            if (race.bonusPicks && (race.bonusPicks.worstDriver || race.bonusPicks.dnfs !== null)) {
                const raceEntry = await Race.findOne({
                    meeting_key: race.meeting_key,
                    year: season,
                });
                
                if (raceEntry) {
                    const { bonusPoints } = calculateBonusPicksScore(
                        race.bonusPicks,
                        raceEntry.race_results || [],
                        raceEntry.qualifying_results || [],
                        raceEntry.dnfs || 0
                    );
                    race.bonusPoints = bonusPoints;

                    // ✅ Get actual performance data for the driver the user picked as "worst driver"
                    if (race.bonusPicks.worstDriver) {
                        const pickedDriverResult = raceEntry.race_results.find(
                            d => d.driverNumber === race.bonusPicks.worstDriver
                        );
                        const pickedDriverQuali = raceEntry.qualifying_results.find(
                            d => d.driverNumber === race.bonusPicks.worstDriver
                        );
                        const pickedDriverInfo = await Driver.findOne({
                            driver_number: race.bonusPicks.worstDriver
                        });

                        if (pickedDriverResult && pickedDriverQuali && pickedDriverInfo) {
                            race.pickedWorstDriver = {
                                driver_name: pickedDriverInfo.full_name,
                                team: pickedDriverInfo.team_name,
                                qualifying_position: pickedDriverQuali.finishPosition,
                                race_startPosition: pickedDriverResult.startPosition,
                                race_position: pickedDriverResult.finishPosition,
                                name_acronym: pickedDriverInfo.name_acronym,
                                headshot_url: pickedDriverInfo.name_acronym
                                    ? `/drivers/${season}/${pickedDriverInfo.name_acronym}.png`
                                    : `/drivers/${season}/default.png`,
                            };
                        }
                    }
                }
            }
        }

        playerRaceCache.set(cacheKey, raceBreakdown);
        res.status(200).json({ raceBreakdown });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
