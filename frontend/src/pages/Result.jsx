import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext.jsx";
import { getResults } from "../api/client.js";

export default function Result() {
  const navigate = useNavigate();
  const { student, sessionId, results, setResults, quizData, clearSession } = useStudent();
  const [loading, setLoading] = useState(!results);

  useEffect(() => {
    if (!results && sessionId) {
      getResults(sessionId)
        .then(res => setResults(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-400 rounded-full animate-spin" />
    </div>
  );

  const score = results?.score || 0;
  const total = results?.total || quizData?.length || 0;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const gaps = results?.gaps || [];
  const breakdown = results?.breakdown || [];

  const getGrade = (pct) => {
    if (pct >= 90) return { label: "Excellent!", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" };
    if (pct >= 70) return { label: "Good job!", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" };
    if (pct >= 50) return { label: "Keep going!", color: "text-amber-500", bg: "bg-amber-50 border-amber-200" };
    return { label: "Needs work", color: "text-red-400", bg: "bg-red-50 border-red-200" };
  };

  const grade = getGrade(percentage);

  return (
    <div className="min-h-screen bg-violet-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Score card */}
        <div className="bg-white rounded-3xl border border-violet-100 p-8 shadow-sm text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-6 ${grade.bg} ${grade.color}`}>
            {grade.label}
          </div>

          {/* Score circle */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f0f8" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#a78bfa" strokeWidth="2.5"
                strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-700">{percentage}%</span>
              <span className="text-xs text-slate-400">{score}/{total} correct</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-700 mb-1">
            {student?.name}'s Results
          </h2>
          <p className="text-slate-400 text-sm">
            {student?.topic} · {student?.subject}
          </p>
        </div>

        {/* Question breakdown */}
        {breakdown.length > 0 && (
          <div className="bg-white rounded-3xl border border-violet-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4">Question breakdown</h3>
            <div className="space-y-3">
              {breakdown.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  item.correct
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-red-50 border-red-100"
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    item.correct ? "bg-emerald-400 text-white" : "bg-red-400 text-white"
                  }`}>
                    {item.correct ? "✓" : "✗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 mb-1">{item.question}</p>
                    {!item.correct && (
                      <div className="space-y-1">
                        <p className="text-xs text-red-500">
                          Your answer: {item.studentAnswer}
                        </p>
                        <p className="text-xs text-emerald-600">
                          Correct: {item.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge gaps */}
        {gaps.length > 0 && (
          <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-2">Knowledge gaps detected</h3>
            <p className="text-slate-400 text-xs mb-4">
              These topics need more attention. Go back to chat to review them.
            </p>
            <div className="flex flex-wrap gap-2">
              {gaps.map((gap, i) => (
                <span key={i} className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {gap}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Score", value: `${score}/${total}`, color: "text-violet-500" },
            { label: "Accuracy", value: `${percentage}%`, color: "text-emerald-500" },
            { label: "Gaps found", value: gaps.length, color: "text-amber-500" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-violet-100 p-4 text-center shadow-sm">
              <p className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/chat")}
            className="bg-white border border-violet-200 text-violet-500 font-bold py-4 rounded-2xl text-sm hover:bg-violet-50 transition-all"
          >
            Back to Chat
          </button>
          <button
            onClick={() => { clearSession(); navigate("/"); }}
            className="bg-violet-400 hover:bg-violet-500 text-white font-bold py-4 rounded-2xl text-sm transition-all"
          >
            New Session
          </button>
        </div>

      </div>
    </div>
  );
}