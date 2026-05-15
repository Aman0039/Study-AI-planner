const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateQuizFromFile, submitQuiz, getQuizzes, getQuiz } = require('../controllers/quizController');

router.use(protect);
router.post('/generate/:fileId', generateQuizFromFile);
router.post('/:quizId/submit', submitQuiz);
router.get('/', getQuizzes);
router.get('/:quizId', getQuiz);

module.exports = router;
