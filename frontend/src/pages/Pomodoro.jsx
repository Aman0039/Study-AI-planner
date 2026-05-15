import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { RiPlayLine, RiPauseLine, RiRefreshLine, RiTimeLine, RiCheckLine } from 'react-icons/ri';

const MODES = {
  work:       { label: 'Focus',       duration: 25, color: '#4361f4' },
  shortBreak: { label: 'Short Break', duration: 5,  color: '#22c55e' },
  longBreak:  { label: 'Long Break',  duration: 15, color: '#8b5cf6' },
};

export default function Pomodoro() {
  const [mode, setMode] = useState('work');
  const [customMins, setCustomMins] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [subject, setSubject] = useState('General');
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const totalSecs = customMins[mode] * 60;
  const progress = ((totalSecs - timeLeft) / totalSecs) * 100;
  const { label, color } = MODES[mode];

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(customMins[mode] * 60);
    startTimeRef.current = null;
  }, [mode, customMins]);

  useEffect(() => { reset(); }, [mode]);

  useEffect(() => {
    if (running) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    document.title = running ? `${formatTime(timeLeft)} — ${label} | StudyAI` : 'Pomodoro | StudyAI';
    return () => { document.title = 'StudyAI'; };
  }, [timeLeft, running, label]);

  const handleComplete = async () => {
    const duration = customMins[mode];
    const sessionEntry = { mode, subject, duration, completedAt: new Date().toISOString() };
    setSessions(s => [sessionEntry, ...s]);

    if (mode === 'work') {
      setPomodoroCount(c => c + 1);
      toast.success(`🍅 Pomodoro complete! +${duration} minutes logged.`);
      try {
        await analyticsAPI.logSession({ duration, subject, type: 'pomodoro' });
      } catch {}
      setMode(pomodoroCount > 0 && (pomodoroCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak');
    } else {
      toast.success('Break over! Ready to focus again?');
      setMode('work');
    }
    setTimeLeft(customMins[mode] * 60);
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1>Pomodoro Timer</h1>
        <p>Stay focused with timed study sessions and tracked breaks</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className="card p-8 text-center">
            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 rounded-xl mb-8 max-w-xs mx-auto" style={{ background: 'var(--bg-tertiary)' }}>
              {Object.entries(MODES).map(([key, m]) => (
                <button key={key} onClick={() => { setMode(key); }}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                  style={{
                    background: mode === key ? m.color : 'transparent',
                    color: mode === key ? 'white' : 'var(--text-secondary)',
                  }}>{m.label}</button>
              ))}
            </div>

            {/* Circle */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-56 h-56">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
                  <motion.circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={circumference}
                    animate={{ strokeDashoffset: strokeOffset }}
                    transition={{ duration: 0.5, ease: 'linear' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif', color }}>{formatTime(timeLeft)}</span>
                  <span className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={reset} className="btn-secondary p-3 rounded-xl">
                <RiRefreshLine className="text-xl" />
              </button>
              <button onClick={() => setRunning(r => !r)}
                className="px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-95"
                style={{ background: color, boxShadow: `0 0 30px ${color}60` }}>
                {running ? <RiPauseLine className="text-2xl" /> : <RiPlayLine className="text-2xl" />}
              </button>
              <div className="w-[52px]" /> {/* Spacer */}
            </div>

            {/* Pomodoros */}
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="w-3 h-3 rounded-full transition-all"
                  style={{ background: i < (pomodoroCount % 4) ? '#4361f4' : 'var(--bg-tertiary)', transform: i < (pomodoroCount % 4) ? 'scale(1.2)' : 'scale(1)' }} />
              ))}
              <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>{pomodoroCount} completed today</span>
            </div>
          </div>

          {/* Settings */}
          <div className="card mt-5">
            <h3 className="font-bold mb-4">Timer Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(MODES).map(([key, m]) => (
                <div key={key}>
                  <label className="label">{m.label} (min)</label>
                  <input type="number" min="1" max="120" className="input-field"
                    value={customMins[key]}
                    onChange={e => {
                      const val = Math.max(1, Math.min(120, Number(e.target.value)));
                      setCustomMins(c => ({ ...c, [key]: val }));
                      if (mode === key && !running) setTimeLeft(val * 60);
                    }} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="label">Study Subject</label>
              <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)}>
                {['General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science', 'Economics'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Session log */}
        <div className="card">
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Session Log</h3>
          {sessions.length === 0 ? (
            <div className="text-center py-10">
              <RiTimeLine className="text-4xl mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sessions will appear here as you complete them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: s.mode === 'work' ? 'rgba(67,97,244,0.2)' : 'rgba(34,197,94,0.2)' }}>
                    {s.mode === 'work' ? '🍅' : '☕'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{MODES[s.mode].label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.subject} · {s.duration} min</p>
                  </div>
                  <RiCheckLine className="shrink-0 text-sm" style={{ color: '#22c55e' }} />
                </motion.div>
              ))}
            </div>
          )}

          {sessions.length > 0 && (
            <div className="mt-5 p-4 rounded-xl text-center" style={{ background: 'rgba(67,97,244,0.1)', border: '1px solid rgba(67,97,244,0.2)' }}>
              <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'Syne, sans-serif', color: '#6b8dfa' }}>
                {sessions.filter(s => s.mode === 'work').reduce((sum, s) => sum + s.duration, 0)} min
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>focused today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
