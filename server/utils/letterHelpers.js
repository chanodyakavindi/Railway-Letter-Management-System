const Letter = require('../models/Letter');

async function generateLetterId() {
  const year = new Date().getFullYear();
  const prefix = `RLY-${year}-`;
  const last = await Letter.findOne({ letterId: new RegExp(`^${prefix}`) })
    .sort({ letterId: -1 })
    .select('letterId')
    .lean();

  let nextNum = 1;
  if (last?.letterId) {
    const parts = last.letterId.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(num)) nextNum = num + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function computeReminderStatus(letter) {
  if (letter.status === 'Completed') return 'completed';
  if (letter.status === 'NoAction') return 'no-action';
  if (!letter.reminderDate) return 'none';

  const today = startOfDay();
  const reminder = startOfDay(new Date(letter.reminderDate));

  if (reminder < today) return 'overdue';
  return 'upcoming';
}

function syncLetterOverdueStatus(letter) {
  if (letter.status === 'Completed' || letter.status === 'NoAction') return letter.status;
  const rs = computeReminderStatus(letter);
  if (rs === 'overdue' && letter.status !== 'Overdue') {
    letter.status = 'Overdue';
  }
  return letter.status;
}

module.exports = {
  generateLetterId,
  addDays,
  startOfDay,
  endOfDay,
  computeReminderStatus,
  syncLetterOverdueStatus,
};
