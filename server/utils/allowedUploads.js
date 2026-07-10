const path = require('path');

/** Document types allowed on letter/reply uploads (not AI scan-only uploads). */
const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.png', '.jpg', '.jpeg', '.webp', '.gif',
  '.doc', '.docx',
  '.xls', '.xlsx',
  '.csv',
  '.txt',
]);

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
  'text/plain',
  'application/octet-stream', // some browsers send this for xlsx/csv
]);

/** MIME types accepted for AI field extraction (vision). */
const AI_SCAN_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

function extname(name = '') {
  return path.extname(name).toLowerCase();
}

function isAllowedDocument(file) {
  if (!file) return false;
  const ext = extname(file.originalname || file.name || '');
  if (ALLOWED_EXTENSIONS.has(ext)) return true;
  return ALLOWED_MIME_TYPES.has(file.mimetype);
}

function isAiScannable(file) {
  if (!file) return false;
  const ext = extname(file.originalname || file.name || '');
  if (ext === '.pdf' || ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) return true;
  return AI_SCAN_MIME_TYPES.has(file.mimetype);
}

const ACCEPT_ATTR = [
  '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif',
  '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt',
  'application/pdf', 'image/*',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
].join(',');

module.exports = {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  AI_SCAN_MIME_TYPES,
  ACCEPT_ATTR,
  isAllowedDocument,
  isAiScannable,
};
