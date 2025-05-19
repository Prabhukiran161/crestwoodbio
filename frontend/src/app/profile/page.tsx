"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/ui/Navbar";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import RealTimeProgressTracker from "@/components/ui/RealTimeProgressTracker";
import BiographyManager from "@/components/ui/BiographyManager";

const loadingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Unauthorized. Please login again.");
      router.push("/login");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        toast.error("Session expired or unauthorized.");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <motion.div variants={loadingVariants} animate="animate">
          <RotateCw size={32} />
        </motion.div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      {/* Main Dashboard Cards */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[
          {
            title: "Progress Tracker",
            content: <RealTimeProgressTracker />,
          },
          {
            title: "Biography Management",
            content: (
              <ul className="text-sm mt-2 list-disc pl-4">
                <li>Life Story Draft 1 - Editing</li>
                <li>Childhood Memoirs - Review</li>
              </ul>
            ),
          },
          {
            title: "Voice Recording",
            content: (
              <>
                <p>Recent: Interview with Grandma.mp3</p>
                <p>Status: Transcribing...</p>
              </>
            ),
          },
          {
            title: "AI Transcription Status",
            content: (
              <>
                <p>Transcribed 3 of 5 recordings</p>
                <p>Next up: Audio_4.mp3</p>
              </>
            ),
          },
          {
            title: "Cloud Storage",
            content: (
              <>
                <p>Used: 2.5 GB / 5 GB</p>
                <div className="bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: "50%" }}
                  ></div>
                </div>
              </>
            ),
          },
          {
            title: "Collaboration",
            content: (
              <>
                <p>3 Active Collaborators</p>
                <ul className="text-sm list-disc pl-4">
                  <li>Alice - Editor</li>
                  <li>Bob - Voice Notes</li>
                </ul>
              </>
            ),
          },
          {
            title: "Analytics",
            content: (
              <>
                <p>Total Reads: 1.2k</p>
                <p>Most Viewed: "A Journey Through Time"</p>
              </>
            ),
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-md rounded-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                {card.content}
              </div>
            </Card>
          </motion.div>
        ))}
      </main>
    </div>
  );
};

export default Profile;
