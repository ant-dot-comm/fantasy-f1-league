import dbConnect from "../../lib/mongodb";
import User from "../../models/User";
import { verifyToken } from "../../lib/authUtils";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    await dbConnect();

    try {
        // ✅ Verify authentication
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const { username, season, meeting_key, worstDriver, dnfs } = req.body;

        if (!username || !season || !meeting_key) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // ✅ Find user and update bonus picks
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Initialize picks structure if it doesn't exist
        if (!user.picks.has(season.toString())) {
            user.picks.set(season.toString(), new Map());
        }

        const seasonPicks = user.picks.get(season.toString());
        if (!seasonPicks.has(meeting_key.toString())) {
            seasonPicks.set(meeting_key.toString(), {
                autopick: false,
                picks: [],
                bonusPicks: {
                    worstDriver: null,
                    dnfs: null,
                },
            });
        }

        const racePicks = seasonPicks.get(meeting_key.toString());

        // ✅ Update bonus picks
        if (worstDriver !== undefined) {
            racePicks.bonusPicks.worstDriver = worstDriver;
        }
        if (dnfs !== undefined) {
            racePicks.bonusPicks.dnfs = dnfs;
        }

        await user.save();

        console.log(`✅ Bonus picks updated for ${username} - Race: ${meeting_key}, Worst Driver: ${worstDriver}, DNFs: ${dnfs}`);

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
} 