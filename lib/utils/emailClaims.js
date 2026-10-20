/**
 * emailClaims – deterministic "draft this email exactly once" guard for the
 * race-weekend email routine.
 *
 * The routine used to de-dupe by searching Gmail, but it's an AI agent and it
 * sometimes searched with a tool that can't see drafts, so it re-drafted the same
 * "Picks Open" email (4x for Singapore 2026). Now the routine must claim the email
 * here first; the claim is an atomic conditional update, so only one run can win.
 *
 *  - picks_open:   claimable once per race.
 *  - grid_changed: claimable again only when new penalty adjustments have been
 *                  logged since the last "Grid Changed" draft.
 */
import dbConnect from "../mongodb.js";
import Race from "../../models/Race.js";

export async function claimEmailDraft({ meetingKey, type }) {
  await dbConnect();
  const key = String(meetingKey);

  if (type === "picks_open") {
    // `null` matches both missing and null, so this only succeeds the first time.
    const won = await Race.findOneAndUpdate(
      { meeting_key: key, "emailDrafts.picksOpenAt": null },
      { $set: { "emailDrafts.picksOpenAt": new Date() } },
      { new: true }
    ).lean();
    if (won) return { claimed: true };
    const race = await Race.findOne({ meeting_key: key }, { emailDrafts: 1 }).lean();
    return race
      ? { claimed: false, reason: "already drafted", draftedAt: race.emailDrafts?.picksOpenAt ?? null }
      : { claimed: false, reason: "race not found" };
  }

  if (type === "grid_changed") {
    const race = await Race.findOne({ meeting_key: key }, { penaltyAdjustments: 1, emailDrafts: 1 }).lean();
    if (!race) return { claimed: false, reason: "race not found" };
    const total = race.penaltyAdjustments?.length ?? 0;
    const prev = race.emailDrafts?.gridChangedCount ?? 0;
    if (total <= prev) {
      return { claimed: false, reason: total ? "already drafted for these adjustments" : "no adjustments" };
    }
    // Compare-and-set on the previous count so concurrent runs can't both win.
    const won = await Race.findOneAndUpdate(
      { meeting_key: key, "emailDrafts.gridChangedCount": prev === 0 ? { $in: [0, null] } : prev },
      { $set: { "emailDrafts.gridChangedCount": total } },
      { new: true }
    ).lean();
    return won
      ? { claimed: true, newAdjustments: total - prev }
      : { claimed: false, reason: "claimed by a concurrent run" };
  }

  return { claimed: false, reason: `unknown type "${type}"` };
}

export default claimEmailDraft;
