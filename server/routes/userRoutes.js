const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/tracking', authorize('head', 'admin'), userController.getUserTracking);
router.get('/', authorize('admin', 'head'), userController.getUsers);
router.get('/:id', userController.getUserById);

router.post(
  '/',
  authorize('admin'),
  [
    body('username').trim().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('fullName').trim().notEmpty(),
    body('role').isIn(['admin', 'head', 'officer', 'secretary']),
  ],
  userController.createUser
);

router.put('/:id', authorize('admin'), userController.updateUser);
router.patch('/:id/status', authorize('admin'), userController.updateStatus);
router.patch(
  '/:id/reset-password',
  authorize('admin'),
  [body('password').optional().isLength({ min: 6 })],
  userController.resetPassword
);

module.exports = router;
