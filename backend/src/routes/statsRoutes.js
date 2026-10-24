const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Review 2 mandatory aggregation endpoints
router.get('/ats', statsController.getAvgAtsScore);
router.get('/missing-skills', statsController.getMissingSkillsStats);
router.get('/job-matches', statsController.getJobMatchByTitleStats);
router.get('/job-match-summary', statsController.getAvgJobMatch);
router.get('/activity', statsController.getActivityStats);
router.get('/dashboard', statsController.getDashboardStats);
router.get('/user/:userId/ats-history', statsController.getUserAtsHistory);

module.exports = router;
