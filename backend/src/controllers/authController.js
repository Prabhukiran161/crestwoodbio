import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import pool from "../config/dbPostgres.js"
import ActivityLog from "../models/ActivityLog.js";
import User from "../models/UserModel.js"; 
import OTPModel from "../models/OTPModel.js"; 
import BlacklistedToken from "../models/BlacklistedToken.js";


export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const emailExists = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use!" });
    }

    // Hash password with stronger salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into PostgreSQL
    const insertQuery = `
      INSERT INTO users (name, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, email`;
    const values = [name, email, hashedPassword];
    const { rows } = await pool.query(insertQuery, values);
    const user = rows[0];

    res.status(201).json({ message: "User registered successfully!", user });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user from PostgreSQL database
    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email]
    );

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token (with stronger security)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send token as HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "Strict",
    });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const userQuery = "SELECT * FROM users WHERE email = $1 LIMIT 1";
    const { rows } = await pool.query(userQuery, [email]);
    const user = rows[0]; // ✅ Correct way to fetch the user from PostgreSQL.

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = new Date(Date.now() + 5 * 60000); // 5-minute expiry

    // Save OTP in database
    await OTPModel.findOneAndUpdate(
      { email },
      { otp: otpCode, expiresAt: otpExpiration },
      { upsert: true, new: true }
    );

    // Send OTP via Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otpCode}`,
    });

    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Fetch stored OTP
    const otpRecord = await OTPModel.findOne({ email });

    if (
      !otpRecord ||
      otpRecord.otp !== parseInt(otp) ||
      otpRecord.expiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Remove OTP record
    await OTPModel.deleteOne({ email });

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const logoutUser = async (req, res) => {
//   try {
//     const user = req.user;
//     const authHeader = req.headers.authorization;
//     const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

//     // 1️⃣ Save logout activity in MongoDB
//     if (user && user.id) {
//       await ActivityLog.create({
//         userId: user.id,
//         action: "User Logout",
//       });
//     }

//     // 2️⃣ Blacklist the JWT token (if present)
//     if (token) {
//       const decoded = jwt.decode(token);
//       if (decoded && decoded.exp) {
//         const expiryDate = new Date(decoded.exp * 1000);
//         await BlacklistedToken.create({ token, expiresAt: expiryDate });
//       }
//     }

//     // 3️⃣ Destroy session and logout from Passport
//     req.logout((err) => {
//       if (err) {
//         return res.status(500).json({ message: "Logout failed", error: err });
//       }

//       req.session.destroy((err) => {
//         if (err) {
//           return res.status(500).json({ message: "Session destruction failed", error: err });
//         }

//         // 4️⃣ Clear cookies (session + JWT if stored)
//         res.clearCookie("connect.sid", { path: "/" });
//         res.clearCookie("token", { path: "/" });

//         // ✅ Optional: Revoke Google session
//         // const googleLogoutURL = "https://accounts.google.com/Logout";
//         // const redirectURL = `${googleLogoutURL}?continue=https://www.google.com/accounts/Logout?continue=${encodeURIComponent(process.env.CLIENT_HOME_URL)}`;
//         // return res.redirect(redirectURL);

//         // 5️⃣ Send response
//         return res.status(200).json({ message: "User logged out successfully" });
//       });
//     });
//   } catch (error) {
//     console.error("❌ Logout error:", error);
//     return res.status(500).json({ message: "Server error during logout" });
//   }
// };

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(400).json({ message: "No token found in headers" });
    }

    const decoded = jwt.decode(token);

    // 1️⃣ Log activity
    if (decoded?.id) {
      await ActivityLog.create({
        userId: decoded.id,
        action: "User Logout",
      });
    }

    // 2️⃣ Blacklist token
    if (decoded?.exp) {
      await BlacklistedToken.create({
        token,
        expiresAt: new Date(decoded.exp * 1000),
      });
    }

    // 3️⃣ Destroy session (Passport)
    req.logout((err) => {
      if (err)
        return res.status(500).json({ message: "Logout failed", error: err });

      req.session.destroy((err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Session destruction failed", error: err });

        // 4️⃣ Clear cookies
        res.clearCookie("connect.sid", { path: "/" });
        res.clearCookie("token", { path: "/" });

        // 5️⃣ Send response
        return res
          .status(200)
          .json({ message: "User logged out successfully" });
      });
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.status(500).json({ message: "Server error during logout" });
  }
};