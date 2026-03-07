import mongoose from "mongoose";

// Aligned with OpenF1 session_result: position = final position; no startPosition in API.
// startPosition only set for race_results (from qualifying/grid); optional for qualifying_results.
const DriverResultSchema = new mongoose.Schema({
  driverNumber: { type: Number, required: true },
  startPosition: { type: Number, required: false }, // optional; only for race (from grid)
  finishPosition: { type: Number, required: true }, // maps from OpenF1 "position"
  dnf: { type: Boolean, default: false },
  dns: { type: Boolean, default: false },
  dsq: { type: Boolean, default: false },
});

const RaceSchema = new mongoose.Schema(
  {
    meeting_key: { type: String, unique: true, required: true },
    country_name: { type: String, required: true },
    meeting_name: { type: String, required: true },
    year: { type: Number, required: true },
    picks_open: { type: Date }, // ✅ Updated field for Qualifying end
    picks_closed: { type: Date }, // ✅ Updated field for Race start
    qualifying_results: { type: [DriverResultSchema], default: [] },
    race_results: { type: [DriverResultSchema], default: [] },
    dnfs: { type: Number, default: 0 }, // ✅ Number of DNFs in the race
  },
  { timestamps: true }
);

export default mongoose.models.Race || mongoose.model("Race", RaceSchema);