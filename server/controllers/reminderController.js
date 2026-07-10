const Letter = require('../models/Letter');
const { buildLetterFilter } = require('../middleware/rbac');
const { computeReminderStatus, startOfDay, endOfDay } = require('../utils/letterHelpers');

exports.getReminders = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const filter = buildLetterFilter(req.user, {
      reminderDate: { $exists: true, $ne: null },
    });

    if (period !== 'all') {
      const now = new Date();
      let from = startOfDay(now);
      if (period === 'weekly') from.setDate(from.getDate() - 7);
      if (period === 'monthly') from.setMonth(from.getMonth() - 1);
      filter.reminderDate = { $gte: from, $lte: endOfDay(now) };
    }

    const letters = await Letter.find(filter)
      .populate('createdBy', 'fullName username')
      .sort({ reminderDate: 1 });

    const active = [];
    const completed = [];
    const noAction = [];

    letters.forEach((l) => {
      const rs = computeReminderStatus(l);
      const item = { ...l.toObject(), reminderStatus: rs };
      if (l.status === 'Completed') completed.push(item);
      else if (l.status === 'NoAction') noAction.push(item);
      else if (rs === 'overdue') active.push({ ...item, reminderStatus: 'overdue' });
      else active.push(item);
    });

    res.json({ active, completed, noAction });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const filter = buildLetterFilter(req.user, {
      reminderDate: { $exists: true, $ne: null },
    });
    const letters = await Letter.find(filter);

    let upcoming = 0;
    let overdue = 0;
    let completed = 0;
    let noAction = 0;

    letters.forEach((l) => {
      const rs = computeReminderStatus(l);
      if (l.status === 'Completed') completed += 1;
      else if (l.status === 'NoAction') noAction += 1;
      else if (rs === 'overdue') overdue += 1;
      else upcoming += 1;
    });

    res.json({ upcoming, overdue, completed, noAction, total: letters.length });
  } catch (err) {
    next(err);
  }
};
