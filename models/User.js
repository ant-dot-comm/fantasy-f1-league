import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true }, 
    password: { type: String, required: true },
    seasons: { type: [Number], default: [new Date().getFullYear()] },
    picks: {
      type: Object,
      default: {},
    },
    reset_token: { type: String },
    reset_token_expires: { type: Date }, 
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;