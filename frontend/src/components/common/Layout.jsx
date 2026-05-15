import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  RiDashboardLine, RiUploadCloud2Line, RiFileTextLine,
  RiQuestionLine, RiStackLine, RiChat3Line, RiCalendarLine,
  RiBarChartLine, RiTimeLine, RiUser3Line, RiLogoutBoxLine,
  RiMenuLine, RiCloseLine, RiBrainLine, RiMoonLine, RiSunLine
} from 'react-icons/ri';

const navItems = [
  { path: '/dashboard',  icon: RiDashboardLine,  label: 'Dashboard' },
  { path: '/upload',     icon: RiUploadCloud2Line,label: 'Upload Notes' },
  { path: '/summary',    icon: RiFileTextLine,    label: 'AI Summary' },
  { path: '/quiz',       icon: RiQuestionLine,    label: 'Quiz' },
  { path: '/flashcards', icon: RiStackLine,       label: 'Flashcards' },
  { path: '/chat',       icon: RiChat3Line,       label: 'AI Chatbot' },
  { path: '/planner',   icon: RiCalendarLine,    label: 'Study Planner' },
  { path: '/analytics',  icon: RiBarChartLine,    label: 'Analytics' },
  { path: '/pomodoro',   icon: RiTimeLine,        label: 'Pomodoro' },
  { path: '/profile',    icon: RiUser3Line,       label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4361f4, #6b8dfa)' }}>
          <RiBrainLine className="text-white text-lg" />
        </div>
        <span className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>StudyAI</span>
      </div>

      {/* User card */}
      <div className="mx-4 mb-4 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #4361f4, #9ab5fd)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>🔥 {user?.streak?.current || 0} day streak</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon className="text-lg shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 mt-4 space-y-0.5 shrink-0">
        <button onClick={toggleTheme} className="sidebar-link w-full">
          {darkMode ? <RiSunLine className="text-lg" /> : <RiMoonLine className="text-lg" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-400" style={{}}>
          <RiLogoutBoxLine className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 fixed inset-y-0 left-0 z-30"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden flex flex-col"
              style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <RiMenuLine className="text-xl" />
          </button>
          <div className="flex items-center gap-2">
            <RiBrainLine className="text-brand-400 text-xl" />
            <span className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>StudyAI</span>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            {darkMode ? <RiSunLine className="text-xl" /> : <RiMoonLine className="text-xl" />}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
