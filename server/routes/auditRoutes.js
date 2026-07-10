const express = require('express');
const auditController = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('head', 'officer', 'admin'));

router.get('/', auditController.getAuditLogs);

module.exports = router;
