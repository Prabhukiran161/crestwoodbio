import pool from "../config/dbPostgres.js"; // your pg pool config

export const insertRecording = async ({
  userId,
  fileName,
  originalName,
  duration,
  type = "recorded",
  transcriptionStatus = "pending",
}) => {
  const query = `
    INSERT INTO recordings (user_id, file_name, original_name, duration, type, transcription_status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    userId,
    fileName,
    originalName,
    duration,
    type,
    transcriptionStatus,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};
