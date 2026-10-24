const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.post('/', matchController.matchResumeToJob);
router.get('/', matchController.getAllMatches);
router.get('/:id', matchController.getMatchResultById);
router.get('/resume/:resumeId', matchController.getMatchesByResume);

module.exports = router;
