import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { RiUser3Line, RiLockLine, RiSaveLine, RiFireLine, RiTrophyLine, RiBookLine, RiQuestionLine, RiStackLine } from 'react-icons/ri';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', preferences: user?.preferences || { theme: 'dark', pomodoroWork: 25, pomodoroBreak: 5 } });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error('Name is required.');
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally { setSavingProfile(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match.');
    if (passwordForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password.');
    } finally { setSavingPassword(false); }
  };

  const stats = [
    { icon: RiBookLine, label: 'Files Uploaded', value: user?.stats?.filesUploaded || 0, color: '#4361f4' },
    { icon: RiQuestionLine, label: 'Quizzes Done', value: user?.stats?.quizzesCompleted || 0, color: '#22c55e' },
    { icon: RiStackLine, label: 'Cards Reviewed', value: user?.stats?.flashcardsReviewed || 0, color: '#8b5cf6' },
    { icon: RiFireLine, label: 'Day Streak', value: user?.streak?.current || 0, color: '#f59e0b' },
    { icon: RiTrophyLine, label: 'Best Streak', value: user?.streak?.longest || 0, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="page-header">
        <h1>Profile & Settings</h1>
        <p>Manage your account details and preferences</p>
      </div>

      {/* Avatar + Stats */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg, #4361f4, #9ab5fd)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{user?.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <s.icon className="text-xl mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
              <p className="text-xs leading-tight" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl max-w-xs" style={{ background: 'var(--bg-tertiary)' }}>
        {[{ id: 'profile', icon: RiUser3Line, label: 'Profile' }, { id: 'security', icon: RiLockLine, label: 'Security' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: activeTab === t.id ? '#4361f4' : 'transparent', color: activeTab === t.id ? 'white' : 'var(--text-secondary)' }}>
            <t.icon /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h3 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Edit Profile</h3>
          <form onSubmit={saveProfile} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input-field" value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" value={user?.email} disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Theme Preference</label>
              <select className="input-field" value={profileForm.preferences?.theme || 'dark'}
                onChange={e => setProfileForm(f => ({ ...f, preferences: { ...f.preferences, theme: e.target.value } }))}>
                <option value="dark">🌙 Dark Mode</option>
                <option value="light">☀️ Light Mode</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Focus Duration (min)</label>
                <input type="number" className="input-field" min="5" max="60" value={profileForm.preferences?.pomodoroWork || 25}
                  onChange={e => setProfileForm(f => ({ ...f, preferences: { ...f.preferences, pomodoroWork: Number(e.target.value) } }))} />
              </div>
              <div>
                <label className="label">Break Duration (min)</label>
                <input type="number" className="input-field" min="1" max="30" value={profileForm.preferences?.pomodoroBreak || 5}
                  onChange={e => setProfileForm(f => ({ ...f, preferences: { ...f.preferences, pomodoroBreak: Number(e.target.value) } }))} />
              </div>
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
              {savingProfile ? <div className="spinner" /> : <RiSaveLine />} Save Changes
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h3 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Change Password</h3>
          <form onSubmit={changePassword} className="space-y-5">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input-field" placeholder="Min. 6 characters"
                value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input-field" placeholder="Repeat new password"
                value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} />
            </div>
            <button type="submit" disabled={savingPassword} className="btn-primary flex items-center gap-2">
              {savingPassword ? <div className="spinner" /> : <RiLockLine />} Change Password
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
