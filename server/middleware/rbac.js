const Letter = require('../models/Letter');

function letterMatchesSecretaryCategory(letter, category) {
  if (!category) return false;
  const targets = [...(letter.sendTo || []), ...(letter.sendCopiesTo || [])];
  if (targets.includes('All')) return true;
  return targets.includes(category);
}

function canViewLetter(user, letter) {
  if (user.role === 'head' || user.role === 'admin') return true;
  if (user.role === 'officer') return true;
  if (user.role === 'secretary') {
    return letterMatchesSecretaryCategory(letter, user.secretaryCategory);
  }
  return false;
}

function canEditLetter(user, letter) {
  if (user.role !== 'officer') return false;
  if (letter.createdBy?.toString() === user._id.toString()) return true;
  return false;
}

function canUpdateLetterStatus(user, letter, status) {
  if (!letter || !canViewLetter(user, letter)) return false;

  if (user.role === 'secretary') {
    return status === 'Completed' || status === 'Pending';
  }

  if (user.role === 'officer' || user.role === 'head' || user.role === 'admin') {
    return true;
  }

  return false;
}

function buildLetterFilter(user, query = {}) {
  const filter = { ...query };

  if (user.role === 'secretary') {
    filter.$or = [
      { sendTo: user.secretaryCategory },
      { sendCopiesTo: user.secretaryCategory },
      { sendTo: 'All' },
      { sendCopiesTo: 'All' },
    ];
  }

  if (user.role === 'officer') {
    filter.createdBy = user._id;
  }

  return filter;
}

module.exports = {
  letterMatchesSecretaryCategory,
  canViewLetter,
  canEditLetter,
  canUpdateLetterStatus,
  buildLetterFilter,
};
