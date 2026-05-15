const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAnalytics, logStudySession } = require('../controllers/analyticsController');

router.use(protect);
router.get('/', getAnalytics);
router.post('/session', logStudySession);

module.exports = router;
