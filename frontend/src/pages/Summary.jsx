import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import FileSelector from '../components/common/FileSelector';
import {
  RiFileTextLine, RiListCheck, RiLightbulbLine, RiMagicLine,
  RiCopyleftLine, RiLoader4Line, RiBrainLine
} from 'react-icons/ri';

const summaryTypes = [
  { id: 'short', label: 'Short Summary', icon: RiFileTextLine, desc: '3-5 sentence overview' },
  { id: 'detailed', label: 'Detailed Summary', icon: RiMagicLine, desc: 'Comprehensive breakdown' },
  { id: 'bullets', label: 'Bullet Points', icon: RiListCheck, desc: 'Key points as bullets' },
  { id: 'keyConcepts', label: 'Key Concepts', icon: RiLightbulbLine, desc: 'Important terms & definitions' },
];

export default function Summary() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [summaryType, setSummaryType] = useState('detailed');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explainTopic, setExplainTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  const generateSummary = async () => {
    if (!selectedFile) return toast.error('Select a file first.');
    setLoading(true); setResult(null);
    try {
      const { data } = await aiAPI.summarize(selectedFile._id, { type: summaryType });
      setResult({ type: summaryType, content: data.summary });
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate summary.');
    } finally { setLoading(false); }
  };

  const generateExplanation = async () => {
    if (!explainTopic.trim()) return toast.error('Enter a topic.');
    setExplainLoading(true); setExplanation('');
    try {
      const { data } = await aiAPI.explain({ topic: explainTopic, fileId: selectedFile?._id });
      setExplanation(data.explanation);
      toast.success('Explanation ready!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.');
    } finally { setExplainLoading(false); }
  };

  const renderSummaryContent = () => {
    if (!result) return null;
    if (result.type === 'bullets' && Array.isArray(result.content)) {
      return (
        <ul className="space-y-2">
          {result.content.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: '#4361f4' }} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (result.type === 'keyConcepts' && Array.isArray(result.content)) {
      return (
        <div className="space-y-3">
          {result.content.map((item, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <p className="font-semibold text-sm mb-1" style={{ color: '#6b8dfa' }}>
                {item.concept || item}
              </p>
              {item.definition && <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.definition}</p>}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="ai-content text-sm leading-relaxed whitespace-pre-wrap">{result.content}</div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1>AI Summary Generator</h1>
        <p>Generate intelligent summaries, bullet points, and key concepts from your study material</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="space-y-5">
          {/* File selector */}
          <div className="card">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Select File</h3>
            <FileSelector onSelect={setSelectedFile} selected={selectedFile} />
          </div>

          {/* Summary type */}
          <div className="card">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Summary Type</h3>
            <div className="space-y-2">
              {summaryTypes.map(type => (
                <button key={type.id} onClick={() => setSummaryType(type.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    background: summaryType === type.id ? 'rgba(67,97,244,0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${summaryType === type.id ? '#4361f4' : 'transparent'}`,
                  }}>
                  <type.icon style={{ color: summaryType === type.id ? '#6b8dfa' : 'var(--text-secondary)' }} className="text-lg shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateSummary} disabled={loading || !selectedFile}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><div className="spinner" /> Generating...</> : <><RiBrainLine /> Generate Summary</>}
          </button>
        </div>

        {/* Result */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card min-h-64">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                {result ? summaryTypes.find(t => t.id === result.type)?.label : 'Summary'}
              </h3>
              {result && (
                <button onClick={() => navigator.clipboard.writeText(typeof result.content === 'string' ? result.content : JSON.stringify(result.content))}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                  <RiCopyleftLine /> Copy
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analyzing your material with Gemini AI...</p>
              </div>
            ) : result ? renderSummaryContent() : (
              <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--text-secondary)' }}>
                <RiFileTextLine className="text-4xl" />
                <p className="text-sm">Select a file and generate a summary</p>
              </div>
            )}
          </div>

          {/* ELI5 */}
          <div className="card">
            <h3 className="font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>💡 Explain Like I'm 10</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Turn any complex topic into a simple, beginner-friendly explanation</p>
            <div className="flex gap-2">
              <input type="text" className="input-field" placeholder="Enter a topic to explain simply..."
                value={explainTopic} onChange={e => setExplainTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateExplanation()} />
              <button onClick={generateExplanation} disabled={explainLoading}
                className="btn-primary px-4 shrink-0 flex items-center gap-2">
                {explainLoading ? <div className="spinner" /> : <RiLightbulbLine />}
              </button>
            </div>
            {explanation && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl text-sm leading-relaxed ai-content"
                style={{ background: 'var(--bg-tertiary)' }}>
                {explanation}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
