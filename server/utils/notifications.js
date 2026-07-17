const { computeReminderStatus } = require('./letterHelpers');

function buildNotificationPayload(letter) {
  const reminderStatus = computeReminderStatus(letter);
  if (letter.status === 'Completed') {
    return {
      type: 'system',
      title: 'Letter completed',
      message: `${letter.letterId}: ${letter.title}`,
    };
  }

  if (reminderStatus === 'overdue') {
    return {
      type: 'overdue',
      title: 'Reminder overdue',
      message: `${letter.letterId}: ${letter.title}`,
    };
  }

  return null;
}

module.exports = {
  buildNotificationPayload,
};
