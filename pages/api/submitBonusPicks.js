import dbConnect from "../../lib/mongodb";
import User from "../../models/User";
import { authenticateAndAuthorizeUser } from "../../lib/middleware";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Authenticate and authorize user
    return authenticateAndAuthorizeUser(req, res, async () => {
        await dbConnect();

        try {
            const { username, season, meeting_key, worstDriver, dnfs } = req.body;

            if (!username || !season || !meeting_key) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            // ✅ Find user and update bonus picks
            let user = await User.findOne({ username }).lean();
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // ✅ Initialize picks structure if it doesn't exist
            if (!user.picks) user.picks = {};
            if (!user.picks[season]) user.picks[season] = {};
            if (!user.picks[season][meeting_key]) {
                user.picks[season][meeting_key] = {
                    autopick: false,
                    picks: [],
                    bonusPicks: {
                        worstDriver: null,
                        dnfs: null,
                    },
                };
            }

            // ✅ Update bonus picks
            if (worstDriver !== undefined) {
                user.picks[season][meeting_key].bonusPicks.worstDriver = parseInt(worstDriver);
                // console.log("Setting worstDriver to:", parseInt(worstDriver));
            }
            if (dnfs !== undefined) {
                user.picks[season][meeting_key].bonusPicks.dnfs = parseInt(dnfs);
                // console.log("Setting dnfs to:", parseInt(dnfs));
            }

            // ✅ Save changes
            await User.updateOne({ username }, { $set: { picks: user.picks } });

            // console.log("Race picks before save:", JSON.stringify(user.picks[season][meeting_key], null, 2));
            // console.log("Full user picks before save:", JSON.stringify(user.picks, null, 2));

            // const updatedUser = await User.findOne({ username });
            // console.log("Race picks before save:", JSON.stringify(user.picks[season][meeting_key], null, 2));

            res.status(200).json({ 
                message: "Bonus picks submitted successfully",
                bonusPicks: {
                    worstDriver,
                    dnfs,
                }
            });
        } catch (error) {
            console.error("❌ Error submitting bonus picks:", error);
            res.status(500).json({ error: "Failed to submit bonus picks" });
        }
    });
}