import { useState, useEffect } from 'react';
import { filesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { RiFilePdfLine, RiFileTextLine, RiYoutubeLine, RiDeleteBin6Line, RiLoader4Line } from 'react-icons/ri';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const { data } = await filesAPI.getAll();
      setFiles(data.files || []);
    } catch { toast.error('Failed to load files.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    try {
      await filesAPI.delete(id);
      setFiles(f => f.filter(x => x._id !== id));
      toast.success('File deleted.');
    } catch { toast.error('Failed to delete file.'); }
  };

  const FileIcon = ({ type }) => {
    if (type === 'pdf') return <RiFilePdfLine className="text-xl text-red-400" />;
    if (type === 'youtube') return <RiYoutubeLine className="text-xl text-red-500" />;
    return <RiFileTextLine className="text-xl text-blue-400" />;
  };

  if (loading) return (
    <div className="card flex items-center justify-center py-10">
      <RiLoader4Line className="animate-spin text-2xl" style={{ color: 'var(--text-secondary)' }} />
    </div>
  );

  if (files.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Your Files ({files.length})</h2>
      <div className="grid gap-3">
        {files.map(file => (
          <div key={file._id} className="card p-4 flex items-center gap-4">
            <FileIcon type={file.fileType} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.originalName}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{file.subject}</span>
                {file.metadata?.wordCount > 0 && (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{file.metadata.wordCount.toLocaleString()} words</span>
                )}
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(file.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <span className={`badge ${file.fileType === 'youtube' ? 'badge-red' : 'badge-blue'} shrink-0`}>
              {file.fileType?.toUpperCase()}
            </span>
            <button onClick={() => handleDelete(file._id)}
              className="p-2 rounded-lg transition-colors shrink-0"
              style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <RiDeleteBin6Line />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
