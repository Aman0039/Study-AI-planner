const UploadedFile = require('../models/UploadedFile');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const { generateQuiz } = require('../utils/gemini');

/**
 * @route   POST /api/quiz/generate/:fileId
 * @desc    Generate quiz from file
 */
const generateQuizFromFile = async (req, res) => {
  try {
    const { quizType = 'mcq', numQuestions = 10 } = req.body;
    const file = await UploadedFile.findOne({ _id: req.params.fileId, user: req.user.id });

    if (!file) return res.status(404).json({ error: 'File not found.' });
    if (!file.extractedText) return res.status(400).json({ error: 'No text content found in file.' });

    const questions = await generateQuiz(file.extractedText, quizType, Math.min(numQuestions, 20));

    const quiz = await QuizResult.create({
      user: req.user.id,
      sourceFile: file._id,
      title: `Quiz: ${file.originalName}`,
      subject: file.subject,
      quizType,
      questions: questions.map(q => ({
        question: q.question,
        type: q.type || quizType,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        userAnswer: null,
        isCorrect: false
      })),
      score: { obtained: 0, total: questions.length, percentage: 0 }
    });

    res.status(201).json({ quiz });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
  }
};

/**
 * @route   POST /api/quiz/:quizId/submit
 * @desc    Submit quiz answers
 */
const submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await QuizResult.findOne({ _id: req.params.quizId, user: req.user.id });

    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.completed) return res.status(400).json({ error: 'Quiz already submitted.' });

    let correct = 0;
    quiz.questions = quiz.questions.map((q, i) => {
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) correct++;
      return { ...q.toObject(), userAnswer, isCorrect };
    });

    quiz.score = {
      obtained: correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100)
    };
    quiz.timeTaken = timeTaken || 0;
    quiz.completed = true;
    await quiz.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.quizzesCompleted': 1 }
    });

    res.json({ quiz, message: `Quiz completed! Score: ${quiz.score.percentage}%` });
  } catch (error) {
    console.error('Quiz submit error:', error);
    res.status(500).json({ error: 'Failed to submit quiz.' });
  }
};

/**
 * @route   GET /api/quiz
 * @desc    Get all user quizzes
 */
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizResult.find({ user: req.user.id })
      .select('-questions')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
};

/**
 * @route   GET /api/quiz/:quizId
 * @desc    Get single quiz
 */
const getQuiz = async (req, res) => {
  try {
    const quiz = await QuizResult.findOne({ _id: req.params.quizId, user: req.user.id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz.' });
  }
};

module.exports = { generateQuizFromFile, submitQuiz, getQuizzes, getQuiz };
