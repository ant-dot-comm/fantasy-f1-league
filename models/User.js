import mongoose from "mongoose";

// ✅ Stored per-driver score (from runCalculateScores)
const DriverScoreSchema = new mongoose.Schema({
  driverNumber: { type: Number, required: true },
  points: { type: Number, required: true },
  bonusTitle: { type: String, default: null },
  startPosition: { type: Number },
  finishPosition: { type: Number },
}, { _id: false });

// ✅ Achievement/card entry (active = unused, inactive = used)
const AchievementEntrySchema = new mongoose.Schema({
  id: { type: String, required: true },           // ACHIEVEMENT_IDS.*
  cardType: { type: String, required: true },    // CARD_TYPES.*
  state: { type: String, enum: ["active", "inactive"], default: "active" },
  earnedAt: { type: Date, default: Date.now },
  earnedMeetingKey: { type: String, default: null },
  usedAt: { type: Date, default: null },
  usedForMeeting: { type: String, default: null },
  season: { type: Number, required: true },
  pointsBoost: { type: Number, default: null },  // for POINTS_BOOST card: 1, 2, 3, or 4
  driverNumber: { type: Number, default: null }, // for Big/Little mover card: which driver earned it
}, { _id: true });

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
  // ✅ Stored scores (set by runCalculateScores)
  score: { type: Number, default: null },  // total for this race (driver + bonus)
  driverScores: { type: [DriverScoreSchema], default: undefined },
  bonusPoints: { type: Number, default: null },
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

    // ✅ Achievements/cards per season (active = unused, inactive = used)
    // achievements: { type: [AchievementEntrySchema], default: [] },

    reset_token: { type: String },
    reset_token_expires: { type: Date }, 
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;