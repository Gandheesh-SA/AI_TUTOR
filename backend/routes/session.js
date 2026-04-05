import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { buildSystemPrompt } from "../prompt.js";
import { chatWithGemini } from "../gemini.js";
import { saveStudentProfile, saveMessage } from "../firestore.js";

const router = Router();

router.post("/start", async (req, res) => {
  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.name || !formData.topic || !formData.subject) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate unique session ID
    const sessionId = `${formData.name.toLowerCase().replace(/\s+/g, "-")}-${uuidv4()}`;

    // Save student profile to Firestore
    await saveStudentProfile(sessionId, formData);

    // Build system prompt from form data
    const systemPrompt = buildSystemPrompt(formData);

    // Get Gemini opening message
    const openingMessage = await chatWithGemini(
      systemPrompt,
      [],
      "Begin the session. Introduce yourself in your persona and warmly welcome the student by name. Tell them what you'll be teaching today."
    );

    // Save opening message to Firestore
    await saveMessage(sessionId, "model", openingMessage);

    res.json({ sessionId, message: openingMessage });

  } catch (err) {
    console.error("Session start error:", err);
    res.status(500).json({ error: "Failed to start session" });
  }
});

export default router;