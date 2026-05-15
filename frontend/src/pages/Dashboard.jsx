import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { filesAPI, analyticsAPI } from '../services/api';
import {
  RiUploadCloud2Line, RiFileTextLine, RiQuestionLine, RiStackLine,
  RiChat3Line, RiCalendarLine, RiFlashlightLine, RiTimeLine,
  RiArrowRightLine, RiFireLine, RiBookLine, RiTrophyLine
} from 'react-icons/ri';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const quickActions = [
  { path: '/upload',    icon: RiUploadCloud2Line, label: 'Upload Notes',   color: '#4361f4' },
  { path: '/summary',  icon: RiFileTextLine,     label: 'AI Summary',     color: '#22c55e' },
  { path: '/quiz',     icon: RiQuestionLine,     label: 'Take a Quiz',    color: '#f59e0b' },
  { path: '/flashcards',icon: RiStackLine,       label: 'Flashcards',     color: '#8b5cf6' },
  { path: '/chat',     icon: RiChat3Line,        label: 'Ask AI',         color: '#ec4899' },
  { path: '/planner',  icon: RiCalendarLine,     label: 'Study Planner',  color: '#06b6d4' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.get().catch(() => null),
      filesAPI.getAll({ limit: 5 }).catch(() => null)
    ]).then(([analyticsRes, filesRes]) => {
      if (analyticsRes) setAnalytics(analyticsRes.data);
      if (filesRes) setRecentFiles(filesRes.data.files || []);
    }).finally(() => setLoading(false));
  }, []);

  const weeklyData = analytics?.weeklyData || Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], minutes: 0
  }));

  const totalMinutesThisWeek = weeklyData.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Ready to learn something new today?
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <RiFireLine style={{ color: '#f59e0b' }} className="text-xl" />
            <div>
              <p className="text-lg font-bold leading-none">{user?.streak?.current || 0}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Day Streak</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: RiBookLine, label: 'Files Uploaded', value: user?.stats?.filesUploaded || 0, color: '#4361f4' },
          { icon: RiQuestionLine, label: 'Quizzes Done', value: user?.stats?.quizzesCompleted || 0, color: '#22c55e' },
          { icon: RiStackLine, label: 'Cards Reviewed', value: user?.stats?.flashcardsReviewed || 0, color: '#8b5cf6' },
          { icon: RiTimeLine, label: 'Mins This Week', value: totalMinutesThisWeek, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}20` }}>
                <stat.icon style={{ color: stat.color }} className="text-xl" />
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
            <p className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions + Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ path, icon: Icon, label, color }) => (
              <Link key={path} to={path}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="card p-4 flex flex-col gap-3 cursor-pointer group"
                  style={{ transition: 'border-color 0.2s' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}20` }}>
                    <Icon style={{ color }} className="text-xl" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{label}</span>
                    <RiArrowRightLine style={{ color: 'var(--text-secondary)' }} className="text-sm group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card">
          <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Weekly Study Time</h2>
          <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>{Math.round(totalMinutesThisWeek / 60 * 10) / 10} hours this week</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361f4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4361f4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v} min`, 'Study Time']} />
              <Area type="monotone" dataKey="minutes" stroke="#4361f4" strokeWidth={2}
                fill="url(#colorMins)" dot={{ fill: '#4361f4', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Files */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Files</h2>
          <Link to="/upload" className="text-sm font-medium flex items-center gap-1" style={{ color: '#6b8dfa' }}>
            View all <RiArrowRightLine />
          </Link>
        </div>
        {loading ? (
          <div className="card flex items-center justify-center py-10">
            <div className="spinner" style={{ borderTopColor: '#4361f4', borderColor: '#4361f4/30' }} />
          </div>
        ) : recentFiles.length === 0 ? (
          <div className="card text-center py-12">
            <RiUploadCloud2Line className="text-4xl mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
            <p className="font-medium mb-1">No files yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Upload your first study material to get started</p>
            <Link to="/upload" className="btn-primary inline-flex items-center gap-2 text-sm">
              <RiUploadCloud2Line /> Upload Now
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentFiles.map(file => (
              <div key={file._id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(67,97,244,0.15)' }}>
                  <RiFileTextLine style={{ color: '#6b8dfa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.originalName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {file.subject} · {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${file.fileType === 'youtube' ? 'badge-red' : 'badge-blue'}`}>
                  {file.fileType?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
