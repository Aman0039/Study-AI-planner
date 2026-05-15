import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quizAPI } from '../services/api';
import toast from 'react-hot-toast';
import FileSelector from '../components/common/FileSelector';
import { RiQuestionLine, RiCheckLine, RiCloseLine, RiLoader4Line, RiTrophyLine, RiTimeLine } from 'react-icons/ri';

export default function Quiz() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [quizType, setQuizType] = useState('mcq');
  const [numQuestions, setNumQuestions] = useState(10);
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (quiz && !submitted) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quiz, submitted]);

  const generateQuiz = async () => {
    if (!selectedFile) return toast.error('Select a file first.');
    setGenerating(true);
    try {
      const { data } = await quizAPI.generate(selectedFile._id, { quizType, numQuestions });
      setQuiz(data.quiz);
      setCurrentQ(0); setAnswers({}); setSubmitted(false); setElapsed(0);
      toast.success(`${data.quiz.questions.length} questions generated!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate quiz.');
    } finally { setGenerating(false); }
  };

  const handleAnswer = (answer) => {
    setAnswers(a => ({ ...a, [currentQ]: answer }));
  };

  const submitQuiz = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const answersArr = quiz.questions.map((_, i) => answers[i] || '');
      const { data } = await quizAPI.submit(quiz._id, { answers: answersArr, timeTaken: elapsed });
      setQuiz(data.quiz); setSubmitted(true);
      toast.success(`Score: ${data.quiz.score.percentage}%!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit quiz.');
    } finally { setSubmitting(false); }
  };

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  if (!quiz) {
    return (
      <div className="space-y-8">
        <div className="page-header">
          <h1>AI Quiz Generator</h1>
          <p>Auto-generate MCQ, True/False, and fill-in-the-blank quizzes from your study material</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card space-y-5">
            <div>
              <h3 className="label">Select File</h3>
              <FileSelector onSelect={setSelectedFile} selected={selectedFile} />
            </div>
            <div>
              <label className="label">Quiz Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'mcq', label: 'MCQ' }, { id: 'trueFalse', label: 'True/False' }, { id: 'mixed', label: 'Mixed' }].map(t => (
                  <button key={t.id} onClick={() => setQuizType(t.id)}
                    className="py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: quizType === t.id ? '#4361f4' : 'var(--bg-tertiary)',
                      color: quizType === t.id ? 'white' : 'var(--text-secondary)',
                    }}>{t.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Number of Questions: {numQuestions}</label>
              <input type="range" min="5" max="20" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}
                className="w-full accent-brand-500" />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                <span>5</span><span>20</span>
              </div>
            </div>
            <button onClick={generateQuiz} disabled={generating || !selectedFile}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {generating ? <><div className="spinner" /> Generating Quiz...</> : <><RiQuestionLine /> Generate Quiz</>}
            </button>
          </div>
          <div className="card">
            <h3 className="font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>How it works</h3>
            {[
              ['1️⃣', 'Select a study material you\'ve uploaded'],
              ['2️⃣', 'Choose your preferred quiz type and question count'],
              ['3️⃣', 'AI generates context-aware questions'],
              ['4️⃣', 'Answer questions and get instant scoring'],
              ['5️⃣', 'Review explanations for each answer'],
            ].map(([n, t]) => (
              <div key={n} className="flex gap-3 mb-3">
                <span className="shrink-0">{n}</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const score = quiz.score;
    const color = score.percentage >= 80 ? '#22c55e' : score.percentage >= 60 ? '#f59e0b' : '#ef4444';
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Quiz Results</h1></div>
        <div className="card text-center py-10">
          <RiTrophyLine className="text-6xl mx-auto mb-4" style={{ color }} />
          <p className="text-5xl font-extrabold mb-2" style={{ fontFamily: 'Syne, sans-serif', color }}>{score.percentage}%</p>
          <p className="text-lg mb-1">{score.obtained} / {score.total} correct</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Time: {formatTime(quiz.timeTaken || 0)}</p>
          <button onClick={() => setQuiz(null)} className="btn-primary">Take Another Quiz</button>
        </div>
        <div className="space-y-4">
          {quiz.questions.map((q, i) => (
            <div key={i} className="card p-5" style={{ borderColor: q.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${q.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {q.isCorrect ? <RiCheckLine /> : <RiCloseLine />}
                </div>
                <p className="font-medium text-sm leading-relaxed">{q.question}</p>
              </div>
              <div className="ml-10 space-y-1">
                <p className="text-xs"><span style={{ color: 'var(--text-secondary)' }}>Your answer: </span>
                  <span className={q.isCorrect ? 'text-green-400' : 'text-red-400'}>{q.userAnswer || 'No answer'}</span>
                </p>
                {!q.isCorrect && <p className="text-xs"><span style={{ color: 'var(--text-secondary)' }}>Correct: </span><span className="text-green-400">{q.correctAnswer}</span></p>}
                {q.explanation && <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>💡 {q.explanation}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1>{quiz.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <RiTimeLine /> {formatTime(elapsed)}
        </div>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
          <span>Question {currentQ + 1} of {quiz.questions.length}</span>
          <span>{Object.keys(answers).length} answered</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
          <motion.div className="h-full rounded-full" style={{ background: '#4361f4', width: `${progress}%` }}
            animate={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-1 mt-3 flex-wrap">
          {quiz.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
              style={{
                background: i === currentQ ? '#4361f4' : answers[i] ? 'rgba(34,197,94,0.2)' : 'var(--bg-tertiary)',
                color: i === currentQ ? 'white' : answers[i] ? '#22c55e' : 'var(--text-secondary)',
              }}>{i + 1}</button>
          ))}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="card p-6">
          <span className="badge badge-blue mb-4 inline-block">{q.type?.toUpperCase() || 'MCQ'}</span>
          <p className="text-lg font-semibold mb-6 leading-relaxed">{q.question}</p>
          <div className="space-y-3">
            {(q.options?.length > 0 ? q.options : ['True', 'False']).map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(opt)}
                className="w-full text-left p-4 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: answers[currentQ] === opt ? 'rgba(67,97,244,0.2)' : 'var(--bg-tertiary)',
                  border: `1px solid ${answers[currentQ] === opt ? '#4361f4' : 'transparent'}`,
                  color: answers[currentQ] === opt ? '#6b8dfa' : 'var(--text-primary)',
                }}>
                {opt}
              </button>
            ))}
          </div>
          {q.type === 'fillBlanks' && (
            <input type="text" className="input-field mt-4" placeholder="Type your answer..."
              value={answers[currentQ] || ''} onChange={e => handleAnswer(e.target.value)} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0} className="btn-secondary disabled:opacity-40">Previous</button>
        {currentQ < quiz.questions.length - 1 ? (
          <button onClick={() => setCurrentQ(q => q + 1)} className="btn-primary">Next</button>
        ) : (
          <button onClick={submitQuiz} disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <><div className="spinner" /> Submitting...</> : <><RiCheckLine /> Submit Quiz</>}
          </button>
        )}
      </div>
    </div>
  );
}
