import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Start a new session with student form data
export const startSession = (formData) =>
  api.post("/session/start", formData);

// Send a chat message
export const sendMessage = (sessionId, message, formData) =>
  api.post("/chat", { sessionId, message, formData });

// Generate quiz from chat history
export const generateQuiz = (sessionId, formData) =>
  api.post("/quiz/generate", { sessionId, formData });

// Submit quiz answers
export const submitQuiz = (sessionId, answers, questions) =>
  api.post("/quiz/submit", { sessionId, answers, questions });

// Get results
export const getResults = (sessionId) =>
  api.get(`/results/${sessionId}`);