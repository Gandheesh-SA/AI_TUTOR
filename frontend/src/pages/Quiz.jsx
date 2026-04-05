import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext.jsx";
import { generateQuiz, submitQuiz } from "../api/client.js";

export default function Quiz() {
  const navigate = useNavigate();
  const { student, sessionId, setQuizData, setResults } = useStudent();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await generateQuiz(sessionId, student);
        setQuestions(res.data.questions);
        setQuizData(res.data.questions);
      } catch (err) {
        setError("Failed to generate quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  const selectAnswer = (questionIndex, answer) => {
    setAnswers(a => ({ ...a, [questionIndex]: answer }));
  };

  const submit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await submitQuiz(sessionId, answers, questions);
      setResults(res.data);
      navigate("/result");
    } catch (err) {
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0
    ? Math.round((Object.keys(answers).length / questions.length) * 100)
    : 0;

  // Loading state
  if (loading) return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Generating your quiz...</p>
        <p className="text-slate-400 text-sm mt-1">Based on what you just learned</p>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <button onClick={() => navigate("/chat")} className="bg-violet-400 text-white px-6 py-3 rounded-2xl font-bold text-sm">
          Back to Chat
        </button>
      </div>
    </div>
  );

  const q = questions[current];

  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-violet-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-slate-700 text-sm">Knowledge Check</p>
              <p className="text-xs text-slate-400">{student?.topic} · {student?.subject}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Question</p>
              <p className="font-bold text-violet-400">{current + 1} / {questions.length}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Question type badge */}
          <div className="mb-4">
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
              q?.type === "mcq"
                ? "bg-violet-100 text-violet-600"
                : q?.type === "truefalse"
                ? "bg-amber-100 text-amber-600"
                : "bg-teal-100 text-teal-600"
            }`}>
              {q?.type === "mcq" ? "Multiple Choice" :
               q?.type === "truefalse" ? "True / False" : "Short Answer"}
            </span>
          </div>

          {/* Question text */}
          <div className="bg-white rounded-3xl border border-violet-100 p-8 mb-6 shadow-sm">
            <p className="text-slate-700 text-lg font-medium leading-relaxed">{q?.question}</p>
          </div>

          {/* Options */}
          {(q?.type === "mcq" || q?.type === "truefalse") && (
            <div className="space-y-3">
              {q?.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(current, opt)}
                  className={`w-full text-left px-6 py-4 rounded-2xl border text-sm font-medium transition-all ${
                    answers[current] === opt
                      ? "bg-violet-50 border-violet-400 text-violet-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-3 font-bold ${
                    answers[current] === opt
                      ? "bg-violet-400 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Short answer */}
          {q?.type === "short" && (
            <textarea
              value={answers[current] || ""}
              onChange={e => selectAnswer(current, e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 resize-none"
            />
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {current > 0 && (
              <button
                onClick={() => setCurrent(c => c - 1)}
                className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-400 text-sm font-semibold hover:border-slate-300 transition-all"
              >
                ← Back
              </button>
            )}
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent(c => c + 1)}
                disabled={!answers[current]}
                className="flex-1 bg-violet-400 hover:bg-violet-500 disabled:opacity-40 text-white font-bold py-3 rounded-2xl text-sm transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting || !answers[current]}
                className="flex-1 bg-emerald-400 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3 rounded-2xl text-sm transition-all"
              >
                {submitting ? "Submitting..." : "Submit Quiz ✓"}
              </button>
            )}
          </div>

          {/* Answered count */}
          <p className="text-center text-xs text-slate-300 mt-4">
            {Object.keys(answers).length} of {questions.length} answered
          </p>
        </div>
      </div>

    </div>
  );
}