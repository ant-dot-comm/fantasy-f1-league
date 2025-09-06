import mongoose from "mongoose";

// ✅ Define the schema for race picks
const RacePickSchema = new mongoose.Schema({
  autopick: { type: Boolean, default: false }, // ✅ Indicates if the pick was auto-generated
  picks: {
    type: [Number], // ✅ Array of driver numbers (can be empty or null)
    default: undefined, // ✅ Allows unselected picks to remain undefined
  },
  bonusPicks: {
    worstDriver: { type: Number, default: null }, // ✅ Driver number for worst driver pick
    dnfs: { type: Number, default: null }, // ✅ Number of DNFs predicted
  },
});

// ✅ Define the main User schema
const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true }, 
    password: { type: String, required: true },
    seasons: { type: [Number], default: [new Date().getFullYear()] },

    // ✅ Picks structure: seasons > raceID > picks object
    picks: {
      type: Map,
      of: {
        type: Map,
        of: RacePickSchema, // ✅ Ensures each race follows the structured format
      },
      default: {},
    },

    reset_token: { type: String },
    reset_token_expires: { type: Date }, 
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;