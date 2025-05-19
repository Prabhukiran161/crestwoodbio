"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BookOpen, Download, Info, UserCheck } from "lucide-react";
import Navbar from "@/components/ui/Navbar";

const mockNotifications = [
  {
    id: 1,
    type: "Editor Review",
    icon: <UserCheck size={20} className="text-blue-500" />,
    title: "Document Approved",
    message:
      "Your document 'Life Story Draft 1' has been approved by the editor.",
    date: "April 10, 2025",
    actionText: "View Comments",
  },
  {
    id: 2,
    type: "Download",
    icon: <Download size={20} className="text-green-500" />,
    title: "Biography Ready to Download",
    message: "Your compiled biography is now available for download.",
    date: "April 9, 2025",
    actionText: "Download Now",
  },
  {
    id: 3,
    type: "Biography Update",
    icon: <BookOpen size={20} className="text-indigo-500" />,
    title: "Biography Updated",
    message: "Chapter 2 of 'A Life in Words' has been updated.",
    date: "April 8, 2025",
    actionText: "Read Now",
  },
  {
    id: 4,
    type: "Announcement",
    icon: <Info size={20} className="text-yellow-500" />,
    title: "New Feature Released",
    message: "You can now collaborate with editors in real-time.",
    date: "April 7, 2025",
    actionText: "Learn More",
  },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  return (
    <div className="min-h-screen bg-[#E8EEF1] text-[#1E3D58]">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        <div className="space-y-6">
          {notifications.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-4 rounded-xl shadow-md flex items-start gap-4 hover:shadow-lg transition"
            >
              <div className="flex-shrink-0">{note.icon}</div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{note.title}</h2>
                <p className="text-sm text-gray-600 mb-2">{note.message}</p>
                <div className="text-xs text-gray-400">{note.date}</div>
              </div>
              {note.actionText && (
                <button className="ml-auto bg-[#43B0F1] hover:bg-[#057DCD] text-white px-3 py-1 rounded text-sm">
                  {note.actionText}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
