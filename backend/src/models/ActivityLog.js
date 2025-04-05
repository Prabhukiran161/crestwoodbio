import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,      
      required: true,
    },
    action: { type: String, required: true },
    ipAddress: { type: String }, // ✅ Stores user IP for better tracking
    userAgent: { type: String }, // ✅ Logs browser/device info
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true } // ✅ Adds `createdAt` & `updatedAt` fields automatically
);

const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);

export default ActivityLog;
