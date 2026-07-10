const { validationResult } = require('express-validator');
const User = require('../models/User');
const Letter = require('../models/Letter');
const { createAuditLog } = require('../utils/audit');

exports.getUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { fullName: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(filter).sort({ fullName: 1 });
    res.json(users.map((u) => u.toSafeJSON()));
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const canView =
      req.user.role === 'admin' ||
      req.user.role === 'head' ||
      req.user._id.toString() === user._id.toString();

    if (!canView) return res.status(403).json({ message: 'Access denied' });

    const stats = await getUserLetterStats(user._id);
    res.json({ user: user.toSafeJSON(), stats });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const exists = await User.findOne({ username: req.body.username.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Username already exists' });

    const user = await User.create({
      ...req.body,
      username: req.body.username.toLowerCase(),
    });

    await createAuditLog({
      user: req.user,
      action: 'Admin created user',
      details: `Created user ${user.username} with role ${user.role}`,
      req,
    });

    res.status(201).json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowed = ['fullName', 'employeeId', 'designation', 'role', 'secretaryCategory', 'canDeleteLetters'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) user[key] = req.body[key];
    });

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    await createAuditLog({
      user: req.user,
      action: 'Admin updated user',
      details: `Updated user ${user.username}`,
      req,
    });

    res.json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = req.body.isActive;
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      user: req.user,
      action: user.isActive ? 'Admin activated user' : 'Admin deactivated user',
      details: `User ${user.username}`,
      req,
    });

    res.json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = req.body.password || 'Password@123';
    await user.save();

    await createAuditLog({
      user: req.user,
      action: 'Admin reset password',
      details: `Password reset for ${user.username}`,
      req,
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getUserTracking = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['officer', 'head', 'secretary'] }, isActive: true });
    const results = [];

    for (const user of users) {
      const stats = await getUserLetterStats(user._id);
      results.push({ user: user.toSafeJSON(), stats });
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
};

async function getUserLetterStats(userId) {
  const uid = userId.toString();
  const [completed, draft, pending, overdue, assigned, recent] = await Promise.all([
    Letter.countDocuments({ createdBy: userId, status: 'Completed' }),
    Letter.countDocuments({ createdBy: userId, status: 'Draft' }),
    Letter.countDocuments({ createdBy: userId, status: { $in: ['Pending', 'Overdue'] } }),
    Letter.countDocuments({ createdBy: userId, status: { $in: ['Overdue', 'NoAction'] } }),
    Letter.countDocuments({ assignedUsers: userId }),
    Letter.find({ createdBy: userId }).sort({ updatedAt: -1 }).limit(10)
      .populate('createdBy', 'fullName username')
      .lean(),
  ]);

  return { completed, draft, pending, overdue, assigned, recentLetters: recent };
}
