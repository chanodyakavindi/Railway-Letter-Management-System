const test = require('node:test');
const assert = require('node:assert/strict');
const { buildNotificationPayload } = require('./notifications');

test('builds an overdue reminder notification payload for past-due reminders', () => {
  const payload = buildNotificationPayload({
    _id: 'letter-1',
    letterId: 'RLY-2026-0001',
    title: 'Follow-up request',
    status: 'Pending',
    reminderDate: '2024-01-01',
  });

  assert.deepEqual(payload, {
    type: 'overdue',
    title: 'Reminder overdue',
    message: 'RLY-2026-0001: Follow-up request',
  });
});

test('builds a completion notification payload for completed letters', () => {
  const payload = buildNotificationPayload({
    _id: 'letter-2',
    letterId: 'RLY-2026-0002',
    title: 'Response sent',
    status: 'Completed',
    reminderDate: '2026-07-20',
  });

  assert.deepEqual(payload, {
    type: 'system',
    title: 'Letter completed',
    message: 'RLY-2026-0002: Response sent',
  });
});
