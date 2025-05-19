"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaDownload, FaEye } from "react-icons/fa";
import Navbar from "@/components/ui/Navbar";
import Image from "next/image";

const mockBiographies = [
  {
    id: 1,
    title: "The Life of John Doe",
    excerpt: "From humble beginnings to international success...",
    category: "Entrepreneur",
    cover: "/images/covers/A LIfe In Words.png",
    featured: true,
  },
  {
    id: 2,
    title: "Memoirs of a Dancer",
    excerpt: "The rhythm of life expressed through movement...",
    category: "Artist",
    cover: "/images/covers/Boundless Horizons.png",
    featured: false,
  },
  {
    id: 3,
    title: "Unbreakable Spirit",
    excerpt: "A story of resilience, strength, and unwavering hope...",
    category: "Inspiration",
    cover: "/images/covers/Unbreakable Spirit.png",
    featured: true,
  },
  {
    id: 4,
    title: "From Dreams to Destiny",
    excerpt: "Charting a journey from the impossible to the unforgettable...",
    category: "Visionary",
    cover: "/images/covers/From Dreams to Destiny.png",
    featured: false,
  },
  {
    id: 5,
    title: "Threads of Fate",
    excerpt: "How a tapestry of events wove the path of a remarkable life...",
    category: "Philosophy",
    cover: "/images/covers/Threads of Fate.png",
    featured: false,
  },
  {
    id: 6,
    title: "Turning Pages of Hope",
    excerpt: "Each chapter tells a tale of perseverance and promise...",
    category: "Hope",
    cover: "/images/covers/TurnIng Pages of Hope.png",
    featured: true,
  }
];

const BiographiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredBiographies = mockBiographies.filter((bio) => {
    const matchesSearch = bio.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" || bio.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#E8EEF1] text-[#1E3D58]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search biographies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
            />
            <FaSearch />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300"
          >
            <option>All</option>
            <option>Entrepreneur</option>
            <option>Artist</option>
            <option>Scientist</option>
          </select>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🌟 Featured Biographies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBiographies
              .filter((b) => b.featured)
              .map((bio) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={bio.id}
                  className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition"
                >
                  <img
                    src={bio.cover}
                    alt={bio.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{bio.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{bio.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <button className="text-[#057DCD] flex items-center gap-1">
                        <FaEye /> Read Now
                      </button>
                      <button className="text-[#43B0F1] flex items-center gap-1">
                        <FaDownload /> Download
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* All Biographies */}
        <h2 className="text-2xl font-bold mb-4">📚 All Biographies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBiographies.map((bio) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={bio.id}
              className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={bio.cover}
                alt={bio.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{bio.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{bio.excerpt}</p>
                <div className="flex justify-between items-center">
                  <button className="text-[#057DCD] flex items-center gap-1">
                    <FaEye /> Read Now
                  </button>
                  <button className="text-[#43B0F1] flex items-center gap-1">
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BiographiesPage;
