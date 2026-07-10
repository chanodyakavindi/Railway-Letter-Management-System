const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Letter = require('../models/Letter');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const RecipientCategory = require('../models/RecipientCategory');
const { DEMO_USERS, RECIPIENT_CATEGORIES } = require('../utils/constants');
const { addDays } = require('../utils/letterHelpers');

async function seedDatabase({ clear = true } = {}) {
  if (clear) {
    await Promise.all([
      User.deleteMany({}),
      Letter.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      RecipientCategory.deleteMany({}),
    ]);
  } else {
    const existing = await User.countDocuments();
    if (existing > 0) {
      console.log('Database already seeded — skipping');
      return { skipped: true };
    }
  }

  await RecipientCategory.insertMany(RECIPIENT_CATEGORIES);

  const usersToCreate = await Promise.all(
    DEMO_USERS.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
    }))
  );
  const users = await User.insertMany(usersToCreate);

  const userMap = {};
  users.forEach((u) => { userMap[u.username] = u; });

  const priyangani = userMap.priyangani;
  const chathura = userMap.chathura;
  const gayanthi = userMap.gayanthi;
  const purnima = userMap.purnima;
  const dulani = userMap.dulani;

  const sampleLetters = [
    {
      letterId: 'RLY-2026-0001',
      dateReceived: new Date('2026-06-20'),
      referredEntity: 'Pension Department',
      letterNumber: 'PEN/2026/SEC-99',
      letterDate: new Date('2026-06-18'),
      title: 'Implementation of Revised Pension Benefits for Retired Drivers',
      fileNumber: 'SF/RLY/PENS/04',
      actionTaken: 'Reviewed at administrative desk. Sent to General Manager for directives.',
      signatureStatus: 'Instructions Forwarded',
      presentedTo: 'Additional Director (Admin)',
      dateFileTransferred: new Date('2026-06-21'),
      dateOfFiling: new Date('2026-06-21'),
      dateOfSignature: new Date('2026-06-18'),
      sendTo: ['Pension Department', 'Additional Secretaries - Administration'],
      sendCopiesTo: ['GMR', 'DMS'],
      status: 'Completed',
      reminderDate: new Date('2026-07-01'),
      createdBy: priyangani._id,
      updatedBy: priyangani._id,
      assignedCategories: ['Pension Department', 'Additional Secretaries - Administration', 'GMR', 'DMS'],
      reminderHistory: [{ reminderDate: new Date('2026-07-01'), notes: 'Follow up on pension directives', changedBy: priyangani._id }],
      entryType: 'full',
    },
    {
      letterId: 'RLY-2026-0002',
      dateReceived: new Date('2026-06-23'),
      referredEntity: 'Ministry of Transport',
      letterNumber: 'MOT/RLY/DEV/88',
      title: 'Proposals for Colombo-Kandy Double Line Special Railway Project Funding',
      fileNumber: 'SF/RLY/DEV/88.02',
      actionTaken: 'Pending review. Awaiting engineering cost plans.',
      signatureStatus: 'Pending Approval',
      sendTo: ['Additional Secretaries - Development', 'Additional Secretaries - Engineering'],
      sendCopiesTo: ['Other'],
      customRecipientName: 'Planning Division',
      status: 'Draft',
      createdBy: chathura._id,
      updatedBy: chathura._id,
      assignedCategories: ['Additional Secretaries - Development', 'Additional Secretaries - Engineering'],
      entryType: 'full',
    },
    {
      letterId: 'RLY-2026-0003',
      dateReceived: new Date('2026-06-24'),
      referredEntity: 'Public Administration Department',
      letterNumber: 'PUB/RLY/2026/05',
      title: 'Approval for SLAcS Grade Officers Postings and Special Audits',
      fileNumber: 'SF/RLY/AUD/12',
      actionTaken: 'Sent documents to the Special Project Board.',
      signatureStatus: 'Approved & Signed',
      sendTo: ['Additional Secretaries - SLAcS Special', 'PSC'],
      sendCopiesTo: ['PUBAD'],
      status: 'Completed',
      reminderDate: new Date('2026-06-30'),
      dateOfMailing: new Date('2026-06-24'),
      createdBy: gayanthi._id,
      updatedBy: gayanthi._id,
      assignedCategories: ['Additional Secretaries - SLAcS Special', 'PSC', 'PUBAD'],
      entryType: 'quick',
    },
    {
      letterId: 'RLY-2026-0004',
      dateReceived: new Date('2026-06-21'),
      referredEntity: 'Department of National Planning',
      letterNumber: 'NP/RLY/PLAN/12',
      title: 'Development Budget Allocation for Coastal Line Tracks Restoration',
      fileNumber: 'SF/RLY/DEV/PLAN.01',
      actionTaken: 'Forwarded plan to engineering department.',
      sendTo: ['Additional Secretaries - Engineering'],
      sendCopiesTo: ['Other'],
      customRecipientName: 'Coastal Division',
      status: 'Completed',
      reminderDate: new Date('2026-06-23'),
      createdBy: purnima._id,
      updatedBy: purnima._id,
      entryType: 'full',
    },
    {
      letterId: 'RLY-2026-0005',
      dateReceived: new Date('2026-06-22'),
      referredEntity: 'State Railway Corporation',
      letterNumber: 'SRC/RLY/TRAIN/44',
      title: 'Technical Specifications for New Train Compartments Procurement',
      fileNumber: 'SF/RLY/ENG/COMP',
      actionTaken: 'Draft specifications prepared.',
      sendTo: ['Additional Secretaries - Engineering'],
      status: 'Pending',
      reminderDate: addDays(new Date('2026-06-22'), 14),
      createdBy: dulani._id,
      updatedBy: dulani._id,
      entryType: 'full',
    },
    {
      letterId: 'RLY-2026-0006',
      dateReceived: new Date('2026-05-01'),
      referredEntity: 'Ministry of Finance',
      letterNumber: 'MOF/RLY/2026/12',
      title: 'Budget Release for Railway Infrastructure Q2',
      fileNumber: 'SF/RLY/FIN/01',
      actionTaken: 'Awaiting treasury clearance.',
      sendTo: ['GMR', 'Secretary'],
      status: 'Overdue',
      reminderDate: new Date('2026-05-20'),
      createdBy: priyangani._id,
      updatedBy: priyangani._id,
      entryType: 'full',
    },
    {
      letterId: 'RLY-2026-0007',
      dateReceived: new Date('2026-04-15'),
      referredEntity: 'Auditor General Department',
      letterNumber: 'AGD/RLY/AUD/09',
      title: 'Special Audit Findings on Rolling Stock Maintenance',
      fileNumber: 'SF/RLY/AUD/09',
      actionTaken: 'No response received from assigned units.',
      sendTo: ['Additional Secretaries - Engineering'],
      status: 'NoAction',
      reminderDate: new Date('2026-05-01'),
      noActionDate: new Date('2026-05-15'),
      noActionRemarks: 'No response from engineering division after multiple reminders.',
      createdBy: chathura._id,
      updatedBy: chathura._id,
      entryType: 'full',
    },
    {
      letterId: 'RLY-2026-0008',
      dateReceived: new Date('2026-06-25'),
      referredEntity: 'Urban Development Authority',
      letterNumber: 'UDA/RLY/2026/03',
      title: 'Railway Station Redevelopment at Fort and Maradana',
      fileNumber: 'SF/RLY/DEV/UDA',
      actionTaken: 'Initial review completed.',
      sendTo: ['Additional Secretaries - Development', 'Additional Secretaries - Special Projects'],
      status: 'Pending',
      reminderDate: addDays(new Date('2026-06-25'), 14),
      createdBy: gayanthi._id,
      updatedBy: gayanthi._id,
      entryType: 'quick',
    },
    {
      letterId: 'RLY-2026-0009',
      dateReceived: new Date('2026-06-10'),
      referredEntity: 'Labour Department',
      letterNumber: 'LAB/RLY/2026/07',
      title: 'Collective Agreement Renewal for Railway Workers Union',
      fileNumber: 'SF/RLY/HR/07',
      sendTo: ['GMR', 'Additional Directors'],
      status: 'Draft',
      createdBy: purnima._id,
      updatedBy: purnima._id,
      entryType: 'full',
    },
    {
      letterId: 'RLY-2026-0010',
      dateReceived: new Date('2026-06-26'),
      referredEntity: 'Department of Meteorology',
      letterNumber: 'MET/RLY/2026/02',
      title: 'Weather Alert Protocol for Railway Operations',
      fileNumber: 'SF/RLY/OPS/02',
      sendTo: ['Secretary', 'GMR'],
      sendCopiesTo: ['DMS'],
      status: 'Pending',
      reminderDate: addDays(new Date('2026-06-26'), 14),
      createdBy: dulani._id,
      updatedBy: dulani._id,
      entryType: 'quick',
    },
  ];

  const letters = await Letter.insertMany(sampleLetters);

  await AuditLog.insertMany([
    { user: priyangani._id, userName: 'Priyangani (priyangani)', userRole: 'officer', action: 'User created letter', details: 'RLY-2026-0001', letterId: 'RLY-2026-0001', letterRef: letters[0]._id },
    { user: userMap.hod._id, userName: 'Head of Department (hod)', userRole: 'head', action: 'User logged in', details: 'Dashboard access' },
    { user: userMap.admin._id, userName: 'System Admin (admin)', userRole: 'admin', action: 'User logged in', details: 'User management' },
    { user: chathura._id, userName: 'Chathura (chathura)', userRole: 'officer', action: 'User created letter', details: 'RLY-2026-0002 Draft', letterId: 'RLY-2026-0002', letterRef: letters[1]._id },
    { user: gayanthi._id, userName: 'Gayanthi (gayanthi)', userRole: 'officer', action: 'User completed letter', details: 'RLY-2026-0003', letterId: 'RLY-2026-0003', letterRef: letters[2]._id },
  ]);

  await Notification.insertMany([
    {
      user: priyangani._id,
      title: 'Overdue reminder',
      message: 'RLY-2026-0006: Budget Release for Railway Infrastructure Q2',
      type: 'overdue',
      relatedLetter: letters[5]._id,
    },
    {
      user: dulani._id,
      title: 'Reminder due',
      message: 'RLY-2026-0010: Weather Alert Protocol for Railway Operations',
      type: 'reminder',
      relatedLetter: letters[9]._id,
    },
    {
      user: userMap['sec-eng']._id,
      title: 'Letter assigned',
      message: 'New letter assigned to Engineering category',
      type: 'assignment',
      relatedLetter: letters[4]._id,
    },
  ]);

  return { users: users.length, letters: letters.length };
}

module.exports = { seedDatabase };
