import mongoose from "mongoose";

const RaceSchema = new mongoose.Schema({
  meeting_key: { type: String, unique: true, required: true },
  country_name: { type: String, required: true },
  meeting_name: { type: String, required: true },
  year: { type: Number, required: true },
  qualifying_results: { type: [Number], default: [] }, // Driver numbers in qualifying order
  race_results: { type: [Number], default: [] }, // Driver numbers in race finish order
}, { timestamps: true });

export default mongoose.models.Race || mongoose.model("Race", RaceSchema);