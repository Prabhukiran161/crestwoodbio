import express from "express";
import {
  getAllRecordings,
  deleteRecording,
  renameRecording,
  saveRecording,
  streamRecording,
} from "../controllers/recordingController.js";
import { uploadAudio } from "../middleware/uploadMiddleware.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", authenticateUser, uploadAudio.single("audio"), saveRecording);
router.get("/all", authenticateUser, getAllRecordings);
router.get("/play/:filename", streamRecording);
router.delete("/:id", authenticateUser, deleteRecording);
router.put("/rename/:id", authenticateUser, renameRecording);

export default router;
