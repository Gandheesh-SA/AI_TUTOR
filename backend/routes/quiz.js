import { Router } from "express";
import { buildSystemPrompt } from "../prompt.js";
import { chatWithGemini } from "../gemini.js";
import { getChatHistory, saveMessage } from "../firestore.js";

const router = Router();

// Generate quiz from chat history
router.post("/generate", async (req, res) => {
  try {
    const { sessionId, formData } = req.body;

    if (!sessionId || !formData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get chat history to base quiz on
    const history = await getChatHistory(sessionId);

    if (history.length === 0) {
      return res.status(400).json({ error: "No chat history found to generate quiz from" });
    }

    // Build quiz generation prompt
    const quizPrompt = `
You are a quiz generator. Based on the chat conversation below, generate exactly 5 quiz questions.

The questions must test understanding of: ${formData.topic} (${formData.subject})
Student level: ${formData.level}

Return ONLY a valid JSON array. No explanation, no markdown, no backticks.
Format exactly like this:
[
  {
    "type": "mcq",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  },
  {
    "type": "truefalse",
    "question": "True or false statement here?",
    "options": ["True", "False"],
    "answer": "True"
  },
  {
    "type": "short",
    "question": "Short answer question here?",
    "options": [],
    "answer": "Expected answer keywords"
  }
]

Rules:
- Include at least 3 MCQ, 1 true/false, 1 short answer
- Base questions strictly on what was discussed in the chat
- Match difficulty to student level: ${formData.level}
- Keep questions clear and concise
    `.trim();

    const rawResponse = await chatWithGemini(quizPrompt, history, "Generate the quiz now.");

    // Parse JSON from Gemini response
    let questions;
    try {
      const cleaned = rawResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      questions = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      return res.status(500).json({ error: "Failed to parse quiz questions" });
    }

    // Save quiz generation event
    await saveMessage(sessionId, "model", `Quiz generated with ${questions.length} questions.`);

    res.json({ questions });

  } catch (err) {
    console.error("Quiz generate error:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Submit quiz answers and get results
router.post("/submit", async (req, res) => {
  try {
    const { sessionId, answers, questions } = req.body;

    if (!sessionId || !answers || !questions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let score = 0;
    const breakdown = [];
    const gaps = [];

    questions.forEach((q, i) => {
      const studentAnswer = answers[i] || "";
      let correct = false;

      if (q.type === "mcq" || q.type === "truefalse") {
        correct = studentAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
      } else if (q.type === "short") {
        // For short answers check if key answer words are present
        const answerWords = q.answer.toLowerCase().split(/\s+/);
        const studentWords = studentAnswer.toLowerCase();
        const matchCount = answerWords.filter(w => studentWords.includes(w)).length;
        correct = matchCount >= Math.ceil(answerWords.length * 0.5);
      }

      if (correct) {
        score++;
      } else {
        // Add to gaps — extract key topic from question
        gaps.push(q.question.substring(0, 60) + "...");
      }

      breakdown.push({
        question: q.question,
        studentAnswer,
        correctAnswer: q.answer,
        correct,
        type: q.type,
      });
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    // Save results to Firestore
    const { saveQuizResult } = await import("../firestore.js");
    await saveQuizResult(sessionId, {
      score,
      total,
      percentage,
      gaps,
      breakdown,
    });

    res.json({ score, total, percentage, gaps, breakdown });

  } catch (err) {
    console.error("Quiz submit error:", err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

export default router;