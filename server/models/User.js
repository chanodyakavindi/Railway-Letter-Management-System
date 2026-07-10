const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String, required: true, trim: true },
    employeeId: { type: String, trim: true },
    designation: { type: String, default: '' },
    role: {
      type: String,
      enum: ['admin', 'head', 'officer', 'secretary'],
      required: true,
    },
    secretaryCategory: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    canDeleteLetters: { type: Boolean, default: false },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    employeeId: this.employeeId,
    designation: this.designation,
    role: this.role,
    secretaryCategory: this.secretaryCategory,
    isActive: this.isActive,
    canDeleteLetters: this.canDeleteLetters,
    lastActivityAt: this.lastActivityAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
