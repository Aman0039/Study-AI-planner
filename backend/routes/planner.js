const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generatePlan, getPlans, getPlan, markSessionComplete, deletePlan } = require('../controllers/plannerController');

router.use(protect);
router.post('/generate', generatePlan);
router.get('/', getPlans);
router.get('/:id', getPlan);
router.patch('/:id/session/:dayIdx/:sessionIdx', markSessionComplete);
router.delete('/:id', deletePlan);

module.exports = router;
