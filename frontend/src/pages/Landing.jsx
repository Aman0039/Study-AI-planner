import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiBrainLine, RiArrowRightLine, RiCheckLine, RiFlashlightLine,
         RiFileTextLine, RiQuestionLine, RiStackLine, RiChat3Line, RiCalendarLine } from 'react-icons/ri';

const features = [
  { icon: RiFileTextLine,  title: 'AI Summaries',     desc: 'Get instant short, detailed, and bullet-point summaries of any study material.' },
  { icon: RiQuestionLine,  title: 'Smart Quizzes',    desc: 'Auto-generated MCQ, True/False, and fill-in-the-blank quizzes with scoring.' },
  { icon: RiStackLine,     title: 'Flashcards',       desc: 'Spaced-repetition flashcards generated directly from your notes.' },
  { icon: RiChat3Line,     title: 'AI Doubt Solver',  desc: 'Context-aware chatbot that answers questions from your uploaded material.' },
  { icon: RiCalendarLine,  title: 'Study Planner',    desc: 'Personalized AI-generated timetables based on your exam date and availability.' },
  { icon: RiFlashlightLine,title: 'Explain Simply',   desc: '"Explain Like I\'m 10" — turn complex topics into beginner-friendly explanations.' },
];

const stats = [
  { value: '10x', label: 'Faster Learning' },
  { value: '95%', label: 'Student Satisfaction' },
  { value: '50+', label: 'AI Features' },
  { value: '∞',   label: 'Study Sessions' },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between glass"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4361f4, #6b8dfa)' }}>
            <RiBrainLine className="text-white" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>StudyAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#4361f4' }} />
        <div className="absolute top-40 right-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: '#9ab5fd' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
            style={{ background: 'rgba(67,97,244,0.15)', border: '1px solid rgba(67,97,244,0.3)', color: '#6b8dfa' }}>
            <RiFlashlightLine /> Powered by Gemini AI
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Study Smarter,<br />
            <span className="gradient-text">Not Harder.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            Upload your notes, PDFs, or YouTube videos. Let AI generate summaries, quizzes,
            flashcards, and personalized study plans instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              Start Learning Free <RiArrowRightLine />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }} className="card text-center">
              <div className="text-4xl font-extrabold gradient-text mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Everything you need to <span className="gradient-text">ace your exams</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Powered by Google Gemini AI for intelligent, context-aware learning tools.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }} whileHover={{ y: -4 }}
                className="card group cursor-default"
                style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(67,97,244,0.15)' }}>
                  <f.icon className="text-2xl" style={{ color: '#6b8dfa' }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card glow-border p-10">
            <RiBrainLine className="text-5xl mx-auto mb-4" style={{ color: '#6b8dfa' }} />
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Ready to transform your studying?
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of students using AI to study smarter. No credit card required.
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              Get Started Free <RiArrowRightLine />
            </Link>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {['No credit card', 'Free forever', 'Cancel anytime'].map(t => (
                <span key={t} className="flex items-center gap-1">
                  <RiCheckLine style={{ color: '#22c55e' }} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <RiBrainLine style={{ color: '#6b8dfa' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>StudyAI</span>
        </div>
        <p>© {new Date().getFullYear()} StudyAI. Built with ❤️ and Gemini AI.</p>
      </footer>
    </div>
  );
}
