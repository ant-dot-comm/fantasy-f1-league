/**
 * GET /api/automation/status  (read-only, token-protected)
 *
 * Feeds the Claude Cowork email agent. Given ?season=&meeting_key= (or the
 * current race auto-detected from the schedule), returns everything needed to
 * draft a "picks are open" announcement and a "grid changed" alert.
 *
 * Auth: Authorization: Bearer <AUTOMATION_TOKEN or CRON_SECRET>
 * Privacy: usernames only — never returns player emails.
 */
import dbConnect from "../../../lib/mongodb";
import Race from "../../../models/Race";
import Driver from "../../../models/Driver";
import raceSchedule from "../../../data/raceSchedule";
import { getCurrentRacePhase } from "../../../lib/utils/racePhase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // --- Auth ---
  const token = process.env.AUTOMATION_TOKEN || process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  if (!token || auth !== `Bearer ${token}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await dbConnect();

  const season = String(req.query.season || process.env.SEASON || "2026");
  const detected = getCurrentRacePhase(new Date(), season);
  let meetingKey = req.query.meeting_key ? String(req.query.meeting_key) : detected?.meetingKey || null;
  const phase = detected?.meetingKey === meetingKey ? detected.phase : detected?.phase ?? null;

  if (!meetingKey) {
    return res.status(200).json({ phase: null, meetingKey: null, message: "No active race window." });
  }

  const info = raceSchedule[meetingKey] || {};
  const race = await Race.findOne({ meeting_key: meetingKey, year: Number(season) }).lean();

  const now = new Date();
  const picksOpen = info.picks_open ? new Date(info.picks_open) : null;
  const picksClose = info.picks_close ? new Date(info.picks_close) : null;
  const isPicksOpen = !!(picksOpen && picksClose && now >= picksOpen && now < picksClose);

  // --- Bottom pool (P11–P22), enriched with names ---
  let bottomDrivers = [];
  if (race?.qualifying_results?.length) {
    const bottom = race.qualifying_results
      .filter((d) => d.finishPosition >= 11 && d.finishPosition <= 22)
      .sort((a, b) => a.finishPosition - b.finishPosition);
    const nums = bottom.map((d) => d.driverNumber);
    const details = await Driver.find({ driver_number: { $in: nums } }).lean();
    const nameByNum = new Map(details.map((d) => [d.driver_number, d.full_name]));
    bottomDrivers = bottom.map((d) => ({
      driverNumber: d.driverNumber,
      position: d.finishPosition,
      fullName: nameByNum.get(d.driverNumber) || `Driver ${d.driverNumber}`,
    }));
  }

  // --- Penalty adjustment events (usernames only; enrich driver names) ---
  const rawAdj = race?.penaltyAdjustments || [];
  const adjNums = [...new Set(rawAdj.flatMap((a) => [a.driverOut, a.driverIn]))];
  const adjDetails = adjNums.length ? await Driver.find({ driver_number: { $in: adjNums } }).lean() : [];
  const adjName = new Map(adjDetails.map((d) => [d.driver_number, d.full_name]));
  const penaltyAdjustments = rawAdj.map((a) => ({
    username: a.username,
    driverOut: a.driverOut,
    driverOutName: adjName.get(a.driverOut) || `Driver ${a.driverOut}`,
    driverIn: a.driverIn,
    driverInName: adjName.get(a.driverIn) || `Driver ${a.driverIn}`,
    at: a.at,
  }));

  return res.status(200).json({
    phase,
    meetingKey,
    season,
    raceName: info.race_name || race?.meeting_name || null,
    picks_open: picksOpen?.toISOString() || null,
    picks_close: picksClose?.toISOString() || null,
    isPicksOpen,
    bottomDrivers,
    penaltyAdjustments,
  });
}
