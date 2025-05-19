// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the uploads/audio directory exists
const uploadDir = path.join(process.cwd(), "uploads", "audio");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// ✅ Extended MIME types to support .webm, .ogg, etc.
const audioFilter = (req, file, cb) => {
  const allowed = [
    "audio/mpeg", // .mp3
    "audio/wav", // .wav
    "audio/mp4", // .mp4 (audio)
    "audio/x-m4a", // .m4a
    "audio/webm", // .webm
    "audio/ogg", // .ogg
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error("❌ Rejected file mimetype:", file.mimetype);
    cb(new Error("Invalid audio file"), false);
  }
};

export const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // Optional: limit to 100MB
});
