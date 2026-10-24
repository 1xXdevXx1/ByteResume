const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

const upload = require('../middleware/upload');

router.get('/fetch-skills', jobController.fetchRoleSkillsFromWeb);
router.post('/upload', upload.single('file'), jobController.uploadJob);
router.post('/', jobController.createJob);
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
