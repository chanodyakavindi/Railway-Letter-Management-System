const multer = require('multer');
const { isAiScannable } = require('../utils/allowedUploads');

// In-memory upload used only for AI extraction (the file is sent to the
// vision model, not persisted). Accepts handwritten letter scans as PDF or
// common image formats (Sinhala or English).
const maxSize = (parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || 10) * 1024 * 1024;

const ALLOWED = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];

const fileFilter = (_req, file, cb) => {
  if (isAiScannable(file) || ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('AI scan accepts PDF or image files only'), false);
  }
};

const uploadScan = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSize },
  fileFilter,
});

module.exports = uploadScan;
