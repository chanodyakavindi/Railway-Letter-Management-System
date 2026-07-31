const test = require('node:test');
const assert = require('node:assert/strict');
const { canUpdateLetterStatus, canViewLetter, buildLetterFilter } = require('./rbac');

test('allows officers to update status for letters they can access', () => {
  const user = { role: 'officer', _id: 'user-1' };
  const letter = { createdBy: { toString: () => 'user-2' } };

  assert.equal(canUpdateLetterStatus(user, letter, 'Completed'), true);
});

test('allows secretaries to complete or reopen letters they can view', () => {
  const user = {
    role: 'secretary',
    secretaryCategory: 'HR',
    _id: 'user-3',
  };
  const letter = {
    sendTo: ['HR'],
    sendCopiesTo: [],
  };

  assert.equal(canUpdateLetterStatus(user, letter, 'Completed'), true);
  assert.equal(canUpdateLetterStatus(user, letter, 'Pending'), true);
  assert.equal(canUpdateLetterStatus(user, letter, 'Draft'), false);
});

test('officers only see letters they created in the list filter', () => {
  const user = { role: 'officer', _id: 'user-1' };
  const filter = buildLetterFilter(user, {});

  assert.deepEqual(filter, { createdBy: 'user-1' });
});

test('heads can view all letters and are not limited by creator filter', () => {
  const user = { role: 'head', _id: 'head-1' };
  const filter = buildLetterFilter(user, {});

  assert.deepEqual(filter, {});
  assert.equal(canViewLetter(user, { createdBy: 'someone-else' }), true);
});
