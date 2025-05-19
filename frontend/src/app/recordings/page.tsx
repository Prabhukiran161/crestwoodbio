"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import { motion } from "framer-motion";
import {
  FaMicrophone,
  FaPause,
  FaStop,
  FaPlay,
  FaFastForward,
  FaFastBackward,
  FaSave,
  FaFileUpload,
  FaTrash,
  FaPen,
} from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { getAuthHeaders } from "@/utils/authHeaders";
import axios from "axios";

const RecordingPage = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00:00");
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const timer = useRef<number>(0);

  const startTimer = () => {
    const id = setInterval(() => {
      timer.current++;
      const hrs = Math.floor(timer.current / 3600)
        .toString()
        .padStart(2, "0");
      const mins = Math.floor((timer.current % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const secs = (timer.current % 60).toString().padStart(2, "0");
      setRecordingTime(`${hrs}:${mins}:${secs}`);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  const resetTimer = () => {
    timer.current = 0;
    setRecordingTime("00:00:00");
  };

  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const newChunks: Blob[] = [];

      recorder.ondataavailable = (e) => newChunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(newChunks, { type: "audio/ogg; codecs=opus" });
        const formData = new FormData();
        formData.append("audio", blob, "recorded_audio.ogg"); // 🟢 valid extension

        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/recordings/upload`,
            formData,
            { headers: getAuthHeaders() }
          );
          toast.success("Recording uploaded successfully!");
          fetchRecordings();
        } catch {
          toast.error("Failed to upload recording");
        }
      };

      recorder.start();
      setChunks(newChunks);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
      toast.success("Recording started");
    } catch {
      toast.error("Microphone access denied or not available");
    }
  };

  const handlePause = () => {
    if (!mediaRecorder) return;

    if (mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      stopTimer();
      setIsPaused(true);
      toast("Recording paused");
    } else if (mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      startTimer();
      setIsPaused(false);
      toast.success("Recording resumed");
    }
  };

  const handleStop = () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setMediaRecorder(null);
    stopTimer();
    resetTimer();
    setIsRecording(false);
    setIsPaused(false);
    toast("Recording stopped");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/recordings/upload`,
        formData,
        { headers: getAuthHeaders() }
      );
      toast.success("Audio uploaded successfully!");
      fetchRecordings();
    } catch {
      toast.error("Upload failed");
    }
  };

  const fetchRecordings = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/recordings/all`,
        { headers: getAuthHeaders() }
      );
      setRecordings(res.data.recordings);
    } catch {
      toast.error("Failed to fetch recordings");
    }
  };

  const deleteRecording = async (id: number) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/recordings/${id}`, {
      headers: getAuthHeaders(),
    });
    fetchRecordings();
  };

  const renameRecording = async (id: number) => {
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/recordings/rename/${id}`,
      { newName },
      { headers: getAuthHeaders() }
    );
    setRenamingId(null);
    setNewName("");
    fetchRecordings();
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <Toaster />
      <div className="max-w-7xl mx-auto p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel */}
          <div className="flex-1">
            <motion.div className="bg-white shadow-lg rounded-2xl p-6">
              <h2 className="text-3xl font-bold text-center text-[#1E3D58] mb-2">
                Voice Recorder
              </h2>
              <p className="text-center text-gray-500 mb-6">
                Record or upload to begin.
              </p>
              <div className="my-6 flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-64 h-16 bg-gradient-to-r from-[#43B0F1] to-[#057DCD] rounded-full shadow-inner"
                />
                <div className="mt-4 px-4 py-2 bg-[#E8EEF1] rounded-lg font-mono text-xl text-[#1E3D58]">
                  RECORD TIMER: {recordingTime}
                </div>
              </div>
              <div className="flex justify-center gap-6 mb-6">
                <button
                  onClick={handleRecord}
                  disabled={isRecording}
                  className="bg-[#43B0F1] p-3 rounded-full text-white"
                >
                  <FaMicrophone />
                </button>
                <button
                  onClick={handlePause}
                  disabled={!isRecording}
                  className="bg-yellow-500 p-3 rounded-full text-white"
                >
                  <FaPause />
                </button>
                <button
                  onClick={handleStop}
                  disabled={!isRecording}
                  className="bg-gray-600 p-3 rounded-full text-white"
                >
                  <FaStop />
                </button>
              </div>
              
            </motion.div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-[35%] space-y-8">
            <motion.div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-[#1E3D58]">
                Upload Audio
              </h3>
              <label className="border-2 border-dashed border-[#057DCD] p-6 rounded-lg text-center cursor-pointer hover:bg-[#F0F6FA] block">
                <FaFileUpload className="text-3xl text-[#43B0F1] mx-auto mb-2" />
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-gray-600">Click or drag to upload</p>
              </label>
              <div className="mt-4 text-right">
                <button className="bg-[#1E3D58] text-white px-4 py-2 rounded">
                  🧠 Transcribe with AI
                </button>
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-[#1E3D58]">
                Recent Sessions
              </h3>
              <div className="space-y-4">
                {recordings.map((rec) => (
                  <div key={rec.id} className="border rounded p-3">
                    <audio controls src={rec.audio_url} className="w-full" />
                    {renamingId === rec.id ? (
                      <div className="flex mt-2 gap-2">
                        <input
                          className="border px-2 py-1 rounded w-full"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                        <button
                          onClick={() => renameRecording(rec.id)}
                          className="bg-green-600 text-white px-3 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRenamingId(null)}
                          className="bg-gray-400 text-white px-3 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 flex justify-between">
                        <p>{rec.original_name}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setRenamingId(rec.id);
                              setNewName(rec.original_name);
                            }}
                            className="text-blue-500"
                          >
                            <FaPen />
                          </button>
                          <button
                            onClick={() => deleteRecording(rec.id)}
                            className="text-red-500"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
