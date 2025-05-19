"use client";
import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/request-otp`, { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp-reset`, {
        email,
        otp,
        newPassword,
      });
      toast.success(res.data.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8EEF1]">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-[#1E3D58] mb-6 text-center">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>

        {step === 1 ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-[#1E3D58]">Email</span>
              <div className="flex items-center border rounded-md p-2">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-[#057DCD] mr-2"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </label>
            <button
              onClick={handleRequestOTP}
              disabled={loading}
              className="bg-[#43B0F1] text-white py-2 px-4 w-full rounded hover:bg-[#057DCD] transition"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="text-[#1E3D58]">OTP</span>
              <div className="flex items-center border rounded-md p-2">
                <FontAwesomeIcon icon={faKey} className="text-[#057DCD] mr-2" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full focus:outline-none"
                  placeholder="Enter OTP"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[#1E3D58]">New Password</span>
              <div className="flex items-center border rounded-md p-2">
                <FontAwesomeIcon icon={faKey} className="text-[#057DCD] mr-2" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full focus:outline-none"
                  placeholder="Enter new password"
                />
              </div>
            </label>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="bg-[#43B0F1] text-white py-2 px-4 w-full rounded hover:bg-[#057DCD] transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
