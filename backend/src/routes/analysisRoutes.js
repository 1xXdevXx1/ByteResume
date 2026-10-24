const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// Review 2 specified routes: POST /api/analyze/:resumeId, GET /api/analysis/:resumeId
router.post('/analyze/:resumeId', analysisController.analyzeResumeById);
router.get('/analysis/:resumeId', analysisController.getAnalysisByResumeId);
router.get('/users/:userId/analysis', analysisController.getUserAnalyses);

module.exports = router;
