// Updated MongoDB connection with environment‑specific handling and clearer errors
import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

/**
 * Resolve the appropriate MongoDB URI based on the execution environment.
 * - In production we prefer a defined `MONGODB_URI` (or `MONGODB_URI_PROD`).
 * - If none is provided, we fall back to a local development URI so that builds
 *   (which may import this module) do not crash.
 */
function getMongoUri() {
  const env = process.env.NODE_ENV ?? "development";
  const devUri = process.env.MONGODB_URI_DEV ?? "mongodb://127.0.0.1:27017/synra_market";
  const prodUri = process.env.MONGODB_URI_PROD ?? process.env.MONGODB_URI;

  if (env === "production") {
    if (!prodUri) {
      console.warn(
        "[dbConnect] No production MongoDB URI set – falling back to dev URI for build stability."
      );
      return devUri;
    }
    return prodUri;
  }

  // Development / preview builds
  return devUri;
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    try {
      const uri = getMongoUri();
      cached.promise = mongoose
        .connect(uri, { bufferCommands: false })
        .then((m) => m);
    } catch (configErr) {
      console.error("[dbConnect] Configuration error:", configErr);
      throw configErr;
    }
  }

  try {
    cached.conn = await cached.promise;
    console.log("[dbConnect] Connected to MongoDB");
    return cached.conn;
  } catch (err) {
    console.error("[dbConnect] Connection failed – resetting cache:", err);
    cached.promise = null;
    throw err;
  }
}

export default dbConnect;
