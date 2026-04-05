import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Form from "./pages/Form.jsx";
import Chat from "./pages/Chat.jsx";
import Quiz from "./pages/Quiz.jsx";
import Result from "./pages/Result.jsx";
import { useStudent } from "./context/StudentContext.jsx";

function ProtectedRoute({ children }) {
  const { student } = useStudent();
  return student ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/chat" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
        <Route path="/quiz" element={
          <ProtectedRoute><Quiz /></ProtectedRoute>
        } />
        <Route path="/result" element={
          <ProtectedRoute><Result /></ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
}