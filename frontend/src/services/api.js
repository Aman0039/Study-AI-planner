import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// ─── Files ───────────────────────────────────────────────────────────────────
export const filesAPI = {
  upload:     (formData) => api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addYouTube: (data)     => api.post('/files/youtube', data),
  getAll:     (params)   => api.get('/files', { params }),
  getOne:     (id)       => api.get(`/files/${id}`),
  delete:     (id)       => api.delete(`/files/${id}`),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  summarize:        (fileId, data)  => api.post(`/ai/summary/${fileId}`, data),
  explain:          (data)          => api.post('/ai/explain', data),
  generateRevision: (fileId)        => api.post(`/ai/revision/${fileId}`),
  summarizeYoutube: (fileId)        => api.post(`/ai/youtube-summary/${fileId}`),
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export const quizAPI = {
  generate: (fileId, data)   => api.post(`/quiz/generate/${fileId}`, data),
  submit:   (quizId, data)   => api.post(`/quiz/${quizId}/submit`, data),
  getAll:   ()               => api.get('/quiz'),
  getOne:   (quizId)         => api.get(`/quiz/${quizId}`),
};

// ─── Flashcards ───────────────────────────────────────────────────────────────
export const flashcardsAPI = {
  generate:   (fileId, data) => api.post(`/flashcards/generate/${fileId}`, data),
  getAll:     ()             => api.get('/flashcards'),
  getOne:     (id)           => api.get(`/flashcards/${id}`),
  reviewCard: (id, cardIdx, data) => api.patch(`/flashcards/${id}/card/${cardIdx}/review`, data),
  delete:     (id)           => api.delete(`/flashcards/${id}`),
};

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chatAPI = {
  send:       (data)   => api.post('/chat', data),
  getSessions:()       => api.get('/chat'),
  getHistory: (chatId) => api.get(`/chat/${chatId}`),
  delete:     (chatId) => api.delete(`/chat/${chatId}`),
};

// ─── Study Planner ────────────────────────────────────────────────────────────
export const plannerAPI = {
  generate: (data) => api.post('/planner/generate', data),
  getAll:   ()     => api.get('/planner'),
  getOne:   (id)   => api.get(`/planner/${id}`),
  markSession: (id, dayIdx, sessionIdx) => api.patch(`/planner/${id}/session/${dayIdx}/${sessionIdx}`),
  delete:   (id)   => api.delete(`/planner/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  get:        ()     => api.get('/analytics'),
  logSession: (data) => api.post('/analytics/session', data),
};

export default api;
