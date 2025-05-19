import express from "express";
import {
  transcribeAudio,
  getAllTranscripts,
  updateDocumentName,
  getAllAudioStatus,
  getTranscriptByDocumentName,
  updateTranscriptText,
  exportTranscript,
  updateTranscriptStatus,
} from "../controllers/libraryController.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Transcribe audio and enhance it with Gemini AI
 * - Requires authentication
 */
router.post("/transcribe/:recordingId", authenticateUser, transcribeAudio);

/**
 * ✅ Get all transcript documents (summary)
 */
router.get("/transcripts", authenticateUser, getAllTranscripts);

/**
 * ✅ Rename a transcript document
 */
router.put("/transcripts/:id/rename", authenticateUser, updateDocumentName);

/**
 * ✅ Get all user's audio files with transcription status
 */
router.get("/audio-status", authenticateUser, getAllAudioStatus);

/**
 * ✅ Fetch full transcript by document name
 */
router.get("/transcripts/:documentName", authenticateUser, getTranscriptByDocumentName);

/**
 * ✅ Update transcript text (from canvas editor Save)
 */
router.put("/transcripts/:documentName", authenticateUser, updateTranscriptText);

/**
 * ✅ Export transcript as PDF or DOCX
 * ?format=pdf or ?format=docx
 */
router.get("/transcripts/:documentName/export", authenticateUser, exportTranscript);

/**
 * ✅ Update status of a transcript (Edit, Under Review, Approved)
 */
router.put("/transcripts/:documentName/status", authenticateUser, updateTranscriptStatus);

export default router;
