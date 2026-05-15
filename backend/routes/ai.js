const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateFileSummary, explainTopic, generateRevision, summarizeYoutube } = require('../controllers/aiController');

router.use(protect);
router.post('/summary/:fileId', generateFileSummary);
router.post('/explain', explainTopic);
router.post('/revision/:fileId', generateRevision);
router.post('/youtube-summary/:fileId', summarizeYoutube);

module.exports = router;
