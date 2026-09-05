/**
 * GET /api/automation/status  (read-only)
 *
 * Feeds the scheduled email-draft agent. Given ?season=&meeting_key= (or the
 * current race auto-detected from the schedule), returns what's needed to draft
 * a "picks are open" announcement and a "grid changed" alert.
 *
 * Public (no auth): phase, race name, deadline, isPicksOpen, the P11–P22 pool,
 * and a penalty *summary* (driver-level only — which drivers were penalized out
 * of the pool + how many picks were affected). All of this is already visible in
 * the app itself.
 *
 * Authed (Authorization: Bearer <AUTOMATION_TOKEN or CRON_SECRET>): additionally
 * returns `penaltyAdjustments` with usernames. Never returns player emails.
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

  // Auth is optional: a valid token unlocks the username-level detail; without
  // one, only public-safe fields are returned.
  const token = process.env.AUTOMATION_TOKEN || process.env.CRON_SECRET;
  const authed = !!token && (req.headers.authorization || "") === `Bearer ${token}`;

  await dbConnect();

  const season = String(req.query.season || process.env.SEASON || "2026");
  const detected = getCurrentRacePhase(new Date(), season);
  const meetingKey = req.query.meeting_key ? String(req.query.meeting_key) : detected?.meetingKey || null;
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

  // Map every driver on the grid to its current position (for names + summary).
  const grid = race?.qualifying_results || [];
  const posByDriver = new Map(
    grid.filter((d) => typeof d.finishPosition === "number").map((d) => [d.driverNumber, d.finishPosition])
  );

  // --- Bottom pool (P11–P22), enriched with names ---
  const rawAdj = race?.penaltyAdjustments || [];
  const nameNums = [
    ...new Set([
      ...grid.filter((d) => d.finishPosition >= 11 && d.finishPosition <= 22).map((d) => d.driverNumber),
      ...rawAdj.flatMap((a) => [a.driverOut, a.driverIn]),
    ]),
  ];
  const details = nameNums.length ? await Driver.find({ driver_number: { $in: nameNums } }).lean() : [];
  const nameByNum = new Map(details.map((d) => [d.driver_number, d.full_name]));
  const nameOf = (n) => nameByNum.get(n) || `Driver ${n}`;

  const bottomDrivers = grid
    .filter((d) => d.finishPosition >= 11 && d.finishPosition <= 22)
    .sort((a, b) => a.finishPosition - b.finishPosition)
    .map((d) => ({ driverNumber: d.driverNumber, position: d.finishPosition, fullName: nameOf(d.driverNumber) }));

  // --- Penalty summary (PUBLIC, no usernames): which drivers were penalized out
  // of the pool, and how many picks were affected. ---
  const removed = new Map(); // driverNumber -> position
  for (const a of rawAdj) {
    if (!removed.has(a.driverOut)) removed.set(a.driverOut, posByDriver.get(a.driverOut) ?? a.positionOut ?? null);
  }
  const penaltySummary = {
    adjustedPickCount: rawAdj.length,
    driversRemoved: [...removed.entries()]
      .map(([driverNumber, position]) => ({ driverNumber, position, fullName: nameOf(driverNumber) }))
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
  };

  const payload = {
    phase,
    meetingKey,
    season,
    raceName: info.race_name || race?.meeting_name || null,
    picks_open: picksOpen?.toISOString() || null,
    picks_close: picksClose?.toISOString() || null,
    isPicksOpen,
    bottomDrivers,
    penaltySummary,
  };

  // Username-level detail only with a valid token.
  if (authed) {
    payload.penaltyAdjustments = rawAdj.map((a) => ({
      username: a.username,
      driverOut: a.driverOut,
      driverOutName: nameOf(a.driverOut),
      driverIn: a.driverIn,
      driverInName: nameOf(a.driverIn),
      at: a.at,
    }));
  }

  return res.status(200).json(payload);
}
