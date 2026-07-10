const express = require('express');
const reminderController = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', reminderController.getReminders);
router.get('/summary', reminderController.getSummary);

module.exports = router;
