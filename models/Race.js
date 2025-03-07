import mongoose from "mongoose";

const DriverResultSchema = new mongoose.Schema({
  driverNumber: { type: Number, required: true },
  startPosition: { type: Number, required: true },
  finishPosition: { type: Number, required: true },
});

const RaceSchema = new mongoose.Schema(
  {
    meeting_key: { type: String, unique: true, required: true },
    country_name: { type: String, required: true },
    meeting_name: { type: String, required: true },
    year: { type: Number, required: true },
    qualifying_results: { type: [DriverResultSchema], default: [] },
    race_results: { type: [DriverResultSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Race || mongoose.model("Race", RaceSchema);