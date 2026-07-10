const AuditLog = require('../models/AuditLog');

async function createAuditLog({ user, action, details = '', letter = null, req = null }) {
  try {
    await AuditLog.create({
      user: user?._id || null,
      userName: user ? `${user.fullName} (${user.username})` : 'System',
      userRole: user?.role || 'system',
      action,
      details,
      letterId: letter?.letterId || '',
      letterRef: letter?._id || null,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || '',
      userAgent: req?.headers?.['user-agent'] || '',
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { createAuditLog };
