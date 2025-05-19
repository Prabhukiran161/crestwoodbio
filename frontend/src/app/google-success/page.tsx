"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const GoogleSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Login failed. No token found.");
      router.replace("/login");
      return;
    }

    sessionStorage.setItem("authToken", token);
    toast.success("Logged in with Google!");
    router.replace("/profile"); // replace instead of push to avoid back-navigation
  }, [token, router]);

  return (
    <div className="text-center mt-10 text-lg font-medium text-gray-700">
      Redirecting to your profile...
    </div>
  );
};

export default GoogleSuccess;
