const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['letter', 'reply'], default: 'letter' },
  },
  { _id: true }
);

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, required: true },
    attachment: attachmentSchema,
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const reminderHistorySchema = new mongoose.Schema(
  {
    reminderDate: Date,
    notes: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const letterSchema = new mongoose.Schema(
  {
    letterId: { type: String, required: true, unique: true },
    dateReceived: { type: Date, required: true },
    referredEntity: { type: String, default: '' },
    letterNumber: { type: String, default: '' },
    letterDate: { type: Date },
    title: { type: String, required: true },
    fileNumber: { type: String, default: '' },
    actionTaken: { type: String, default: '' },
    signatureStatus: { type: String, default: '' },
    presentedTo: { type: String, default: '' },
    dateFileTransferred: { type: Date },
    dateOfFiling: { type: Date },
    dateOfSignature: { type: Date },
    dateOfMailing: { type: Date },
    sendTo: [{ type: String }],
    sendCopiesTo: [{ type: String }],
    customRecipientName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Completed', 'NoAction', 'Overdue'],
      default: 'Draft',
    },
    reminderDate: { type: Date },
    reminderHistory: [reminderHistorySchema],
    noActionRemarks: { type: String, default: '' },
    noActionDate: { type: Date },
    pdfAttachment: attachmentSchema,
    attachments: [attachmentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignedCategories: [{ type: String }],
    replies: [replySchema],
    sourceType: { type: String, enum: ['letter', 'reply'], default: 'letter' },
    entryType: { type: String, enum: ['full', 'quick'], default: 'full' },
  },
  { timestamps: true }
);

letterSchema.index({ status: 1, reminderDate: 1 });
letterSchema.index({ createdBy: 1 });
letterSchema.index({ title: 'text', letterNumber: 'text', fileNumber: 'text', referredEntity: 'text' });

module.exports = mongoose.model('Letter', letterSchema);
