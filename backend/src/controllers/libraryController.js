import path from "path";
import fs from "fs";
import pool from "../config/dbPostgres.js";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { transcribeWithAssemblyAI } from "../services/assemblyService.js";
import { enhanceWithGeminiAI } from "../services/geminiService.js";

export const transcribeAudio = async (req, res) => {
  const userId = req.user?.id;
  const recordingId = req.params.recordingId;

  try {
    // Step 1: Validate user and file
    const query = `SELECT * FROM recordings WHERE id = $1 AND user_id = $2`;
    const { rows } = await pool.query(query, [recordingId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Recording not found" });
    }

    const recording = rows[0];
    const flacPath = path.join(
      process.cwd(),
      "uploads",
      "audio",
      recording.file_name
    );

    if (!fs.existsSync(flacPath)) {
      return res.status(404).json({ message: "FLAC file not found on server" });
    }

    if (!recording.file_name.endsWith(".flac")) {
      return res
        .status(400)
        .json({ message: "Only .flac files are supported for transcription." });
    }

    // Step 2: Transcribe with AssemblyAI
    const transcriptText = await transcribeWithAssemblyAI(flacPath);
    console.log(transcriptText);

    // Step 3: Enhance with Gemini AI
    const prompt = `
You are a professional biography writer. Rewrite the following spoken transcript into a well-structured, book-style chapter.    

- Use a professional yet approachable tone.
- Format it as a standalone chapter of a personal biography (5 to 10 pages).
- Structure the text into paragraphs with smooth transitions.
- Include a chapter heading.
- Do not include any AI-related disclaimers.
- Keep the story as accurate and personal as possible, while improving flow and readability.    

TRANSCRIPT:
"${transcriptText}"
    `.trim();

    const enhancedText = await enhanceWithGeminiAI(prompt);

    // ✅ Step 4: Save Enhanced Transcript to PostgreSQL
    const originalName = recording.original_name || `recording_${recording.id}`;
    const baseName = path.parse(originalName).name.replace(/[^\w\d]/g, "_");
    const timestamp = Date.now();
    const documentName = `${baseName}_${timestamp}`;

    // Check for uniqueness (very rare conflict)
    const checkQuery = `SELECT 1 FROM transcripts WHERE document_name = $1 LIMIT 1`;
    const { rows: existing } = await pool.query(checkQuery, [documentName]);
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "Document name already exists. Try again." });
    }

    const insertTranscriptQuery = `
  INSERT INTO transcripts (recording_id, user_id, text, status, document_name)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

    const { rows: transcriptRows } = await pool.query(insertTranscriptQuery, [
      recordingId,
      userId,
      enhancedText,
      "Edit",
      documentName,
    ]);

    // 🔄 Update recording status
    await pool.query(
      `UPDATE recordings SET transcription_status = 'transcribed' WHERE id = $1`,
      [recordingId]
    );

    // 📤 Step 5: Respond with full transcript data
    return res.status(200).json({
      message: "Transcription enhanced and stored successfully!",
      transcript: transcriptText,
      enhanced: enhancedText,
      document: transcriptRows[0], // include transcript row if needed
    });
  } catch (error) {
    console.error("❌ Transcription Error:", error);
    return res.status(500).json({ message: "Failed to transcribe audio" });
  }
};

export const getAllTranscripts = async (req, res) => {
  const userId = req.user?.id;

  try {
    const query = `
      SELECT 
        id,
        document_name,
        status,
        created_at
      FROM transcripts
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;

    const { rows } = await pool.query(query, [userId]);

    res.status(200).json({
      message: "Fetched all transcripts successfully",
      transcripts: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching transcripts:", error);
    res.status(500).json({ message: "Failed to retrieve transcripts" });
  }
};

export const updateDocumentName = async (req, res) => {
  const userId = req.user?.id;
  const transcriptId = req.params.id;
  const { newDocumentName } = req.body;

  try {
    // 1️⃣ Validate input
    if (!newDocumentName || newDocumentName.trim() === "") {
      return res
        .status(400)
        .json({ message: "New document name cannot be empty" });
    }

    // 2️⃣ Check ownership
    const checkOwnerQuery = `
      SELECT * FROM transcripts 
      WHERE id = $1 AND user_id = $2
    `;
    const { rows: transcriptRows } = await pool.query(checkOwnerQuery, [
      transcriptId,
      userId,
    ]);

    if (transcriptRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Transcript not found or unauthorized" });
    }

    // 3️⃣ Check for document_name uniqueness
    const checkUniqueQuery = `
      SELECT 1 FROM transcripts 
      WHERE document_name = $1 AND user_id = $2 AND id != $3
    `;
    const { rows: existing } = await pool.query(checkUniqueQuery, [
      newDocumentName,
      userId,
      transcriptId,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({ message: "Document name already exists" });
    }

    // 4️⃣ Update the document_name
    const updateQuery = `
    UPDATE transcripts 
    SET document_name = $1, updated_at = NOW()
    WHERE id = $2 
    RETURNING id, document_name, status, updated_at;
  `;
    const { rows: updated } = await pool.query(updateQuery, [
      newDocumentName,
      transcriptId,
    ]);

    res.status(200).json({
      message: "Document name updated successfully",
      transcript: updated[0],
    });
  } catch (error) {
    console.error("❌ Error updating document name:", error);
    res.status(500).json({ message: "Failed to update document name" });
  }
};

export const getAllAudioStatus = async (req, res) => {
  const userId = req.user?.id;

  try {
    const query = `
      SELECT 
        id,
        original_name AS file_name,
        transcription_status AS status,
        created_at
      FROM recordings
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;

    const { rows } = await pool.query(query, [userId]);

    res.status(200).json({
      message: "Fetched all audio files and statuses",
      audios: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching audio statuses:", error);
    res.status(500).json({ message: "Failed to fetch audio status" });
  }
};

export const getTranscriptByDocumentName = async (req, res) => {
  const userId = req.user?.id;
  const { documentName } = req.params;

  if (!documentName) {
    return res.status(400).json({ message: "Document name is required" });
  }

  try {
    const query = `
      SELECT 
        id,
        document_name,
        text,
        status,
        created_at
      FROM transcripts
      WHERE user_id = $1 AND document_name = $2
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [userId, documentName]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Transcript not found" });
    }

    res.status(200).json({
      message: "Transcript fetched successfully",
      transcript: rows[0],
    });
  } catch (error) {
    console.error("❌ Error fetching transcript by document name:", error);
    res.status(500).json({ message: "Failed to fetch transcript" });
  }
};

export const updateTranscriptText = async (req, res) => {
  const userId = req.user?.id;
  const { documentName } = req.params;
  const { newText } = req.body;

  if (!documentName || !newText) {
    return res
      .status(400)
      .json({ message: "Document name and new text are required" });
  }

  try {
    // 🔍 Check if transcript exists
    const findQuery = `SELECT * FROM transcripts WHERE user_id = $1 AND document_name = $2`;
    const { rows } = await pool.query(findQuery, [userId, documentName]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Transcript not found or unauthorized" });
    }

    // ✍️ Update the text
    const updateQuery = `
      UPDATE transcripts
      SET text = $1, updated_at = NOW()
      WHERE user_id = $2 AND document_name = $3
      RETURNING *;
    `;

    const { rows: updated } = await pool.query(updateQuery, [
      newText,
      userId,
      documentName,
    ]);

    res.status(200).json({
      message: "Transcript updated successfully",
      transcript: updated[0],
    });
  } catch (error) {
    console.error("❌ Error updating transcript:", error);
    res.status(500).json({ message: "Failed to update transcript" });
  }
};

export const exportTranscript = async (req, res) => {
  const userId = req.user?.id;
  const { documentName } = req.params;
  const { format } = req.query; // e.g., ?format=pdf or ?format=docx

  if (!["pdf", "docx"].includes(format)) {
    return res
      .status(400)
      .json({ message: "Invalid export format. Use 'pdf' or 'docx'." });
  }

  try {
    // 🔍 Get transcript
    const query = `SELECT text FROM transcripts WHERE user_id = $1 AND document_name = $2`;
    const { rows } = await pool.query(query, [userId, documentName]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Transcript not found or unauthorized" });
    }

    const transcriptText = rows[0].text;

    // 📂 Create temporary directory if not exists
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const baseFileName = `${documentName}_${Date.now()}`;
    const filePath = path.join(exportDir, `${baseFileName}.${format}`);

    if (format === "pdf") {
      // 📝 Generate PDF using pdfkit
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      doc.fontSize(12).text(transcriptText, { align: "justify" });
      doc.end();

      stream.on("finish", () => {
        res.download(filePath, `${documentName}.pdf`, () => {
          fs.unlinkSync(filePath); // cleanup
        });
      });
    }

    if (format === "docx") {
      // 📝 Generate DOCX using docx
      const paragraphs = transcriptText
        .split("\n\n")
        .map((para) => new Paragraph(new TextRun(para)));

      const doc = new Document({
        sections: [{ children: paragraphs }],
      });

      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(filePath, buffer);

      res.download(filePath, `${documentName}.docx`, () => {
        fs.unlinkSync(filePath); // cleanup
      });
    }
  } catch (error) {
    console.error("❌ Export error:", error);
    res.status(500).json({ message: "Failed to export transcript" });
  }
};

export const updateTranscriptStatus = async (req, res) => {
  const userId = req.user?.id;
  const { documentName } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["Edit", "Under Review", "Approved"];
  if (!allowedStatuses.includes(status)) {
    return res
      .status(400)
      .json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
  }

  try {
    const updateQuery = `
      UPDATE transcripts
      SET status = $1
      WHERE user_id = $2 AND document_name = $3
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [
      status,
      userId,
      documentName,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Transcript not found or unauthorized" });
    }

    res.status(200).json({
      message: `Transcript status updated to '${status}'`,
      updated: rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating transcript status:", error);
    res.status(500).json({ message: "Failed to update transcript status" });
  }
};
