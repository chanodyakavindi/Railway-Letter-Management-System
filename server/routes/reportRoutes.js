const express = require('express');
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/letters.csv', reportController.exportCSV);
router.get('/letters.pdf', reportController.exportPDF);

module.exports = router;
