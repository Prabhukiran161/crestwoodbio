"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaUndo,
  FaRedo,
  FaFilePdf,
  FaFileWord,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import Navbar from "@/components/ui/Navbar";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { getAuthHeaders } from "@/utils/authHeaders";

// Utility function to split the transcript text into pages based on a character limit.
function splitTextIntoPages(text, pageSize = 2000) {
  const pages = [];
  let start = 0;
  while (start < text.length) {
    pages.push(text.slice(start, start + pageSize));
    start += pageSize;
  }
  return pages;
}

const DocumentLibrary = () => {
  // Pagination state for the canvas area (for transcript viewing/editing)
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pages, setPages] = useState([]); // Stores transcript pages based on split text

  // Audio files and dynamic data states
  const [audios, setAudios] = useState([]);
  const [loadingAudioId, setLoadingAudioId] = useState(null);

  // Transcripts management state (summary and inline renaming)
  const [transcripts, setTranscripts] = useState([]);
  const [editingTranscriptId, setEditingTranscriptId] = useState(null);
  const [editingTranscriptName, setEditingTranscriptName] = useState("");

  // Transcript canvas: full text and current document identification
  const [fullTranscriptText, setFullTranscriptText] = useState("");
  const [currentDocumentName, setCurrentDocumentName] = useState("");

  // For pagination controls on the transcript canvas, dynamically derived.
  const totalPages = pages.length || 1;

  // Pagination Control Handlers for transcript canvas
  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1)
      setCurrentPageIndex(currentPageIndex + 1);
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
  };

  // When transcript text changes, split it into pages and reset to the first page.
  const updatePages = (newText) => {
    setFullTranscriptText(newText);
    const newPages = splitTextIntoPages(newText, 2000);
    setPages(newPages);
    setCurrentPageIndex(0);
  };

  // Fetch audio files with transcription statuses from the backend.
  const fetchAudios = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/library/audio-status`,
        { headers: getAuthHeaders() }
      );
      setAudios(res.data.audios);
    } catch (error) {
      console.error("Error fetching audios:", error);
      toast.error("Failed to fetch audio files");
    }
  };

  // Fetch transcript summaries from the backend.
  const fetchTranscripts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/library/transcripts`,
        { headers: getAuthHeaders() }
      );
      setTranscripts(res.data.transcripts);
    } catch (error) {
      console.error("Error fetching transcripts:", error);
      toast.error("Failed to fetch transcripts");
    }
  };

  // Initiate transcription process for a given audio file.
  const handleTranscribe = async (recordingId) => {
    try {
      setLoadingAudioId(recordingId);
      toast.loading("Processing transcription and enhancement...", {
        id: "transcribing",
      });

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/library/transcribe/${recordingId}`,
        {},
        { headers: getAuthHeaders() }
      );

      toast.success("Transcription completed successfully!", {
        id: "transcribing",
      });
      fetchAudios();
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe the audio", { id: "transcribing" });
    } finally {
      setLoadingAudioId(null);
    }
  };

  // Update document name for a transcript.
  const handleSaveDocumentName = async (transcriptId) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/library/transcripts/${transcriptId}/rename`,
        { newDocumentName: editingTranscriptName },
        { headers: getAuthHeaders() }
      );
      toast.success("Document name updated successfully!");
      fetchTranscripts();
      setEditingTranscriptId(null);
      setEditingTranscriptName("");
    } catch (error) {
      console.error("Error updating document name", error);
      toast.error("Failed to update document name");
    }
  };

  // View a full transcript by its document name. Update the transcript canvas.
  const handleViewTranscript = async (documentName) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/library/transcripts/${documentName}`,
        { headers: getAuthHeaders() }
      );
      const text = res.data.transcript.text;
      updatePages(text);
      setCurrentDocumentName(documentName);
    } catch (error) {
      console.error("Error fetching transcript:", error);
      toast.error("Failed to fetch transcript");
    }
  };

  // Save the current transcript text (edited in the canvas) back to the backend.
  const handleSaveTranscriptText = async () => {
    if (!currentDocumentName || !fullTranscriptText) {
      toast.error("Transcript document or text is missing.");
      return;
    }
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/library/transcripts/${currentDocumentName}`,
        { newText: fullTranscriptText },
        { headers: getAuthHeaders() }
      );
      toast.success("Transcript updated successfully!");
      fetchTranscripts();
    } catch (error) {
      console.error("Error updating transcript text:", error);
      toast.error("Failed to update transcript text");
    }
  };

  // Export the currently viewed transcript as PDF or DOCX.
  const handleExportTranscript = async (format) => {
    if (!currentDocumentName) {
      toast.error("No transcript selected for export.");
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/library/transcripts/${currentDocumentName}/export?format=${format}`,
        {
          headers: getAuthHeaders(),
          responseType: "blob",
        }
      );

      // Create a blob URL for downloading the file.
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${currentDocumentName}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting transcript:", error);
      toast.error("Failed to export transcript");
    }
  };

  // Update transcript status to (for example) "Under Review".
  const handleSubmitForReview = async () => {
    if (!currentDocumentName) {
      toast.error("No transcript selected.");
      return;
    }
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/library/transcripts/${currentDocumentName}/status`,
        { status: "Under Review" },
        { headers: getAuthHeaders() }
      );
      toast.success("Transcript submitted for review!");
      fetchTranscripts();
    } catch (error) {
      console.error("Error updating transcript status:", error);
      toast.error("Failed to submit transcript for review");
    }
  };

  useEffect(() => {
    fetchAudios();
    fetchTranscripts();
  }, []);

  return (
    <div className="min-h-screen bg-[#E8EEF1] text-[#1E3D58]">
      <Navbar />
      <Toaster />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Panel: Transcription Canvas */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 flex flex-col space-y-4">
          {/* Top Toolbar */}
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex gap-3 text-[#057DCD]">
              <button>
                <FaBold />
              </button>
              <button>
                <FaItalic />
              </button>
              <button>
                <FaUnderline />
              </button>
              <select className="text-sm border rounded px-2 py-1">
                <option>12pt</option>
                <option>14pt</option>
                <option>16pt</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handlePrevPage}>
                <MdNavigateBefore size={20} />
              </button>
              <span className="text-sm">
                Page {currentPageIndex + 1} of {totalPages}
              </span>
              <button onClick={handleNextPage}>
                <MdNavigateNext size={20} />
              </button>
              <button>
                <FaUndo />
              </button>
              <button>
                <FaRedo />
              </button>
            </div>
          </div>

          {/* Canvas Editor: Uses a textarea that fills available space and preserves formatting */}
          <div className="flex-1 border border-gray-300 rounded-lg p-4 bg-[#F7FAFC] overflow-y-auto min-h-[400px]">
            <textarea
              className="w-full h-full resize-none bg-transparent outline-none whitespace-pre-wrap"
              value={fullTranscriptText}
              onChange={(e) => updatePages(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => handleExportTranscript("pdf")}
                className="bg-[#43B0F1] text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <FaFilePdf /> Export PDF
              </button>
              <button
                onClick={() => handleExportTranscript("docx")}
                className="bg-[#057DCD] text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <FaFileWord /> Export DOCX
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTranscriptText}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
              <button
                onClick={handleSubmitForReview}
                className="bg-[#1E3D58] text-white px-4 py-2 rounded shadow-md"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Audio Files & Transcripts List */}
        <div className="space-y-6">
          {/* Audio Files Section */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Audio Files</h3>
            <div className="space-y-2 text-sm">
              {audios.length === 0 ? (
                <p>No audio files found.</p>
              ) : (
                audios.map((audio) => (
                  <div
                    key={audio.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span>{audio.file_name}</span>
                    {audio.status === "pending" ? (
                      <button
                        onClick={() => handleTranscribe(audio.id)}
                        disabled={loadingAudioId === audio.id}
                        className="relative bg-[#43B0F1] text-white px-3 py-1 rounded text-xs overflow-hidden"
                      >
                        <span
                          className={
                            loadingAudioId === audio.id ? "opacity-0" : ""
                          }
                        >
                          Transcribe
                        </span>
                        {loadingAudioId === audio.id && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="absolute top-0 left-0 h-full bg-[#057DCD]"
                          />
                        )}
                      </button>
                    ) : audio.status === "in_progress" ? (
                      <span className="text-yellow-500 capitalize">
                        Processing...
                      </span>
                    ) : (
                      <span className="text-green-600 capitalize">
                        {audio.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transcripts Section */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">
              Transcribed Documents
            </h3>
            <div className="space-y-2 text-sm">
              {transcripts.length === 0 ? (
                <p>No transcripts found.</p>
              ) : (
                transcripts.map((transcript) => (
                  <div
                    key={transcript.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    {editingTranscriptId === transcript.id ? (
                      <input
                        type="text"
                        value={editingTranscriptName}
                        onChange={(e) =>
                          setEditingTranscriptName(e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      <span>{transcript.document_name}</span>
                    )}
                    <div className="flex gap-2 items-center">
                      <span
                        className={
                          transcript.status === "Approved"
                            ? "text-green-600"
                            : "text-blue-500"
                        }
                      >
                        {transcript.status}
                      </span>
                      {editingTranscriptId === transcript.id ? (
                        <button
                          onClick={() => handleSaveDocumentName(transcript.id)}
                          className="text-[#057DCD]"
                        >
                          <FaSave size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingTranscriptId(transcript.id);
                            setEditingTranscriptName(transcript.document_name);
                          }}
                          className="text-[#057DCD]"
                        >
                          <FaEdit size={16} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleViewTranscript(transcript.document_name)
                        }
                        className="text-[#057DCD] underline"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLibrary;

