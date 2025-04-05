import mongoose from "mongoose";

const BlacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  blacklistedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistedToken = mongoose.model(
  "BlacklistedToken",
  BlacklistedTokenSchema
);

export default BlacklistedToken;
