import { Firestore } from "@google-cloud/firestore";

const db = new Firestore();

// Save student profile
export async function saveStudentProfile(sessionId, formData) {
  await db.collection("students").doc(sessionId).set({
    ...formData,
    createdAt: Firestore.Timestamp.now(),
    messageCount: 0,
    lastActiveAt: Firestore.Timestamp.now(),
  });
}

// Save a single message
export async function saveMessage(sessionId, role, text) {
  await db
    .collection("students")
    .doc(sessionId)
    .collection("messages")
    .add({
      role,
      text,
      timestamp: Firestore.Timestamp.now(),
    });
}

// Get full chat history ordered by time
export async function getChatHistory(sessionId) {
  const snapshot = await db
    .collection("students")
    .doc(sessionId)
    .collection("messages")
    .orderBy("timestamp", "asc")
    .get();

  return snapshot.docs.map(doc => ({
    role: doc.data().role,
    text: doc.data().text,
  }));
}

// Update progress after each message
export async function updateProgress(sessionId, data) {
  await db
    .collection("students")
    .doc(sessionId)
    .update({
      lastActiveAt: Firestore.Timestamp.now(),
      messageCount: Firestore.FieldValue.increment(1),
      ...data,
    });
}

// Save quiz results
export async function saveQuizResult(sessionId, resultData) {
  await db
    .collection("students")
    .doc(sessionId)
    .collection("quizResults")
    .add({
      ...resultData,
      submittedAt: Firestore.Timestamp.now(),
    });

  // Also update main student doc with latest score
  await db
    .collection("students")
    .doc(sessionId)
    .update({
      latestScore: resultData.percentage,
      latestGaps: resultData.gaps,
      quizTakenAt: Firestore.Timestamp.now(),
    });
}

// Get results for a session
export async function getResults(sessionId) {
  const snapshot = await db
    .collection("students")
    .doc(sessionId)
    .collection("quizResults")
    .orderBy("submittedAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return snapshot.docs[0].data();
}

// Get student profile
export async function getStudentProfile(sessionId) {
  const doc = await db
    .collection("students")
    .doc(sessionId)
    .get();

  if (!doc.exists) return null;
  return doc.data();
}