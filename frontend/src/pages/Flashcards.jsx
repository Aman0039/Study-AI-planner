import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { flashcardsAPI } from '../services/api';
import toast from 'react-hot-toast';
import FileSelector from '../components/common/FileSelector';
import { RiStackLine, RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiCloseLine, RiLoader4Line, RiRefreshLine } from 'react-icons/ri';

function FlipCard({ card, index, total, onKnown, onUnknown, onNext, onPrev }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Card {index + 1} of {total}</p>
      {/* Card */}
      <div className="w-full max-w-lg" style={{ perspective: 1000, height: 280 }} onClick={() => setFlipped(f => !f)}>
        <motion.div className="relative w-full h-full cursor-pointer" style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="badge badge-blue mb-4">{card.difficulty?.toUpperCase()}</span>
            <p className="text-lg font-semibold leading-relaxed">{card.question}</p>
            <p className="text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>Click to reveal answer</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'rgba(67,97,244,0.1)', border: '1px solid rgba(67,97,244,0.4)' }}>
            <p className="text-base leading-relaxed">{card.answer}</p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={onPrev} disabled={index === 0} className="btn-secondary p-3 disabled:opacity-40">
          <RiArrowLeftLine />
        </button>
        <button onClick={() => { onUnknown(); setFlipped(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          <RiCloseLine /> Still Learning
        </button>
        <button onClick={() => { onKnown(); setFlipped(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
          <RiCheckLine /> Got It!
        </button>
        <button onClick={() => { onNext(); setFlipped(false); }} disabled={index === total - 1} className="btn-secondary p-3 disabled:opacity-40">
          <RiArrowRightLine />
        </button>
      </div>
    </div>
  );
}

export default function Flashcards() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [numCards, setNumCards] = useState(15);
  const [generating, setGenerating] = useState(false);
  const [sets, setSets] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [loadingSets, setLoadingSets] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'study' | 'generate'

  useEffect(() => {
    flashcardsAPI.getAll().then(({ data }) => setSets(data.sets || [])).finally(() => setLoadingSets(false));
  }, []);

  const generate = async () => {
    if (!selectedFile) return toast.error('Select a file.');
    setGenerating(true);
    try {
      const { data } = await flashcardsAPI.generate(selectedFile._id, { numCards });
      setSets(s => [data.flashcardSet, ...s]);
      toast.success(`${data.flashcardSet.totalCards} flashcards created!`);
      setView('list');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate flashcards.');
    } finally { setGenerating(false); }
  };

  const studySet = async (set) => {
    const { data } = await flashcardsAPI.getOne(set._id);
    setActiveSet(data.set); setCurrentCard(0); setView('study');
  };

  const handleReview = async (known) => {
    if (!activeSet) return;
    await flashcardsAPI.reviewCard(activeSet._id, currentCard, { known });
    setActiveSet(s => {
      const cards = [...s.cards];
      cards[currentCard] = { ...cards[currentCard], known };
      return { ...s, cards, masteredCards: cards.filter(c => c.known).length };
    });
  };

  if (view === 'study' && activeSet) {
    const card = activeSet.cards[currentCard];
    const mastered = activeSet.cards.filter(c => c.known).length;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="btn-secondary flex items-center gap-2 text-sm">
            <RiArrowLeftLine /> Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm badge badge-green">{mastered}/{activeSet.totalCards} mastered</span>
            <button onClick={() => { setCurrentCard(0); }} className="btn-secondary p-2"><RiRefreshLine /></button>
          </div>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-bold text-center mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>{activeSet.title}</h2>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full mb-8" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full rounded-full transition-all" style={{ background: '#22c55e', width: `${(mastered / activeSet.totalCards) * 100}%` }} />
          </div>
          <FlipCard card={card} index={currentCard} total={activeSet.cards.length}
            onKnown={() => handleReview(true)} onUnknown={() => handleReview(false)}
            onNext={() => setCurrentCard(c => Math.min(activeSet.cards.length - 1, c + 1))}
            onPrev={() => setCurrentCard(c => Math.max(0, c - 1))} />
        </div>
      </div>
    );
  }

  if (view === 'generate') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="btn-secondary flex items-center gap-2 text-sm">
            <RiArrowLeftLine /> Back
          </button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Generate Flashcards</h1>
        </div>
        <div className="card max-w-lg space-y-5">
          <div><label className="label">Select File</label><FileSelector onSelect={setSelectedFile} selected={selectedFile} /></div>
          <div>
            <label className="label">Number of Cards: {numCards}</label>
            <input type="range" min="5" max="30" value={numCards} onChange={e => setNumCards(Number(e.target.value))} className="w-full accent-brand-500" />
          </div>
          <button onClick={generate} disabled={generating || !selectedFile} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {generating ? <><div className="spinner" /> Generating...</> : <><RiStackLine /> Create Flashcards</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="page-header mb-0"><h1>Flashcard Sets</h1><p>AI-generated flashcards with spaced repetition</p></div>
        <button onClick={() => setView('generate')} className="btn-primary flex items-center gap-2">
          <RiStackLine /> New Set
        </button>
      </div>

      {loadingSets ? (
        <div className="card flex items-center justify-center py-12"><RiLoader4Line className="animate-spin text-2xl" style={{ color: 'var(--text-secondary)' }} /></div>
      ) : sets.length === 0 ? (
        <div className="card text-center py-16">
          <RiStackLine className="text-5xl mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="font-bold text-lg mb-2">No flashcard sets yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Generate your first set from your study material</p>
          <button onClick={() => setView('generate')} className="btn-primary">Create Flashcards</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sets.map(set => {
            const pct = set.totalCards ? Math.round((set.masteredCards / set.totalCards) * 100) : 0;
            return (
              <motion.div key={set._id} whileHover={{ y: -4 }} className="card cursor-pointer" onClick={() => studySet(set)}>
                <div className="flex items-start justify-between mb-3">
                  <RiStackLine className="text-2xl" style={{ color: '#6b8dfa' }} />
                  <span className="badge badge-blue">{set.subject}</span>
                </div>
                <h3 className="font-bold mb-1 leading-snug text-sm">{set.title}</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{set.totalCards} cards · {set.masteredCards} mastered</p>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="h-full rounded-full" style={{ background: '#22c55e', width: `${pct}%` }} />
                </div>
                <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-secondary)' }}>{pct}% done</p>
                <button className="btn-primary w-full mt-4 text-sm py-2">Study Now</button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
