import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Driver from "@/models/Driver";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    await dbConnect();
    const { username, season } = req.query;

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
            });

            // ✅ Only trust stored driverScores/bonusPoints from runCalculateScores
            const hasStoredScores = Array.isArray(plainRaceData.driverScores) && plainRaceData.driverScores.length > 0;
            if (!hasStoredScores) {
                console.warn(
                    `⚠️ Missing stored driverScores for ${username} in season ${season}, meeting_key ${meetingKey}. Skipping race in breakdown.`
                );
                continue;
            }

            const results = plainRaceData.picks
                .map((driverNumber) => {
                    const stored = plainRaceData.driverScores.find((d) => d.driverNumber === driverNumber);
                    const driverInfo = driverDetails.find((d) => d.driver_number === driverNumber);
                    const qualiResult = raceEntry.qualifying_results?.find((d) => d.driverNumber === driverNumber);
                    if (!driverInfo) return null;
                    return {
                        driver_name: driverInfo.full_name,
                        team: driverInfo.team_name,
                        qualifying_position: stored?.startPosition ?? qualiResult?.finishPosition,
                        race_startPosition: stored?.startPosition,
                        race_position: stored?.finishPosition,
                        points: stored?.points ?? 0,
                        bonusTitle: stored?.bonusTitle ?? null,
                        gpWinner: raceEntry.race_results?.find((d) => d.driverNumber === driverNumber)?.finishPosition === 1,
                        name_acronym: driverInfo.name_acronym,
                        autoPicks: plainRaceData.autopick,
                        headshot_url: driverInfo.name_acronym
                            ? `/drivers/${season}/${driverInfo.name_acronym}.png`
                            : `/drivers/${season}/default.png`,
                    };
                })
                .filter(Boolean);

            if (
                plainRaceData.bonusPicks &&
                typeof plainRaceData.bonusPoints !== "number"
            ) {
                console.warn(
                    `⚠️ Missing stored bonusPoints for ${username} in season ${season}, meeting_key ${meetingKey}. Using 0.`
                );
            }

            const bonusPoints =
                typeof plainRaceData.bonusPoints === "number"
                    ? plainRaceData.bonusPoints
                    : 0;

            raceBreakdown.push({
                race: raceEntry.meeting_name,
                meeting_key: meetingKey,
                results,
                bonusPicks: plainRaceData.bonusPicks || null,
                bonusPoints,
                actualDnfs: raceEntry.dnfs || 0,
                pickedWorstDriver: null,
            });
            
            console.log(`🔍 Added to raceBreakdown for ${meetingKey}:`, {
                race: raceEntry.meeting_name,
                bonusPicks: plainRaceData.bonusPicks,
                hasBonusPicks: !!plainRaceData.bonusPicks
            });
        }

        // ✅ Populate pickedWorstDriver for each race (does not change scores)
        for (const race of raceBreakdown) {
            if (race.bonusPicks && (race.bonusPicks.worstDriver || race.bonusPicks.dnfs !== null)) {
                const raceEntry = await Race.findOne({
                    meeting_key: race.meeting_key,
                    year: season,
                });
                
                if (raceEntry) {
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

        res.status(200).json({ raceBreakdown });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
