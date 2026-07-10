const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { createAuditLog } = require('../utils/audit');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    user.lastActivityAt = new Date();
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      user,
      action: 'User logged in',
      details: `Login from ${req.ip}`,
      req,
    });

    res.json({
      token: signToken(user._id),
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
};

exports.logout = async (req, res, next) => {
  try {
    await createAuditLog({
      user: req.user,
      action: 'User logged out',
      req,
    });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};
