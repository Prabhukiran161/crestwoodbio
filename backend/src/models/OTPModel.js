import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});

const OTPModel = mongoose.model("OTP", OTPSchema);

export default OTPModel;
