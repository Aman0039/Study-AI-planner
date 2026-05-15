import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { RiBarChartLine, RiLoader4Line, RiTrophyLine, RiFireLine, RiTimeLine, RiQuestionLine } from 'react-icons/ri';

const COLORS = ['#4361f4', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get().then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RiLoader4Line className="animate-spin text-3xl" style={{ color: 'var(--text-secondary)' }} />
    </div>
  );

  const weeklyData = data?.weeklyData || [];
  const totalWeeklyMins = weeklyData.reduce((s, d) => s + d.minutes, 0);
  const subjectStats = data?.subjectStats || [];
  const flashcardStats = data?.flashcardStats || [];
  const recentQuizzes = data?.recentQuizzes || [];
  const avgQuizScore = recentQuizzes.length
    ? Math.round(recentQuizzes.reduce((s, q) => s + q.score.percentage, 0) / recentQuizzes.length)
    : 0;

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Track your study progress, quiz performance, and learning patterns</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: RiTimeLine, label: 'Study Time This Week', value: `${Math.round(totalWeeklyMins / 60 * 10) / 10}h`, color: '#4361f4' },
          { icon: RiQuestionLine, label: 'Avg Quiz Score', value: `${avgQuizScore}%`, color: '#22c55e' },
          { icon: RiFireLine, label: 'Current Streak', value: `${user?.streak?.current || 0} days`, color: '#f59e0b' },
          { icon: RiTrophyLine, label: 'Best Streak', value: `${user?.streak?.longest || 0} days`, color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                <stat.icon style={{ color: stat.color }} className="text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Study Time */}
        <div className="card">
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Weekly Study Time</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Minutes studied per day this week</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361f4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4361f4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#4361f4" strokeWidth={2} fill="url(#studyGrad)" dot={{ r: 3, fill: '#4361f4' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz Performance */}
        <div className="card">
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Quiz Scores</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Performance on your last {recentQuizzes.length} quizzes</p>
          {recentQuizzes.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-sm" style={{ color: 'var(--text-secondary)' }}>No quizzes taken yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={recentQuizzes.map((q, i) => ({ name: `Q${i + 1}`, score: q.score.percentage, subject: q.subject }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Score %" radius={[6, 6, 0, 0]}>
                  {recentQuizzes.map((q, i) => (
                    <Cell key={i} fill={q.score.percentage >= 80 ? '#22c55e' : q.score.percentage >= 60 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject distribution */}
        <div className="card">
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Study Distribution</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Files uploaded per subject</p>
          {subjectStats.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-sm" style={{ color: 'var(--text-secondary)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={subjectStats} dataKey="files" nameKey="subject" cx="50%" cy="50%" outerRadius={80} label={({ subject, percent }) => `${subject} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {subjectStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Flashcard mastery */}
        <div className="card">
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Flashcard Mastery</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Cards mastered per subject</p>
          {flashcardStats.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-sm" style={{ color: 'var(--text-secondary)' }}>No flashcard data yet</div>
          ) : (
            <div className="space-y-4">
              {flashcardStats.map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium">{f.subject}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{f.mastered}/{f.total} cards ({f.percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${f.percentage}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overall stats */}
      <div className="card">
        <h3 className="font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Overall Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Files Uploaded', value: user?.stats?.filesUploaded || 0 },
            { label: 'Quizzes Completed', value: user?.stats?.quizzesCompleted || 0 },
            { label: 'Flashcards Reviewed', value: user?.stats?.flashcardsReviewed || 0 },
            { label: 'Total Study Sessions', value: data?.analytics?.studySessions?.length || 0 },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-extrabold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: COLORS[i] }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
