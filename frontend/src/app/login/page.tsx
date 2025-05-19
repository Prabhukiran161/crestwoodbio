"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const loginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = async (values, { setSubmitting, setStatus }) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, values, {
        withCredentials: true,
      });      

      if (res.status === 200) {
        const token = res.data.token;
        sessionStorage.setItem("authToken", token);
        
        toast.success("Login successful!");
        router.push("/profile");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8EEF1] p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-[#1E3D58] text-center mb-6">
          Login to Your Account
        </h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-5">
              <div className="relative">
                <FaEnvelope className="absolute top-3 left-3 text-[#057DCD]" />
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43B0F1]"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-[#057DCD]" />
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43B0F1]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-3 right-3 text-[#057DCD] focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="text-right mt-1">
                <Link
                  href="/forgotpassword"
                  className="text-sm text-[#057DCD] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              {status && (
                <div className="text-red-600 text-sm text-center">{status}</div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2 px-4 bg-[#43B0F1] text-white font-semibold rounded-lg shadow-md hover:bg-[#057DCD] transition duration-300"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </motion.button>

              <div className="flex items-center justify-center">
                <div className="border-t border-gray-300 w-1/4" />
                <span className="mx-2 text-gray-500 text-sm">or</span>
                <div className="border-t border-gray-300 w-1/4" />
              </div>

              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2 px-4 flex items-center justify-center gap-2 border border-[#43B0F1] text-[#1E3D58] font-semibold rounded-lg hover:bg-[#E8EEF1] transition duration-300"
              >
                <FaGoogle className="text-[#057DCD]" /> Continue with Google
              </motion.button>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#057DCD] font-medium hover:underline"
                >
                  Register
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </motion.div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Login;
