const express = require('express');
const aiController = require('../controllers/aiController');
const uploadScan = require('../middleware/uploadScan');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Only officers register letters, so only they need field extraction.
router.post('/extract', authorize('officer'), uploadScan.single('file'), aiController.extractLetter);

module.exports = router;
