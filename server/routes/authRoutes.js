const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/login',
  [
    body('username').trim().notEmpty(),
    body('password').notEmpty(),
  ],
  authController.login
);

router.get('/me', protect, authController.me);
router.post('/logout', protect, authController.logout);

module.exports = router;
