import { createContext, useContext, useState } from "react";

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [results, setResults] = useState(null);

  const clearSession = () => {
    setStudent(null);
    setSessionId(null);
    setChatHistory([]);
    setQuizData(null);
    setResults(null);
  };

  return (
    <StudentContext.Provider value={{
      student, setStudent,
      sessionId, setSessionId,
      chatHistory, setChatHistory,
      quizData, setQuizData,
      results, setResults,
      clearSession
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  return useContext(StudentContext);
}