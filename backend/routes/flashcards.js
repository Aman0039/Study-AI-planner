const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateFlashcardsFromFile, getFlashcardSets, getFlashcardSet, reviewCard, deleteFlashcardSet } = require('../controllers/flashcardController');

router.use(protect);
router.post('/generate/:fileId', generateFlashcardsFromFile);
router.get('/', getFlashcardSets);
router.get('/:id', getFlashcardSet);
router.patch('/:id/card/:cardIndex/review', reviewCard);
router.delete('/:id', deleteFlashcardSet);

module.exports = router;
