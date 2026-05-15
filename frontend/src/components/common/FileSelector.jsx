import { useState, useEffect } from 'react';
import { filesAPI } from '../../services/api';
import { RiFilePdfLine, RiFileTextLine, RiYoutubeLine, RiLoader4Line } from 'react-icons/ri';

export default function FileSelector({ onSelect, selected, filter }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filesAPI.getAll({ limit: 50 })
      .then(({ data }) => {
        let f = data.files || [];
        if (filter) f = f.filter(filter);
        setFiles(f);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
      <RiLoader4Line className="animate-spin" /> Loading files...
    </div>
  );

  if (files.length === 0) return (
    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No files found. Upload a file first.</p>
  );

  const Icon = ({ type }) => {
    if (type === 'pdf') return <RiFilePdfLine className="text-red-400 shrink-0" />;
    if (type === 'youtube') return <RiYoutubeLine className="text-red-500 shrink-0" />;
    return <RiFileTextLine className="text-blue-400 shrink-0" />;
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
      {files.map(file => (
        <button key={file._id} onClick={() => onSelect(file)}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
          style={{
            background: selected?._id === file._id ? 'rgba(67,97,244,0.15)' : 'var(--bg-tertiary)',
            border: `1px solid ${selected?._id === file._id ? '#4361f4' : 'transparent'}`,
            color: 'var(--text-primary)',
          }}>
          <Icon type={file.fileType} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{file.originalName}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{file.subject}</p>
          </div>
          {selected?._id === file._id && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#4361f4' }}>
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
