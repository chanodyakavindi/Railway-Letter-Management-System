const mongoose = require('mongoose');

const recipientCategorySchema = new mongoose.Schema(
  {
    value: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    shortLabel: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    secretaryUsername: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecipientCategory', recipientCategorySchema);
