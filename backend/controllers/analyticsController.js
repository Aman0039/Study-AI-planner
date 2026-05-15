const Analytics = require('../models/Analytics');
const QuizResult = require('../models/QuizResult');
const UploadedFile = require('../models/UploadedFile');
const Flashcard = require('../models/Flashcard');

/**
 * @route   GET /api/analytics
 */
const getAnalytics = async (req, res) => {
  try {
    const [analytics, recentQuizzes, files, flashcards] = await Promise.all([
      Analytics.findOne({ user: req.user.id }),
      QuizResult.find({ user: req.user.id, completed: true })
        .select('subject score createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      UploadedFile.find({ user: req.user.id }).select('subject fileType createdAt'),
      Flashcard.find({ user: req.user.id }).select('subject totalCards masteredCards')
    ]);

    // Compute subject stats
    const subjectMap = {};
    files.forEach(f => {
      if (!subjectMap[f.subject]) subjectMap[f.subject] = { files: 0, quizAvg: 0, quizCount: 0 };
      subjectMap[f.subject].files++;
    });

    recentQuizzes.forEach(q => {
      if (!subjectMap[q.subject]) subjectMap[q.subject] = { files: 0, quizAvg: 0, quizCount: 0 };
      subjectMap[q.subject].quizAvg =
        (subjectMap[q.subject].quizAvg * subjectMap[q.subject].quizCount + q.score.percentage) /
        (subjectMap[q.subject].quizCount + 1);
      subjectMap[q.subject].quizCount++;
    });

    // Weekly study data (last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayLabel = date.toLocaleDateString('en', { weekday: 'short' });
      const sessions = analytics?.studySessions?.filter(s => {
        const sDate = new Date(s.date);
        return sDate.toDateString() === date.toDateString();
      }) || [];
      return {
        day: dayLabel,
        minutes: sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      };
    });

    res.json({
      analytics,
      recentQuizzes,
      subjectStats: Object.entries(subjectMap).map(([subject, data]) => ({ subject, ...data })),
      weeklyData,
      flashcardStats: flashcards.map(f => ({
        subject: f.subject,
        total: f.totalCards,
        mastered: f.masteredCards,
        percentage: f.totalCards ? Math.round((f.masteredCards / f.totalCards) * 100) : 0
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
};

/**
 * @route   POST /api/analytics/session
 */
const logStudySession = async (req, res) => {
  try {
    const { duration, subject, type } = req.body;
    if (!duration || duration <= 0) return res.status(400).json({ error: 'Valid duration required.' });

    await Analytics.findOneAndUpdate(
      { user: req.user.id },
      {
        $push: {
          studySessions: { date: new Date(), duration, subject: subject || 'General', type: type || 'reading' }
        }
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Study session logged!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log session.' });
  }
};

module.exports = { getAnalytics, logStudySession };
