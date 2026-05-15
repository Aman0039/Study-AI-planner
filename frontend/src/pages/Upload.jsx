import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { filesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  RiUploadCloud2Line, RiFilePdfLine, RiFileTextLine, RiYoutubeLine,
  RiDeleteBin6Line, RiCheckLine, RiCloseLine, RiAddLine
} from 'react-icons/ri';
import FileList from '../components/common/FileList';

export default function Upload() {
  const [tab, setTab] = useState('file'); // 'file' | 'youtube'
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [ytUrl, setYtUrl] = useState('');
  const [subject, setSubject] = useState('General');
  const [uploading, setUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const inputRef = useRef();

  const subjects = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science', 'Economics', 'Geography'];

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const validateAndSetFile = (f) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|txt)$/i)) {
      return toast.error('Only PDF and TXT files are supported.');
    }
    if (f.size > 10 * 1024 * 1024) return toast.error('File must be under 10MB.');
    setFile(f);
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (tab === 'file') {
        if (!file) return toast.error('Please select a file.');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('subject', subject);
        await filesAPI.upload(fd);
        toast.success('File uploaded and processed!');
        setFile(null);
      } else {
        if (!ytUrl) return toast.error('Please enter a YouTube URL.');
        await filesAPI.addYouTube({ url: ytUrl, subject });
        toast.success('YouTube video processed!');
        setYtUrl('');
      }
      setRefreshKey(k => k + 1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1>Upload Study Materials</h1>
        <p>Upload PDFs, text files, or YouTube videos to generate AI-powered learning tools</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Card */}
        <div className="card space-y-5">
          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            {[{ id: 'file', label: '📄 Upload File' }, { id: 'youtube', label: '▶️ YouTube' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t.id ? 'text-white shadow' : ''}`}
                style={tab === t.id ? { background: 'var(--accent)' } : { color: 'var(--text-secondary)' }}>
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'file' ? (
              <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Drop zone */}
                <div
                  onClick={() => inputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: dragOver ? '#4361f4' : 'var(--border)',
                    background: dragOver ? 'rgba(67,97,244,0.05)' : 'var(--bg-tertiary)',
                  }}>
                  <input ref={inputRef} type="file" className="hidden" accept=".pdf,.txt"
                    onChange={e => e.target.files[0] && validateAndSetFile(e.target.files[0])} />
                  {file ? (
                    <div className="flex items-center gap-3 justify-center">
                      {file.type === 'application/pdf' ? <RiFilePdfLine className="text-3xl text-red-400" /> : <RiFileTextLine className="text-3xl text-blue-400" />}
                      <div className="text-left">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-2 p-1 rounded" style={{ color: 'var(--text-secondary)' }}>
                        <RiCloseLine />
                      </button>
                    </div>
                  ) : (
                    <>
                      <RiUploadCloud2Line className="text-4xl mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                      <p className="font-medium mb-1">Drop your file here or click to browse</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>PDF, TXT up to 10MB</p>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="yt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-xl p-5" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <RiYoutubeLine className="text-3xl text-red-500" />
                    <div>
                      <p className="font-semibold text-sm">YouTube Transcript</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Video must have captions enabled</p>
                    </div>
                  </div>
                  <input type="url" className="input-field" placeholder="https://youtube.com/watch?v=..."
                    value={ytUrl} onChange={e => setYtUrl(e.target.value)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subject */}
          <div>
            <label className="label">Subject</label>
            <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {uploading ? (
              <><div className="spinner" /> Processing...</>
            ) : (
              <><RiUploadCloud2Line /> {tab === 'file' ? 'Upload & Process' : 'Extract Transcript'}</>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="card">
          <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Tips for best results</h3>
          <div className="space-y-4">
            {[
              { icon: '📄', title: 'Use clear PDFs', desc: 'Text-based PDFs work best. Scanned images may not extract properly.' },
              { icon: '📝', title: 'Organize your notes', desc: 'Well-structured content produces better AI summaries and quizzes.' },
              { icon: '▶️', title: 'YouTube captions', desc: 'Only videos with auto-generated or manual captions can be processed.' },
              { icon: '📏', title: 'File size limit', desc: 'Files must be under 10MB. Split large documents for better results.' },
              { icon: '🏷️', title: 'Tag your subject', desc: 'Selecting the right subject helps organize your learning materials.' },
            ].map(tip => (
              <div key={tip.title} className="flex gap-3">
                <span className="text-xl shrink-0">{tip.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{tip.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File List */}
      <FileList key={refreshKey} />
    </div>
  );
}
