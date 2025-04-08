const mongoose = require('mongoose');

const SmtpConfigSchema = new mongoose.Schema({
  host: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    required: true
  },
  secure: {
    type: Boolean,
    default: true
  },
  auth: {
    user: {
      type: String,
      required: true
    },
    pass: {
      type: String,
      required: true
    }
  },
  fromEmail: {
    type: String,
    required: true
  },
  fromName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 시 updatedAt 필드 자동 갱신
SmtpConfigSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('SmtpConfig', SmtpConfigSchema);
