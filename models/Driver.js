import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
  driver_number: { type: Number, required: true },
  full_name: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  name_acronym: { type: String },
  country_code: { type: String },
  team_name: { type: String },
  team_colour: { type: String },
  headshot_url: { type: String },
  year: { type: Number, required: true }, // Store by season
}, { timestamps: true });

const Driver = mongoose.models.Driver || mongoose.model("Driver", DriverSchema);

export default Driver;