const AuditLog = require('../models/AuditLog');
const { buildLetterFilter } = require('../middleware/rbac');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { from, to, user, action } = req.query;
    const filter = {};

    // Route already limits access to head/officer/admin. All of them get a
    // read-only view of the chronological activity log (matches the wireframe).

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (user) filter.user = user;
    if (action) filter.action = new RegExp(action, 'i');

    const logs = await AuditLog.find(filter)
      .populate('user', 'fullName username role')
      .populate('letterRef', 'letterId title')
      .sort({ createdAt: -1 })
      .limit(500);

    res.json(logs);
  } catch (err) {
    next(err);
  }
};
