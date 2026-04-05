import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext.jsx";
import { startSession } from "../api/client.js";

const PERSONAS = [
  { val: "dora", emoji: "🗺️", name: "Dora Explorer", desc: "Adventure-based learning" },
  { val: "sherlock", emoji: "🔍", name: "Detective", desc: "Solve mysteries to learn" },
  { val: "storyteller", emoji: "📖", name: "Storyteller", desc: "Learn through narrative" },
  { val: "coach", emoji: "🏆", name: "Sports Coach", desc: "Challenges and drills" },
  { val: "scientist", emoji: "🔬", name: "Mad Scientist", desc: "Wild experiments" },
  { val: "custom", emoji: "✨", name: "Custom", desc: "Your own character" },
];

const SUBJECTS = [
  "History", "Geography", "Science", "Mathematics",
  "Civics / Political Science", "Economics", "English Literature",
  "Computer Science", "Biology", "Physics", "Chemistry", "Other",
];

export default function Form() {
  const navigate = useNavigate();
  const { setStudent, setSessionId, setChatHistory } = useStudent();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "", age: "", level: "",
    subject: "", topic: "", goal: "",
    persona: "", customPersona: "",
    language: "english", duration: "20", notes: "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setErr = (key, msg) => setErrors(e => ({ ...e, [key]: msg }));
  const clearErr = (key) => setErrors(e => { const n = { ...e }; delete n[key]; return n; });

  const validate = () => {
    const errs = {};
    if (step === 1) {
      if (!form.name.trim()) errs.name = "Required";
      if (!form.age || form.age < 5 || form.age > 60) errs.age = "Enter valid age";
      if (!form.level) errs.level = "Select a level";
    }
    if (step === 2) {
      if (!form.subject) errs.subject = "Select a subject";
      if (!form.topic.trim()) errs.topic = "Enter a topic";
    }
    if (step === 3) {
      if (!form.persona) errs.persona = "Choose a style";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < 4) { setStep(s => s + 1); return; }
    // Step 4 submit
    try {
      setLoading(true);
      const res = await startSession(form);
      setStudent(form);
      setSessionId(res.data.sessionId);
      setChatHistory([{ role: "model", text: res.data.message }]);
      navigate("/chat");
    } catch (err) {
      console.error(err);
      alert("Failed to start session. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const Pill = ({ label, val, field }) => (
    <button
      onClick={() => { set(field, val); clearErr(field); }}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
        form[field] === val
          ? "bg-violet-100 border-violet-400 text-violet-700"
          : "bg-white border-slate-200 text-slate-500 hover:border-violet-300"
      }`}
    >
      {label}
    </button>
  );

  const inputClass = (field) =>
    `w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-700 
     placeholder-slate-300 outline-none transition-all ${
      errors[field]
        ? "border-red-300 focus:border-red-400"
        : "border-slate-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
    }`;

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-violet-200 text-violet-500 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-5">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            AI-Powered Tutor
          </div>
          <h1 className="text-4xl font-bold text-slate-700 leading-tight mb-2">
            Learn anything,<br />
            <span className="text-violet-400">your way.</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Tell us about yourself and we'll build a personalised AI tutor just for you.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-violet-100 p-8 shadow-sm">

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-8">
            {[1,2,3,4].map(n => (
              <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                n < step ? "bg-emerald-300" : n === step ? "bg-violet-400" : "bg-slate-100"
              }`} />
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-1">Step 1 of 4</p>
                <h2 className="text-xl font-bold text-slate-700">Who are you?</h2>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Name</label>
                <input
                  type="text" placeholder="e.g. Arjun"
                  value={form.name}
                  onChange={e => { set("name", e.target.value); clearErr("name"); }}
                  className={inputClass("name")}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Age</label>
                <input
                  type="number" placeholder="e.g. 17" min="5" max="60"
                  value={form.age}
                  onChange={e => { set("age", e.target.value); clearErr("age"); }}
                  className={inputClass("age")}
                />
                {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Level</label>
                <div className="flex flex-wrap gap-2">
                  {["beginner","intermediate","advanced"].map(l => (
                    <Pill key={l} label={l.charAt(0).toUpperCase()+l.slice(1)} val={l} field="level" />
                  ))}
                </div>
                {errors.level && <p className="text-red-400 text-xs mt-1">{errors.level}</p>}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-1">Step 2 of 4</p>
                <h2 className="text-xl font-bold text-slate-700">What to learn?</h2>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Subject</label>
                <select
                  value={form.subject}
                  onChange={e => { set("subject", e.target.value); clearErr("subject"); }}
                  className={inputClass("subject") + " appearance-none cursor-pointer"}
                >
                  <option value="" disabled>Choose a subject</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Topic</label>
                <input
                  type="text" placeholder="e.g. Parliament of India"
                  value={form.topic}
                  onChange={e => { set("topic", e.target.value); clearErr("topic"); }}
                  className={inputClass("topic")}
                />
                {errors.topic && <p className="text-red-400 text-xs mt-1">{errors.topic}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Goal</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {val:"understand",label:"Understand basics"},
                    {val:"exam",label:"Exam prep"},
                    {val:"deep",label:"Deep dive"},
                    {val:"fun",label:"Just curious"},
                  ].map(g => <Pill key={g.val} label={g.label} val={g.val} field="goal" />)}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-1">Step 3 of 4</p>
                <h2 className="text-xl font-bold text-slate-700">Pick your teaching style</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PERSONAS.map(p => (
                  <button
                    key={p.val}
                    onClick={() => { set("persona", p.val); clearErr("persona"); }}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      form.persona === p.val
                        ? "bg-violet-50 border-violet-300"
                        : "bg-slate-50 border-slate-100 hover:border-violet-200"
                    }`}
                  >
                    <div className="text-2xl mb-2">{p.emoji}</div>
                    <div className="font-bold text-sm text-slate-700 mb-1">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.desc}</div>
                  </button>
                ))}
              </div>
              {form.persona === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Describe persona</label>
                  <textarea
                    value={form.customPersona}
                    onChange={e => set("customPersona", e.target.value)}
                    placeholder="e.g. Tony Stark explaining with sarcasm..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-violet-300 resize-none h-24"
                  />
                </div>
              )}
              {errors.persona && <p className="text-red-400 text-xs mt-1">{errors.persona}</p>}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-1">Step 4 of 4</p>
                <h2 className="text-xl font-bold text-slate-700">Preferences</h2>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Language</label>
                <select
                  value={form.language}
                  onChange={e => set("language", e.target.value)}
                  className={inputClass("language") + " appearance-none cursor-pointer"}
                >
                  {["english","hindi","tamil","telugu","kannada","malayalam","bengali","marathi"].map(l => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Session length</label>
                <div className="flex flex-wrap gap-2">
                  {[{val:"10",label:"10 mins"},{val:"20",label:"20 mins"},{val:"30",label:"30 mins"},{val:"60",label:"1 hour"}].map(d => (
                    <Pill key={d.val} label={d.label} val={d.val} field="duration" />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Notes <span className="normal-case font-normal text-slate-300">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                  placeholder="e.g. Use simple words, focus on examples..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-violet-300 resize-none h-20"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={`flex gap-3 mt-8 ${step > 1 ? "justify-between" : ""}`}>
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-400 text-sm font-semibold hover:border-slate-300 transition-all"
              >
                ← Back
              </button>
            )}
            <button
              onClick={next}
              disabled={loading}
              className="flex-1 bg-violet-400 hover:bg-violet-500 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm transition-all"
            >
              {loading ? "Starting your tutor..." : step === 4 ? "Launch my tutor 🚀" : "Continue →"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}