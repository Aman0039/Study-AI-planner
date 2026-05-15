import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { plannerAPI } from '../services/api';
import toast from 'react-hot-toast';
import { RiCalendarLine, RiAddLine, RiDeleteBin6Line, RiCheckLine, RiLoader4Line, RiTimeLine, RiBookLine } from 'react-icons/ri';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

function PlanCard({ plan, onDelete, onMarkSession }) {
  const totalSessions = plan.schedule?.reduce((sum, d) => sum + (d.sessions?.length || 0), 0) || 0;
  const completedSessions = plan.schedule?.reduce((sum, d) => sum + (d.sessions?.filter(s => s.completed)?.length || 0), 0) || 0;
  const progress = totalSessions ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const daysLeft = Math.ceil((new Date(plan.examDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="card space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{plan.title}</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Exam: {new Date(plan.examDate).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${daysLeft <= 7 ? 'badge-red' : daysLeft <= 14 ? 'badge-amber' : 'badge-green'}`}>
            {daysLeft > 0 ? `${daysLeft}d left` : 'Exam day!'}
          </span>
          <button onClick={() => onDelete(plan._id)} className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <RiDeleteBin6Line />
          </button>
        </div>
      </div>

      {/* Subjects */}
      <div className="flex flex-wrap gap-2">
        {plan.subjects?.map((s, i) => (
          <span key={i} className="badge text-xs" style={{ background: `${PRIORITY_COLORS[s.priority]}20`, color: PRIORITY_COLORS[s.priority] }}>
            {s.name} · {s.priority}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          <span>{completedSessions}/{totalSessions} sessions completed</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
          <motion.div className="h-full rounded-full" style={{ background: '#4361f4' }}
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Schedule</h4>
        {plan.schedule?.slice(0, 3).map((day, dayIdx) => (
          <div key={dayIdx} className="rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#6b8dfa' }}>{day.day}</p>
            <div className="space-y-1.5">
              {day.sessions?.map((session, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <button onClick={() => onMarkSession(plan._id, dayIdx, sIdx)}
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${session.completed ? 'bg-green-500' : ''}`}
                    style={{ border: `2px solid ${session.completed ? '#22c55e' : 'var(--border)'}` }}>
                    {session.completed && <RiCheckLine className="text-white text-xs" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${session.completed ? 'line-through opacity-50' : ''}`}>{session.topic || session.subject}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{session.subject} · {session.duration} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {(plan.schedule?.length || 0) > 3 && (
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>+{plan.schedule.length - 3} more days</p>
        )}
      </div>

      {/* Tips */}
      {plan.tips?.length > 0 && (
        <div className="p-3 rounded-xl" style={{ background: 'rgba(67,97,244,0.08)', border: '1px solid rgba(67,97,244,0.2)' }}>
          <p className="text-xs font-bold mb-2" style={{ color: '#6b8dfa' }}>💡 AI Tips</p>
          <ul className="space-y-1">
            {plan.tips.slice(0, 3).map((tip, i) => <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Planner() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', examDate: '', availableHoursPerDay: 4,
    subjects: [{ name: '', priority: 'medium', hoursNeeded: 5 }]
  });

  useEffect(() => {
    plannerAPI.getAll().then(({ data }) => setPlans(data.plans || [])).finally(() => setLoading(false));
  }, []);

  const addSubject = () => setForm(f => ({ ...f, subjects: [...f.subjects, { name: '', priority: 'medium', hoursNeeded: 5 }] }));
  const removeSubject = (i) => setForm(f => ({ ...f, subjects: f.subjects.filter((_, idx) => idx !== i) }));
  const updateSubject = (i, field, val) => setForm(f => ({
    ...f, subjects: f.subjects.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
  }));

  const generate = async (e) => {
    e.preventDefault();
    if (!form.examDate) return toast.error('Exam date is required.');
    if (form.subjects.some(s => !s.name.trim())) return toast.error('All subjects need a name.');
    setGenerating(true);
    try {
      const { data } = await plannerAPI.generate(form);
      setPlans(p => [data.plan, ...p]);
      toast.success('Study plan generated!');
      setShowForm(false);
      setForm({ title: '', examDate: '', availableHoursPerDay: 4, subjects: [{ name: '', priority: 'medium', hoursNeeded: 5 }] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate plan.');
    } finally { setGenerating(false); }
  };

  const deletePlan = async (id) => {
    await plannerAPI.delete(id);
    setPlans(p => p.filter(x => x._id !== id));
    toast.success('Plan deleted.');
  };

  const markSession = async (planId, dayIdx, sessionIdx) => {
    await plannerAPI.markSession(planId, dayIdx, sessionIdx);
    setPlans(p => p.map(plan => {
      if (plan._id !== planId) return plan;
      const schedule = plan.schedule.map((day, di) => di !== dayIdx ? day : {
        ...day, sessions: day.sessions.map((s, si) => si !== sessionIdx ? s : { ...s, completed: true })
      });
      return { ...plan, schedule };
    }));
    toast.success('Session completed! ✅');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1>Study Planner</h1>
          <p>AI-generated personalized timetables based on your exam date and availability</p>
        </div>
        <button onClick={() => setShowForm(f => !f)} className="btn-primary flex items-center gap-2">
          <RiAddLine /> {showForm ? 'Cancel' : 'New Plan'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Generate Study Plan</h2>
          <form onSubmit={generate} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Plan Title (optional)</label>
                <input type="text" className="input-field" placeholder="e.g. Final Exam Prep"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Exam Date *</label>
                <input type="date" className="input-field" required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Available Study Hours Per Day: {form.availableHoursPerDay}h</label>
              <input type="range" min="1" max="12" value={form.availableHoursPerDay}
                onChange={e => setForm(f => ({ ...f, availableHoursPerDay: Number(e.target.value) }))}
                className="w-full accent-brand-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0">Subjects *</label>
                <button type="button" onClick={addSubject} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                  <RiAddLine /> Add Subject
                </button>
              </div>
              <div className="space-y-3">
                {form.subjects.map((s, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 items-start p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <div>
                      <label className="label">Name</label>
                      <input type="text" className="input-field" placeholder="Subject name" required
                        value={s.name} onChange={e => updateSubject(i, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Priority</label>
                      <select className="input-field" value={s.priority} onChange={e => updateSubject(i, 'priority', e.target.value)}>
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Hours Needed</label>
                      <div className="flex gap-2">
                        <input type="number" className="input-field" min="1" max="100"
                          value={s.hoursNeeded} onChange={e => updateSubject(i, 'hoursNeeded', Number(e.target.value))} />
                        {form.subjects.length > 1 && (
                          <button type="button" onClick={() => removeSubject(i)} className="shrink-0 p-2 rounded-lg" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
                            <RiDeleteBin6Line />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={generating} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {generating ? <><div className="spinner" /> Generating AI Plan...</> : <><RiCalendarLine /> Generate Study Plan</>}
            </button>
          </form>
        </motion.div>
      )}

      {/* Plans */}
      {loading ? (
        <div className="card flex items-center justify-center py-12"><RiLoader4Line className="animate-spin text-2xl" style={{ color: 'var(--text-secondary)' }} /></div>
      ) : plans.length === 0 && !showForm ? (
        <div className="card text-center py-16">
          <RiCalendarLine className="text-5xl mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="font-bold text-lg mb-2">No study plans yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Create an AI-powered study plan tailored to your exam schedule</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create Study Plan</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {plans.map(plan => (
            <PlanCard key={plan._id} plan={plan} onDelete={deletePlan} onMarkSession={markSession} />
          ))}
        </div>
      )}
    </div>
  );
}
