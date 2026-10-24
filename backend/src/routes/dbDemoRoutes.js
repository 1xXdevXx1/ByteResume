const express = require('express');
const router = express.Router();
const dbDemoController = require('../controllers/dbDemoController');

router.get('/indexes', dbDemoController.getDatabaseIndexes);
router.get('/collections', dbDemoController.getCollectionStats);
router.get('/collections/:name', dbDemoController.getCollectionDocuments);
router.get('/cache-status', dbDemoController.getCacheStatus);
router.post('/cache-clear', dbDemoController.clearCache);

module.exports = router;
