import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Layout      from './components/common/Layout';
import Dashboard   from './pages/Dashboard';
import Upload      from './pages/Upload';
import Summary     from './pages/Summary';
import Quiz        from './pages/Quiz';
import Flashcards  from './pages/Flashcards';
import Chatbot     from './pages/Chatbot';
import Planner     from './pages/Planner';
import Analytics   from './pages/Analytics';
import Profile     from './pages/Profile';
import Pomodoro    from './pages/Pomodoro';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Loading StudyAI...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#232742',
              color: '#f1f3ff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#232742' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#232742' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="upload"      element={<Upload />} />
            <Route path="summary"     element={<Summary />} />
            <Route path="quiz"        element={<Quiz />} />
            <Route path="flashcards"  element={<Flashcards />} />
            <Route path="chat"        element={<Chatbot />} />
            <Route path="planner"     element={<Planner />} />
            <Route path="analytics"   element={<Analytics />} />
            <Route path="pomodoro"    element={<Pomodoro />} />
            <Route path="profile"     element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
