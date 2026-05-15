import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import FileSelector from '../components/common/FileSelector';
import {
  RiChat3Line, RiSendPlaneLine, RiLoader4Line, RiAddLine,
  RiDeleteBin6Line, RiFileLine, RiBrainLine
} from 'react-icons/ri';

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isUser ? 'text-white' : 'text-white'}`}
        style={{ background: isUser ? '#4361f4' : 'linear-gradient(135deg,#6b8dfa,#4361f4)' }}>
        {isUser ? '👤' : <RiBrainLine />}
      </div>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        style={{
          background: isUser ? '#4361f4' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border)',
          color: isUser ? 'white' : 'var(--text-primary)',
        }}>
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function Chatbot() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFiles, setShowFiles] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatAPI.getSessions()
      .then(({ data }) => setSessions(data.sessions || []))
      .finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async (chatId) => {
    try {
      const { data } = await chatAPI.getHistory(chatId);
      setMessages(data.chat.messages);
      setActiveChatId(chatId);
    } catch { toast.error('Failed to load chat.'); }
  };

  const newChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setSelectedFile(null);
    inputRef.current?.focus();
  };

  const deleteSession = async (e, chatId) => {
    e.stopPropagation();
    await chatAPI.delete(chatId);
    setSessions(s => s.filter(x => x._id !== chatId));
    if (activeChatId === chatId) newChat();
    toast.success('Chat deleted.');
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput('');
    setSending(true);

    const tempUserMsg = { role: 'user', content: userMsg, timestamp: new Date() };
    setMessages(m => [...m, tempUserMsg]);

    try {
      const { data } = await chatAPI.send({
        message: userMsg,
        chatId: activeChatId,
        fileId: selectedFile?._id
      });

      setMessages(m => [...m, data.message]);
      if (!activeChatId) {
        setActiveChatId(data.chatId);
        setSessions(s => [{ _id: data.chatId, title: data.title, updatedAt: new Date() }, ...s]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message.');
      setMessages(m => m.slice(0, -1));
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = [
    'Summarize the key concepts from this material',
    'What are the most important points to remember?',
    'Create 5 practice questions for me',
    'Explain this topic in simple terms',
  ];

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 shrink-0">
        <button onClick={newChat} className="btn-primary w-full flex items-center justify-center gap-2 mb-4 py-2.5 text-sm">
          <RiAddLine /> New Chat
        </button>

        {/* File context */}
        <div className="card p-3 mb-4">
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Context File</p>
          {selectedFile ? (
            <div className="flex items-center gap-2">
              <RiFileLine style={{ color: '#6b8dfa' }} className="shrink-0" />
              <p className="text-xs truncate flex-1">{selectedFile.originalName}</p>
              <button onClick={() => setSelectedFile(null)} className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setShowFiles(f => !f)} className="text-xs flex items-center gap-1" style={{ color: '#6b8dfa' }}>
              <RiFileLine /> Attach a file
            </button>
          )}
          {showFiles && !selectedFile && (
            <div className="mt-3">
              <FileSelector onSelect={(f) => { setSelectedFile(f); setShowFiles(false); }} selected={selectedFile} />
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto space-y-1">
          <p className="text-xs font-semibold mb-2 px-1 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Recent Chats</p>
          {loadingSessions ? (
            <div className="flex justify-center py-4"><RiLoader4Line className="animate-spin" style={{ color: 'var(--text-secondary)' }} /></div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>No chats yet</p>
          ) : sessions.map(s => (
            <div key={s._id} onClick={() => loadChat(s._id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-all ${activeChatId === s._id ? 'active' : ''}`}
              style={{
                background: activeChatId === s._id ? 'rgba(67,97,244,0.15)' : 'transparent',
                border: `1px solid ${activeChatId === s._id ? 'rgba(67,97,244,0.3)' : 'transparent'}`,
              }}>
              <RiChat3Line className="shrink-0 text-sm" style={{ color: activeChatId === s._id ? '#6b8dfa' : 'var(--text-secondary)' }} />
              <p className="text-xs flex-1 truncate">{s.title}</p>
              <button onClick={(e) => deleteSession(e, s._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                style={{ color: 'var(--text-secondary)' }}>
                <RiDeleteBin6Line className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col card p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4361f4,#6b8dfa)' }}>
            <RiBrainLine className="text-white text-sm" />
          </div>
          <div>
            <p className="font-bold text-sm">StudyAI Assistant</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {selectedFile ? `Context: ${selectedFile.originalName}` : 'Ask me anything about your study material'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div>
                <RiBrainLine className="text-5xl mx-auto mb-3" style={{ color: '#4361f4' }} />
                <p className="font-bold text-lg mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Ask me anything</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>I can help you understand concepts, solve doubts, and learn from your materials.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                {suggestions.map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    className="text-left p-3 rounded-xl text-xs leading-relaxed transition-all"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#4361f4'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6b8dfa,#4361f4)' }}>
                <RiBrainLine className="text-white text-sm" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#6b8dfa' }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-3 items-end">
            <textarea ref={inputRef} rows={1} className="input-field flex-1 resize-none"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
              placeholder="Ask a question about your study material..."
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              onKeyDown={handleKeyDown} />
            <button onClick={sendMessage} disabled={sending || !input.trim()}
              className="btn-primary p-3 shrink-0 disabled:opacity-50"
              style={{ borderRadius: '12px' }}>
              {sending ? <div className="spinner w-4 h-4" /> : <RiSendPlaneLine className="text-lg" />}
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
