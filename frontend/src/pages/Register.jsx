import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RiBrainLine, RiEyeLine, RiEyeOffLine, RiArrowRightLine, RiCheckLine } from 'react-icons/ri';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to StudyAI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const perks = ['AI-powered summaries & quizzes', 'Smart flashcard system', 'Personalized study plans'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-20 right-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: '#4361f4' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4361f4,#6b8dfa)' }}>
              <RiBrainLine className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Create account</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Join thousands of AI-powered learners</p>
            </div>
          </div>

          <div className="mb-6 p-3 rounded-xl space-y-1.5" style={{ background: 'var(--bg-tertiary)' }}>
            {perks.map(p => (
              <div key={p} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <RiCheckLine style={{ color: '#22c55e' }} className="shrink-0" /> {p}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input-field" placeholder="John Doe"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-10" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                  {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <div className="spinner" /> : (<>Create Free Account <RiArrowRightLine /></>)}
            </button>
          </form>

          <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#6b8dfa' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
