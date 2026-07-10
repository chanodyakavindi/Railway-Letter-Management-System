const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const Letter = require('../models/Letter');
const RecipientCategory = require('../models/RecipientCategory');
const Notification = require('../models/Notification');
const { createAuditLog } = require('../utils/audit');
const {
  generateLetterId,
  addDays,
  syncLetterOverdueStatus,
  computeReminderStatus,
} = require('../utils/letterHelpers');
const { canViewLetter, canEditLetter, buildLetterFilter } = require('../middleware/rbac');

function parseLetterBody(body) {
  const data = { ...body };
  const dateFields = [
    'dateReceived', 'letterDate', 'dateFileTransferred', 'dateOfFiling',
    'dateOfSignature', 'dateOfMailing', 'reminderDate',
  ];
  dateFields.forEach((f) => {
    if (data[f]) data[f] = new Date(data[f]);
  });

  if (typeof data.sendTo === 'string') {
    try { data.sendTo = JSON.parse(data.sendTo); } catch { data.sendTo = data.sendTo ? [data.sendTo] : []; }
  }
  if (typeof data.sendCopiesTo === 'string') {
    try { data.sendCopiesTo = JSON.parse(data.sendCopiesTo); } catch { data.sendCopiesTo = data.sendCopiesTo ? [data.sendCopiesTo] : []; }
  }

  return data;
}

function expandAllRecipients(sendTo = [], sendCopiesTo = []) {
  const allValues = RecipientCategory ? [] : [];
  return { sendTo, sendCopiesTo };
}

exports.getCategories = async (_req, res, next) => {
  try {
    const cats = await RecipientCategory.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

exports.getLetters = async (req, res, next) => {
  try {
    const {
      status, search, recipient, createdBy, dateFrom, dateTo, inbox,
    } = req.query;

    const filter = buildLetterFilter(req.user, {});

    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    if (recipient) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ sendTo: recipient }, { sendCopiesTo: recipient }],
      });
    }
    if (dateFrom || dateTo) {
      filter.dateReceived = {};
      if (dateFrom) filter.dateReceived.$gte = new Date(dateFrom);
      if (dateTo) filter.dateReceived.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$text = { $search: search };
    }
    if (inbox === 'secretary' && req.user.role === 'secretary') {
      Object.assign(filter, buildLetterFilter(req.user, {}));
    }

    const letters = await Letter.find(filter)
      .populate('createdBy', 'fullName username employeeId')
      .populate('updatedBy', 'fullName username')
      .populate('replies.user', 'fullName username designation')
      .sort({ updatedAt: -1 });

    const enriched = letters.map((l) => {
      const obj = l.toObject();
      obj.reminderStatus = computeReminderStatus(l);
      return obj;
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

exports.getLetterById = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id)
      .populate('createdBy', 'fullName username employeeId')
      .populate('updatedBy', 'fullName username')
      .populate('replies.user', 'fullName username designation');

    if (!letter) return res.status(404).json({ message: 'Letter not found' });
    if (!canViewLetter(req.user, letter)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const obj = letter.toObject();
    obj.reminderStatus = computeReminderStatus(letter);
    res.json(obj);
  } catch (err) {
    next(err);
  }
};

exports.createLetter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const data = parseLetterBody(req.body);
    const letterId = await generateLetterId();

    if (!data.reminderDate && data.dateReceived) {
      data.reminderDate = addDays(new Date(data.dateReceived), 14);
    }

    if (data.status === 'Completed') {
      data.status = 'Completed';
    } else if (!data.status) {
      data.status = 'Draft';
    }

    const letter = await Letter.create({
      ...data,
      letterId,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      assignedCategories: [...(data.sendTo || []), ...(data.sendCopiesTo || [])],
    });

    if (req.file) {
      letter.pdfAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user._id,
        type: 'letter',
      };
      await letter.save();
    }

    syncLetterOverdueStatus(letter);
    await letter.save();

    await createAuditLog({
      user: req.user,
      action: 'User created letter',
      details: `Created ${letter.letterId} - ${letter.title}`,
      letter,
      req,
    });

    if (data.reminderDate) {
      letter.reminderHistory.push({
        reminderDate: data.reminderDate,
        notes: 'Initial reminder set',
        changedBy: req.user._id,
      });
      await letter.save();
    }

    res.status(201).json(letter);
  } catch (err) {
    next(err);
  }
};

exports.updateLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });
    if (!canEditLetter(req.user, letter)) {
      return res.status(403).json({ message: 'You cannot edit this letter' });
    }

    const data = parseLetterBody(req.body);
    Object.assign(letter, data);
    letter.updatedBy = req.user._id;
    letter.assignedCategories = [...(letter.sendTo || []), ...(letter.sendCopiesTo || [])];

    if (req.file) {
      letter.pdfAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user._id,
        type: 'letter',
      };
    }

    syncLetterOverdueStatus(letter);
    await letter.save();

    await createAuditLog({
      user: req.user,
      action: 'User edited letter',
      details: `Updated ${letter.letterId}`,
      letter,
      req,
    });

    res.json(letter);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });

    const { status } = req.body;
    const isSecretary = req.user.role === 'secretary';
    const isOfficer = req.user.role === 'officer';

    if (isSecretary) {
      if (!canViewLetter(req.user, letter)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (status !== 'Completed' && status !== 'Pending') {
        return res.status(403).json({ message: 'Secretary can only mark response status' });
      }
    } else if (!isOfficer || !canEditLetter(req.user, letter)) {
      return res.status(403).json({ message: 'Cannot update status' });
    }

    letter.status = status;
    if (status === 'NoAction') {
      letter.noActionDate = req.body.noActionDate ? new Date(req.body.noActionDate) : new Date();
      letter.noActionRemarks = req.body.noActionRemarks || '';
    }
    letter.updatedBy = req.user._id;
    await letter.save();

    await createAuditLog({
      user: req.user,
      action: `User changed letter status to ${status}`,
      details: letter.letterId,
      letter,
      req,
    });

    res.json(letter);
  } catch (err) {
    next(err);
  }
};

exports.updateReminder = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });

    if (req.user.role === 'head') {
      // head can view only
    } else if (!canEditLetter(req.user, letter) && req.user.role !== 'head') {
      if (req.user.role !== 'officer') {
        return res.status(403).json({ message: 'Cannot update reminder' });
      }
    }

    if (req.user.role === 'officer' && !canEditLetter(req.user, letter)) {
      return res.status(403).json({ message: 'Cannot update reminder' });
    }

    const reminderDate = req.body.reminderDate ? new Date(req.body.reminderDate) : null;
    letter.reminderDate = reminderDate;
    letter.reminderHistory.push({
      reminderDate,
      notes: req.body.notes || '',
      changedBy: req.user._id,
    });
    letter.updatedBy = req.user._id;
    syncLetterOverdueStatus(letter);
    await letter.save();

    await createAuditLog({
      user: req.user,
      action: 'User changed reminder',
      details: `${letter.letterId} reminder: ${reminderDate}`,
      letter,
      req,
    });

    res.json(letter);
  } catch (err) {
    next(err);
  }
};

exports.addReply = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });

    if (req.user.role !== 'secretary' || !canViewLetter(req.user, letter)) {
      return res.status(403).json({ message: 'Only assigned secretary can reply' });
    }

    const reply = {
      user: req.user._id,
      note: req.body.note,
      completed: req.body.completed === true || req.body.completed === 'true',
    };

    if (req.file) {
      reply.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user._id,
        type: 'reply',
      };
    }

    letter.replies.push(reply);
    if (reply.completed) {
      letter.status = 'Pending';
    }
    letter.updatedBy = req.user._id;
    await letter.save();

    await createAuditLog({
      user: req.user,
      action: 'Secretary replied',
      details: `Reply on ${letter.letterId}`,
      letter,
      req,
    });

    await Notification.create({
      user: letter.createdBy,
      title: 'Secretary reply received',
      message: `${req.user.fullName} replied to ${letter.letterId}`,
      type: 'reply',
      relatedLetter: letter._id,
    });

    res.status(201).json(letter);
  } catch (err) {
    next(err);
  }
};

exports.uploadPdf = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });
    if (!canEditLetter(req.user, letter) && req.user.role !== 'secretary') {
      return res.status(403).json({ message: 'Cannot upload' });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      type: req.body.type === 'reply' ? 'reply' : 'letter',
    };

    if (attachment.type === 'letter') {
      letter.pdfAttachment = attachment;
    } else {
      letter.attachments.push(attachment);
    }
    letter.updatedBy = req.user._id;
    await letter.save();

    await createAuditLog({
      user: req.user,
      action: 'User uploaded PDF',
      details: `${attachment.originalName} on ${letter.letterId}`,
      letter,
      req,
    });

    res.json(letter);
  } catch (err) {
    next(err);
  }
};

exports.downloadAttachment = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });
    if (!canViewLetter(req.user, letter)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let attachment = null;
    if (req.params.attachmentId === 'main' && letter.pdfAttachment?.filename) {
      attachment = letter.pdfAttachment;
    } else {
      attachment = letter.attachments?.id(req.params.attachmentId);
      if (!attachment && letter.replies?.length) {
        for (const r of letter.replies) {
          if (r.attachment?._id?.toString() === req.params.attachmentId) {
            attachment = r.attachment;
            break;
          }
        }
      }
    }

    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    const filePath = path.join(__dirname, '..', 'uploads', attachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const viewInline = req.query.view === '1' || req.query.inline === '1';
    if (viewInline) {
      const mime = attachment.mimeType || 'application/octet-stream';
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.originalName || 'document')}"`);
      return fs.createReadStream(filePath).pipe(res);
    }

    res.download(filePath, attachment.originalName);
  } catch (err) {
    next(err);
  }
};

exports.deleteLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });

    if (req.user.role !== 'admin' && !req.user.canDeleteLetters) {
      return res.status(403).json({ message: 'Delete not permitted' });
    }

    await letter.deleteOne();
    await createAuditLog({
      user: req.user,
      action: 'User deleted letter',
      details: letter.letterId,
      req,
    });
    res.json({ message: 'Letter deleted' });
  } catch (err) {
    next(err);
  }
};
