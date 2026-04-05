import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sessionRouter from "./routes/session.js";
import chatRouter from "./routes/chat.js";
import quizRouter from "./routes/quiz.js";
import resultsRouter from "./routes/results.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AI Tutor backend running", version: "1.0.0" });
});

// Routes
app.use("/session", sessionRouter);
app.use("/chat", chatRouter);
app.use("/quiz", quizRouter);
app.use("/results", resultsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Tutor backend running on port ${PORT}`);
});