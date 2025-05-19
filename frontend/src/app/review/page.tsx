"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaEdit, FaFileAlt, FaTrash } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";
import Navbar from "@/components/ui/Navbar";

const EditorReviewPage = () => {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const documents = [
    {
      id: "doc1",
      title: "Early Childhood",
      summary: "Covers birth to elementary school years.",
      status: "Reviewed",
    },
    {
      id: "doc2",
      title: "Teen Years",
      summary: "Explores adolescence and school memories.",
      status: "Under Review",
    },
    {
      id: "doc3",
      title: "Career Journey",
      summary: "Details professional experiences and growth.",
      status: "Approved",
    },
  ];

  const toggleSelect = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((doc) => doc !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#E8EEF1] text-[#1E3D58]">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Document Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold">📄 Editor Review</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                whileHover={{ scale: 1.03 }}
                className={`relative bg-white rounded-xl shadow-lg p-4 cursor-pointer transition border-2 ${
                  selectedDocs.includes(doc.id)
                    ? "border-[#057DCD]"
                    : "border-transparent"
                }`}
                onClick={() => toggleSelect(doc.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-3xl text-[#43B0F1]" />
                    <div>
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                      <p className="text-sm text-gray-500">{doc.summary}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      doc.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : doc.status === "Under Review"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="mt-4 flex justify-between text-sm text-[#1E3D58]">
                  <button className="flex items-center gap-1 hover:text-[#057DCD]">
                    <FaEdit /> Edit
                  </button>
                  <button className="flex items-center gap-1 hover:text-red-600">
                    <FaTrash /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Compile Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">📚 Compile Biography</h3>
          <p className="text-sm text-gray-500">
            Drag or select documents to compile a complete biography.
          </p>

          <div className="border border-dashed border-gray-300 p-4 rounded-lg min-h-[150px] space-y-2">
            {selectedDocs.length === 0 ? (
              <p className="text-sm text-gray-400">No documents selected.</p>
            ) : (
              selectedDocs.map((id) => {
                const doc = documents.find((d) => d.id === id);
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between text-sm p-2 bg-[#E8EEF1] rounded"
                  >
                    <div className="flex items-center gap-2">
                      <MdDragIndicator className="text-gray-400" />
                      {doc?.title}
                    </div>
                    <span className="text-xs text-gray-500">{doc?.status}</span>
                  </div>
                );
              })
            )}
          </div>

          <button
            disabled={selectedDocs.length === 0}
            className="w-full py-2 px-4 rounded-md bg-[#057DCD] hover:bg-[#1E3D58] text-white font-semibold transition"
          >
            📘 Combine Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorReviewPage;
