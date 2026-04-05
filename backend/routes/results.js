import { Router } from "express";
import { getResults } from "../firestore.js";

const router = Router();

router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const results = await getResults(sessionId);

    if (!results) {
      return res.status(404).json({ error: "Results not found" });
    }

    res.json(results);

  } catch (err) {
    console.error("Results error:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

export default router;