import ActivityLog from "../models/ActivityLog.js";

const logMiddleware = async (req, res, next) => {
  try {
    const userId = req.user? String(req.user.id) : "Guest"; 
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";

    if (!req.url.startsWith("/static") && !req.url.includes("favicon.ico")) {
      await ActivityLog.create({ userId, action: `${req.method} ${req.originalUrl}`, ipAddress, userAgent });
      console.log(`📝 Logged: ${req.method} ${req.originalUrl} by ${userId} from ${ipAddress}`);
    }
  } catch (error) {
    console.error("❌ Error logging activity:", error.message);
  }
  next();
};

export default logMiddleware;
