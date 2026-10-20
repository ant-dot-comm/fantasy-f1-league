/**
 * GET /api/automation/claim-email/?meeting_key=<key>&type=picks_open|grid_changed
 *
 * Called by the race-weekend email routine right before it drafts an email.
 * Returns { claimed: true } to exactly one caller per email (see
 * lib/utils/emailClaims.js); everyone else gets { claimed: false, reason }.
 * GET so the routine's Vercel fetch tool can call it. Only works while picks are
 * open for that race, which keeps the window for misuse small. No personal data.
 */
import { claimEmailDraft } from "../../../lib/utils/emailClaims";
import raceSchedule from "../../../data/raceSchedule";

const TYPES = ["picks_open", "grid_changed"];

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    return res.status(405).json({ claimed: false, reason: "Method Not Allowed" });
  }

  const meetingKey = req.query.meeting_key ? String(req.query.meeting_key) : null;
  const type = String(req.query.type || "");
  if (!meetingKey || !TYPES.includes(type)) {
    return res.status(400).json({ claimed: false, reason: "need meeting_key and type=picks_open|grid_changed" });
  }

  const info = raceSchedule[meetingKey];
  const now = new Date();
  const picksOpen =
    info?.picks_open && info?.picks_close &&
    now >= new Date(info.picks_open) && now < new Date(info.picks_close);
  if (!picksOpen) {
    return res.status(200).json({ claimed: false, reason: "picks not open for this race" });
  }

  try {
    return res.status(200).json(await claimEmailDraft({ meetingKey, type }));
  } catch (e) {
    console.error("❌ claim-email error:", e);
    return res.status(500).json({ claimed: false, reason: String(e?.message || e) });
  }
}
