import { VertexAI } from "@google-cloud/vertexai";

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = "us-central1";
const MODEL = "gemini-1.5-flash";

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

const model = vertexAI.getGenerativeModel({
  model: MODEL,
});

export async function chatWithGemini(systemPrompt, chatHistory, newMessage) {
  const request = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      ...chatHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      {
        role: "user",
        parts: [{ text: newMessage }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.9,
      topP: 0.95,
    },
  };

  const response = await model.generateContent(request);
  const result = response.response;
  const text = result.candidates[0].content.parts[0].text;
  return text;
}