"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

const Register = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const registerSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password too short")
      .matches(/[a-z]/, "At least one lowercase letter")
      .matches(/[A-Z]/, "At least one uppercase letter")
      .matches(/\d/, "At least one number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleRegister = async (values, { setSubmitting, setStatus }) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        values
      );
      if (res.status === 201) {
        toast.success("Registration successful!");
        router.push("/login");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8EEF1] px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3D58] text-center mb-6">
          Create Account
        </h2>

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-5">
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-[#057DCD]" />
                <Field
                  name="name"
                  placeholder="Name"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43B0F1]"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

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
                <div
                  className="absolute right-3 top-3 cursor-pointer text-[#057DCD]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-[#057DCD]" />
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43B0F1]"
                />
                <div
                  className="absolute right-3 top-3 cursor-pointer text-[#057DCD]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {status && (
                <div className="text-red-600 text-sm text-center">{status}</div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#43B0F1] text-white font-semibold rounded-lg shadow-md hover:bg-[#057DCD] transition duration-300"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </motion.button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#057DCD] font-medium hover:underline"
                >
                  Login
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

export default Register;
