import axios from "axios";
import fs from "fs/promises";
import path from "path";

const baseUrl = "https://api.assemblyai.com";
const API_KEY = process.env.ASSEMBLYAI_API_KEY;

const headers = {
  authorization: API_KEY,
};

export const transcribeWithAssemblyAI = async (filePath) => {
  try {
    console.log("🟡 Reading audio file:", filePath);
    const audioBuffer = await fs.readFile(filePath); // 🔁 read file as buffer

    // 1️⃣ Upload audio
    const uploadRes = await axios.post(`${baseUrl}/v2/upload`, audioBuffer, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const uploadUrl = uploadRes.data.upload_url;
    console.log("✅ Uploaded to AssemblyAI:", uploadUrl);

    // 2️⃣ Request transcription
    const transcribeRes = await axios.post(
      `${baseUrl}/v2/transcript`,
      { audio_url: uploadUrl },
      { headers }
    );

    const transcriptId = transcribeRes.data.id;
    const pollingUrl = `${baseUrl}/v2/transcript/${transcriptId}`;

    // 3️⃣ Poll until completed
    let status = "queued";
    let transcriptData;

    while (status === "queued" || status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 4000)); // wait 4s

      const pollRes = await axios.get(pollingUrl, { headers });
      status = pollRes.data.status;
      transcriptData = pollRes.data;

      console.log("🔁 Transcription status:", status);
    }

    if (status === "completed") {
      console.log("✅ Transcription complete");
      return transcriptData.text;
    } else {
      throw new Error(`AssemblyAI Error: ${transcriptData.error}`);
    }
  } catch (err) {
    console.error("❌ AssemblyAI Transcription Error:", err.message);
    throw new Error("Transcoding failed → Make sure the file is valid audio");
  }
};
