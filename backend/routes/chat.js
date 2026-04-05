import { Router } from "express";
import { buildSystemPrompt } from "../prompt.js";
import { chatWithGemini } from "../gemini.js";
import { saveMessage, getChatHistory, updateProgress } from "../firestore.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { sessionId, message, formData } = req.body;

    if (!sessionId || !message || !formData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(formData);

    // Get full chat history from Firestore
    const history = await getChatHistory(sessionId);

    // Save student message
    await saveMessage(sessionId, "user", message);

    // Call Gemini with history + new message
    const reply = await chatWithGemini(systemPrompt, history, message);

    // Save Gemini reply
    await saveMessage(sessionId, "model", reply);

    // Update progress
    await updateProgress(sessionId, {});

    res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Failed to get response" });
  }
});

export default router;