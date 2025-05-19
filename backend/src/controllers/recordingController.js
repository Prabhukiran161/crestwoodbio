import pool from "../config/dbPostgres.js";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import mime from "mime";
ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

// 🎙️ Save a new recording (upload or recorded)

// export const saveRecording = async (req, res) => {
//   try {
//     const userId = req.user?.id || "guest";
//     const { originalname, filename } = req.file;
//     const type = req.body.type || "recorded";

//     const inputPath = path.join(process.cwd(), "uploads", "audio", filename);
//     const flacName = `${Date.now()}_${path.parse(filename).name}.flac`;
//     const flacPath = path.join(process.cwd(), "uploads", "audio", flacName);

//     // 🎧 Convert to .flac
//     ffmpeg(inputPath)
//       .output(flacPath)
//       .audioCodec("flac")
//       .on("end", async () => {
//         // 🧠 Extract duration from .flac
//         ffmpeg.ffprobe(flacPath, async (err, metadata) => {
//           if (err) {
//             console.error("❌ Duration error:", err);
//             return res.status(500).json({ message: "Failed to read duration" });
//           }

//           const durationSec = metadata.format.duration;
//           const minutes = Math.floor(durationSec / 60);
//           const seconds = Math.floor(durationSec % 60);
//           const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

//           // 🗑 Delete original input file (optional)
//           fs.unlinkSync(inputPath);

//           // 🧾 Save metadata to PostgreSQL
//           const insertQuery = `
//             INSERT INTO recordings (user_id, file_name, original_name, duration, type)
//             VALUES ($1, $2, $3, $4, $5)
//             RETURNING *;
//           `;
//           const values = [userId, flacName, originalname, duration, type];
//           const { rows } = await pool.query(insertQuery, values);

//           res.status(201).json({
//             message: "Recording saved and converted to .flac",
//             recording: rows[0],
//           });
//         });
//       })
//       .on("error", (err) => {
//         console.error("❌ Conversion error:", err);
//         res.status(500).json({ message: "Audio conversion failed" });
//       })
//       .run();
//   } catch (error) {
//     console.error("❌ Save Recording Error:", error);
//     res.status(500).json({ message: "Server error while saving recording" });
//   }
// };

export const saveRecording = async (req, res) => {
  try {
    // 1️⃣ Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: "Invalid audio file" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID" });
    }

    const { originalname, filename } = req.file;
    const type = req.body.type || "recorded";

    const inputPath = path.join(process.cwd(), "uploads", "audio", filename);
    const ext = path.extname(filename).toLowerCase();

    // 2️⃣ Restrict allowed audio formats
    const allowedExtensions = [".ogg", ".mp3", ".wav", ".m4a", ".webm"];
    if (!allowedExtensions.includes(ext)) {
      console.error("❌ Unsupported file type:", ext);
      return res.status(400).json({ message: "Unsupported audio format" });
    }

    // 3️⃣ Setup .flac file name + path
    const flacName = `${Date.now()}_${path.parse(filename).name}.flac`;
    const flacPath = path.join(process.cwd(), "uploads", "audio", flacName);

    // 4️⃣ Convert to .flac
    ffmpeg(inputPath)
      .output(flacPath)
      .audioCodec("flac")
      .on("start", (commandLine) => {
        console.log("🎬 FFmpeg started:", commandLine);
      })
      .on("end", async () => {
        // 5️⃣ Extract duration from converted .flac
        ffmpeg.ffprobe(flacPath, async (err, metadata) => {
          if (err) {
            console.error("❌ Error reading duration:", err);
            return res
              .status(500)
              .json({ message: "Duration extraction failed" });
          }

          const durationSec = metadata.format.duration || 0;
          const hours = Math.floor(durationSec / 3600);
          const minutes = Math.floor((durationSec % 3600) / 60);
          const seconds = Math.floor(durationSec % 60);
          const duration = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

          // 6️⃣ Clean up the original file
          try {
            fs.unlinkSync(inputPath);
          } catch (cleanupErr) {
            console.warn("⚠️ File cleanup failed:", cleanupErr.message);
          }

          // 7️⃣ Save metadata to PostgreSQL
          try {
            const insertQuery = `
              INSERT INTO recordings (user_id, file_name, original_name, duration, type)
              VALUES ($1, $2, $3, $4, $5)
              RETURNING *;
            `;
            const values = [userId, flacName, originalname, duration, type];
            const { rows } = await pool.query(insertQuery, values);

            return res.status(201).json({
              message: "Recording saved and converted to .flac",
              recording: rows[0],
            });
          } catch (dbError) {
            console.error("❌ DB Error while saving recording:", dbError);
            return res.status(500).json({ message: "Database insert failed" });
          }
        });
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg conversion error:", err);
        return res.status(500).json({ message: "Conversion failed" });
      })
      .run();
  } catch (error) {
    console.error("❌ Save recording error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllRecordings = async (req, res) => {
  const userId = req.user?.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countQuery = `SELECT COUNT(*) FROM recordings WHERE user_id = $1`;
    const dataQuery = `
      SELECT id, user_id, file_name, original_name, duration, type, transcription_status, created_at
      FROM recordings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    const totalCountResult = await pool.query(countQuery, [userId]);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    const { rows } = await pool.query(dataQuery, [userId, limit, offset]);

    const recordings = rows.map((rec) => ({
      ...rec,
      audio_url: `${process.env.SERVER_URL}/recordings/play/${rec.file_name}`,
    }));

    res.status(200).json({
      page,
      limit,
      total: totalCount,
      recordings,
    });
  } catch (error) {
    console.error("❌ Error fetching recordings:", error);
    res.status(500).json({ message: "Failed to fetch recordings" });
  }
};

export const deleteRecording = async (req, res) => {
  const userId = req.user.id;
  const recordingId = req.params.id;

  try {
    const findQuery = `SELECT * FROM recordings WHERE id = $1 AND user_id = $2`;
    const { rows } = await pool.query(findQuery, [recordingId, userId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Recording not found or unauthorized" });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "audio",
      rows[0].file_name
    );

    // Delete file
    fs.unlink(filePath, (err) => {
      if (err) console.warn("⚠️ File not found or already deleted");
    });

    // Delete DB row
    await pool.query("DELETE FROM recordings WHERE id = $1", [recordingId]);

    res.status(200).json({ message: "Recording deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting recording:", error);
    res.status(500).json({ message: "Failed to delete recording" });
  }
};

export const renameRecording = async (req, res) => {
  const userId = req.user.id;
  const recordingId = req.params.id;
  const { newName } = req.body;

  try {
    const findQuery = `SELECT * FROM recordings WHERE id = $1 AND user_id = $2`;
    const { rows } = await pool.query(findQuery, [recordingId, userId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Recording not found or unauthorized" });
    }

    const updateQuery = `UPDATE recordings SET original_name = $1 WHERE id = $2 RETURNING *`;
    const { rows: updated } = await pool.query(updateQuery, [
      newName,
      recordingId,
    ]);

    res
      .status(200)
      .json({ message: "Recording renamed", recording: updated[0] });
  } catch (error) {
    console.error("❌ Rename error:", error);
    res.status(500).json({ message: "Failed to rename recording" });
  }
};

export const streamRecording = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), "uploads", "audio", filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("❌ Audio file not found:", filename);
      return res.status(404).json({ message: "Audio file not found" });
    }

    const mimeType = mime.getType(filePath) || "application/octet-stream";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Access-Control-Allow-Origin", "*"); // ✅ Very important for streaming
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // ✅ Fix for audio streaming in Chrome

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
};

