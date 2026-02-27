import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env.local first (Next.js convention), then .env
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config();

console.log("📢 Loading MongoDB connection file...");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is missing in `.env.local`");
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// console.log("🔗 Using MongoDB URI:", MONGODB_URI);

let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  console.log("📡 Attempting to connect to MongoDB...");

  if (cached.conn) {
    console.log("✅ Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🚀 Creating new MongoDB connection...");
    cached.promise = mongoose.connect(MONGODB_URI, {})
      .then((mongoose) => {
        console.log("✅ MongoDB Connected!");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Error:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;