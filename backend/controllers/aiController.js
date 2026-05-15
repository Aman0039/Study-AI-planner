const UploadedFile = require('../models/UploadedFile');
const {
  generateSummary,
  explainSimply,
  generateRevisionSheet,
  summarizeYouTubeContent
} = require('../utils/gemini');

/**
 * @route   POST /api/ai/summary/:fileId
 * @desc    Generate AI summary for a file
 */
const generateFileSummary = async (req, res) => {
  try {
    const { type = 'detailed' } = req.body;
    const file = await UploadedFile.findOne({ _id: req.params.fileId, user: req.user.id });

    if (!file) return res.status(404).json({ error: 'File not found.' });
    if (!file.extractedText) return res.status(400).json({ error: 'No text content found in file.' });

    const validTypes = ['short', 'detailed', 'bullets', 'keyConcepts'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid summary type.' });

    const result = await generateSummary(file.extractedText, type);

    // Cache summary in file document
    if (!file.summary) file.summary = {};
    if (type === 'bullets') file.summary.bullets = result;
    else if (type === 'keyConcepts') file.summary.keyConcepts = result;
    else if (type === 'short') file.summary.short = result;
    else file.summary.detailed = result;
    await file.save();

    res.json({ summary: result, type, fileId: file._id });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary. Please try again.' });
  }
};

/**
 * @route   POST /api/ai/explain
 * @desc    Explain Like I'm 10
 */
const explainTopic = async (req, res) => {
  try {
    const { topic, fileId } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required.' });

    let context = '';
    if (fileId) {
      const file = await UploadedFile.findOne({ _id: fileId, user: req.user.id });
      if (file) context = file.extractedText;
    }

    const explanation = await explainSimply(topic, context);
    res.json({ explanation, topic });
  } catch (error) {
    console.error('Explain error:', error);
    res.status(500).json({ error: 'Failed to generate explanation.' });
  }
};

/**
 * @route   POST /api/ai/revision/:fileId
 * @desc    Generate revision sheet
 */
const generateRevision = async (req, res) => {
  try {
    const file = await UploadedFile.findOne({ _id: req.params.fileId, user: req.user.id });
    if (!file) return res.status(404).json({ error: 'File not found.' });
    if (!file.extractedText) return res.status(400).json({ error: 'No text content found in file.' });

    const revisionSheet = await generateRevisionSheet(file.extractedText, file.subject);
    res.json({ revisionSheet, subject: file.subject });
  } catch (error) {
    console.error('Revision error:', error);
    res.status(500).json({ error: 'Failed to generate revision sheet.' });
  }
};

/**
 * @route   POST /api/ai/youtube-summary/:fileId
 * @desc    Summarize YouTube content
 */
const summarizeYoutube = async (req, res) => {
  try {
    const file = await UploadedFile.findOne({
      _id: req.params.fileId,
      user: req.user.id,
      fileType: 'youtube'
    });
    if (!file) return res.status(404).json({ error: 'YouTube file not found.' });

    const result = await summarizeYouTubeContent(file.extractedText, file.originalName);
    res.json({ result, fileId: file._id });
  } catch (error) {
    console.error('YouTube summary error:', error);
    res.status(500).json({ error: 'Failed to summarize YouTube video.' });
  }
};

module.exports = { generateFileSummary, explainTopic, generateRevision, summarizeYoutube };
