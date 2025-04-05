import express from "express";
import { registerUser, loginUser, requestOTP , verifyOTPAndResetPassword , logoutUser } from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import ActivityLog from "../models/ActivityLog.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

/** 
 * ✅ User Registration Route 
 * - Registers a new user 
 */
router.post("/register", registerUser);

/** 
 * ✅ User Login Route 
 * - Logs in a user and provides a JWT token 
 */
router.post("/login", loginUser);

/** 
 * ✅ Google OAuth Login Route 
 * - Redirects user to Google authentication 
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/** 
 * ✅ Google OAuth Callback Route 
 * - Handles authentication after Google login
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      // Generate JWT Token
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Log user activity with additional metadata
      await ActivityLog.create({
        userId: String(req.user.id),
        action: "Google Sign-In",
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "Unknown",
        userAgent: req.headers["user-agent"] || "Unknown",
      });

      return res.json({ message: "Google login successful!", token, user: req.user });
    } catch (error) {
      console.error("❌ Google Callback Error:", error.message);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/** 
 * ✅ User Profile Route (Protected)
 * - Requires authentication
 */
router.get("/profile", authenticateUser, (req, res) => {
  res.json({ message: "User profile", user: req.user });
});

// Forgot Password - Request OTP
router.post("/request-otp", requestOTP);

// Forgot Password - Verify OTP & Reset Password
router.post("/verify-otp-reset", verifyOTPAndResetPassword);

/**
 * ✅ User Logout Route
 * - Logs out user from session and Google OAuth (if applicable)
 * - Clears cookies and redirects to homepage
 */
router.get("/logout", authenticateUser, logoutUser);

export default router;
