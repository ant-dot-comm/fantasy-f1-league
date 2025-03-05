import mongoose from "mongoose";

// ✅ Define the schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    seasons: { type: [Number], default: [new Date().getFullYear()] },
    picks: {
      type: Object, // ✅ Changed from Map to Object
      default: {}, // ✅ Default to empty object
    },
  });

// ✅ Prevent model re-compilation issues in Next.js
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;