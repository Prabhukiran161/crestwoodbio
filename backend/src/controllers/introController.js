import pool from "../config/dbPostgres.js"; // PostgreSQL connection
import path from "path"; // For file name sanitization (optional)
import fs from "fs";

export const insertIntroduction = async (req, res) => {
  const userId = req.user?.id;
  const {
    full_name,
    date_of_birth,
    place_of_birth_country,
    place_of_birth_city,
    father_name,
    mother_name,
    parents_unknown,
    sibling_count,
    sibling_names,
    additional_info,
    voice_file,
  } = req.body;

  // ✅ Validate required fields
  if (!full_name || full_name.trim() === "") {
    return res.status(400).json({ message: "Full name is required." });
  }

  try {
    // ✅ Ensure sibling_names is a valid array
    const siblingNamesArray = Array.isArray(sibling_names)
      ? sibling_names
      : typeof sibling_names === "string"
      ? sibling_names.split(",").map((name) => name.trim())
      : [];

    const query = `
      INSERT INTO introduction (
        user_id, full_name, date_of_birth, 
        place_of_birth_country, place_of_birth_city,
        father_name, mother_name, parents_unknown,
        sibling_count, sibling_names,
        additional_info, voice_file
      ) VALUES (
        $1, $2, $3,
        $4, $5,
        $6, $7, $8,
        $9, $10,
        $11, $12
      ) RETURNING *;
    `;

    const values = [
      userId,
      full_name,
      date_of_birth || null,
      place_of_birth_country || null,
      place_of_birth_city || null,
      father_name || null,
      mother_name || null,
      parents_unknown || false,
      sibling_count || 0,
      siblingNamesArray, // ✅ Now always an array
      additional_info || null,
      voice_file || null,
    ];

    const { rows } = await pool.query(query, values);

    res.status(201).json({
      message: "Introduction data inserted successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ Error inserting introduction:", error);
    res.status(500).json({ message: "Failed to insert introduction" });
  }
};


export const updateIntroduction = async (req, res) => {
  const userId = req.user?.id;
  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  try {
    const allowedFields = [
      "full_name",
      "date_of_birth",
      "place_of_birth_country",
      "place_of_birth_city",
      "father_name",
      "mother_name",
      "parents_unknown",
      "sibling_count",
      "sibling_names",
      "additional_info",
      "voice_file",
    ];

    const updates = [];
    const values = [userId];
    let paramIdx = 2;

    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${paramIdx}`);
        values.push(fields[key]);
        paramIdx++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    const query = `
      UPDATE introduction
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Introduction not found for update" });
    }

    res.status(200).json({
      message: "Introduction updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating introduction:", error);
    res.status(500).json({ message: "Failed to update introduction" });
  }
};

export const getIntroduction = async (req, res) => {
  const userId = req.user?.id;

  try {
    const query = `SELECT * FROM introduction WHERE user_id = $1 LIMIT 1`;
    const { rows } = await pool.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No introduction data found" });
    }

    res.status(200).json({
      message: "Introduction data retrieved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ Error fetching introduction:", error);
    res.status(500).json({ message: "Failed to fetch introduction" });
  }
};

