const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlan } = require('../utils/gemini');

/**
 * @route   POST /api/planner/generate
 */
const generatePlan = async (req, res) => {
  try {
    const { title, examDate, subjects, availableHoursPerDay } = req.body;

    if (!examDate || !subjects?.length || !availableHoursPerDay) {
      return res.status(400).json({ error: 'Exam date, subjects, and available hours are required.' });
    }

    if (new Date(examDate) <= new Date()) {
      return res.status(400).json({ error: 'Exam date must be in the future.' });
    }

    const aiPlan = await generateStudyPlan(subjects, examDate, availableHoursPerDay);

    const plan = await StudyPlan.create({
      user: req.user.id,
      title: title || `Study Plan - ${new Date(examDate).toLocaleDateString()}`,
      examDate,
      subjects,
      availableHoursPerDay,
      schedule: aiPlan.schedule?.map(day => ({
        date: new Date(day.date || Date.now()),
        day: day.day,
        sessions: day.sessions || [],
        totalHours: day.totalHours || 0
      })) || [],
      tips: aiPlan.tips || []
    });

    res.status(201).json({ plan, overview: aiPlan.overview, weeklyGoals: aiPlan.weeklyGoals });
  } catch (error) {
    console.error('Study plan error:', error);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
};

/**
 * @route   GET /api/planner
 */
const getPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ plans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study plans.' });
  }
};

/**
 * @route   GET /api/planner/:id
 */
const getPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ error: 'Study plan not found.' });
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study plan.' });
  }
};

/**
 * @route   PATCH /api/planner/:id/session/:dayIdx/:sessionIdx
 */
const markSessionComplete = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ error: 'Study plan not found.' });

    const { dayIdx, sessionIdx } = req.params;
    if (plan.schedule[dayIdx]?.sessions[sessionIdx]) {
      plan.schedule[dayIdx].sessions[sessionIdx].completed = true;
      await plan.save();
    }

    res.json({ message: 'Session marked as complete!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session.' });
  }
};

/**
 * @route   DELETE /api/planner/:id
 */
const deletePlan = async (req, res) => {
  try {
    await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Study plan deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete study plan.' });
  }
};

module.exports = { generatePlan, getPlans, getPlan, markSessionComplete, deletePlan };
