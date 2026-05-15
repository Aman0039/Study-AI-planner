const UploadedFile = require('../models/UploadedFile');
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');
const { generateFlashcards } = require('../utils/gemini');

/**
 * @route   POST /api/flashcards/generate/:fileId
 */
const generateFlashcardsFromFile = async (req, res) => {
  try {
    const { numCards = 15 } = req.body;
    const file = await UploadedFile.findOne({ _id: req.params.fileId, user: req.user.id });

    if (!file) return res.status(404).json({ error: 'File not found.' });
    if (!file.extractedText) return res.status(400).json({ error: 'No text content in file.' });

    const cards = await generateFlashcards(file.extractedText, Math.min(numCards, 30));

    const flashcardSet = await Flashcard.create({
      user: req.user.id,
      sourceFile: file._id,
      title: `Flashcards: ${file.originalName}`,
      subject: file.subject,
      cards: cards.map(c => ({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty || 'medium'
      })),
      totalCards: cards.length
    });

    res.status(201).json({ flashcardSet });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards.' });
  }
};

/**
 * @route   GET /api/flashcards
 */
const getFlashcardSets = async (req, res) => {
  try {
    const sets = await Flashcard.find({ user: req.user.id })
      .select('-cards')
      .sort({ createdAt: -1 });
    res.json({ sets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcard sets.' });
  }
};

/**
 * @route   GET /api/flashcards/:id
 */
const getFlashcardSet = async (req, res) => {
  try {
    const set = await Flashcard.findOne({ _id: req.params.id, user: req.user.id });
    if (!set) return res.status(404).json({ error: 'Flashcard set not found.' });
    res.json({ set });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcard set.' });
  }
};

/**
 * @route   PATCH /api/flashcards/:id/card/:cardIndex/review
 */
const reviewCard = async (req, res) => {
  try {
    const { known } = req.body;
    const set = await Flashcard.findOne({ _id: req.params.id, user: req.user.id });
    if (!set) return res.status(404).json({ error: 'Flashcard set not found.' });

    const cardIndex = parseInt(req.params.cardIndex);
    if (cardIndex < 0 || cardIndex >= set.cards.length) {
      return res.status(400).json({ error: 'Invalid card index.' });
    }

    set.cards[cardIndex].known = known;
    set.cards[cardIndex].reviewCount += 1;
    set.cards[cardIndex].lastReviewed = new Date();
    set.masteredCards = set.cards.filter(c => c.known).length;
    await set.save();

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.flashcardsReviewed': 1 }
    });

    res.json({ message: 'Card reviewed!', card: set.cards[cardIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update card review.' });
  }
};

/**
 * @route   DELETE /api/flashcards/:id
 */
const deleteFlashcardSet = async (req, res) => {
  try {
    await Flashcard.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Flashcard set deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete flashcard set.' });
  }
};

module.exports = { generateFlashcardsFromFile, getFlashcardSets, getFlashcardSet, reviewCard, deleteFlashcardSet };
