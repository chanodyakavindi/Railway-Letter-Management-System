const Letter = require('../models/Letter');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { buildLetterFilter } = require('../middleware/rbac');
const { startOfDay, endOfDay, computeReminderStatus } = require('../utils/letterHelpers');

function getPeriodRange(period, now = new Date()) {
  const start = startOfDay(now);
  let from = new Date(start);

  if (period === 'weekly') {
    from.setDate(from.getDate() - 7);
  } else if (period === 'monthly') {
    from.setMonth(from.getMonth() - 1);
  } else {
    from = startOfDay(now);
  }

  return { from, to: endOfDay(now) };
}

function buildPeriodStatsFilter(baseFilter, period, now = new Date()) {
  const { from, to } = getPeriodRange(period, now);
  return {
    ...baseFilter,
    createdAt: { $gte: from, $lte: to },
  };
}

exports.getStats = async (req, res, next) => {
  try {
    const { period = 'daily' } = req.query;
    const filter = buildLetterFilter(req.user, {});
    const periodFilter = buildPeriodStatsFilter(filter, period);

    const [
      total,
      draft,
      pending,
      completed,
      noAction,
      overdue,
      activeReminders,
    ] = await Promise.all([
      Letter.countDocuments(periodFilter),
      Letter.countDocuments({ ...periodFilter, status: 'Draft' }),
      Letter.countDocuments({ ...periodFilter, status: { $in: ['Pending', 'Overdue'] } }),
      Letter.countDocuments({ ...periodFilter, status: 'Completed' }),
      Letter.countDocuments({ ...periodFilter, status: 'NoAction' }),
      Letter.countDocuments({ ...periodFilter, status: 'Overdue' }),
      Letter.countDocuments({
        ...periodFilter,
        status: { $nin: ['Completed', 'NoAction'] },
        reminderDate: { $exists: true, $ne: null },
      }),
    ]);

    const periodCounts = await Letter.aggregate([
      { $match: periodFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      draft,
      pending,
      completed,
      noAction,
      overdue,
      activeReminders,
      period,
      periodCounts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecent = async (req, res, next) => {
  try {
    const filter = buildLetterFilter(req.user, {});
    const letters = await Letter.find(filter)
      .populate('createdBy', 'fullName username')
      .sort({ updatedAt: -1 })
      .limit(parseInt(req.query.limit, 10) || 10);

    res.json(letters);
  } catch (err) {
    next(err);
  }
};

exports.getDailySummary = async (req, res, next) => {
  try {
    const filter = buildLetterFilter(req.user, {});
    const today = startOfDay();
    const tomorrow = endOfDay();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const letters = await Letter.find(filter)
      .populate('createdBy', 'fullName username')
      .lean();

    const pending = letters.filter((l) => ['Pending', 'Draft', 'Overdue'].includes(l.status));
    const dueReminders = letters.filter((l) => {
      if (!l.reminderDate || l.status === 'Completed') return false;
      const rd = startOfDay(new Date(l.reminderDate));
      return rd.getTime() === today.getTime();
    });
    const overdue = letters.filter((l) => computeReminderStatus(l) === 'overdue' && l.status !== 'Completed');
    const completedToday = letters.filter((l) => {
      if (l.status !== 'Completed') return false;
      const u = new Date(l.updatedAt);
      return u >= today && u <= tomorrow;
    });
    const oldDrafts = letters.filter((l) => {
      if (l.status !== 'Draft') return false;
      return new Date(l.createdAt) < sevenDaysAgo;
    });

    res.json({
      pending,
      dueReminders,
      overdue,
      completedToday,
      oldDrafts,
      generatedAt: new Date(),
    });
  } catch (err) {
    next(err);
  }
};

exports.getPeriodRange = getPeriodRange;
exports.buildPeriodStatsFilter = buildPeriodStatsFilter;

exports.generateDailyNotifications = async () => {
  const today = startOfDay();
  const officers = await User.find({ role: 'officer', isActive: true });

  for (const officer of officers) {
    const letters = await Letter.find({
      createdBy: officer._id,
      status: { $nin: ['Completed', 'NoAction'] },
      reminderDate: { $lte: endOfDay() },
    });

    for (const letter of letters) {
      const rs = computeReminderStatus(letter);
      if (rs === 'overdue' || rs === 'upcoming') {
        const exists = await Notification.findOne({
          user: officer._id,
          relatedLetter: letter._id,
          type: rs === 'overdue' ? 'overdue' : 'reminder',
          createdAt: { $gte: today },
        });
        if (!exists) {
          await Notification.create({
            user: officer._id,
            title: rs === 'overdue' ? 'Overdue reminder' : 'Reminder due',
            message: `${letter.letterId}: ${letter.title}`,
            type: rs === 'overdue' ? 'overdue' : 'reminder',
            relatedLetter: letter._id,
          });
        }
      }
    }
  }
};
