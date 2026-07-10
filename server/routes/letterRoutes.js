const express = require('express');
const { body } = require('express-validator');
const letterController = require('../controllers/letterController');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/categories/list', protect, letterController.getCategories);

router.use(protect);

router.get('/', letterController.getLetters);
router.get('/:id', letterController.getLetterById);
router.get('/:id/download/:attachmentId', letterController.downloadAttachment);

router.post(
  '/',
  authorize('officer'),
  upload.single('pdf'),
  [
    body('title').trim().notEmpty(),
    body('dateReceived').notEmpty(),
  ],
  letterController.createLetter
);

router.put(
  '/:id',
  authorize('officer'),
  upload.single('pdf'),
  letterController.updateLetter
);

router.patch('/:id/status', letterController.updateStatus);
router.patch('/:id/reminder', authorize('officer'), letterController.updateReminder);

router.post(
  '/:id/replies',
  authorize('secretary'),
  upload.single('pdf'),
  [body('note').trim().notEmpty()],
  letterController.addReply
);

router.post(
  '/:id/upload',
  upload.single('pdf'),
  letterController.uploadPdf
);

router.delete('/:id', letterController.deleteLetter);

module.exports = router;
