const PDFDocument = require('pdfkit');
const Letter = require('../models/Letter');
const { buildLetterFilter } = require('../middleware/rbac');
const { createAuditLog } = require('../utils/audit');

function buildReportFilter(req) {
  const { status, dateFrom, dateTo, recipient, createdBy, search } = req.query;
  const filter = buildLetterFilter(req.user, {});

  if (status) filter.status = status;
  if (createdBy) filter.createdBy = createdBy;
  if (recipient) {
    filter.$or = [
      { sendTo: recipient },
      { sendCopiesTo: recipient },
    ];
  }
  if (dateFrom || dateTo) {
    filter.dateReceived = {};
    if (dateFrom) filter.dateReceived.$gte = new Date(dateFrom);
    if (dateTo) filter.dateReceived.$lte = new Date(dateTo);
  }
  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { letterId: new RegExp(search, 'i') },
      { referredEntity: new RegExp(search, 'i') },
    ];
  }

  return filter;
}

exports.exportCSV = async (req, res, next) => {
  try {
    if (!['head', 'officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const letters = await Letter.find(buildReportFilter(req))
      .populate('createdBy', 'fullName username')
      .sort({ dateReceived: -1 });

    const headers = [
      'letterId', 'dateReceived', 'subject', 'fileNumber', 'status',
      'createdBy', 'assignedTo', 'reminderDate', 'actionTaken', 'referredEntity',
    ];

    const rows = letters.map((l) => [
      l.letterId,
      l.dateReceived ? l.dateReceived.toISOString().split('T')[0] : '',
      `"${(l.title || '').replace(/"/g, '""')}"`,
      l.fileNumber || '',
      l.status,
      l.createdBy ? `${l.createdBy.fullName}` : '',
      (l.sendTo || []).join('; '),
      l.reminderDate ? l.reminderDate.toISOString().split('T')[0] : '',
      `"${(l.actionTaken || '').replace(/"/g, '""')}"`,
      `"${(l.referredEntity || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    await createAuditLog({
      user: req.user,
      action: 'Export generated',
      details: `CSV export - ${letters.length} letters`,
      req,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=rlms-letters-report.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

exports.exportPDF = async (req, res, next) => {
  try {
    if (!['head', 'officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const letters = await Letter.find(buildReportFilter(req))
      .populate('createdBy', 'fullName username')
      .sort({ dateReceived: -1 })
      .limit(200);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rlms-letters-report.pdf');
    doc.pipe(res);

    doc.fontSize(16).text('Railway Letter Management System — Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()} | Total: ${letters.length}`);
    doc.moveDown();

    letters.forEach((l, i) => {
      if (i > 0) doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#1e40af').text(l.letterId);
      doc.fontSize(9).fillColor('#000')
        .text(`Subject: ${l.title}`)
        .text(`Status: ${l.status} | Received: ${l.dateReceived?.toISOString().split('T')[0] || '-'}`)
        .text(`Created by: ${l.createdBy?.fullName || '-'} | Assigned: ${(l.sendTo || []).join(', ')}`)
        .text(`Reminder: ${l.reminderDate?.toISOString().split('T')[0] || '-'}`);
      doc.moveDown(0.3);
    });

    doc.end();

    await createAuditLog({
      user: req.user,
      action: 'Export generated',
      details: `PDF export - ${letters.length} letters`,
      req,
    });
  } catch (err) {
    next(err);
  }
};
