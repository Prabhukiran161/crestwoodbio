import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import recordingRoutes from "./routes/recordingRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import passport from "./config/passport.js";
import pool from "./config/dbPostgres.js";
import connectMongoDB from "./config/dbMongo.js";
import logMiddleware from "./middleware/logMiddleware.js";
import authMiddleware from "./middleware/authMiddleware.js";
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ✅ Security Enhancements: Use HTTP Headers Middleware (Helmet)
import helmet from "helmet";
app.use(helmet()); // Helps prevent common security vulnerabilities

// ✅ Limit JSON Payload Size (Prevents DOS Attacks)
app.use(express.json({ limit: "1mb" }));

// ✅ Express Session Configuration (More Secure)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Only store sessions when needed
    cookie: {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "lax", // Prevents CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ✅ Passport Authentication Middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Middleware Configuration
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // Allow CORS
app.use(morgan("dev")); // Log HTTP requests
app.use(logMiddleware); // ✅ Auto-logs all requests

// ✅ Connect to MongoDB
connectMongoDB();

// ✅ Routes
app.use("/auth", authRoutes);

app.use("/recordings", recordingRoutes);

app.use("/library", libraryRoutes);

app.use("/introduction", formRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🚀 CrestwoodBio Backend API is running...");
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
