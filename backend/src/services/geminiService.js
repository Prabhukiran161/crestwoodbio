import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-pro-latest"; // or gemini-1.0-pro, gemini-pro

export const enhanceWithGeminiAI = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!text) {
      throw new Error("No enhanced content returned by Gemini AI");
    }

    return text;
  } catch (error) {
    console.error(
      "❌ Gemini REST API Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to enhance transcription with Gemini AI");
  }
};
